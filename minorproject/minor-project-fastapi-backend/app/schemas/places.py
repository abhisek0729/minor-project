from pydantic import BaseModel
from app.schemas.common import ORMModel

class PlaceCreate(BaseModel):
    name: str
    location: str
    description: str
    place_image_url: str
    map_url: str

class PlaceOut(ORMModel):
    id: int
    name: str
    location: str
    description: str
    place_image_url: str
    map_url: str
