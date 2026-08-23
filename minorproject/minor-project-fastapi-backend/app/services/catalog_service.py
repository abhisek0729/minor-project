from sqlalchemy import select, or_, desc
from sqlalchemy.orm import selectinload
from app.models.base import Hotel, Room, Restaurant, Menu, Guide, Place, Booking, Expense

DISTRICT_ALIASES = {
    "pokhara": ["Kaski", "Pokhara", "Lakeside"],
    "kathmandu": ["Kathmandu", "Thamel", "Lalitpur", "Bhaktapur", "Patan"],
    "chitwan": ["Chitwan", "Sauraha", "Bharatpur"],
    "lumbini": ["Rupandehi", "Lumbini", "Bhairahawa", "Butwal"],
    "butwal": ["Rupandehi", "Butwal"],
    "mustang": ["Mustang", "Jomsom", "Muktinath"],
    "everest": ["Solukhumbu", "Namche", "Lukla", "Everest"],
    "annapurna": ["Kaski", "Mustang", "Manang", "Myagdi"],
    "dharan": ["Sunsari", "Dharan", "Bhedetar"],
    "nagarkot": ["Bhaktapur", "Nagarkot", "Kavre"],
    "janakpur": ["Dhanusha", "Janakpur"],
    "rara": ["Mugu", "Rara"],
    "bardia": ["Bardiya", "Bardia"],
    "bandipur": ["Tanahun", "Bandipur"],
    "ilam": ["Ilam"],
    "gorkha": ["Gorkha", "Manaslu"],
    "langtang": ["Rasuwa", "Langtang"],
}

def get_location_keywords(destination: str | None) -> list[str]:
    if not destination:
        return []
    dest_clean = destination.strip().lower()
    for key, aliases in DISTRICT_ALIASES.items():
        if key in dest_clean or dest_clean in key:
            return aliases
    return [destination.strip()]

async def search_hotels(db, destination=None, max_price=None, limit=20):
    q = select(Hotel).options(selectinload(Hotel.rooms))
    if destination:
        keywords = get_location_keywords(destination)
        # Priority 1: Match district or municipality directly
        dist_clauses = [
            Hotel.district.ilike(f"%{kw}%") for kw in keywords if kw not in ["Lakeside", "Thamel", "Sauraha"]
        ] + [
            Hotel.municipality.ilike(f"%{kw}%") for kw in keywords
        ]
        
        # If user searched "Pokhara", also allow Gandaki Province hotels if needed
        if "pokhara" in destination.lower() or "kaski" in destination.lower():
            dist_clauses.append(Hotel.province.ilike("%Gandaki%"))
        elif "kathmandu" in destination.lower():
            dist_clauses.append(Hotel.province.ilike("%Bagmati%"))
        elif "dharan" in destination.lower():
            dist_clauses.append(Hotel.province.ilike("%Koshi%"))
        elif "lumbini" in destination.lower() or "butwal" in destination.lower():
            dist_clauses.append(Hotel.province.ilike("%Lumbini%"))

        if dist_clauses:
            q = q.where(or_(*dist_clauses))

    if max_price is not None:
        q = q.join(Room).where(Room.price_per_night <= max_price)
    return list((await db.scalars(q.limit(limit))).unique())

async def search_restaurants(db, destination=None, cuisine=None, limit=20):
    q = select(Restaurant).options(selectinload(Restaurant.menus))
    if destination:
        keywords = get_location_keywords(destination)
        clauses = []
        for kw in keywords:
            if kw not in ["Lakeside", "Thamel", "Sauraha"]:
                clauses.append(Restaurant.location.ilike(f"%{kw}%"))
        
        if "pokhara" in destination.lower() or "kaski" in destination.lower():
            clauses.append(Restaurant.location.ilike("%Gandaki%"))
            clauses.append(Restaurant.location.ilike("%Kaski%"))
        elif "kathmandu" in destination.lower():
            clauses.append(Restaurant.location.ilike("%Kathmandu%"))
            clauses.append(Restaurant.location.ilike("%Bagmati%"))

        if clauses:
            q = q.where(or_(*clauses))
    if cuisine:
        q = q.where(Restaurant.cuisine.ilike(f"%{cuisine}%"))
    return list((await db.scalars(q.limit(limit))).unique())

async def search_guides(db, destination=None, limit=20):
    q = select(Guide)
    if destination:
        keywords = get_location_keywords(destination)
        clauses = []
        for kw in keywords:
            pat = f"%{kw}%"
            clauses.extend([
                Guide.location.ilike(pat),
                Guide.name.ilike(pat),
            ])
        q = q.where(or_(*clauses))
    return list((await db.scalars(q.limit(limit))).all())

async def search_places(db, destination=None, limit=30):
    q = select(Place)
    if destination:
        keywords = get_location_keywords(destination)
        clauses = []
        for kw in keywords:
            pat = f"%{kw}%"
            clauses.extend([
                Place.location.ilike(pat),
                Place.name.ilike(pat),
            ])
        q = q.where(or_(*clauses))
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

async def search_user_expenses(db, user_id: int, limit=50):
    if not user_id:
        return []
    q = select(Expense).where(Expense.user_id == user_id).order_by(desc(Expense.created_at)).limit(limit)
    return list((await db.scalars(q)).all())

