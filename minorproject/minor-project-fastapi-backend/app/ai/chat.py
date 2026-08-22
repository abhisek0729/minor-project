import re
from app.ai.gemini import GeminiService
from app.ai.prompts import CHAT_SYSTEM, AGENT_SYSTEM
from app.services.catalog_service import (
    search_hotels,
    search_restaurants,
    search_guides,
    search_places,
    search_user_bookings,
)
from app.services.maps_service import GoogleMapsService
from app.services.web_search_service import WebSearchService
from app.schemas.ai import ChatResponse, Recommendation, ActionProposal, MapCard
from app.core.config import settings
from app.ai.tools import TourismAgentToolset
from app.ai.action_agent import process_action_request

COMMON_LOCATIONS = [
    "kathmandu", "pokhara", "chitwan", "lumbini", "bhaktapur",
    "lalitpur", "patan", "annapurna", "everest", "mustang",
    "nagarkot", "bandipur", "dharan", "itahari", "biratnagar",
    "illam", "rara", "bardia", "janakpur", "gorkha", "manang"
]

def extract_query_keywords(text: str) -> list[str]:
    text_lower = text.lower()
    found = []
    for loc in COMMON_LOCATIONS:
        if loc in text_lower:
            found.append(loc)
    
    if not found:
        words = re.findall(r"\b[A-Za-z]{3,}\b", text)
        stopwords = {
            "the", "and", "for", "with", "show", "tell", "what", "where", "how", "can", "you",
            "plan", "trip", "find", "best", "some", "good", "hotel", "hotels", "stay", "stays",
            "food", "foods", "restaurant", "restaurants", "guide", "guides", "trek", "place", "places",
            "budget", "eat", "eating", "pork", "momo", "momos", "thakali", "sekuwa", "sukuti",
            "buff", "chicken", "mutton", "dish", "dishes", "lunch", "dinner", "breakfast", "cafe"
        }
        found = [w for w in words if w.lower() not in stopwords]
    return found

