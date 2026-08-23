from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.common import ORMModel

class ExpenseCreate(BaseModel):
    name: str
    amount: int = Field(gt=0)
    location: str
    type: str

class ExpenseUpdate(ExpenseCreate):
    pass

class ExpenseOut(ORMModel):
    id: int
    user_id: int | None
    name: str
    amount: int
    location: str
    type: str
    created_at: datetime
