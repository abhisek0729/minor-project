from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from app.db.session import get_db
from app.core.security import require_roles
from app.models.base import User, UserRole, Role
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["admin"])

class ApprovalRequest(BaseModel):
    status: str

@router.get("/partner-requests")
async def partner_requests(user=Depends(require_roles("admin")), db=Depends(get_db)):
    q = select(UserRole, User, Role).join(User, User.id == UserRole.user_id).join(Role, Role.id == UserRole.role_id).where(
        UserRole.approval_status == "pending", Role.name != "tourist"
    )
    rows = (await db.execute(q)).all()
    return [{"user_id": u.id, "name": u.name, "email": u.email, "role": r.name, "status": ur.approval_status} for ur,u,r in rows]

@router.patch("/partner-requests/{user_id}/{role_name}")
async def approve_partner(user_id: int, role_name: str, payload: ApprovalRequest, user=Depends(require_roles("admin")), db=Depends(get_db)):
    if payload.status not in {"approved","rejected","suspended","pending"}:
        raise HTTPException(422, "Invalid approval status")
    role = await db.scalar(select(Role).where(Role.name == role_name))
    if not role: raise HTTPException(404, "Role not found")
    ur = await db.scalar(select(UserRole).where(UserRole.user_id == user_id, UserRole.role_id == role.id))
    if not ur: raise HTTPException(404, "Partner request not found")
    ur.approval_status = payload.status
    await db.commit()
    return {"user_id": user_id, "role": role_name, "status": payload.status}
