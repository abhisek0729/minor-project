from fastapi import APIRouter, Depends, HTTPException
from app.db.session import get_db
from app.core.security import get_current_user
from app.schemas.ai import RecommendationRequest, RecommendationResponse, ExpenseInsightRequest, ExpenseInsightResponse, ChatRequest, ChatResponse
from app.schemas.itinerary import ItineraryGenerateRequest
from app.ai.recommendations import recommend
from app.ai.expense import expense_insights
from app.ai.chat import chat
from app.ai.itinerary import generate_itinerary
from app.services.itinerary_service import save_generated_itinerary

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/recommendations", response_model=RecommendationResponse)
async def recommendations(payload: RecommendationRequest, db=Depends(get_db)):
    return await recommend(db, payload)

@router.post("/expense-insights", response_model=ExpenseInsightResponse)
async def insights(payload: ExpenseInsightRequest, user=Depends(get_current_user), db=Depends(get_db)):
    return await expense_insights(db, user.id, payload.days)

@router.post("/chat", response_model=ChatResponse)
async def assistant(payload: ChatRequest, db=Depends(get_db)):
    return await chat(db, payload)

@router.post("/itinerary")
async def generate(payload: ItineraryGenerateRequest, user=Depends(get_current_user), db=Depends(get_db)):
    try:
        generated = await generate_itinerary(db, payload)
        saved = await save_generated_itinerary(db, user.id, payload, generated)
        return {"id": saved.id, "itinerary": generated.model_dump(mode="json")}
    except RuntimeError as e:
        raise HTTPException(503, str(e))
    except ValueError as e:
        raise HTTPException(404, str(e))
