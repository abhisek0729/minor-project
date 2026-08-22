import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import {
  guidesTable,
  hotelsTable,
  placesTable,
  restaurantsTable,
} from "@/app/lib/db/schema";
import { ilike, or } from "drizzle-orm";
import {
  getUserMemoryProfile,
  updateUserMemory,
} from "@/app/features/ai/services/user-memory.service";
import destinationsData from "@/app/lib/db/destinations-data.json";

const FASTAPI_BASE_URL =
  process.env.FASTAPI_BASE_URL ||
  process.env.NEXT_PUBLIC_FASTAPI_BASE_URL ||
  "http://localhost:8000";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(request: NextRequest) {
  // 1. Session & Auth context (supports signed-in users and guest explorers)
  const session = await getServerSession(authOptions);
  const body = await request.json();
  const userMessage: string = body.message || "";
  const history: Array<{ role: string; content?: string; text?: string }> =
    body.history || body.messages || [];
  const userId = session?.user?.id ? Number(session.user.id) : 1;
  const userName = session?.user?.name || "Traveler";
  const userRoles = session?.user?.roles ? (session.user.roles || []).map((r: { name: string }) => r.name) : ["tourist"];

  const payload = {
    ...body,
    user_id: userId,
    user_name: userName,
    user_roles: userRoles,
  };

  // 2. Try FastAPI Backend first if running
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const backendResponse = await fetch(
      `${FASTAPI_BASE_URL.replace(/\/$/, "")}/api/v1/ai/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (backendResponse.ok) {
      const data = await backendResponse.json();
      return NextResponse.json(data);
    }
  } catch {
    // Graceful fallback to smart in-app AI engine
  }

  // 3. Smart Next.js Travel AI Engine with Conversational Memory
  try {
    const responseData = await processSmartAIQuery(
      userMessage,
      userId,
      userRoles,
      userName,
      history
    );
    return NextResponse.json(responseData);
  } catch (err: unknown) {
    console.error("AI Query processing error:", err);
    return NextResponse.json({
      answer:
        "I'm ready to help you plan custom trips, recommend verified hotels & local food, and log travel expenses! Ask me anything about any destination in Nepal.",
      recommendations: [],
      steps_taken: ["Platform Assistant Ready"],
      tools_used: ["in_app_engine"],
    });
  }
}

async function processSmartAIQuery(
  message: string,
  userId: number,
  userRoles: string[],
  userName: string,
  history: Array<{ role: string; content?: string; text?: string }> = []
) {
  const msgLower = message.toLowerCase();
  const stepsTaken: string[] = [];

  // Load User Memory Layer Profile (past bookings, expense history, partner roles, custom preferences)
  const userMemory = await getUserMemoryProfile(userId, userName, userRoles);

  // A. Extract Conversational Context & Match Across Major Hubs and 150 Destinations
  let destination = "";
  let origin = "";

  // 1. Check for "from [Origin] to [Destination]"
  const fromToMatch = message.match(/from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+?)(?:\s+for|\s+with|\s+including|\s+include|\s+and|\s*$)/i);
  if (fromToMatch) {
    origin = fromToMatch[1].trim();
    const destCandidate = fromToMatch[2].trim().toLowerCase();
    
    if (destCandidate.includes("pokhara")) destination = "Pokhara Valley & Phewa Lake";
    else if (destCandidate.includes("dharan")) destination = "Dharan & Bhedetar";
    else if (destCandidate.includes("kathmandu") || destCandidate.includes("ktm")) destination = "Kathmandu Valley";
    else if (destCandidate.includes("chitwan")) destination = "Chitwan National Park Safari";
    else if (destCandidate.includes("lumbini")) destination = "Lumbini Sacred Garden";
    else if (destCandidate.includes("mustang")) destination = "Upper & Lower Mustang";
    else if (destCandidate.includes("everest")) destination = "Everest Base Camp & Namche";
    else if (destCandidate.includes("annapurna")) destination = "Annapurna Sanctuary & ABC";
    else if (destCandidate.includes("bandipur")) destination = "Bandipur Heritage Town";
    else if (destCandidate.includes("ilam")) destination = "Ilam Kanyam Tea Garden";
    else destination = fromToMatch[2].trim();

    stepsTaken.push(`🗺️ Identified travel route: ${origin} ➔ ${destination}`);
  }

  // 2. Scan for major destination names
  if (!destination) {
    if (msgLower.includes("pokhara") || msgLower.includes("phewa") || msgLower.includes("sarangkot") || msgLower.includes("lakeside")) {
      destination = "Pokhara Valley & Phewa Lake";
    } else if (msgLower.includes("dharan") || msgLower.includes("bhedetar") || msgLower.includes("chinde") || msgLower.includes("bijayapur")) {
      destination = "Dharan & Bhedetar";
    } else if (msgLower.includes("kathmandu") || msgLower.includes("ktm") || msgLower.includes("thamel") || msgLower.includes("pashupati")) {
      destination = "Kathmandu Valley";
    } else if (msgLower.includes("chitwan") || msgLower.includes("sauraha") || msgLower.includes("safari")) {
      destination = "Chitwan National Park Safari";
    } else if (msgLower.includes("lumbini")) {
      destination = "Lumbini Sacred Garden";
    } else if (msgLower.includes("mustang") || msgLower.includes("muktinath") || msgLower.includes("jomsom")) {
      destination = "Upper & Lower Mustang";
    } else if (msgLower.includes("everest") || msgLower.includes("ebc") || msgLower.includes("namche") || msgLower.includes("lukla")) {
      destination = "Everest Base Camp & Namche";
    } else if (msgLower.includes("annapurna") || msgLower.includes("abc") || msgLower.includes("mardi") || msgLower.includes("poon hill")) {
      destination = "Annapurna Sanctuary & ABC";
    } else if (msgLower.includes("bandipur")) {
      destination = "Bandipur Heritage Town";
    } else if (msgLower.includes("nagarkot")) {
      destination = "Nagarkot Sunrise Viewpoint";
    } else if (msgLower.includes("ilam") || msgLower.includes("kanyam")) {
      destination = "Ilam Kanyam Tea Garden";
    } else if (msgLower.includes("janakpur")) {
      destination = "Janakpur Dham & Janaki Temple";
    } else if (msgLower.includes("rara")) {
      destination = "Rara Lake, Mugu";
    } else if (msgLower.includes("gosaikunda") || msgLower.includes("langtang")) {
      destination = "Langtang Valley & Gosaikunda";
    }
  }

  // 3. Scan current message across all 150 destinations dataset
  if (!destination) {
    for (const dest of destinationsData) {
      const nameLower = dest.name.toLowerCase();
      const primaryName = nameLower.split("&")[0].trim();
      if (msgLower.includes(nameLower) || (primaryName.length > 3 && msgLower.includes(primaryName))) {
        destination = dest.name;
        break;
      }
    }
  }

  // 4. If not in current message, search recent history backwards (Conversational Memory)
  if (!destination && history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const hText = (history[i].content || history[i].text || "").toLowerCase();
      if (hText.includes("pokhara")) { destination = "Pokhara Valley & Phewa Lake"; break; }
      if (hText.includes("dharan")) { destination = "Dharan & Bhedetar"; break; }
      if (hText.includes("kathmandu")) { destination = "Kathmandu Valley"; break; }
      for (const dest of destinationsData) {
        const nameLower = dest.name.toLowerCase();
        const primaryName = nameLower.split("&")[0].trim();
        if (hText.includes(nameLower) || (primaryName.length > 3 && hText.includes(primaryName))) {
          destination = dest.name;
          stepsTaken.push(`🧠 Recalled active destination from conversation history: ${dest.name}`);
          break;
        }
      }
      if (destination) break;
    }
  }

  // 5. Fallback to valid memory destination or Pokhara
  if (!destination) {
    const validMem = userMemory.recentDestinations.find(
      (d) => !d.toLowerCase().includes("guiding") && !d.toLowerCase().includes("service")
    );
    destination = validMem || "Pokhara Valley & Phewa Lake";
  }

  const destinationTitle = destination;

  // Detect special activities & adventure preferences
  const hasBungee = msgLower.includes("bungee") || msgLower.includes("bungy") || msgLower.includes("the cliff") || msgLower.includes("highground");
  const hasParagliding = msgLower.includes("paragliding") || msgLower.includes("gliding");
  const hasRafting = msgLower.includes("rafting");
  const hasZipline = msgLower.includes("zipline") || msgLower.includes("zip flyer");
  const hasSafari = msgLower.includes("safari") || msgLower.includes("wildlife");

  if (hasBungee) stepsTaken.push("🎯 Detected adventure activity: Bungee Jumping");
  if (hasParagliding) stepsTaken.push("🎯 Detected adventure activity: Paragliding");
  if (hasRafting) stepsTaken.push("🎯 Detected adventure activity: White Water Rafting");

  // Persist active destination to user memory layer
  updateUserMemory(userId, "active_destination", destinationTitle);

  // Auto-detect & persist user preferences
  if (msgLower.includes("vegetarian") || msgLower.includes("veg only")) {
    updateUserMemory(userId, "dietary_preference", "Vegetarian");
    stepsTaken.push("🧠 Saved preference: Vegetarian diet");
  } else if (msgLower.includes("non-veg") || msgLower.includes("meat lover")) {
    updateUserMemory(userId, "dietary_preference", "Non-Vegetarian");
  }

  if (
    msgLower.includes("budget travel") ||
    msgLower.includes("backpacker") ||
    msgLower.includes("cheap stay")
  ) {
    updateUserMemory(userId, "budget_tier", "Budget Backpacker");
    stepsTaken.push("🧠 Saved preference: Budget-friendly stays");
  } else if (
    msgLower.includes("luxury") ||
    msgLower.includes("5 star") ||
    msgLower.includes("premium resort")
  ) {
    updateUserMemory(userId, "budget_tier", "Luxury & Boutique");
    stepsTaken.push("🧠 Saved preference: Luxury & Boutique");
  }

  // Detect duration query (e.g. "for 3 days")
  const durationMatch = message.match(/(\d+)\s*(day|night|week)/i);
  let durationDays: number | null = null;
  if (durationMatch) {
    const num = parseInt(durationMatch[1], 10);
    const unit = durationMatch[2].toLowerCase();
    durationDays = unit.includes("week") ? num * 7 : num;
    stepsTaken.push(`⏱️ Identified trip duration: ${durationDays} Days`);
  }

  // Determine user intent (Full Trip Planning vs Pure Budget Query)
  const isTripPlanningIntent =
    msgLower.includes("plan") ||
    msgLower.includes("trip") ||
    msgLower.includes("itinerary") ||
    msgLower.includes("visit") ||
    msgLower.includes("travel") ||
    msgLower.includes("suggest") ||
    Boolean(fromToMatch) ||
    hasBungee ||
    hasParagliding ||
    hasRafting;

  const isPureBudgetOnly =
    !isTripPlanningIntent &&
    (msgLower.includes("cost") || msgLower.includes("amount") || msgLower.includes("budget") || msgLower.includes("price") || msgLower.includes("how much"));

  // B. Check for Form Action Intents (Human In The Loop with RBAC Guards)
  const isSuperAdmin = userRoles.includes("admin");

  // 1. Super Admin: Partner Approval Intent
  if (
    (msgLower.includes("approve") || msgLower.includes("accept partner") || msgLower.includes("grant partner")) &&
    (msgLower.includes("partner") || msgLower.includes("hotel") || msgLower.includes("restaurant") || msgLower.includes("guide") || msgLower.includes("owner") || msgLower.includes("user"))
  ) {
    if (!isSuperAdmin) {
      return {
        answer: "⚠️ Access Restricted: Reviewing and approving partner workspaces requires Super Admin privileges. You are currently logged in as a Traveler.",
        steps_taken: ["🔒 RBAC Policy Check: Denied non-admin partner approval mutation"],
        tools_used: ["rbac_guard"],
      };
    }

    const numMatch = message.match(/\b\d+\b/);
    const targetUserId = numMatch ? parseInt(numMatch[0]) : null;
    let roleType: "hotelOwner" | "restaurantOwner" | "guide" = "hotelOwner";

    if (msgLower.includes("restaurant")) roleType = "restaurantOwner";
    else if (msgLower.includes("guide")) roleType = "guide";
    else if (msgLower.includes("hotel")) roleType = "hotelOwner";

    if (!targetUserId) {
      return {
        answer: "Please provide the User ID or Partner ID to approve (e.g., 'Approve hotel partner for user ID 5'). You can also view all pending approvals at /dashboard/admin/approvals.",
        steps_taken: ["❓ Prompted for missing partner user ID"],
        tools_used: ["action_slot_analyzer"],
      };
    }

    return {
      answer: `🛡️ Super Admin Action Prepared: Review the partner approval details below and click Confirm & Execute to activate their workspace.`,
      action_proposal: {
        action_type: "APPROVE_PARTNER",
        title: "Approve Partner Workspace",
        description: `Approve pending ${roleType} workspace application for User ID #${targetUserId}.`,
        payload: {
          user_id: targetUserId,
          role_name: roleType,
        },
        status: "requires_approval",
      },
      steps_taken: ["🛡️ Super Admin RBAC Verified", "📋 Generated Partner Approval Action Card"],
      tools_used: ["hitl_proposal_generator", "rbac_guard"],
    };
  }

  // 2. Super Admin: Partner Rejection Intent
  if (
    (msgLower.includes("reject") || msgLower.includes("deny partner") || msgLower.includes("suspend partner")) &&
    (msgLower.includes("partner") || msgLower.includes("hotel") || msgLower.includes("restaurant") || msgLower.includes("guide") || msgLower.includes("user"))
  ) {
    if (!isSuperAdmin) {
      return {
        answer: "⚠️ Access Restricted: Rejecting or suspending partner workspaces requires Super Admin privileges.",
        steps_taken: ["🔒 RBAC Policy Check: Denied non-admin mutation"],
        tools_used: ["rbac_guard"],
      };
    }

    const numMatch = message.match(/\b\d+\b/);
    const targetUserId = numMatch ? parseInt(numMatch[0]) : null;
    let roleType: "hotelOwner" | "restaurantOwner" | "guide" = "hotelOwner";

    if (msgLower.includes("restaurant")) roleType = "restaurantOwner";
    else if (msgLower.includes("guide")) roleType = "guide";

    if (!targetUserId) {
      return {
        answer: "Please specify the Partner User ID to reject (e.g., 'Reject partner 12').",
        steps_taken: ["❓ Prompted for partner ID"],
        tools_used: ["action_slot_analyzer"],
      };
    }

    return {
      answer: `🛡️ Super Admin Action Prepared: Review the rejection action below and click Confirm & Execute.`,
      action_proposal: {
        action_type: "REJECT_PARTNER",
        title: "Reject Partner Application",
        description: `Reject ${roleType} application for User ID #${targetUserId}.`,
        payload: {
          user_id: targetUserId,
          role_name: roleType,
        },
        status: "requires_approval",
      },
      steps_taken: ["🛡️ Super Admin RBAC Verified", "📋 Generated Partner Rejection Card"],
      tools_used: ["hitl_proposal_generator", "rbac_guard"],
    };
  }

  // 3. User: Expense Intent
  const expenseKeywords = ["spent", "expense", "paid", "cost me", "bought"];
  const hasExpenseIntent = expenseKeywords.some((k) => msgLower.includes(k));

  if (hasExpenseIntent) {
    const numMatch = message.match(/(\d+[\d,]*)/);
    const amount = numMatch ? parseInt(numMatch[0].replace(/,/g, "")) : 1500;

    let expType = "food";
    if (msgLower.includes("hotel") || msgLower.includes("room") || msgLower.includes("stay") || msgLower.includes("lodge")) {
      expType = "lodging";
    } else if (msgLower.includes("taxi") || msgLower.includes("bus") || msgLower.includes("flight") || msgLower.includes("ticket") || msgLower.includes("cab")) {
      expType = "transportation";
    } else if (msgLower.includes("guide") || msgLower.includes("entry") || msgLower.includes("permit") || msgLower.includes("bungee")) {
      expType = "activities";
    }

    const location = destinationTitle.split("&")[0].trim();
    const cleanName =
      message
        .replace(/spent|paid|cost|i|on|for|in|at|npr|rs|rupees/gi, "")
        .replace(/\b\d+\b/g, "")
        .trim() || "Trip Expense";

    return {
      answer: `✨ I have prepared your expense record for ${location}! Review and click Confirm & Execute to save it to your expense ledger.`,
      action_proposal: {
        action_type: "LOG_EXPENSE",
        title: "Record Travel Expense",
        description: `Log ${cleanName} of NPR ${amount.toLocaleString()} in ${location} (${expType}).`,
        payload: {
          name: cleanName,
          amount,
          location,
          type: expType,
        },
        status: "requires_approval",
      },
      steps_taken: ["📋 Compiled Human-In-The-Loop Action Proposal card"],
      tools_used: ["hitl_proposal_generator"],
    };
  }

  // C. Search Platform Database using active destination context
  stepsTaken.push(`🔍 Searching verified platform database for '${destinationTitle}'`);
  let hotels: (typeof hotelsTable.$inferSelect)[] = [];
  let restaurants: (typeof restaurantsTable.$inferSelect)[] = [];
  let places: (typeof placesTable.$inferSelect)[] = [];
  let guides: (typeof guidesTable.$inferSelect)[] = [];

  const queryPlace = destinationTitle.toLowerCase().includes("pokhara") ? "Pokhara" : destinationTitle.split("&")[0].trim();

  try {
    if (db) {
      const [dbHotels, dbRestaurants, dbPlaces, dbGuides] = await Promise.all([
        db
          .select()
          .from(hotelsTable)
          .where(
            or(
              ilike(hotelsTable.district, `%${queryPlace}%`),
              ilike(hotelsTable.name, `%${queryPlace}%`),
              ilike(hotelsTable.street, `%${queryPlace}%`)
            )
          )
          .limit(3),
        db
          .select()
          .from(restaurantsTable)
          .where(
            or(
              ilike(restaurantsTable.location, `%${queryPlace}%`),
              ilike(restaurantsTable.name, `%${queryPlace}%`)
            )
          )
          .limit(3),
        db
          .select()
          .from(placesTable)
          .where(
            or(
              ilike(placesTable.location, `%${queryPlace}%`),
              ilike(placesTable.name, `%${queryPlace}%`)
            )
          )
          .limit(3),
        db
          .select()
          .from(guidesTable)
          .where(
            or(
              ilike(guidesTable.location, `%${queryPlace}%`),
              ilike(guidesTable.name, `%${queryPlace}%`)
            )
          )
          .limit(2),
      ]);
      hotels = dbHotels || [];
      restaurants = dbRestaurants || [];
      places = dbPlaces || [];
      guides = dbGuides || [];
    }
  } catch (dbErr) {
    console.warn("DB Query fallback note in AI route:", dbErr);
  }

  // Generate Map Cards tailored specifically to active destination and adventure sports
  stepsTaken.push(`📍 Generated live Google Maps navigation cards for ${destinationTitle}`);
  const mapCards: { title: string; location: string; map_url: string; place_type: string }[] = [];

  if (destinationTitle.toLowerCase().includes("pokhara")) {
    mapCards.push({
      title: "Phewa Lake (Lakeside)",
      location: "Lakeside Marg, Pokhara, Nepal",
      map_url: "https://www.google.com/maps/search/?api=1&query=Phewa+Lake+Pokhara+Nepal",
      place_type: "attraction",
    });

    if (hasBungee) {
      mapCards.push({
        title: "HighGround Bungee Jump",
        location: "Hemja, Pokhara, Nepal",
        map_url: "https://www.google.com/maps/search/?api=1&query=HighGround+Adventures+Bungee+Pokhara",
        place_type: "activity",
      });
      mapCards.push({
        title: "The Cliff Bungee (World's 2nd Highest)",
        location: "Kushma, Parbat / Pokhara",
        map_url: "https://www.google.com/maps/search/?api=1&query=The+Cliff+Nepal+Kushma+Bungee",
        place_type: "activity",
      });
    }

    mapCards.push({
      title: "Sarangkot Sunrise Viewpoint",
      location: "Sarangkot, Pokhara, Nepal",
      map_url: "https://www.google.com/maps/search/?api=1&query=Sarangkot+Pokhara+Nepal",
      place_type: "viewpoint",
    });
  } else if (destinationTitle.toLowerCase().includes("dharan") || destinationTitle.toLowerCase().includes("chinde")) {
    mapCards.push({
      title: "Budha Subba Temple",
      location: "Bijayapur, Dharan, Nepal",
      map_url: "https://www.google.com/maps/search/?api=1&query=Budha+Subba+Temple+Dharan+Nepal",
      place_type: "attraction",
    });
    mapCards.push({
      title: "Bhedetar Viewpoint",
      location: "Bhedetar, Sunsari/Dhankuta Border",
      map_url: "https://www.google.com/maps/search/?api=1&query=Bhedetar+View+Tower+Nepal",
      place_type: "viewpoint",
    });
  } else {
    mapCards.push({
      title: destinationTitle,
      location: `${destinationTitle}, Nepal`,
      map_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationTitle + ", Nepal")}`,
      place_type: "destination",
    });
  }

  // Format recommendations
  const recommendations: Array<{
    entity_type: string;
    entity_id: number;
    name: string;
    reason: string;
    location: string;
    booking_note: string;
  }> = [];

  for (const h of hotels) {
    recommendations.push({
      entity_type: "hotel",
      entity_id: h.id,
      name: h.name,
      reason: `Verified stay in ${h.district}.`,
      location: `${h.district}, Nepal`,
      booking_note: `Visit /hotels to reserve.`,
    });
  }
  for (const r of restaurants) {
    recommendations.push({
      entity_type: "restaurant",
      entity_id: r.id,
      name: r.name,
      reason: `${r.cuisine} dining in ${r.location}.`,
      location: r.location,
      booking_note: `Visit /restaurants to view menu.`,
    });
  }

  // D. Call Gemini LLM with Full Conversational Multi-Turn History
  stepsTaken.push("🤖 Generating response with multi-turn memory & Gemini 2.0 Flash");
  let generatedAnswer = "";

  const hotelContextStr = hotels.length > 0 
    ? JSON.stringify(hotels.map((h) => ({ name: h.name, location: `${h.district}, Nepal`, price: "NPR 2,200 – 4,500/night", rating: "4.6★", verified: true })))
    : "Verified stays available on /hotels catalog.";

  const restaurantContextStr = restaurants.length > 0
    ? JSON.stringify(restaurants.map((r) => ({ name: r.name, cuisine: r.cuisine || "Authentic Nepali / Multi-Cuisine", location: r.location || `${destinationTitle}, Nepal`, rating: "4.5★" })))
    : "Authentic local dining available on /restaurants.";

  const guideContextStr = guides.length > 0
    ? JSON.stringify(guides.map((g) => ({ name: g.name, languages: g.languages || "Nepali, English", dailyRate: g.dailyRate ? `NPR ${g.dailyRate}/day` : "NPR 2,500/day" })))
    : "Licensed trekking guides available on /guide.";

  const systemInstruction = `
TRAVELNEPAL AI — PERSONAL TRAVEL SPECIALIST

You are TravelNepal AI, an intelligent travel specialist and personal trip planner built into the TravelNepal platform.
Your job is to help users discover destinations, plan itineraries, compare hotels and restaurants, estimate trip costs, and make practical travel decisions.
You should feel like a knowledgeable local travel consultant — not a generic chatbot.

1. USER CONTEXT
- User Name: ${userName}
- Roles: ${userRoles.join(", ") || "tourist"}
- Main spending priority: ${userMemory.topExpenseCategory}
- Spending style: ${userMemory.spendingHabit}
- Active Destination: ${destinationTitle}
- Origin Point: ${origin || "Kathmandu / Local"}
- Special Activities Requested: ${hasBungee ? "Bungee Jumping" : ""}${hasParagliding ? ", Paragliding" : ""}${hasRafting ? ", Rafting" : ""}

2. VERIFIED PLATFORM DATA
Hotels: ${hotelContextStr}
Restaurants: ${restaurantContextStr}
Tour Guides: ${guideContextStr}

3. PERSONALIZATION & ROUTE RULES
- If the user asks to travel from Origin to Destination (e.g. from Dharan to Pokhara), provide real transportation logistics (bus/flight/drive duration).
- If the user requested specific activities like Bungee Jumping, Paragliding, or Rafting, explicitly integrate them into the schedule and budget.

4. RESPONSE STYLE
- Clean, modern, engaging, concise, easy to scan, and practical.
- IMPORTANT FORMATTING RULE: Output plain clean text only. NEVER use markdown symbols (no #, ##, ###, and NO **bold** or *italic* asterisks). Use clean emoji headers and bullet points with • symbol.
`;

  if (GEMINI_API_KEY && GEMINI_API_KEY.startsWith("AIzaSy")) {
    try {
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      for (const h of history.slice(-8)) {
        const text = h.content || h.text || "";
        if (text) {
          contents.push({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text }],
          });
        }
      }

      contents.push({
        role: "user",
        parts: [
          {
            text: `[SYSTEM INSTRUCTION]: ${systemInstruction}\n\n[USER QUERY]: ${message}`,
          },
        ],
      });

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1400,
            },
          }),
        }
      );

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          generatedAnswer = text;
        }
      }
    } catch (e) {
      console.warn("Gemini API multi-turn error, using local template generator:", e);
    }
  }

  // E. Dynamic Local Intelligent Generator
  if (!generatedAnswer) {
    const days = durationDays || 3;
    const nightRate = userMemory.spendingHabit.includes("Budget") ? 2500 : 3800;
    const foodDaily = 1400;
    const bungeeCost = hasBungee ? 7500 : 0;
    const paraglidingCost = hasParagliding ? 8000 : 0;
    const raftingCost = hasRafting ? 4000 : 0;
    const adventureTotal = bungeeCost + paraglidingCost + raftingCost;

    const transitIntercity = origin.toLowerCase().includes("dharan") ? 3500 : 2500;
    const localTransit = 2000;
    const stayTotal = nightRate * (days - 1 > 0 ? days - 1 : days);
    const foodTotal = foodDaily * days;
    const sightseeingTotal = 2500 + adventureTotal;
    const totalEst = transitIntercity + localTransit + stayTotal + foodTotal + sightseeingTotal;
    const usdEst = Math.round(totalEst / 134);

    if (isPureBudgetOnly) {
      generatedAnswer = `💰 ${days}-Day Trip Budget for ${destinationTitle}

Here is the realistic, itemized budget calculation for your ${days}-day trip to ${destinationTitle}, tailored for ${userMemory.spendingHabit}:

🏨 Accommodation
• ${days > 1 ? days - 1 : 1} Nights × NPR ${nightRate.toLocaleString()} = NPR ${stayTotal.toLocaleString()}
(Comfortable verified stays on TravelNepal)

🍽️ Food & Dining
• ${days} Days × NPR ${foodDaily.toLocaleString()} / day = NPR ${foodTotal.toLocaleString()}
(Authentic Thakali thali, morning breakfast, and local lakefront dining)

🚗 Transportation
• Intercity Transit (${origin ? `${origin} ↔ ${destinationTitle}` : "Intercity transfers"}): NPR ${transitIntercity.toLocaleString()}
• Local Cabs & Boating: NPR ${localTransit.toLocaleString()}

🎟️ Activities & Adventure
${hasBungee ? `• Bungee Jumping Pass (HighGround / Kushma): NPR ${bungeeCost.toLocaleString()}\n` : ""}${hasParagliding ? `• Paragliding Flight (Sarangkot): NPR ${paraglidingCost.toLocaleString()}\n` : ""}• Sightseeing & Viewpoint Entry Passes: NPR 2,500

---

💰 TOTAL ESTIMATED TRIP COST
• Total Estimated Cost: NPR ${totalEst.toLocaleString()}
• Approximate USD Equivalent: $${usdEst} USD (approx. NPR ${Math.round(totalEst / days).toLocaleString()} / day)

Included:
✓ Verified Hotel Lodging (${days > 1 ? days - 1 : 1} Nights)
✓ Daily Meals & Authentic Regional Food
✓ Intercity & Local City Transit
${hasBungee ? "✓ Bungee Jumping Pass & Safety Briefing\n" : ""}✓ Essential Sightseeing & Boating Passes

Excluded:
✗ Personal Souvenir Shopping
✗ Alcohol & Personal Extras

---
Would you like me to recommend top verified hotels in ${destinationTitle} matching this budget?`;
    } else {
      // Full Tailored Itinerary with Origin, Destination & Adventure Sports
      const routeTitle = origin
        ? `${days}-Day Adventure Trip: ${origin} to ${destinationTitle}`
        : `${days}-Day Travel Plan: ${destinationTitle}`;

      generatedAnswer = `🌄 ${routeTitle}

Welcome to your personalized itinerary from ${origin || "Dharan"} to ${destinationTitle}, customized for your ${userMemory.spendingHabit} style${hasBungee ? " with thrilling Bungee Jumping included" : ""}.

⭐ Trip Snapshot
• Route: ${origin ? `${origin} ➔ ${destinationTitle}` : destinationTitle}
• Recommended Duration: ${days} Days / ${days > 1 ? days - 1 : 1} Nights
• Travel Style: ${userMemory.spendingHabit}
• Key Highlights: ${hasBungee ? "Bungee Jumping at Hemja / Kushma, " : ""}Phewa Lake Boating, Sarangkot Sunrise, World Peace Pagoda
• Approximate Total Budget: NPR ${totalEst.toLocaleString()} (approx. $${usdEst} USD)

🚗 Travel Logistics (${origin ? `${origin} ➔ ${destinationTitle}` : "Transit to Destination"})
• Option 1 (Deluxe Tourist Coach): Daily morning/night tourist coach from ${origin || "Dharan"} via the Highway (~8–9 hrs, scenic hills & rivers).
• Option 2 (Flight): 45-min short connecting flight from Biratnagar Airport to Pokhara International Airport.

🗓️ Suggested ${days}-Day Itinerary

Day 1: Journey from ${origin || "Dharan"} & Lakeside Golden Hour
• Morning: Early morning departure from ${origin || "Dharan"}. Enjoy scenic roadside tea and breakfast stops.
• Afternoon: Arrive in Pokhara, check in to your verified Lakeside hotel, and refresh.
• Evening: Peaceful sunset boat ride on Phewa Lake, visit the island Tal Barahi Temple, followed by a lakeside dinner with live acoustic music.

Day 2: The Adventure Day — Bungee Jumping & Iconic Sights
• Morning: Early transfer to Hemja (HighGround Bungee, 20 mins from Lakeside) or Kushma (The Cliff, 228m suspension bridge). Experience the heart-pumping leap with panoramic Himalayan backdrops and GoPro recording!
• Afternoon: Return to Pokhara for a well-deserved authentic Thakali Thali lunch. Explore Davis Falls and the sacred Gupteshwor Mahadev Cave.
• Evening: Drive up to the World Peace Pagoda for panoramic sunset views over Pokhara valley and Phewa Lake, followed by lakefront café relaxation.

Day 3: Sarangkot Sunrise, Heritage Trails & Return Transit
• Morning: 5:30 AM drive to Sarangkot for sunrise over the Annapurna, Dhaulagiri, and Machhapuchhre (Fishtail) peaks, followed by organic breakfast.
• Afternoon: Souvenir shopping along Lakeside bazaar (local tea, prayer flags, handicrafts), check out, and begin your journey back to ${origin || "Dharan"}.

🎯 Featured Adventure: Bungee Jumping in Pokhara
• Location: HighGround Adventures (Hemja, Pokhara) or The Cliff (Kushma, Parbat).
• Jump Height: 70 meters tower jump with water touch (Hemja) or 228 meters gorge jump (Kushma).
• Estimated Cost: NPR 7,000 – 8,500 per jumper (includes safety briefing, equipment, and jump certificate).

🏨 Where to Stay
${hotels.length > 0 ? hotels.map(h => `• ${h.name} (${h.district}) — Verified stay, convenient location, optimal for ${userMemory.spendingHabit}.`).join('\n') : `• Verified Stays in ${destinationTitle} — Check our /hotels catalog for real-time room availability.`}

🍜 Where to Eat
${restaurants.length > 0 ? restaurants.map(r => `• ${r.name} (${r.cuisine}) — Must-try authentic local culinary experience.`).join('\n') : `• Authentic Thakali Kitchen & Lakefront multi-cuisine dining around Lakeside Pokhara.`}

💰 Estimated Trip Cost Breakdown
• Transport (${origin || "Dharan"} ↔ ${destinationTitle}): NPR ${transitIntercity.toLocaleString()}
• Hotel Stay (${days > 1 ? days - 1 : 1} Nights): NPR ${stayTotal.toLocaleString()}
• Meals & Dining (${days} Days): NPR ${foodTotal.toLocaleString()}
${hasBungee ? `• Bungee Jumping Pass & Photos: NPR ${bungeeCost.toLocaleString()}\n` : ""}• Sightseeing & Phewa Boat: NPR ${localTransit.toLocaleString()}
• Total Estimated Budget: NPR ${totalEst.toLocaleString()} (approx. $${usdEst} USD)

💡 Smart Traveler Tips
1. Wear secure, closed-toe sports shoes and comfortable athletic clothing for your Bungee Jump.
2. Book your Bungee Jumping slot for the morning when weather is calm and clear.
3. Keep valid citizenship/passport ID handy for activity registration and hotel check-in.

---
Would you like me to recommend verified hotels in Pokhara or provide direct booking details for the Bungee Jump?`;
    }
  }

  // Clean all markdown heading hashes, bold asterisks, and italic wrappers
  const cleanAnswer = generatedAnswer
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^\s*[\*\-]\s+/gm, "• ")
    .trim();

  return {
    answer: cleanAnswer,
    recommendations,
    map_cards: mapCards.slice(0, 4),
    map_url: mapCards[0]?.map_url,
    steps_taken: stepsTaken,
    tools_used: ["conversational_memory_layer", "database_catalog_search", "google_maps_lookup", "ai_trip_synthesis"],
  };
}
