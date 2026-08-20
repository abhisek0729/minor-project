from decimal import Decimal
from pydantic import BaseModel, Field

class RecommendationRequest(BaseModel):
    destination: str
    budget: Decimal | None = None
    interests: list[str] = []
    cuisine_preferences: list[str] = []
    travel_style: str = "balanced"
    travelers: int = Field(default=1, ge=1, le=20)

class Recommendation(BaseModel):
    entity_type: str
    entity_id: int
    name: str
    reason: str
    estimated_cost: Decimal | None = None
    location: str | None = None
    map_url: str | None = None
    booking_note: str | None = None

class RecommendationResponse(BaseModel):
    recommendations: list[Recommendation]

class ExpenseInsightRequest(BaseModel):
    days: int = Field(default=30, ge=1, le=365)

class ExpenseInsightResponse(BaseModel):
    total_spend: int
    by_type: dict[str, int]
    daily_average: float
    budget_warning: str | None
    insights: list[str]

class ChatRequest(BaseModel):
    message: str
    destination: str | None = None
    budget: Decimal | None = None

class ChatResponse(BaseModel):
    answer: str
    recommendations: list[Recommendation] = []
    map_url: str | None = None
    itinerary_summary: str | None = None
    tools_used: list[str] = []
