from app.ai.gemini import GeminiService
from app.ai.prompts import CHAT_SYSTEM, AGENT_SYSTEM
from app.services.catalog_service import search_hotels, search_restaurants, search_guides, search_places
from app.schemas.ai import ChatResponse, Recommendation
from app.core.config import settings
from app.ai.tools import TourismAgentToolset


async def chat(db, req):
    hotels = await search_hotels(db, req.destination) if req.destination else []
    restaurants = await search_restaurants(db, req.destination) if req.destination else []
    places = await search_places(db, req.destination) if req.destination else []
    guides = await search_guides(db, req.destination) if req.destination else []

    toolset = TourismAgentToolset()
    candidates = {
        "hotels": [
            {
                **toolset.build_place_context(name=h.name, location=f"{h.district}, {h.province}", place_type="hotel"),
                "id": h.id,
            }
            for h in hotels[:8]
        ],
        "restaurants": [
            {
                **toolset.build_place_context(name=r.name, location=r.location, place_type="restaurant", note=r.cuisine),
                "id": r.id,
                "cuisine": r.cuisine,
            }
            for r in restaurants[:8]
        ],
        "places": [
            {
                **toolset.build_place_context(name=p.name, location=p.location, place_type="destination", note=p.description),
                "id": p.id,
            }
            for p in places[:8]
        ],
        "guides": [
            {
                **toolset.build_place_context(name=g.name, location=g.location, place_type="guide", note=g.description),
                "id": g.id,
            }
            for g in guides[:5]
        ],
    }

    prompt = f"""{AGENT_SYSTEM}
{CHAT_SYSTEM}
User message: {req.message}
Destination: {req.destination}
Budget: {req.budget}
Candidates: {candidates}
"""
    service = GeminiService()
    if service.client:
        response = await service.client.aio.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
        )
        answer = response.text
    else:
        answer = "AI is not configured. Use /ai/recommendations for database-backed recommendations."

    recs = [
        Recommendation(
            entity_type="place",
            entity_id=p.id,
            name=p.name,
            reason=p.description,
            location=p.location,
            map_url=toolset.build_place_context(name=p.name, location=p.location, place_type="destination")["map_url"],
        )
        for p in places[:5]
    ]
    return ChatResponse(
        answer=answer,
        recommendations=recs,
        map_url=(candidates["places"][0]["map_url"] if candidates["places"] else None),
        itinerary_summary=f"{len(candidates['hotels'])} hotel options, {len(candidates['restaurants'])} food options, {len(candidates['places'])} destination ideas, and {len(candidates['guides'])} guides considered.",
        tools_used=["google_maps_lookup", "destination_filter", "booking_context"],
    )
