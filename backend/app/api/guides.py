from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.base import Guide
from app.schemas.guides import GuideCreate, GuideOut
from app.core.security import require_roles
from app.services.catalog_service import search_guides

router = APIRouter(prefix="/guides", tags=["guides"])

@router.get("", response_model=list[GuideOut])
async def list_guides(destination: str | None = None, limit: int = Query(20, le=100), db=Depends(get_db)):
    return await search_guides(db, destination, limit)

@router.get("/{guide_id}", response_model=GuideOut)
async def get_guide(guide_id: int, db=Depends(get_db)):
    obj = await db.get(Guide, guide_id)
    if not obj: raise HTTPException(404, "Guide not found")
    return obj

@router.post("", response_model=GuideOut, status_code=201)
async def create_guide(payload: GuideCreate, user=Depends(require_roles("guide","admin")), db=Depends(get_db)):
    obj = Guide(user_id=user.id, **payload.model_dump())
    db.add(obj); await db.commit(); await db.refresh(obj); return obj
