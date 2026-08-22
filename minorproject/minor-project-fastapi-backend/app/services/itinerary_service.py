from datetime import datetime, time
from app.models.base import Itinerary, ItineraryDay, ItineraryItem

def midnight(d):
    return datetime.combine(d, time.min)

async def save_generated_itinerary(db, user_id: int, request, generated):
    obj = Itinerary(
        user_id=user_id,
        title=generated.title,
        destination=generated.destination,
        start_date=midnight(request.start_date),
        end_date=midnight(request.end_date),
        budget=request.budget,
        currency=request.currency,
        travel_style=request.travel_style,
        status="draft",
    )
    db.add(obj)
    await db.flush()

    for day in generated.days:
        db_day = ItineraryDay(
            itinerary_id=obj.id,
            day_number=day.day_number,
            date=midnight(day.date),
            title=day.title,
            estimated_cost=day.estimated_cost,
        )
        db.add(db_day)
        await db.flush()
        for item in day.items:
            db.add(ItineraryItem(day_id=db_day.id, **item.model_dump()))
    await db.commit()
    await db.refresh(obj)
    return obj
