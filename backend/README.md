# TourSphere FastAPI Backend + AI Layer

FastAPI replacement for the existing Next.js API layer of the minor tourism project.

The backend maps to the existing PostgreSQL schema (`users`, `user_roles`, `hotels`,
`rooms`, `restaurants`, `menus`, `guides`, `places`, `expenses`) and adds itinerary
tables. It exposes CRUD/search APIs plus an AI layer for itinerary generation,
recommendations and expense insights.

## Architecture

```text
Next.js frontend
      |
      | REST / JSON + Bearer JWT
      v
FastAPI
  |-- auth / RBAC
  |-- hotels / rooms
  |-- restaurants / menus
  |-- guides / places
  |-- expenses
  |-- itineraries
  `-- AI
        |-- candidate retrieval from PostgreSQL
        |-- Gemini structured generation
        `-- validation against database IDs

PostgreSQL <--- SQLAlchemy async
```

## Run

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Swagger: `http://localhost:8000/docs`

## Database

The current frontend repository already defines the core tables. This backend does
**not** call `create_all()` on startup. Run the additive SQL in
`alembic/versions/0001_itinerary_tables.sql` against the same PostgreSQL database.

## Authentication

This backend issues JWTs from `/api/v1/auth/login`. For the existing NextAuth
frontend, either migrate the frontend to use this token or add a small token-exchange
route that verifies the existing NextAuth identity and issues the FastAPI JWT.

Do not send `user_id` in request bodies for ownership-sensitive operations. The
authenticated user's ID comes from the JWT.

## AI

Set `GEMINI_API_KEY`. The AI service first retrieves real hotels/restaurants/guides/
places from PostgreSQL and then asks Gemini to rank/compose an itinerary. The model
does not get permission to invent database IDs.

If `GEMINI_API_KEY` is missing, deterministic database-backed recommendations still
work and AI generation returns a clear configuration error.

## Main endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET/POST /api/v1/hotels`
- `GET/POST /api/v1/hotels/{hotel_id}/rooms`
- `GET/POST /api/v1/restaurants`
- `GET/POST /api/v1/restaurants/{restaurant_id}/menus`
- `GET/POST /api/v1/guides`
- `GET/POST /api/v1/places`
- `GET/POST/PUT/DELETE /api/v1/expenses`
- `GET/POST/PUT/DELETE /api/v1/itineraries`
- `POST /api/v1/ai/itinerary`
- `POST /api/v1/ai/recommendations`
- `POST /api/v1/ai/expense-insights`
- `POST /api/v1/ai/chat`
