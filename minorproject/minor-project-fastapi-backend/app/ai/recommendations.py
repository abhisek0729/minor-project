from app.services.catalog_service import search_hotels, search_restaurants, search_guides, search_places
from app.schemas.ai import RecommendationResponse, Recommendation

async def recommend(db, req):
    hotels = await search_hotels(db, req.destination, req.budget)
    restaurants = []
    cuisines = req.cuisine_preferences or [None]
    for cuisine in cuisines[:3]:
        restaurants.extend(await search_restaurants(db, req.destination, cuisine))
    guides = await search_guides(db, req.destination)
    places = await search_places(db, req.destination)

    recommendations = []
    for h in hotels[:3]:
        recommendations.append(Recommendation(entity_type="hotel", entity_id=h.id, name=h.name, reason=f"Located in {h.district}, suitable for a {req.travel_style} trip."))
    for r in restaurants[:3]:
        recommendations.append(Recommendation(entity_type="restaurant", entity_id=r.id, name=r.name, reason=f"{r.cuisine} cuisine in {r.location}."))
    for p in places[:5]:
        recommendations.append(Recommendation(entity_type="place", entity_id=p.id, name=p.name, reason=p.description))
    for g in guides[:2]:
        recommendations.append(Recommendation(entity_type="guide", entity_id=g.id, name=g.name, reason=f"Guide available in {g.location}."))
    return RecommendationResponse(recommendations=recommendations)