async def chat(db, req):
    user_msg = req.message or ""
    destination = req.destination or ""
    user_roles = req.user_roles or []
    steps_taken = []
    msg_lower = user_msg.lower().strip()

    # 0. OUT-OF-DOMAIN & NON-TOURISM GUARDRAIL
    out_of_domain_patterns = [
        r"\b(c|c\+\+|cpp|python|javascript|typescript|java|rust|golang|ruby|php|html|css|sql)\s+(code|program|script|function|syntax|compiler)\b",
        r"\b(write|generate|give|create|build)\s+(a\s+)?([a-z0-9#\+]+)?\s*(code|script|program|algorithm|class|function|regex|sql)\b",
        r"\b(code\s+for|program\s+to|code\s+to|coding|algorithm|debugging|debug\s+this|compile\s+this|hello\s*world|fibonacci|bubble\s*sort)\b",
        r"\b(write\s+(an?\s+)?(essay|poem|song|story|lyrics|speech))\s+(about|on)\s+(?!nepal|travel|trek|himalaya|tourism|everest|pokhara|kathmandu)",
        r"\b(solve|calculate)\s+(math|equation|algebra|calculus|physics|integral|derivative|geometry)\b",
        r"\b(crypto|bitcoin|ethereum|forex\s+trading|stock\s+market|stock\s+price\s+of)\b",
        r"\b(medical\s+advice|diagnose\s+my|cure\s+for|symptoms\s+of\s+cancer)\b",
    ]

    has_travel_context = any(
        k in msg_lower for k in [
            "nepal", "travel", "trip", "trek", "tour", "hotel", "stay", "room",
            "food", "restaurant", "dish", "expense", "booking", "guide",
            "platform", "workspace", "khalti"
        ]
    )

    is_out_of_domain = any(re.search(p, msg_lower) for p in out_of_domain_patterns) and not has_travel_context

    if is_out_of_domain:
        steps_taken.append("🔒 Guardrail: Filtered out-of-domain / non-tourism request")
        return ChatResponse(
            answer=(
                "Namaste! 🙏 I am your **TravelNepal AI Specialist**, focused exclusively on travel, tourism, and platform operations across Nepal.\n\n"
                "I cannot assist with programming, general coding, academic assignments, or topics outside Nepal tourism.\n\n"
                "🌟 **Here is what I can help you with:**\n"
                "• 🗺️ **Trip & Trek Planning**: Custom routes, day trips, and itineraries across Nepal\n"
                "• 🏨 **Hotels & Stays**: Live recommendations and verified bookings via Khalti\n"
                "• 🍽️ **Food & Dining**: Finding authentic dishes, local eateries, and restaurant menus\n"
                "• 🧗 **Tour Guides**: Connecting with licensed Himalayan guides and porters\n"
                "• 💰 **Travel Expenses**: Logging and categorizing your travel spending\n"
                "• 🏢 **Partner Workspaces**: Managing your hotel, restaurant, or guide listings\n\n"
                "Please feel free to ask any question about traveling in Nepal or using the TravelNepal platform!"
            ),
            steps_taken=steps_taken,
            tools_used=["guardrail_filter"],
        )

    # 1. ACTION & FORM ASSISTANT (HITL)
    action_result = await process_action_request(user_msg, user_roles, req.history or [])
    if action_result and action_result.get("is_action"):
        steps_taken.append("⚡ Detected action intent & extracted form parameters")
        action_type = action_result.get("action_type")
        is_complete = action_result.get("is_complete", False)
        
        if not is_complete:
            steps_taken.append("❓ Identified missing required parameters")
            return ChatResponse(
                answer=action_result.get("clarification_question") or "Could you provide a few more details to complete this request?",
                steps_taken=steps_taken,
                tools_used=["action_slot_analyzer"],
            )
        else:
            steps_taken.append("📋 Compiled Human-In-The-Loop Action Proposal card")
            proposal = ActionProposal(
                action_type=action_type,
                title=action_result.get("proposal_title") or f"Proposed Action: {action_type}",
                description=action_result.get("proposal_summary") or "Please confirm this action to proceed.",
                payload=action_result.get("extracted_payload") or {},
                status="requires_approval",
            )
            return ChatResponse(
                answer="✨ I have prepared your request! Please review the details below and click **Confirm & Execute** to save it to your platform.",
                action_proposal=proposal,
                steps_taken=steps_taken,
                tools_used=["action_intent_compiler", "hitl_proposal_generator"],
            )

    # 1.5 NEARBY / NEAR ME LOCATION INTENT
    is_near_me = any(
        k in msg_lower for k in [
            "near me", "nearest hotel", "nearest stay", "nearest restaurant", "nearest food",
            "hotels near me", "hotel near me", "stays near me", "nearby hotel",
            "nearby stays", "nearby restaurant", "places near me"
        ]
    )
    nep_cities = [
        "butwal", "kathmandu", "pokhara", "lumbini", "dharan", "chitwan", "sauraha",
        "nagarkot", "bhaktapur", "lalitpur", "biratnagar", "mustang", "manang",
        "bandipur", "ilam", "janakpur", "gorkha", "hetauda", "nepalgunj",
        "bhairahawa", "dhangadhi", "itahari", "birtamod", "damak"
    ]
    has_city_in_msg = any(c in msg_lower for c in nep_cities)

    # Check if user is replying to previous location question
    last_assistant_text = ""
    if req.history:
        for prev in reversed(req.history):
            role = getattr(prev, "role", None) or (prev.get("role") if isinstance(prev, dict) else "")
            if role in ["assistant", "model"]:
                last_assistant_text = str(
                    getattr(prev, "content", None) or getattr(prev, "text", None) or (prev.get("text", "") if isinstance(prev, dict) else "")
                ).lower()
                break

    is_answering_location = (
        "where are you currently located in nepal" in last_assistant_text or
        "let me know your current city" in last_assistant_text
    )

    if is_answering_location:
        for c in nep_cities:
            if c in msg_lower:
                destination = c.capitalize()
                steps_taken.append(f"📍 Received traveler location: '{destination}'")
                break
        if not destination:
            destination = user_msg.replace("i am in", "").replace("in", "").strip().capitalize()

    elif is_near_me and not has_city_in_msg:
        steps_taken.append("📍 Detected 'near me' query — Prompted traveler for current city/location")
        return ChatResponse(
            answer=(
                "📍 **Where are you currently located in Nepal?**\n\n"
                "Please let me know your current city or area (e.g., *Butwal, Kathmandu, Pokhara, Dharan, Chitwan, Lumbini*).\n\n"
                "Once you tell me your location, I will immediately search our verified platform database and live Google Maps to find the closest top-rated hotels, stays, and restaurants for you!"
            ),
            steps_taken=steps_taken,
            tools_used=["location_slot_analyzer"],
        )

    # 2. QUERY & INFORMATION RETRIEVAL
    keywords = extract_query_keywords(user_msg)
    search_term = destination or (keywords[0] if keywords else None)

    # Conversational History Fallback for Search Term
    if not search_term and req.history:
        for prev in reversed(req.history):
            prev_text = getattr(prev, "content", None) or getattr(prev, "text", "") or (prev.get("text", "") if isinstance(prev, dict) else "")
            prev_keywords = extract_query_keywords(str(prev_text))
            if prev_keywords:
                search_term = prev_keywords[0]
                steps_taken.append(f"🧠 Maintained active destination from conversation history: '{search_term.capitalize()}'")
                break

    msg_lower = user_msg.lower()
    is_asking_bookings = any(k in msg_lower for k in ["my booking", "my trip", "my reservation", "booked", "my stay"])

    # Priority 1: Search Platform Database
    steps_taken.append(f"🔍 Searching TravelNepal platform database for '{search_term or 'Nepal'}'")
    hotels = await search_hotels(db, search_term, limit=6)
    restaurants = await search_restaurants(db, search_term, limit=6)
    places = await search_places(db, search_term, limit=6)
    guides = await search_guides(db, search_term, limit=4)
    
    user_bookings = []
    if is_asking_bookings and req.user_id:
        steps_taken.append("👤 Retrieved your authenticated bookings & reservations")
        user_bookings = await search_user_bookings(db, req.user_id, limit=5)

    # Fallback to broader database query if specific term returned empty
    if not hotels and not restaurants and not places and not guides:
        hotels = await search_hotels(db, None, limit=3)
        restaurants = await search_restaurants(db, None, limit=3)
        places = await search_places(db, None, limit=3)
        guides = await search_guides(db, None, limit=3)

    # Priority 2: Web Search via DuckDuckGo / Tavily (if needed)
    web_results = []
    needs_web_search = len(hotels) + len(restaurants) + len(places) < 2 or any(
        k in msg_lower for k in ["weather", "permit", "festival", "route", "visa", "bus time", "flight time", "current", "latest"]
    )

    if needs_web_search and search_term:
        steps_taken.append(f"🌐 Searched web via DuckDuckGo for live info on '{search_term}'")
        searcher = WebSearchService()
        web_results = await searcher.search(f"{search_term} {user_msg}", max_results=3)

    # Priority 3: Google Maps Location Generation
    steps_taken.append("📍 Generated Google Maps location & navigation links")
    maps_service = GoogleMapsService()
    map_cards = []

    # Add places to map cards
    for p in places[:3]:
        map_url = maps_service.build_search_url(p.location, p.name)
        map_cards.append(MapCard(
            title=p.name,
            location=p.location,
            map_url=map_url,
            place_type="destination",
        ))

    for h in hotels[:2]:
        loc_str = f"{h.district or ''}, Nepal"
        map_url = maps_service.build_search_url(loc_str, h.name)
        map_cards.append(MapCard(
            title=h.name,
            location=loc_str,
            map_url=map_url,
            place_type="hotel",
        ))

    for r in restaurants[:2]:
        map_url = maps_service.build_search_url(r.location or "Nepal", r.name)
        map_cards.append(MapCard(
            title=r.name,
            location=r.location or "Nepal",
            map_url=map_url,
            place_type="restaurant",
        ))

    # Format Candidates for LLM
    hotels_context = [
        {
            "id": h.id,
            "name": h.name,
            "location": f"{h.district or ''}, {h.province or ''}".strip(", "),
            "rooms": [f"{r.room_type} (NPR {int(r.price_per_night)})" for r in (h.rooms or [])] or ["Standard Room"],
            "url": f"/hotels/{h.id}",
            "map_url": maps_service.build_search_url(h.district or "Nepal", h.name),
        }
        for h in hotels
    ]

    restaurants_context = [
        {
            "id": r.id,
            "name": r.name,
            "cuisine": r.cuisine or "Multi-Cuisine",
            "location": r.location or "Nepal",
            "sample_menu": [f"{m.name} (NPR {m.price})" for m in (r.menus or [])[:3]] or ["Nepali Thali"],
            "url": f"/restaurants/{r.id}",
            "map_url": maps_service.build_search_url(r.location or "Nepal", r.name),
        }
        for r in restaurants
    ]

    places_context = [
        {
            "name": p.name,
            "location": p.location,
            "description": p.description,
            "map_url": maps_service.build_search_url(p.location, p.name),
        }
        for p in places
    ]

    guides_context = [
        {
            "name": g.name,
            "location": g.location,
            "bio": g.description,
        }
        for g in guides
    ]

    bookings_context = [
        {
            "item_name": b.entity_name,
            "status": b.booking_status,
            "cost": f"NPR {int(b.total_cost)}" if b.total_cost else "NPR 0",
        }
        for b in user_bookings
    ]

    candidates_summary = {
        "platform_hotels": hotels_context,
        "platform_restaurants": restaurants_context,
        "platform_places": places_context,
        "platform_guides": guides_context,
        "user_bookings": bookings_context if is_asking_bookings else [],
        "web_insights": web_results,
    }

    user_greeting = f"User: {req.user_name} (Roles: {', '.join(req.user_roles) if req.user_roles else 'Tourist'})"

    prompt = f"""{AGENT_SYSTEM}
{CHAT_SYSTEM}
Context:
- {user_greeting}
- Location Focus: {search_term or 'Nepal'}
- Live Candidates:
{candidates_summary}

Instructions:
1. Always prioritize and cite the verified platform candidates (Hotels, Restaurants, Places, Guides) first.
2. If web insights are present, incorporate helpful external travel advice smoothly.
3. Clearly mention live Google Maps search links and prices.
4. If the user asks about their personal bookings, summarize them truthfully from the data provided.
5. Tone: Knowledgeable, enthusiastic Nepal tourism assistant.

User Query: {user_msg}
"""

    service = GeminiService()
    if service.client:
        try:
            response = await service.client.aio.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
            )
            answer = response.text or "Here are verified travel recommendations for your Nepal trip."
        except Exception as e:
            print("Gemini API Error:", e)
            answer = build_fallback_answer(user_msg, search_term, candidates_summary)
    else:
        answer = build_fallback_answer(user_msg, search_term, candidates_summary)

    # Recommendations
    recs = []
    for h in hotels_context[:2]:
        recs.append(Recommendation(
            entity_type="hotel",
            entity_id=h["id"],
            name=h["name"],
            reason=f"Hotel in {h['location']} with {', '.join(h['rooms'][:1])}",
            location=h["location"],
            map_url=h["map_url"],
            booking_note=f"Visit {h['url']} to reserve.",
        ))

    for r in restaurants_context[:2]:
        recs.append(Recommendation(
            entity_type="restaurant",
            entity_id=r["id"],
            name=r["name"],
            reason=f"{r['cuisine']} in {r['location']}. Dishes: {', '.join(r['sample_menu'][:2])}",
            location=r["location"],
            map_url=r["map_url"],
            booking_note=f"Visit {r['url']} for menu.",
        ))

    for p in places_context[:2]:
        recs.append(Recommendation(
            entity_type="place",
            entity_id=1,
            name=p["name"],
            reason=p.get("description", "Top attraction in Nepal"),
            location=p["location"],
            map_url=p["map_url"],
        ))

    return ChatResponse(
        answer=answer,
        recommendations=recs,
        map_url=map_cards[0].map_url if map_cards else None,
        map_cards=map_cards[:4],
        steps_taken=steps_taken,
        itinerary_summary=f"Queried {len(hotels)} hotels, {len(restaurants)} food spots, {len(places)} destinations.",
        tools_used=["database_catalog_search", "google_maps_lookup", "web_search"],
    )

