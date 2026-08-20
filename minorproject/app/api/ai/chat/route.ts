import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import {
  bookingsTable,
  guidesTable,
  hotelsTable,
  placesTable,
  restaurantsTable,
} from "@/app/lib/db/schema";
import { desc, eq, ilike, or } from "drizzle-orm";
import {
  getUserMemoryProfile,
  updateUserMemory,
} from "@/app/features/ai/services/user-memory.service";

const FASTAPI_BASE_URL =
  process.env.FASTAPI_BASE_URL ||
  process.env.NEXT_PUBLIC_FASTAPI_BASE_URL ||
  "http://localhost:8000";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(request: NextRequest) {
  // 1. RBAC & Auth Guard: Ensure user is authenticated
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        detail: "You must be signed in to use the AI Travel Assistant.",
      },
      { status: 401 }
    );
  }

  const body = await request.json();
  const userMessage: string = body.message || "";
  const userId = Number(session.user.id);
  const userRoles = (session.user.roles || []).map((r: any) => r.name);

  const payload = {
    ...body,
    user_id: userId,
    user_name: session.user.name || "Traveler",
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

  // 3. Smart Next.js Travel AI Engine
  try {
    const responseData = await processSmartAIQuery(
      userMessage,
      userId,
      userRoles,
      session.user.name || "Traveler"
    );
    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error("AI Query processing error:", err);
    return NextResponse.json({
      answer: "I'm ready to help you plan custom trips, recommend verified hotels & local food, and log travel expenses! Ask me anything about any destination in Nepal.",
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
  userName: string
) {
  const msgLower = message.toLowerCase();
  const stepsTaken: string[] = [];

  // Load User Memory Layer Profile (past bookings, expense history, partner roles, custom preferences)
  const userMemory = await getUserMemoryProfile(userId, userName, userRoles);

  // Auto-detect & persist user preferences for future recommendations
  if (msgLower.includes("vegetarian") || msgLower.includes("veg only")) {
    updateUserMemory(userId, "dietary_preference", "Vegetarian");
    stepsTaken.push("🧠 Saved preference: Vegetarian diet");
  } else if (msgLower.includes("non-veg") || msgLower.includes("meat lover")) {
    updateUserMemory(userId, "dietary_preference", "Non-Vegetarian");
  }

  if (msgLower.includes("budget travel") || msgLower.includes("backpacker") || msgLower.includes("cheap stay")) {
    updateUserMemory(userId, "budget_tier", "Budget Backpacker");
    stepsTaken.push("🧠 Saved preference: Budget-friendly stays");
  } else if (msgLower.includes("luxury") || msgLower.includes("5 star") || msgLower.includes("premium resort")) {
    updateUserMemory(userId, "budget_tier", "Luxury & Boutique");
    stepsTaken.push("🧠 Saved preference: Luxury & Boutique");
  }

  if (msgLower.includes("solo traveler") || msgLower.includes("solo trip")) {
    updateUserMemory(userId, "travel_style", "Solo Adventurer");
  } else if (msgLower.includes("family trip") || msgLower.includes("with kids")) {
    updateUserMemory(userId, "travel_style", "Family Vacation");
  } else if (msgLower.includes("trekker") || msgLower.includes("hiking lover") || msgLower.includes("adventure")) {
    updateUserMemory(userId, "travel_style", "Trekking & Adventure");
  }

  // A. Check for Form Action Intents (Human In The Loop)
  // 1. Log Expense Action
  if (
    msgLower.includes("expense") ||
    msgLower.includes("spent") ||
    msgLower.includes("spend") ||
    msgLower.includes("paid")
  ) {
    stepsTaken.push("⚡ Detected expense tracking intent");
    const numMatch = message.match(/\b\d+\b/);
    const amount = numMatch ? parseInt(numMatch[0]) : null;

    let location = "Kathmandu";
    const destinations = ["Dharan", "Pokhara", "Kathmandu", "Chitwan", "Lumbini", "Nagarkot", "Patan", "Bhaktapur", "Bhedetar"];
    for (const loc of destinations) {
      if (msgLower.includes(loc.toLowerCase())) {
        location = loc;
        break;
      }
    }

    let expType = "other";
    if (["food", "sekuwa", "dinner", "lunch", "breakfast", "momo", "thali", "restaurant"].some((k) => msgLower.includes(k))) {
      expType = "food";
    } else if (["hotel", "room", "stay", "resort", "lodge"].some((k) => msgLower.includes(k))) {
      expType = "accommodation";
    } else if (["taxi", "cab", "bus", "transport", "flight", "jeep"].some((k) => msgLower.includes(k))) {
      expType = "transport";
    } else if (["trek", "guide", "tour", "ticket", "paragliding", "activity"].some((k) => msgLower.includes(k))) {
      expType = "activity";
    }

    if (!amount || amount <= 0) {
      return {
        answer: "How much was the expense amount in NPR?",
        steps_taken: ["❓ Prompted for missing expense amount"],
        tools_used: ["action_slot_analyzer"],
      };
    }

    const cleanName =
      message
        .replace(/log|add|track|record|expense|for|of/gi, "")
        .replace(/\b\d+\b/g, "")
        .trim() || "Trip Expense";

    return {
      answer: `✨ I have prepared your expense record! Please review the details below and click **Confirm & Execute** to save it to your expense ledger.`,
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

  // 2. Add Hotel Room Action (Hotel Owners)
  if (msgLower.includes("add room") || msgLower.includes("create room") || msgLower.includes("new room")) {
    const numMatch = message.match(/\b\d+\b/g);
    const roomNumber = numMatch ? numMatch[0] : "101";
    const price = numMatch && numMatch.length > 1 ? parseInt(numMatch[1]) : (numMatch && parseInt(numMatch[0]) > 500 ? parseInt(numMatch[0]) : null);

    let roomType = "single";
    for (const t of ["suite", "family", "twin", "double", "single"]) {
      if (msgLower.includes(t)) {
        roomType = t;
        break;
      }
    }

    if (!price) {
      return {
        answer: "What is the price per night (in NPR) for this room?",
        steps_taken: ["❓ Prompted for missing room price"],
      };
    }

    return {
      answer: `✨ I have prepared to add Room #${roomNumber} to your hotel listing. Review and click **Confirm & Execute**.`,
      action_proposal: {
        action_type: "ADD_HOTEL_ROOM",
        title: "Add Hotel Room",
        description: `Add ${roomType.toUpperCase()} Room #${roomNumber} at NPR ${price.toLocaleString()}/night.`,
        payload: {
          room_number: roomNumber,
          room_type: roomType,
          price_per_night: price,
          capacity: roomType === "family" ? 4 : (roomType === "double" || roomType === "twin" ? 2 : 1),
          description: `Comfortable ${roomType} room with modern amenities.`,
        },
        status: "requires_approval",
      },
      steps_taken: ["📋 Compiled Human-In-The-Loop Action Proposal card"],
    };
  }

  // 3. Add Restaurant Dish Action (Restaurant Owners)
  if (
    msgLower.includes("add dish") ||
    msgLower.includes("create dish") ||
    msgLower.includes("add menu") ||
    msgLower.includes("new dish") ||
    msgLower.includes("add food")
  ) {
    const numMatch = message.match(/\b\d+\b/);
    const price = numMatch ? parseInt(numMatch[0]) : null;

    let category = "Main Course";
    if (["appetizer", "starter", "snack"].some((k) => msgLower.includes(k))) category = "Appetizer";
    if (["dessert", "sweet"].some((k) => msgLower.includes(k))) category = "Dessert";
    if (["beverage", "drink", "tea", "coffee", "juice"].some((k) => msgLower.includes(k))) category = "Beverage";

    const cleanDishName =
      message
        .replace(/add|create|new|dish|food|menu|item|for|price|npr|rs/gi, "")
        .replace(/\b\d+\b/g, "")
        .trim() || "Signature Special";

    if (!price) {
      return {
        answer: `What is the price (in NPR) for "${cleanDishName}"?`,
        steps_taken: ["❓ Prompted for dish price"],
      };
    }

    return {
      answer: `✨ I have prepared to add "${cleanDishName}" to your restaurant menu! Review and click **Confirm & Execute**.`,
      action_proposal: {
        action_type: "ADD_RESTAURANT_DISH",
        title: "Add Restaurant Dish",
        description: `Add "${cleanDishName}" (${category}) at NPR ${price.toLocaleString()}.`,
        payload: {
          name: cleanDishName,
          price,
          category,
          description: `Freshly prepared authentic ${cleanDishName}.`,
        },
        status: "requires_approval",
      },
      steps_taken: ["📋 Compiled Human-In-The-Loop Action Proposal card"],
    };
  }

  // 4. Update Restaurant Operating Hours
  if (msgLower.includes("operating hour") || msgLower.includes("restaurant timing") || msgLower.includes("change time")) {
    return {
      answer: "✨ I can update your restaurant's operating schedule. Please review the proposal:",
      action_proposal: {
        action_type: "UPDATE_RESTAURANT_HOURS",
        title: "Update Restaurant Schedule",
        description: "Set opening hours to 09:00 AM - 10:00 PM and status to Open.",
        payload: {
          opening_time: "09:00 AM",
          closing_time: "10:00 PM",
          is_open: true,
        },
        status: "requires_approval",
      },
      steps_taken: ["📋 Compiled Human-In-The-Loop Action Proposal card"],
    };
  }

  // 5. Create Tour Package (Tour Guides)
  if (
    msgLower.includes("create package") ||
    msgLower.includes("add package") ||
    msgLower.includes("new tour") ||
    msgLower.includes("new trek")
  ) {
    const numMatch = message.match(/\b\d+\b/g);
    const price = numMatch && numMatch.length > 0 ? parseInt(numMatch[0]) : 8500;
    const days = numMatch && numMatch.length > 1 ? parseInt(numMatch[1]) : 3;

    const pkgTitle =
      message
        .replace(/create|add|new|package|tour|trek|for/gi, "")
        .replace(/\b\d+\b/g, "")
        .trim() || "Scenic Himalayan Adventure";

    return {
      answer: `✨ I have drafted the "${pkgTitle}" package for your guide profile! Review the details and click **Confirm & Execute**.`,
      action_proposal: {
        action_type: "CREATE_TOUR_PACKAGE",
        title: "Publish Tour Package",
        description: `Publish "${pkgTitle}" (${days} Days) at NPR ${price.toLocaleString()} per person.`,
        payload: {
          title: pkgTitle,
          price,
          duration_days: days,
          destination: "Nepal",
          max_group_size: 8,
          description: `Comprehensive guided experience covering top scenic viewpoints and trails.`,
          itinerary: "Day 1: Arrival & briefing. Day 2: Guided exploration. Day 3: Scenic ridge walk & departure.",
        },
        status: "requires_approval",
      },
      steps_taken: ["📋 Compiled Human-In-The-Loop Action Proposal card"],
    };
  }

  // 6. Set Guide Availability
  if (msgLower.includes("availability") || msgLower.includes("mark available") || msgLower.includes("available on")) {
    const today = new Date().toISOString().split("T")[0];
    return {
      answer: "✨ I have prepared your tour guide availability update. Review and click **Confirm & Execute**:",
      action_proposal: {
        action_type: "SET_GUIDE_AVAILABILITY",
        title: "Update Guide Availability",
        description: `Mark status as Available for upcoming bookings on ${today}.`,
        payload: {
          date: today,
          is_available: true,
          note: "Open for half-day and full-day tours",
        },
        status: "requires_approval",
      },
      steps_taken: ["📋 Compiled Human-In-The-Loop Action Proposal card"],
    };
  }

  // 7. Create Traveler Booking
  if (
    msgLower.includes("book hotel") ||
    msgLower.includes("book room") ||
    msgLower.includes("reserve room") ||
    msgLower.includes("book tour")
  ) {
    const numMatch = message.match(/\b\d+\b/g);
    const amount = numMatch ? parseInt(numMatch[0]) : 3500;
    const guests = numMatch && numMatch.length > 1 ? parseInt(numMatch[1]) : 2;

    return {
      answer: "✨ I have prepared your booking request. Please review the booking proposal and click **Confirm & Execute** to submit:",
      action_proposal: {
        action_type: "CREATE_BOOKING",
        title: "Submit Booking Request",
        description: `Reserve for ${guests} guest(s) at NPR ${amount.toLocaleString()}.`,
        payload: {
          booking_type: "hotel",
          item_id: 1,
          item_name: "Verified Stay Booking",
          check_in_date: new Date().toISOString().split("T")[0],
          guests,
          total_amount: amount,
          special_requests: "Booked via AI Assistant",
        },
        status: "requires_approval",
      },
      steps_taken: ["📋 Compiled Human-In-The-Loop Action Proposal card"],
    };
  }

  // B. RAG & Query Pipeline: Extract Location / Intent
  stepsTaken.push("🔍 Queried TravelNepal platform database");

  let destination = "Nepal";
  const knownLocations = [
    "Chinde Danda", "Chinde Dada", "Dharan", "Bhedetar", "Namaste Jharna", "Pokhara", "Kathmandu",
    "Chitwan", "Lumbini", "Nagarkot", "Patan", "Bhaktapur", "Bandipur", "Mustang", "Annapurna", "Everest", "Ilam"
  ];
  for (const loc of knownLocations) {
    if (msgLower.includes(loc.toLowerCase())) {
      destination = loc;
      break;
    }
  }

  // Search local DB
  const [hotels, restaurants, places, guides, userBookings] = await Promise.all([
    db
      .select()
      .from(hotelsTable)
      .where(or(ilike(hotelsTable.district, `%${destination}%`), ilike(hotelsTable.name, `%${destination}%`), ilike(hotelsTable.street, `%${destination}%`)))
      .limit(3),
    db
      .select()
      .from(restaurantsTable)
      .where(or(ilike(restaurantsTable.location, `%${destination}%`), ilike(restaurantsTable.name, `%${destination}%`)))
      .limit(3),
    db
      .select()
      .from(placesTable)
      .where(or(ilike(placesTable.location, `%${destination}%`), ilike(placesTable.name, `%${destination}%`)))
      .limit(3),
    db
      .select()
      .from(guidesTable)
      .where(or(ilike(guidesTable.location, `%${destination}%`), ilike(guidesTable.name, `%${destination}%`)))
      .limit(2),
    msgLower.includes("booking")
      ? db.select().from(bookingsTable).where(eq(bookingsTable.userId, userId)).orderBy(desc(bookingsTable.createdAt)).limit(3)
      : Promise.resolve([]),
  ]);

  // Generate Map Cards
  stepsTaken.push("📍 Generated live Google Maps navigation cards");
  const mapCards: { title: string; location: string; map_url: string; place_type: string }[] = [];

  // Always add the primary queried destination to Map Cards
  const queryQuery = msgLower.includes("dharan") || msgLower.includes("chinde")
    ? "Chinde Danda, Dharan, Nepal"
    : `${destination}, Nepal`;

  mapCards.push({
    title: destination === "Nepal" ? "Chinde Danda Viewpoint" : destination,
    location: msgLower.includes("chinde") ? "Dharan-20, Sunsari, Nepal" : `${destination}, Nepal`,
    map_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryQuery)}`,
    place_type: "destination",
  });

  if (msgLower.includes("dharan") || msgLower.includes("chinde")) {
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
  }

  for (const p of places) {
    if (!mapCards.some((m) => m.title === p.name)) {
      mapCards.push({
        title: p.name,
        location: p.location,
        map_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + " " + p.location)}`,
        place_type: "destination",
      });
    }
  }

  for (const h of hotels) {
    mapCards.push({
      title: h.name,
      location: `${h.district}, Nepal`,
      map_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + " " + h.district + " Nepal")}`,
      place_type: "hotel",
    });
  }

  for (const r of restaurants) {
    mapCards.push({
      title: r.name,
      location: r.location || "Nepal",
      map_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + " " + (r.location || "Nepal"))}`,
      place_type: "restaurant",
    });
  }

  // Recommendations
  const recommendations: any[] = [];
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

  // C. Call Gemini LLM for Detailed Personalized Travel Synthesis
  stepsTaken.push("🤖 Synthesized custom travel plan with AI & User Memory");
  let generatedAnswer = "";

  if (GEMINI_API_KEY) {
    try {
      const systemContext = `
You are the official AI Travel Specialist and Personal Trip Planner for TravelNepal / TourSphere.

=== USER MEMORY & PERSONALIZED PROFILE ===
${userMemory.summaryPromptText}
Top Expense Focus: ${userMemory.topExpenseCategory}
Spending Habit: ${userMemory.spendingHabit}
Past Destinations / Bookings: ${userMemory.recentDestinations.join(", ") || "First trip with TravelNepal"}
==========================================

Destination Mentioned: ${destination}
Available Verified Platform Hotels: ${JSON.stringify(hotels.map(h => ({ name: h.name, location: h.district })))}
Available Verified Platform Restaurants: ${JSON.stringify(restaurants.map(r => ({ name: r.name, cuisine: r.cuisine, location: r.location })))}
Available Tour Guides: ${JSON.stringify(guides.map(g => ({ name: g.name, languages: g.languages, rate: g.dailyRate })))}

Format instructions:
1. Warm greeting using user's name.
2. If asked to plan a trip (e.g. Chinde Danda of Dharan), provide a rich, scenic, practical travel plan:
   - 🌄 **Trip Overview & Scenic Highlights** (Explain what Chinde Danda is famous for: breathtaking sunrise/sunset over Dharan city, paragliding launch point, green hills, serene picnic spot).
   - 📅 **Step-by-Step / Day Itinerary**:
     * 🌅 **Morning**: Reach Dharan Bhanuchowk, explore iconic Dharan Clock Tower, visit historical Budha Subba Temple & Dantakali.
     * 🚗 **Midday / Afternoon**: Head up to Chinde Danda (approx 20-30 mins scenic drive/hike from Dharan bazaar). Experience paragliding or peaceful hillside chill.
     * 🌇 **Late Afternoon & Sunset**: Golden hour panoramic views of Eastern Terai plains and Sunsari hills from the hill ridge.
     * 🍽️ **Evening**: Indulge in authentic Dharani food (famous Dharani Pork Sekuwa / Sel Roti / local snacks at Bhanuchowk).
   - 🚗 **How to Reach & Transport Guide** (Local auto-rickshaws, bikes, or hiking trail from Dharan).
   - 🏨 **Where to Stay & Recommended Dining** (Reference platform verified options).
   - 💰 **Estimated Budget Breakdown (in NPR)** (Transport, Food, Activities like Paragliding).
   - 💡 **Personalized Recommendation For You** (Explicitly reference their travel profile, spending tier "${userMemory.spendingHabit}", and preferences).
3. Use clean markdown, bold titles, bullet points, and neat spacing.
`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemContext}\n\nUser Question: ${message}` }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1200,
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
      console.warn("Gemini direct generation error, falling back to curated itinerary:", e);
    }
  }

  // D. Fallback Curated Travel Plan if Gemini was offline
  if (!generatedAnswer) {
    if (msgLower.includes("chinde") || msgLower.includes("dharan")) {
      generatedAnswer = `Namaste ${userName}! 🙏 Here is your complete, scenic trip plan for **Chinde Danda & Dharan**:

### 🌄 **Trip Overview**
**Chinde Danda (चिण्डे डाँडा)** is a hilltop viewpoint located in Dharan-20 (Sunsari district). It is famed for panoramic 360° vistas of Dharan city, lush green tea-carpeted hills, thrilling **paragliding flights**, and mesmerizing sunset views over the Eastern Terai plains.

---

### 📅 **Ideal 1-Day Itinerary**

#### 🌅 **Morning (08:00 AM – 11:30 AM) – Dharan Cultural Walk**
* **08:00 AM**: Start at **Bhanuchowk** (Dharan Clock Tower) with fresh local tea and traditional breakfast.
* **09:30 AM**: Visit the sacred **Budha Subba Temple** (famous for unique shoot-less bamboos) and **Dantakali Temple** in Bijayapur hillock.

#### 🚗 **Afternoon (12:00 PM – 03:30 PM) – Ascent to Chinde Danda**
* **12:00 PM**: Take a scenic 25-minute drive/bike ride or 1.5-hour nature hike up towards **Chinde Danda**.
* **01:30 PM**: Experience **Tandem Paragliding** soaring over Dharan, or relax with fresh breeze and photography along the ridge.

#### 🌇 **Late Afternoon & Sunset (04:00 PM – 06:00 PM) – Golden Hour**
* **04:30 PM**: Catch the sunset over the valley with clear views of Saptakoshi river in the distance.
* **05:30 PM**: Head back down to Dharan bazaar.

#### 🍽️ **Evening (06:30 PM – 08:30 PM) – Authentic Dharani Feast**
* Indulge in Dharan's world-famous **Pork Sekuwa**, authentic **Tongba**, and local Newari / Kirati specialties around Bhanuchowk.

---

### 🚗 **Transport & Travel Tips**
* **Getting There**: Regular flights/buses to Biratnagar, then a 45-minute drive to Dharan. Local jeeps/scooters easily accessible to Chinde Danda.
* **Best Time to Visit**: September to April for clear blue skies and optimal paragliding wind conditions.

---

### 💰 **Estimated Budget (per person)**
* **Local Transport**: NPR 500 – 1,000
* **Meals & Local Food**: NPR 800 – 1,500
* **Paragliding (Optional)**: NPR 3,500 – 5,000
* **Stay in Dharan**: NPR 1,500 – 3,500/night

---

### 💡 **Personalized For You (${userMemory.spendingHabit})**
* Based on your travel history and **${userMemory.topExpenseCategory}** focus, we recommend reserving accommodations near Bhanuchowk for easy access to morning transport and dining!

🗺️ *Interactive Google Maps navigation cards are linked below for direct turn-by-turn routing!*`;
    } else {
      generatedAnswer = `Namaste ${userName}! 🙏 Here is your curated travel guide and recommendations for **${destination}**:

### 🏔️ **Trip Highlights & Sightseeing**
Explore the top cultural, natural, and historic wonders around ${destination}. Enjoy scenic viewpoints, tranquil nature trails, and authentic local experiences.

### 🏨 **Recommended Stays & Accommodations**
Check out verified hotels and boutique lodges on TravelNepal offering comfortable stays and modern amenities.

### 🍽️ **Local Dining & Food Specialties**
Taste traditional Nepali thali, local specialties, and fresh organic cuisine.

### 💰 **Budget & Planning**
* Budget Stays: NPR 1,500 – 2,500 / night
* Standard Meals: NPR 400 – 900 / meal
* Local Transport: NPR 500 – 1,200 / day

---

### 💡 **Personalized For You**
* Tailored for **${userMemory.spendingHabit}** with focus on **${userMemory.topExpenseCategory}**.

🗺️ *Check the interactive Google Maps cards below for direct locations and routes!*`;
    }
  }

  return {
    answer: generatedAnswer,
    recommendations,
    map_cards: mapCards.slice(0, 4),
    map_url: mapCards[0]?.map_url,
    steps_taken: stepsTaken,
    tools_used: ["database_catalog_search", "google_maps_lookup", "ai_trip_synthesis"],
  };
}
