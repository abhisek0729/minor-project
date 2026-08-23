from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from app.db.session import get_db
from app.models.base import Expense
from app.schemas.expenses import ExpenseCreate, ExpenseUpdate, ExpenseOut
from app.core.security import get_current_user

router = APIRouter(prefix="/expenses", tags=["expenses"])

@router.get("", response_model=list[ExpenseOut])
async def list_expenses(days: int = Query(30, ge=1, le=365), user=Depends(get_current_user), db=Depends(get_db)):
    from app.services.expense_service import list_expenses as svc
    return await svc(db, user.id, days)

@router.post("", response_model=ExpenseOut, status_code=201)
async def create_expense(payload: ExpenseCreate, user=Depends(get_current_user), db=Depends(get_db)):
    obj = Expense(user_id=user.id, **payload.model_dump())
    db.add(obj); await db.commit(); await db.refresh(obj); return obj

@router.put("/{expense_id}", response_model=ExpenseOut)
async def update_expense(expense_id: int, payload: ExpenseUpdate, user=Depends(get_current_user), db=Depends(get_db)):
    obj = await db.get(Expense, expense_id)
    if not obj or obj.user_id != user.id: raise HTTPException(404, "Expense not found")
    for k,v in payload.model_dump().items(): setattr(obj,k,v)
    await db.commit(); await db.refresh(obj); return obj

@router.delete("/{expense_id}")
async def delete_expense(expense_id: int, user=Depends(get_current_user), db=Depends(get_db)):
    obj = await db.get(Expense, expense_id)
    if not obj or obj.user_id != user.id: raise HTTPException(404, "Expense not found")
    await db.delete(obj); await db.commit(); return {"message":"Expense deleted"}
