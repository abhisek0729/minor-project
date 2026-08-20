from sqlalchemy import select, or_, desc
from sqlalchemy.orm import selectinload
from app.models.base import Hotel, Room, Restaurant, Menu, Guide, Place, Booking

async def search_hotels(db, destination=None, max_price=None, limit=20):
    q = select(Hotel).options(selectinload(Hotel.rooms))
    if destination:
        pattern = f"%{destination}%"
        q = q.where(
            or_(
                Hotel.name.ilike(pattern),
                Hotel.district.ilike(pattern),
                Hotel.municipality.ilike(pattern),
                Hotel.province.ilike(pattern),
                Hotel.street.ilike(pattern),
                Hotel.description.ilike(pattern),
            )
        )
    if max_price is not None:
        q = q.join(Room).where(Room.price_per_night <= max_price)
    return list((await db.scalars(q.limit(limit))).unique())

async def search_restaurants(db, destination=None, cuisine=None, limit=20):
    q = select(Restaurant).options(selectinload(Restaurant.menus))
    if destination:
        pattern = f"%{destination}%"
        q = q.where(
            or_(
                Restaurant.name.ilike(pattern),
                Restaurant.location.ilike(pattern),
                Restaurant.description.ilike(pattern),
            )
        )
    if cuisine:
        q = q.where(Restaurant.cuisine.ilike(f"%{cuisine}%"))
    return list((await db.scalars(q.limit(limit))).unique())

async def search_guides(db, destination=None, limit=20):
    q = select(Guide)
    if destination:
        pattern = f"%{destination}%"
        q = q.where(
            or_(
                Guide.name.ilike(pattern),
                Guide.location.ilike(pattern),
                Guide.description.ilike(pattern),
            )
        )
    return list((await db.scalars(q.limit(limit))).all())

async def search_places(db, destination=None, limit=30):
    q = select(Place)
    if destination:
        pattern = f"%{destination}%"
        q = q.where(
            or_(
                Place.name.ilike(pattern),
                Place.location.ilike(pattern),
                Place.description.ilike(pattern),
            )
        )
    return list((await db.scalars(q.limit(limit))).all())

async def search_user_bookings(db, user_id: int, limit=10):
    if not user_id:
        return []
    q = select(Booking).where(Booking.user_id == user_id).order_by(desc(Booking.created_at)).limit(limit)
    return list((await db.scalars(q)).all())

async def get_rooms(db, hotel_id):
    return list((await db.scalars(select(Room).where(Room.hotel_id == hotel_id))).all())

async def get_restaurant_menus(db, restaurant_id):
    return list((await db.scalars(select(Menu).where(Menu.restaurant_id == restaurant_id))).all())
