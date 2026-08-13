from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserOut, RoleRequest
from app.services.auth_service import register, login
from app.core.security import get_current_user
from app.models.base import Role, UserRole

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=201)
async def register_user(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    return await register(db, payload.name, payload.email, payload.password)

@router.post("/login", response_model=TokenResponse)
async def login_user(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    token, user = await login(db, payload.email, payload.password)
    return TokenResponse(access_token=token, user=user)

@router.get("/me", response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return user

@router.post("/request-role")
async def request_role(payload: RoleRequest, user=Depends(get_current_user), db=Depends(get_db)):
    if payload.role not in {"hotelOwner", "restaurantOwner", "guide"}:
        raise HTTPException(422, "Only partner roles can be requested")
    role = await db.scalar(select(Role).where(Role.name == payload.role))
    if not role:
        role = Role(name=payload.role)
        db.add(role)
        await db.flush()
    existing = await db.scalar(select(UserRole).where(UserRole.user_id == user.id, UserRole.role_id == role.id))
    if existing:
        return {"status": existing.approval_status, "role": payload.role}
    db.add(UserRole(user_id=user.id, role_id=role.id, approval_status="pending"))
    await db.commit()
    return {"status": "pending", "role": payload.role}
