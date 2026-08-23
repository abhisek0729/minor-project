from decimal import Decimal
from typing import Any
from pydantic import BaseModel, Field

class RecommendationRequest(BaseModel):
    destination: str
    budget: Decimal | None = None
    interests: list[str] = []
    cuisine_preferences: list[str] = []
    travel_style: str = "balanced"
    travelers: int = Field(default=1, ge=1, le=20)

class Recommendation(BaseModel):
    name: str
    type: str = "hotel"
    description: str = ""
    price: str | None = None
    rating: float | None = None
    location: str | None = None
    action_url: str | None = None
    url: str | None = None
    map_url: str | None = None
    # Backward compatibility fields
    entity_type: str | None = None
    entity_id: int | None = None
    reason: str | None = None
    estimated_cost: Decimal | None = None
    booking_note: str | None = None

class MapCard(BaseModel):
    title: str
    location: str
    map_url: str
    place_type: str = "destination"

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

class ActionProposal(BaseModel):
    action_type: str  # "LOG_EXPENSE" | "ADD_HOTEL_ROOM" | "ADD_RESTAURANT_DISH" | "PLAN_ITINERARY" | "CREATE_BOOKING"
    title: str
    description: str
    payload: dict[str, Any]
    status: str = "requires_approval"  # "requires_approval" | "executed" | "cancelled"

class ChatRequest(BaseModel):
    message: str
    destination: str | None = None
    budget: Decimal | None = None
    user_id: int | None = None
    user_name: str | None = None
    user_roles: list[str] = []
    history: list[dict] = []

class ChatResponse(BaseModel):
    answer: str
    recommendations: list[Recommendation] = []
    action_proposal: ActionProposal | None = None
    map_url: str | None = None
    map_cards: list[MapCard] = []
    steps_taken: list[str] = []
    itinerary_summary: str | None = None
    tools_used: list[str] = []
