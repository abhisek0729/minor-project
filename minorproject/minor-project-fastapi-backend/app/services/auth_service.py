from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models.base import User, Role, UserRole
from app.core.security import hash_password, verify_password, create_access_token

async def register(db: AsyncSession, name: str, email: str, password: str) -> User:
    existing = await db.scalar(select(User).where(User.email == email))
    if existing:
        raise HTTPException(409, "Email already registered")
    user = User(name=name, email=email, password_hash=hash_password(password), provider="credentials", is_verified=False)
    db.add(user)
    await db.flush()
    role = await db.scalar(select(Role).where(Role.name == "tourist"))
    if not role:
        role = Role(name="tourist")
        db.add(role)
        await db.flush()
    db.add(UserRole(user_id=user.id, role_id=role.id, approval_status="approved"))
    await db.commit()
    await db.refresh(user)
    return user

async def login(db: AsyncSession, email: str, password: str) -> tuple[str, User]:
    user = await db.scalar(select(User).where(User.email == email))
    if not user or not user.password_hash or not verify_password(password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return create_access_token(user.id), user
