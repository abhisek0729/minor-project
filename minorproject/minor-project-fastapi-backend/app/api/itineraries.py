from datetime import datetime, time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from app.db.session import get_db
from app.models.base import Itinerary, ItineraryDay, ItineraryItem
from app.schemas.itinerary import ItineraryCreate, ItineraryDayCreate, ItineraryOut, ItineraryDetail
from app.core.security import get_current_user

router = APIRouter(prefix="/itineraries", tags=["itineraries"])

def at_midnight(d):
    return datetime.combine(d, time.min)

@router.get("", response_model=list[ItineraryOut])
async def list_itineraries(user=Depends(get_current_user), db=Depends(get_db)):
    return list((await db.scalars(select(Itinerary).where(Itinerary.user_id == user.id).order_by(Itinerary.created_at.desc()))).all())

@router.get("/{itinerary_id}", response_model=ItineraryDetail)
async def get_itinerary(itinerary_id: int, user=Depends(get_current_user), db=Depends(get_db)):
    obj = await db.scalar(select(Itinerary).where(Itinerary.id == itinerary_id, Itinerary.user_id == user.id))
    if not obj: raise HTTPException(404, "Itinerary not found")
    days = list((await db.scalars(select(ItineraryDay).where(ItineraryDay.itinerary_id == obj.id).order_by(ItineraryDay.day_number))).all())
    out = []
    for day in days:
        items = list((await db.scalars(select(ItineraryItem).where(ItineraryItem.day_id == day.id).order_by(ItineraryItem.sequence))).all())
        out.append({"id":day.id,"day_number":day.day_number,"date":day.date,"title":day.title,"estimated_cost":day.estimated_cost,
                    "items":[{"id":i.id,"sequence":i.sequence,"start_time":i.start_time,"end_time":i.end_time,"item_type":i.item_type,"title":i.title,
                              "description":i.description,"estimated_cost":i.estimated_cost,"entity_id":i.entity_id,"location":i.location} for i in items]})
    return ItineraryDetail.model_validate({**obj.__dict__, "days": out})

@router.post("", response_model=ItineraryOut, status_code=201)
async def create_itinerary(payload: ItineraryCreate, user=Depends(get_current_user), db=Depends(get_db)):
    obj = Itinerary(user_id=user.id, title=payload.title, destination=payload.destination,
                    start_date=at_midnight(payload.start_date), end_date=at_midnight(payload.end_date),
                    budget=payload.budget, currency=payload.currency, travel_style=payload.travel_style)
    db.add(obj); await db.commit(); await db.refresh(obj); return obj

@router.post("/{itinerary_id}/days", status_code=201)
async def add_day(itinerary_id: int, payload: ItineraryDayCreate, user=Depends(get_current_user), db=Depends(get_db)):
    obj = await db.scalar(select(Itinerary).where(Itinerary.id==itinerary_id, Itinerary.user_id==user.id))
    if not obj: raise HTTPException(404, "Itinerary not found")
    day = ItineraryDay(itinerary_id=obj.id, day_number=payload.day_number, date=at_midnight(payload.date), title=payload.title, estimated_cost=payload.estimated_cost)
    db.add(day); await db.flush()
    for item in payload.items:
        db.add(ItineraryItem(day_id=day.id, **item.model_dump()))
    await db.commit()
    return {"id": day.id, "message":"Day added"}
