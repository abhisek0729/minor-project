import json
from datetime import date
from decimal import Decimal
from pydantic import BaseModel, Field
from app.ai.gemini import GeminiService
from app.ai.prompts import ITINERARY_SYSTEM
from app.services.catalog_service import search_hotels, search_restaurants, search_guides, search_places

class GeneratedItem(BaseModel):
    sequence: int
    start_time: str | None = None
    end_time: str | None = None
    item_type: str
    title: str
    description: str
    estimated_cost: Decimal = Field(default=0, ge=0)
    entity_id: int | None = None
    location: str | None = None

class GeneratedDay(BaseModel):
    day_number: int
    date: date
    title: str
    estimated_cost: Decimal = Field(default=0, ge=0)
    items: list[GeneratedItem]

class GeneratedItinerary(BaseModel):
    title: str
    destination: str
    total_estimated_cost: Decimal
    explanation: str
    days: list[GeneratedDay]

async def generate_itinerary(db, request):
    nights = max(1, (request.end_date - request.start_date).days)
    hotels = await search_hotels(db, request.destination, request.budget / nights)
    restaurants = await search_restaurants(db, request.destination, request.cuisine_preferences[0] if request.cuisine_preferences else None)
    guides = await search_guides(db, request.destination)
    places = await search_places(db, request.destination)

    candidates = {
        "hotels": [{"id": h.id, "name": h.name, "location": f"{h.street}, {h.district}", "description": h.description} for h in hotels],
        "restaurants": [{"id": r.id, "name": r.name, "location": r.location, "cuisine": r.cuisine, "description": r.description} for r in restaurants],
        "guides": [{"id": g.id, "name": g.name, "location": g.location, "description": g.description} for g in guides],
        "places": [{"id": p.id, "name": p.name, "location": p.location, "description": p.description} for p in places],
    }
    if not any(candidates.values()):
        raise ValueError("No tourism candidates found for this destination")

    prompt = f"""{ITINERARY_SYSTEM}
Trip request:
destination={request.destination}
start_date={request.start_date}
end_date={request.end_date}
budget={request.budget} {request.currency}
travelers={request.travelers}
travel_style={request.travel_style}
interests={request.interests}
hotel_preference={request.hotel_preference}
cuisine_preferences={request.cuisine_preferences}

Candidate database records:
{json.dumps(candidates, default=str)}
"""
    result = await GeminiService().generate_json(prompt, GeneratedItinerary.model_json_schema())
    itinerary = GeneratedItinerary.model_validate_json(result)

    valid_ids = {
        "hotel": {x["id"] for x in candidates["hotels"]},
        "restaurant": {x["id"] for x in candidates["restaurants"]},
        "guide": {x["id"] for x in candidates["guides"]},
        "place": {x["id"] for x in candidates["places"]},
    }
    for day in itinerary.days:
        for item in day.items:
            if item.item_type in valid_ids and item.entity_id is not None and item.entity_id not in valid_ids[item.item_type]:
                item.entity_id = None
    return itinerary
