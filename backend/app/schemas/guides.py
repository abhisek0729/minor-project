from pydantic import BaseModel
from app.schemas.common import ORMModel

class GuideCreate(BaseModel):
    name: str
    description: str
    location: str
    phone_number: str
    guide_image_url: str

class GuideOut(ORMModel):
    id: int
    name: str
    description: str
    location: str
    phone_number: str
    guide_image_url: str
