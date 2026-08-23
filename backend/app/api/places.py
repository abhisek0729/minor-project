from fastapi import APIRouter, Depends, HTTPException, Query
from app.db.session import get_db
from app.models.base import Place
from app.schemas.places import PlaceCreate, PlaceOut
from app.core.security import require_roles
from app.services.catalog_service import search_places

router = APIRouter(prefix="/places", tags=["places"])

@router.get("", response_model=list[PlaceOut])
async def list_places(destination: str | None = None, limit: int = Query(30, le=100), db=Depends(get_db)):
    return await search_places(db, destination, limit)

@router.get("/{place_id}", response_model=PlaceOut)
async def get_place(place_id: int, db=Depends(get_db)):
    obj = await db.get(Place, place_id)
    if not obj: raise HTTPException(404, "Place not found")
    return obj

@router.post("", response_model=PlaceOut, status_code=201)
async def create_place(payload: PlaceCreate, user=Depends(require_roles("admin")), db=Depends(get_db)):
    obj = Place(**payload.model_dump())
    db.add(obj); await db.commit(); await db.refresh(obj); return obj
