import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import { destinationsTable, hotelsTable, restaurantsTable } from "@/app/lib/db/schema";
import { ilike, or } from "drizzle-orm";

function getFastApiEndpoints(request: NextRequest): string[] {
  const envUrl = process.env.FASTAPI_BASE_URL || process.env.NEXT_PUBLIC_FASTAPI_BASE_URL;
  const origin = request.nextUrl.origin;
  const endpoints: string[] = [];

  // If explicit external production URL is set (e.g. Render / Railway / EC2)
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    const clean = envUrl.replace(/\/$/, "");
    endpoints.push(`${clean}/api/v1/ai/chat`);
    endpoints.push(`${clean}/api/backend/api/v1/ai/chat`);
  }

  // If on Vercel or production domain
  if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
    endpoints.push(`${origin}/api/backend/api/v1/ai/chat`);
    endpoints.push(`${origin}/api/v1/ai/chat`);
  }

  // Local development fallback
  endpoints.push("http://127.0.0.1:8000/api/v1/ai/chat");
  endpoints.push("http://localhost:8000/api/v1/ai/chat");

  return Array.from(new Set(endpoints));
}

async function generateDirectGeminiResponse(userMessage: string, history: any[], destinationHint?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    // 1. Search database for relevant context (hotels, places, food in Nepal)
    let hotels: any[] = [];
    let destinations: any[] = [];
    let restaurants: any[] = [];

    const searchKeyword = destinationHint || (userMessage.match(/\b(butwal|dharan|kathmandu|pokhara|chitwan|lumbini|mustang|everest|ilam|biratnagar|bhaktapur|patan|janakpur)\b/i)?.[0]);

    if (db) {
      try {
        if (searchKeyword) {
          [hotels, destinations, restaurants] = await Promise.all([
            db.select().from(hotelsTable).where(or(ilike(hotelsTable.name, `%${searchKeyword}%`), ilike(hotelsTable.district, `%${searchKeyword}%`))).limit(4),
            db.select().from(destinationsTable).where(or(ilike(destinationsTable.name, `%${searchKeyword}%`), ilike(destinationsTable.region, `%${searchKeyword}%`))).limit(4),
            db.select().from(restaurantsTable).where(or(ilike(restaurantsTable.name, `%${searchKeyword}%`), ilike(restaurantsTable.location, `%${searchKeyword}%`))).limit(4),
          ]);
        }
        if (hotels.length === 0) hotels = await db.select().from(hotelsTable).limit(3);
        if (destinations.length === 0) destinations = await db.select().from(destinationsTable).limit(3);
        if (restaurants.length === 0) restaurants = await db.select().from(restaurantsTable).limit(3);
      } catch (dbErr) {
        console.warn("DB query error in chat fallback:", dbErr);
      }
    }

    const contextSummary = `
Verified Nepal Platform Data:
- Recommended Hotels: ${hotels.map(h => `${h.name} (${h.district || 'Nepal'})`).join(", ") || "Hotel Barahi Pokhara, Dwarika's Kathmandu"}
- Popular Destinations: ${destinations.map(d => `${d.name} (${d.region || 'Nepal'})`).join(", ") || "Bhedetar Dharan, Phewa Lake Pokhara, Maya Devi Lumbini"}
- Top Food Spots: ${restaurants.map(r => `${r.name} (${r.location || 'Nepal'})`).join(", ") || "Moondance Restaurant, Bhojan Griha"}
`;

    const systemPrompt = `You are TravelNepal AI, an expert travel consultant and AI tour specialist for Nepal.
Always provide well-structured, inspiring, and practical travel answers formatted with clear Markdown headers, bullet points, budget estimates in Nepalese Rupees (NPR), hotel & restaurant recommendations, and daily itineraries.

${contextSummary}
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const contents = [
      { role: "user", parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }] }
    ];

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
        },
      }),
    });

    if (!res.ok) {
      // Try gemini-1.5-flash fallback if 2.5-flash model key is configured differently
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
      return null;
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (e) {
    console.error("Gemini Direct Fallback Error:", e);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const userMessage: string = body.message || "";
    const history = body.history || body.messages || [];
    const userId = session?.user?.id ? Number(session.user.id) : 1;
    const userName = session?.user?.name || "Traveler";
    const userRoles = session?.user?.roles
      ? (session.user.roles || []).map((r: { name: string }) => r.name)
      : ["tourist"];

    const payload = {
      message: userMessage,
      history: history,
      user_id: userId,
      user_name: userName,
      user_roles: userRoles,
      destination: body.destination || undefined,
    };

    const endpoints = getFastApiEndpoints(request);
    let successData: any = null;

    // 1. Try FastAPI LangGraph Endpoints
    for (const endpoint of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 18000);

        const backendResponse = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (backendResponse.ok) {
          successData = await backendResponse.json();
          break;
        }
      } catch {
        // Continue to next endpoint or fallback
      }
    }

    if (successData) {
      return NextResponse.json(successData);
    }

    // 2. Intelligent Built-in Gemini AI Engine Fallback
    const directAiAnswer = await generateDirectGeminiResponse(userMessage, history, body.destination);

    if (directAiAnswer) {
      return NextResponse.json({
        answer: directAiAnswer,
        recommendations: [
          {
            entity_type: "destination",
            name: "Lakeside & Phewa Lake",
            location: "Pokhara, Gandaki Province",
            reason: "Iconic boating, lakeside promenade, and Annapurna mountain views.",
            url: "/destinations",
          },
          {
            entity_type: "hotel",
            name: "Hotel Barahi Pokhara",
            location: "Lakeside, Pokhara",
            reason: "Popular top-rated lakeside stay with mountain views.",
            url: "/hotels",
          },
        ],
        steps_taken: [
          "⚡ Connected to TravelNepal Gemini AI Engine",
          "🗺️ Generated tailored route itinerary, budget & verified stay options",
        ],
        tools_used: ["gemini_ai_direct_planner", "nepal_database_catalog"],
      });
    }

    // 3. Dynamic Contextual Offline Fallback (If all APIs fail)
    const lowerMsg = userMessage.toLowerCase();
    
    // Check if query is about capabilities
    if (/what (are|can) (you|your)|capabilities|features|who are you|help/i.test(lowerMsg)) {
      return NextResponse.json({
        answer: `Namaste! 🙏 I am your **TravelNepal AI Voice & Travel Specialist**.\n\n` +
          `I can help you with:\n` +
          `• 🗺️ **Custom Itineraries:** Multi-day plans for Pokhara, Kathmandu, Chitwan, Mustang, and more.\n` +
          `• 🏨 **Verified Hotels:** Finding rooms and booking stays directly via Khalti.\n` +
          `• 🍽️ **Dining & Menus:** Discovering authentic local Thakali, Newari, and Momo eateries.\n` +
          `• 🚌 **Transit & Routes:** Bus schedules, tourist coach fares, and travel times.\n` +
          `• 💰 **Expense Tracking:** Logging and tracking your Nepal travel expenses.`,
        recommendations: [],
        steps_taken: ["📋 TravelNepal Knowledge Base: Platform Capabilities"],
        tools_used: ["knowledge_base"],
      });
    }

    // Detect target city for dynamic travel guidance
    const cityMatch = lowerMsg.match(/\b(pokhara|kathmandu|chitwan|mustang|dharan|lumbini|bhaktapur|patan|nagarkot|bandipur|ilam)\b/i)?.[0];
    const targetCity = cityMatch ? (cityMatch.charAt(0).toUpperCase() + cityMatch.slice(1).toLowerCase()) : "Pokhara";

    return NextResponse.json({
      answer: `Namaste! 🙏 Here is a curated travel guide for **${targetCity}**:\n\n` +
        `• **Highlights & Sights**: Explore top scenic viewpoints, local cultural landmarks, and lakeside/heritage walks.\n` +
        `• **Transport & Arrival**: Easily accessible via tourist deluxe buses or domestic flights.\n` +
        `• **Suggested Duration**: 2 to 4 Days for a relaxed experience.\n\n` +
        `💰 **Estimated Budget**: Approx **NPR 4,000 – 7,500 per day** (comfort stays, authentic local dining, and sightseeing).`,
      recommendations: [
        {
          entity_type: "destination",
          name: `${targetCity} Highlights`,
          location: `${targetCity}, Nepal`,
          reason: `Top scenic sights and attractions in ${targetCity}`,
          url: "/destinations",
        },
        {
          entity_type: "hotel",
          name: `Verified Stays in ${targetCity}`,
          location: targetCity,
          reason: "Comfortable verified rooms with amenities",
          url: "/hotels",
        },
      ],
      steps_taken: [`📋 Generated ${targetCity} guide from TravelNepal knowledge base`],
      tools_used: ["knowledge_base"],
    });
  } catch (err: unknown) {
    console.error("AI Chat Route Error:", err);
    return NextResponse.json(
      {
        answer: "Namaste! 🙏 I am your TravelNepal AI Specialist. Please feel free to ask your travel query again.",
        recommendations: [],
        steps_taken: [],
        tools_used: [],
      },
      { status: 200 }
    );
  }
}
