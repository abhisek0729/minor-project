from pydantic import BaseModel, Field
from app.schemas.common import ORMModel

class RestaurantCreate(BaseModel):
    name: str
    description: str
    restaurant_image_url: str
    location: str
    phone_number: str
    cuisine: str

class RestaurantOut(ORMModel):
    id: int
    name: str
    description: str
    restaurant_image_url: str
    location: str
    phone_number: str
    cuisine: str

class MenuCreate(BaseModel):
    name: str
    description: str
    menus_image_url: str
    price: int = Field(gt=0)

class MenuOut(ORMModel):
    id: int
    restaurant_id: int
    name: str
    description: str
    menus_image_url: str
    price: int
