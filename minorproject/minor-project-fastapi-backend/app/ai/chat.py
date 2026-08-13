from app.ai.gemini import GeminiService
from app.ai.prompts import CHAT_SYSTEM
from app.services.catalog_service import search_hotels, search_restaurants, search_guides, search_places
from app.schemas.ai import ChatResponse, Recommendation
from app.core.config import settings

async def chat(db, req):
    hotels = await search_hotels(db, req.destination) if req.destination else []
    restaurants = await search_restaurants(db, req.destination) if req.destination else []
    places = await search_places(db, req.destination) if req.destination else []
    guides = await search_guides(db, req.destination) if req.destination else []
    candidates = {
        "hotels": [{"id": h.id, "name": h.name, "location": h.district} for h in hotels[:8]],
        "restaurants": [{"id": r.id, "name": r.name, "location": r.location, "cuisine": r.cuisine} for r in restaurants[:8]],
        "places": [{"id": p.id, "name": p.name, "location": p.location} for p in places[:8]],
        "guides": [{"id": g.id, "name": g.name, "location": g.location} for g in guides[:5]],
    }
    prompt = f"""{CHAT_SYSTEM}
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
    recs = [Recommendation(entity_type="place", entity_id=p.id, name=p.name, reason=p.description) for p in places[:5]]
    return ChatResponse(answer=answer, recommendations=recs)
