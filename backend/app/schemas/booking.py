from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from decimal import Decimal

class CreateBookingRequest(BaseModel):
    entity_type: str  # hotel, room, restaurant, guide, place, travel
    entity_id: int
    entity_name: str
    location: str
    check_in_date: datetime | None = None
    check_out_date: datetime | None = None
    total_cost: Decimal = Field(default=Decimal("0.00"), ge=0)
    booking_notes: str | None = None

class UpdateBookingRequest(BaseModel):
    booking_status: str | None = None  # pending, confirmed, cancelled, completed
    check_in_date: datetime | None = None
    check_out_date: datetime | None = None
    booking_notes: str | None = None

class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    entity_type: str
    entity_id: int
    entity_name: str
    location: str
    check_in_date: datetime | None
    check_out_date: datetime | None
    booking_status: str
    total_cost: Decimal
    booking_notes: str | None
    created_at: datetime
    updated_at: datetime

class BookingListResponse(BaseModel):
    bookings: list[BookingResponse]
    total: int