def build_fallback_answer(user_msg: str, destination: str | None, candidates: dict) -> str:
    hotels = candidates.get("platform_hotels", [])
    restaurants = candidates.get("platform_restaurants", [])
    places = candidates.get("platform_places", [])
    web = candidates.get("web_insights", [])

    lines = [f"Here are top verified recommendations for {destination or 'Nepal'}:\n"]

    if places:
        lines.append("🏔️ **Popular Destinations:**")
        for p in places[:3]:
            lines.append(f"- **{p['name']}** ({p['location']}) - [View on Google Maps]({p['map_url']})")

    if hotels:
        lines.append("\n🏨 **Hotels & Stays:**")
        for h in hotels[:3]:
            lines.append(f"- **{h['name']}** ({h['location']}) - {', '.join(h['rooms'][:1])} - [Map Link]({h['map_url']})")

    if restaurants:
        lines.append("\n🍽️ **Dining & Food:**")
        for r in restaurants[:3]:
            lines.append(f"- **{r['name']}** ({r['cuisine']}) in {r['location']} - [Map Link]({r['map_url']})")

    if web:
        lines.append("\n🌐 **Web Insights:**")
        for w in web[:2]:
            lines.append(f"- **{w['title']}**: {w['snippet'][:120]}...")

    return "\n".join(lines)
