from decimal import Decimal
from pydantic import BaseModel, Field
from app.schemas.common import ORMModel

class HotelCreate(BaseModel):
    name: str
    description: str
    phone_number: str
    province: str
    district: str
    municipality: str
    ward: str
    street: str
    established_year: int | None = None
    website: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    cover_image_url: str | None = None
    cover_image_public_id: str | None = None

class HotelUpdate(HotelCreate):
    pass

class HotelOut(ORMModel):
    id: int
    user_id: int | None
    name: str
    description: str
    phone_number: str
    province: str
    district: str
    municipality: str
    ward: str
    street: str
    latitude: float | None
    longitude: float | None
    cover_image_url: str | None
    website: str | None

class RoomCreate(BaseModel):
    room_number: str
    room_type: str
    description: str
    price_per_night: Decimal = Field(gt=0)
    capacity: int = Field(gt=0)
    status: str = "available"

class RoomOut(ORMModel):
    id: int
    hotel_id: int
    room_number: str
    room_type: str
    description: str
    price_per_night: Decimal
    capacity: int
    status: str
