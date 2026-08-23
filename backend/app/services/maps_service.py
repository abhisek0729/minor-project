from __future__ import annotations

from urllib.parse import quote_plus


class GoogleMapsService:
    """Small helper for generating map URLs from location data without requiring API keys.

    The app can later switch to the Google Places API when the real key is supplied.
    """

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key

    @staticmethod
    def build_search_url(location: str, name: str | None = None) -> str:
        query = f"{name} {location}" if name else location
        return f"https://www.google.com/maps/search/?api=1&query={quote_plus(query)}"

    def build_place_details_url(self, location: str, name: str | None = None) -> str:
        if not self.api_key:
            return self.build_search_url(location, name)

        query = f"{name} {location}" if name else location
        return (
            "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?"
            f"input={quote_plus(query)}&inputtype=textquery&fields=place_id,formatted_address&key={self.api_key}"
        )
