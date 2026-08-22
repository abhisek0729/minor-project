# Frontend integration

Base URL: `http://localhost:8000/api/v1`

## Auth

```ts
const { access_token } = await fetch("/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
}).then(r => r.json());

await fetch("/api/v1/expenses", {
  headers: { Authorization: `Bearer ${access_token}` },
});
```

## Search

```text
GET /hotels?destination=Pokhara
GET /restaurants?destination=Pokhara&cuisine=Nepali
GET /guides?destination=Pokhara
GET /places?destination=Pokhara
```

## AI itinerary

```json
POST /api/v1/ai/itinerary
{
  "destination": "Pokhara",
  "start_date": "2026-09-01",
  "end_date": "2026-09-05",
  "budget": 50000,
  "currency": "NPR",
  "travelers": 2,
  "travel_style": "balanced",
  "interests": ["nature", "adventure", "culture"],
  "cuisine_preferences": ["Nepali"]
}
```

The response contains the generated itinerary and the persisted itinerary ID.

## Migration strategy

The current repository is Next.js and already has a PostgreSQL/Drizzle schema. This
FastAPI service is intentionally a separate API service. Do not duplicate database
tables in the frontend. Keep the database shared and move business operations to
FastAPI one domain at a time.

Recommended migration order:

1. Auth token exchange
2. Hotels/rooms
3. Restaurants/menus
4. Guides/places
5. Expenses
6. Itineraries
7. AI
8. Remove corresponding Next.js server actions/routes after frontend cutover
