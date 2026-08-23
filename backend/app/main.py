from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.hotels import router as hotels_router
from app.api.restaurants import router as restaurants_router
from app.api.guides import router as guides_router
from app.api.places import router as places_router
from app.api.expenses import router as expenses_router
from app.api.itineraries import router as itineraries_router
from app.api.bookings import router as bookings_router
from app.api.ai import router as ai_router
from app.api.admin import router as admin_router

app = FastAPI(title=settings.app_name, version="1.0.0", docs_url="/docs", redoc_url="/redoc")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["system"])
@app.get("/api/backend/health", tags=["system"])
async def health():
    return {"status": "ok"}

# Support both standard `/api/v1` and Vercel multi-service `/api/backend/api/v1` prefixes
for prefix in ["/api/v1", "/api/backend/api/v1"]:
    app.include_router(auth_router, prefix=prefix)
    app.include_router(hotels_router, prefix=prefix)
    app.include_router(restaurants_router, prefix=prefix)
    app.include_router(guides_router, prefix=prefix)
    app.include_router(places_router, prefix=prefix)
    app.include_router(expenses_router, prefix=prefix)
    app.include_router(itineraries_router, prefix=prefix)
    app.include_router(bookings_router, prefix=prefix)
    app.include_router(ai_router, prefix=prefix)
    app.include_router(admin_router, prefix=prefix)
