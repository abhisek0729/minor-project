from app.ai.tools import TourismAgentToolset
from app.services.maps_service import GoogleMapsService


def test_google_maps_url_builds_search_link():
    url = GoogleMapsService.build_search_url("Pokhara", "Phewa Lake")
    assert "google.com/maps/search" in url
    assert "Phewa+Lake" in url
    assert "Pokhara" in url


def test_agent_toolset_builds_map_data_for_place():
    tools = TourismAgentToolset()
    place = tools.build_place_context(name="Phewa Lake", location="Pokhara")

    assert place["name"] == "Phewa Lake"
    assert place["location"] == "Pokhara"
    assert "google.com/maps/search" in place["map_url"]
