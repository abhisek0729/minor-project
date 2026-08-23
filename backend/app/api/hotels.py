from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.base import Hotel, Room
from app.schemas.hotels import HotelCreate, HotelOut, RoomCreate, RoomOut
from app.core.security import get_current_user, require_roles
from app.services.catalog_service import search_hotels, get_rooms

router = APIRouter(prefix="/hotels", tags=["hotels"])

@router.get("", response_model=list[HotelOut])
async def list_hotels(destination: str | None = None, limit: int = Query(20, le=100), db: AsyncSession = Depends(get_db)):
    return await search_hotels(db, destination=destination, limit=limit)

@router.get("/{hotel_id}", response_model=HotelOut)
async def get_hotel(hotel_id: int, db: AsyncSession = Depends(get_db)):
    hotel = await db.get(Hotel, hotel_id)
    if not hotel: raise HTTPException(404, "Hotel not found")
    return hotel

@router.post("", response_model=HotelOut, status_code=201)
async def create_hotel(payload: HotelCreate, user=Depends(require_roles("hotelOwner","admin")), db: AsyncSession = Depends(get_db)):
    hotel = Hotel(user_id=user.id, name=payload.name, description=payload.description, phone_number=payload.phone_number,
        province=payload.province, district=payload.district, municipality=payload.municipality, ward=payload.ward,
        street=payload.street, established_year=payload.established_year, website=payload.website, latitude=payload.latitude,
        longitude=payload.longitude, cover_image_url=payload.cover_image_url, cover_image_public_id=payload.cover_image_public_id)
    db.add(hotel); await db.commit(); await db.refresh(hotel); return hotel

@router.get("/{hotel_id}/rooms", response_model=list[RoomOut])
async def list_rooms(hotel_id: int, db: AsyncSession = Depends(get_db)):
    return await get_rooms(db, hotel_id)

@router.post("/{hotel_id}/rooms", response_model=RoomOut, status_code=201)
async def create_room(hotel_id: int, payload: RoomCreate, user=Depends(require_roles("hotelOwner","admin")), db: AsyncSession = Depends(get_db)):
    hotel = await db.get(Hotel, hotel_id)
    if not hotel: raise HTTPException(404, "Hotel not found")
    if hotel.user_id != user.id and "admin" not in await _roles(user.id, db):
        raise HTTPException(403, "You do not own this hotel")
    room = Room(hotel_id=hotel_id, room_number=payload.room_number, room_type=payload.room_type,
        description=payload.description, price_per_night=payload.price_per_night, capacity=payload.capacity, status=payload.status)
    db.add(room); await db.commit(); await db.refresh(room); return room

async def _roles(user_id, db):
    from app.core.security import get_user_roles
    return await get_user_roles(user_id, db)
