from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from app.schemas.common import ORMModel

class ItineraryCreate(BaseModel):
    title: str
    destination: str
    start_date: date
    end_date: date
    budget: Decimal | None = Field(default=None, ge=0)
    currency: str = "NPR"
    travel_style: str | None = None

class ItineraryItemCreate(BaseModel):
    sequence: int = Field(ge=1)
    start_time: str | None = None
    end_time: str | None = None
    item_type: str
    title: str
    description: str
    estimated_cost: Decimal = Field(default=0, ge=0)
    entity_id: int | None = None
    location: str | None = None

class ItineraryDayCreate(BaseModel):
    day_number: int = Field(ge=1)
    date: date
    title: str
    estimated_cost: Decimal = Field(default=0, ge=0)
    items: list[ItineraryItemCreate] = []

class ItineraryOut(ORMModel):
    id: int
    user_id: int
    title: str
    destination: str
    start_date: datetime
    end_date: datetime
    budget: Decimal | None
    currency: str
    travel_style: str | None
    status: str
    created_at: datetime
    updated_at: datetime

class ItineraryDetail(ItineraryOut):
    days: list[dict]

class ItineraryGenerateRequest(BaseModel):
    destination: str
    start_date: date
    end_date: date
    budget: Decimal = Field(gt=0)
    currency: str = "NPR"
    travelers: int = Field(default=1, ge=1, le=20)
    travel_style: str = "balanced"
    interests: list[str] = []
    hotel_preference: str | None = None
    cuisine_preferences: list[str] = []
