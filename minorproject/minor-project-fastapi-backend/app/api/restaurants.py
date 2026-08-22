from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.base import Restaurant, Menu
from app.schemas.restaurants import RestaurantCreate, RestaurantOut, MenuCreate, MenuOut
from app.core.security import require_roles
from app.services.catalog_service import search_restaurants, get_restaurant_menus

router = APIRouter(prefix="/restaurants", tags=["restaurants"])

@router.get("", response_model=list[RestaurantOut])
async def list_restaurants(destination: str | None = None, cuisine: str | None = None, limit: int = Query(20, le=100), db=Depends(get_db)):
    return await search_restaurants(db, destination, cuisine, limit)

@router.get("/{restaurant_id}", response_model=RestaurantOut)
async def get_restaurant(restaurant_id: int, db=Depends(get_db)):
    obj = await db.get(Restaurant, restaurant_id)
    if not obj: raise HTTPException(404, "Restaurant not found")
    return obj

@router.post("", response_model=RestaurantOut, status_code=201)
async def create_restaurant(payload: RestaurantCreate, user=Depends(require_roles("restaurantOwner","admin")), db=Depends(get_db)):
    obj = Restaurant(user_id=user.id, **payload.model_dump())
    db.add(obj); await db.commit(); await db.refresh(obj); return obj

@router.get("/{restaurant_id}/menus", response_model=list[MenuOut])
async def list_menus(restaurant_id: int, db=Depends(get_db)):
    return await get_restaurant_menus(db, restaurant_id)

@router.post("/{restaurant_id}/menus", response_model=MenuOut, status_code=201)
async def create_menu(restaurant_id: int, payload: MenuCreate, user=Depends(require_roles("restaurantOwner","admin")), db=Depends(get_db)):
    restaurant = await db.get(Restaurant, restaurant_id)
    if not restaurant: raise HTTPException(404, "Restaurant not found")
    if restaurant.user_id != user.id:
        roles = await __import__("app.core.security", fromlist=["get_user_roles"]).get_user_roles(user.id, db)
        if "admin" not in roles: raise HTTPException(403, "You do not own this restaurant")
    obj = Menu(restaurant_id=restaurant_id, **payload.model_dump())
    db.add(obj); await db.commit(); await db.refresh(obj); return obj
