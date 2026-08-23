from __future__ import annotations

from dataclasses import dataclass, asdict

from app.services.maps_service import GoogleMapsService


@dataclass
class ToolResult:
    name: str
    location: str
    type: str
    map_url: str
    note: str = ""


class TourismAgentToolset:
    """Lightweight tool layer for the AI planner.

    This is intentionally small and backend-friendly. It gives the agent a structured way to
    attach map links and local context to hotels, restaurants, destinations, guides, and
    itinerary steps without hardcoding everything into the prompt.
    """

    def __init__(self, maps_api_key: str | None = None):
        self.maps = GoogleMapsService(api_key=maps_api_key)

    def build_place_context(self, *, name: str, location: str, place_type: str = "destination", note: str = "") -> dict:
        return {
            "name": name,
            "location": location,
            "type": place_type,
            "map_url": self.maps.build_search_url(location, name),
            "note": note,
        }

    def build_itinerary_step(self, *, title: str, location: str, item_type: str, description: str = "") -> dict:
        return {
            "title": title,
            "location": location,
            "item_type": item_type,
            "description": description,
            "map_url": self.maps.build_search_url(location, title),
        }

    def build_expense_context(self, *, name: str, amount: int, location: str, expense_type: str) -> dict:
        return {
            "name": name,
            "amount": amount,
            "location": location,
            "type": expense_type,
            "map_url": self.maps.build_search_url(location, name),
        }

    @staticmethod
    def add_booking_context(*, item_name: str, item_type: str, location: str) -> dict:
        return {
            "item_name": item_name,
            "item_type": item_type,
            "location": location,
            "booking_note": f"Ready to reserve {item_name} in {location}.",
            "map_url": GoogleMapsService.build_search_url(location, item_name),
        }

    def tool_results(self, records: list[dict]) -> list[dict]:
        return [asdict(ToolResult(**record)) if isinstance(record, dict) and "name" in record else record for record in records]
