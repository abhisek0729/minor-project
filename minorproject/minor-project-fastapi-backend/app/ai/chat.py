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
        stopwords = {"the", "and", "for", "with", "show", "tell", "what", "where", "how", "can", "you", "plan", "trip", "find", "best", "some", "good", "hotel", "hotels", "stay", "stays", "food", "restaurant", "restaurants", "guide", "guides", "trek", "place", "places", "budget"}
        found = [w for w in words if w.lower() not in stopwords]
    return found

async def chat(db, req):
    user_msg = req.message or ""
    destination = req.destination or ""
    user_roles = req.user_roles or []
    steps_taken = []

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

    # 2. QUERY & INFORMATION RETRIEVAL
    keywords = extract_query_keywords(user_msg)
    search_term = destination or (keywords[0] if keywords else None)
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
