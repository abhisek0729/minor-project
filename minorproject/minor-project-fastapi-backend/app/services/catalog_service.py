from sqlalchemy import select, or_
from app.models.base import Hotel, Room, Restaurant, Menu, Guide, Place

async def search_hotels(db, destination=None, max_price=None, limit=20):
    q = select(Hotel)
    if destination:
        pattern = f"%{destination}%"
        q = q.where(or_(Hotel.name.ilike(pattern), Hotel.district.ilike(pattern), Hotel.municipality.ilike(pattern), Hotel.province.ilike(pattern), Hotel.street.ilike(pattern)))
    if max_price is not None:
        q = q.join(Room).where(Room.price_per_night <= max_price)
    return list((await db.scalars(q.limit(limit))).unique())

async def search_restaurants(db, destination=None, cuisine=None, limit=20):
    q = select(Restaurant)
    if destination:
        q = q.where(Restaurant.location.ilike(f"%{destination}%"))
    if cuisine:
        q = q.where(Restaurant.cuisine.ilike(f"%{cuisine}%"))
    return list((await db.scalars(q.limit(limit))).unique())

async def search_guides(db, destination=None, limit=20):
    q = select(Guide)
    if destination:
        q = q.where(Guide.location.ilike(f"%{destination}%"))
    return list((await db.scalars(q.limit(limit))).all())

async def search_places(db, destination=None, limit=30):
    q = select(Place)
    if destination:
        q = q.where(or_(Place.location.ilike(f"%{destination}%"), Place.description.ilike(f"%{destination}%")))
    return list((await db.scalars(q.limit(limit))).all())

async def get_rooms(db, hotel_id):
    return list((await db.scalars(select(Room).where(Room.hotel_id == hotel_id))).all())

async def get_restaurant_menus(db, restaurant_id):
    return list((await db.scalars(select(Menu).where(Menu.restaurant_id == restaurant_id))).all())
