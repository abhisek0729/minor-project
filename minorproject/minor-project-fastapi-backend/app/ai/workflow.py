from __future__ import annotations

import os
import json
import re
from typing import TypedDict, Annotated, Sequence, Any
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver

from app.core.config import settings
from app.db.session import SessionLocal
from app.services.catalog_service import (
    search_hotels,
    search_restaurants,
    search_places,
    search_guides,
)
from app.services.maps_service import GoogleMapsService
from app.services.web_search_service import WebSearchService
from app.ai.gemini import GeminiService
from app.ai.prompts import CHAT_SYSTEM

# ============================================================================
# 1. HIERARCHICAL MULTI-AGENT STATE DEFINITION
# ============================================================================
class TourismAgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    user_id: int | None
    user_name: str | None
    user_roles: list[str]
    intent: str
    language: str
    origin: str | None
    destination: str | None
    secondary_dest: str | None
    days: int | None
    budget_npr: int | None
    guests: int | None
    constraints: list[str]
    action_proposal: dict[str, Any] | None
    recommendations: list[dict[str, Any]]
    map_cards: list[dict[str, Any]]
    steps_taken: list[str]
    tools_used: list[str]
    final_answer: str
    is_terminal: bool

# ============================================================================
# 2. CONSTANTS, DICTIONARIES & PATTERNS
# ============================================================================
KNOWN_NEPALI_CITIES = [
    "pokhara", "kathmandu", "lumbini", "dharan", "chitwan", "mustang",
    "everest", "annapurna", "butwal", "bandipur", "ilam", "janakpur",
    "rara", "nagarkot", "bhaktapur", "lalitpur", "biratnagar", "itahari",
    "bhedetar", "namche", "sauraha", "gorkha", "hetauda", "nepalgunj",
    "bhairahawa", "damak", "birtamod", "surkhet", "manang", "dhankuta",
    "langtang", "dolpo", "muktinath", "jomsom", "panauti", "kirtipur"
]

SECURITY_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|system)\s+instructions",
    r"(show|give|tell|reveal)\s+(me\s+)?(the\s+)?(database\s+password|api\s+key|admin\s+password|system\s+prompt|hidden\s+instructions)",
    r"drop\s+table",
    r"select\s+.*\s+from\s+users",
    r"delete\s+all\s+hotel",
    r"change\s+my\s+role\s+to\s+admin",
    r"approve\s+my\s+account\s+without",
    r"ignore\s+authorization\s+rules",
]

OUT_OF_DOMAIN_KEYWORDS = [
    "python", "javascript", "typescript", "c++", "java", "sql", "coding",
    "write code", "fix bug", "algorithm", "solve math", "calculus",
    "stock price", "crypto", "bitcoin"
]

DEVANAGARI_REGEX = re.compile(r"[\u0900-\u097F]")

ROMANIZED_NEPALI_KEYWORDS = [
    "banaideu", "banaidinu", "bata", "ma", "k ho", "k k cha", "k k chha",
    "ramro", "sasto", "dubai", "mero", "huncha", "lagi", "khojideu",
    "jana", "kasari", "kun", "ghumne", "itinerary banaideu"
]

def detect_language(text: str) -> str:
    if DEVANAGARI_REGEX.search(text):
        return "ne"
    text_lower = text.lower()
    if any(kw in text_lower for kw in ROMANIZED_NEPALI_KEYWORDS):
        return "romanized_ne"
    return "en"

def parse_duration_and_budget(text: str) -> tuple[int | None, int | None]:
    text_lower = text.lower()
    days = None
    budget = None

    # Parse days
    day_match = re.search(r"(\d+)\s*(?:-|–|\s*)?(?:day|days|din|dina)", text_lower)
    if day_match:
        try:
            days = int(day_match.group(1))
        except:
            pass

    # Parse budget
    k_budget = re.search(r"(\d+)\s*k\b", text_lower)
    if k_budget:
        budget = int(k_budget.group(1)) * 1000
    else:
        npr_budget = re.search(r"(?:npr|rs\.?|rupees|budget(?:\s*of)?)\s*[:=]?\s*(\d[\d,]*)", text_lower)
        if npr_budget:
            try:
                budget = int(npr_budget.group(1).replace(",", ""))
            except:
                pass

    return days, budget

# ============================================================================
# 3. SUPERVISOR & ORCHESTRATOR AGENT NODE
# ============================================================================
def supervisor_orchestrator_node(state: TourismAgentState) -> dict[str, Any]:
    """
    Supervisor Agent: Evaluates user message, analyzes multi-lingual inputs,
    enforces security guardrails, detects invalid parameters, and routes to
    specialized domain agents.
    """
    last_msg = state["messages"][-1].content if state["messages"] else ""
    msg_lower = last_msg.lower().strip()
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))

    steps.append("🧠 Supervisor Agent: Analyzing intent, language, entities & safety")
    tools.append("supervisor_orchestrator")

    lang = detect_language(last_msg)
    days, budget = parse_duration_and_budget(last_msg)

    # 1. SECURITY & PROMPT INJECTION GUARDRAIL
    for pat in SECURITY_INJECTION_PATTERNS:
        if re.search(pat, msg_lower):
            steps.append("🛡️ Security Guardrail: Blocked adversarial prompt injection attempt")
            return {
                "intent": "security_violation",
                "language": lang,
                "is_terminal": True,
                "final_answer": """🔒 **Security Notice:**
Your request cannot be processed because it violates safety and security policies. System prompts, credentials, API keys, and unauthorized database operations are strictly protected.

How may I assist you with your travel plans in Nepal?""",
                "steps_taken": steps,
                "tools_used": tools + ["security_filter"],
            }

    # 2. INVALID INPUT TESTING (Negative days/budget, zero travelers)
    if re.search(r"-\s*\d+\s*(?:day|days|din)", msg_lower) or (days is not None and days <= 0):
        steps.append("⚠️ Input Validator: Detected invalid duration parameter")
        return {
            "intent": "invalid_input",
            "language": lang,
            "is_terminal": True,
            "final_answer": "Please specify a valid travel duration of at least 1 day. How many days are you planning to explore Nepal?",
            "steps_taken": steps,
            "tools_used": tools + ["input_validator"],
        }
    if re.search(r"-\s*(?:npr|rs\.?)?\s*\d+", msg_lower) or (budget is not None and budget <= 0):
        steps.append("⚠️ Input Validator: Detected invalid budget parameter")
        return {
            "intent": "invalid_input",
            "language": lang,
            "is_terminal": True,
            "final_answer": "Please provide a valid budget in NPR greater than 0 so I can build an accurate travel recommendation.",
            "steps_taken": steps,
            "tools_used": tools + ["input_validator"],
        }
    if re.search(r"\b(0|-1|-2)\s*(?:traveler|travelers|people|person|ppl)\b", msg_lower):
        steps.append("⚠️ Input Validator: Detected invalid traveler count")
        return {
            "intent": "invalid_input",
            "language": lang,
            "is_terminal": True,
            "final_answer": "A trip requires at least 1 traveler! Please let me know how many guests are joining your journey.",
            "steps_taken": steps,
            "tools_used": tools + ["input_validator"],
        }

    # 3. EMERGENCY SOS & MOUNTAIN CRISIS PROTOCOL
    is_emergency = any(kw in msg_lower for kw in ["emergency", "sos", "altitude sickness", "rescue", "police", "injured", "lost in mountain", "lost my passport", "helpline", "mountain distress"])
    if is_emergency:
        return {
            "intent": "emergency_sos",
            "language": lang,
            "is_terminal": False,
            "steps_taken": steps + ["🚨 Supervisor: Delegated to Emergency SOS Agent"],
        }

    # 4. GREETINGS & CAPABILITIES
    is_pure_greeting = any(re.search(rf"^{g}\b", msg_lower) for g in ["hi", "hello", "hey", "namaste", "what's up", "sup", "greetings"]) and len(msg_lower.split()) <= 4
    if is_pure_greeting and not any(city in msg_lower for city in KNOWN_NEPALI_CITIES):
        steps.append("👋 Supervisor: Handled conversational greeting")
        greeting_text = """Namaste! 🙏 I am your **TravelNepal AI Voice & Travel Specialist**.

I can help you plan trips, find hotels and local food, book stays with Khalti, check bus routes, and log expenses.

🌟 **Quick ideas to get started:**
• 🗺️ *Plan a 3-day trip to Pokhara under NPR 20,000*
• 🚌 *Transit route from Kathmandu to Pokhara*
• 🏨 *Find verified hotels in Lakeside Pokhara*
• 🍽️ *Discover authentic Thakali dining in Kathmandu*
• 💰 *Log an expense of NPR 2,500 for dinner*"""
        if lang == "ne":
            greeting_text = """नमस्ते! 🙏 म तपाईंको **TravelNepal AI यात्रा सहायक** हुँ।

म तपाईंलाई नेपालभरिका होटल, रेस्टुरेन्ट, यात्रा योजना, बस रुट र खर्च ट्र्याक गर्न मद्दत गर्न सक्छु।

🌟 **तपाईं के गर्न चाहनुहुन्छ?**
• 🗺️ *पोखराको ३ दिनको यात्रा योजना बनाउनुहोस्*
• 🏨 *पोखरामा राम्रो होटल खोज्नुहोस्*
• 🍽️ *काठमाडौंमा मौलिक थकाली खाना खोज्नुहोस्*"""
        return {
            "intent": "greeting",
            "language": lang,
            "is_terminal": True,
            "final_answer": greeting_text,
            "steps_taken": steps,
            "tools_used": tools + ["greeting_agent"],
        }

    # 5. OUT-OF-DOMAIN FILTER
    has_travel_terms = any(t in msg_lower for t in ["nepal", "travel", "trip", "trek", "hotel", "food", "restaurant", "guide", "stay", "khalti", "expense", "bus", "student", "route", "visit", "destination", "book", "reserve", "pokhara", "kathmandu", "chitwan"])
    if any(re.search(rf"\b{kw}\b", msg_lower) for kw in OUT_OF_DOMAIN_KEYWORDS) and not has_travel_terms:
        steps.append("🔒 Guardrail: Filtered non-travel question")
        return {
            "intent": "guardrail_violation",
            "language": lang,
            "is_terminal": True,
            "final_answer": """Namaste! 🙏 I am your **TravelNepal Travel Specialist**, focused exclusively on travel, tourism, and platform features across Nepal.

I cannot assist with programming, general coding, or non-tourism subjects. How can I help you explore Nepal today?""",
            "steps_taken": steps,
            "tools_used": tools + ["guardrail_filter"],
        }

    # 6. EXTRACT ORIGIN & DESTINATION
    origin = None
    destination = None
    secondary_dest = None

    route_match = re.search(r"from\s+([a-zA-Z]+)\s+to\s+([a-zA-Z]+)", msg_lower)
    if route_match:
        c1, c2 = route_match.group(1), route_match.group(2)
        for city in KNOWN_NEPALI_CITIES:
            if c1 == city:
                origin = city.capitalize()
            if c2 == city:
                destination = city.capitalize()

    # Compare pattern: X or Y / X vs Y
    comp_match = re.search(r"([a-zA-Z]+)\s+(?:vs|or|and|ra)\s+([a-zA-Z]+)", msg_lower)
    if comp_match and not origin:
        c1, c2 = comp_match.group(1), comp_match.group(2)
        for city in KNOWN_NEPALI_CITIES:
            if c1 == city:
                destination = city.capitalize()
            if c2 == city:
                secondary_dest = city.capitalize()

    if not destination:
        for city in KNOWN_NEPALI_CITIES:
            if re.search(rf"\b{city}\b", msg_lower):
                destination = city.capitalize()
                break

    # 7. ROUTE TO DOMAIN SUB-AGENTS
    # A. Partner RBAC Owner Mutations
    if any(phrase in msg_lower for phrase in ["add room", "create room", "new room", "add hotel room", "add dish", "add food", "add menu", "new dish"]):
        return {
            "intent": "partner_rbac_action",
            "destination": destination,
            "language": lang,
            "is_terminal": False,
            "steps_taken": steps + ["🏢 Supervisor: Delegated to Partner RBAC Agent"],
        }

    # B. Expense Logging
    if any(phrase in msg_lower for phrase in ["log expense", "spent", "spent rs", "spent npr", "record expense", "add expense"]):
        return {
            "intent": "expense_tracking",
            "destination": destination,
            "language": lang,
            "is_terminal": False,
            "steps_taken": steps + ["💰 Supervisor: Delegated to Expense Tracking Agent"],
        }

    # C. Transit & Intercity Routing
    if (origin and destination) or any(t in msg_lower for t in ["how to travel", "how to reach", "how to go", "how do i travel", "bus from", "flight to", "cheapest way to reach", "fastest way to reach", "travel time"]):
        return {
            "intent": "transit_routing",
            "origin": origin or "Kathmandu",
            "destination": destination or "Pokhara",
            "days": days,
            "budget_npr": budget,
            "language": lang,
            "is_terminal": False,
            "steps_taken": steps + ["🚌 Supervisor: Delegated to Transit & Route Agent"],
        }

    # D. Hotel Search & Booking
    if any(h in msg_lower for h in ["hotel", "stay", "resort", "lodge", "room", "accommodation", "booking", "reserve room"]):
        return {
            "intent": "hotel_booking",
            "destination": destination or "Pokhara",
            "days": days,
            "budget_npr": budget,
            "language": lang,
            "is_terminal": False,
            "steps_taken": steps + [f"🏨 Supervisor: Delegated to Hotel & Stay Agent ({destination or 'Pokhara'})"],
        }

    # E. Dining & Food Discovery
    if any(f in msg_lower for f in ["food", "eat", "restaurant", "cafe", "momo", "sekuwa", "thakali", "khaja", "breakfast", "dinner", "lunch", "cuisine", "dining"]):
        return {
            "intent": "dining_discovery",
            "destination": destination or "Kathmandu",
            "language": lang,
            "is_terminal": False,
            "steps_taken": steps + [f"🍽️ Supervisor: Delegated to Dining & Food Agent ({destination or 'Kathmandu'})"],
        }

    # F. Itinerary & Personalized Trip Planning
    return {
        "intent": "itinerary_planning",
        "destination": destination or "Pokhara",
        "secondary_dest": secondary_dest,
        "days": days or 3,
        "budget_npr": budget,
        "language": lang,
        "is_terminal": False,
        "steps_taken": steps + [f"🗺️ Supervisor: Delegated to Itinerary Planning Agent ({destination or 'Pokhara'})"],
    }

# ============================================================================
# 4. SPECIALIZED DOMAIN SUB-AGENTS
# ============================================================================

# SUB-AGENT 1: EMERGENCY SOS & SAFETY AGENT
def emergency_sos_agent(state: TourismAgentState) -> dict[str, Any]:
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))
    steps.append("🚨 Emergency Agent: Generated official Nepal safety & rescue coordinates")
    tools.append("emergency_sos_agent")

    return {
        "is_terminal": True,
        "final_answer": """🚨 **TravelNepal Emergency Safety & SOS Protocol**

If you or anyone in your group is injured, lost, or experiencing severe high-altitude distress, please remain calm and follow these steps immediately:

📞 **Direct Emergency Contact Desks in Nepal (24/7):**
• 👮 **Tourist Police Hotline:** Dial `1144` or `+977-1-4247041` (Direct tourist emergency unit)
• 🚑 **Medical / Ambulance:** Dial `102`
• 🚓 **Nepal Police Control:** Dial `100`
• 🏔️ **Himalayan Rescue Association (HRA):** `+977-1-4440292` / `+977-1-4440293` (High-altitude & AMS advisory)
• 🚁 **Helicopter Evacuation Coordination:** Available via local district tourist police desk and certified trekking agencies.

💡 **Immediate Mountain Safety Action:**
* If experiencing symptoms of Acute Mountain Sickness (AMS) such as throbbing headache, nausea, or shortness of breath at rest, **halt ascent immediately and descend at least 500 meters**.
* Keep warm, drink hot fluids (electrolytes/garlic soup), and do not travel alone after dark.""",
        "steps_taken": steps,
        "tools_used": tools,
    }

# SUB-AGENT 2: TRANSIT & ROUTE AGENT
async def transit_route_agent(state: TourismAgentState) -> dict[str, Any]:
    origin = state.get("origin") or "Kathmandu"
    destination = state.get("destination") or "Pokhara"
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))

    steps.append(f"🚌 Transit Agent: Calculating highway routes, fares & travel options ({origin} ➔ {destination})")
    tools.append("transit_route_agent")

    map_url = f"https://www.google.com/maps/dir/{origin},+Nepal/{destination},+Nepal"
    map_cards = [{
        "title": f"Route: {origin} → {destination}",
        "location": f"{origin} to {destination} Highway, Nepal",
        "map_url": map_url,
        "place_type": "transit_route",
        "description": f"Direct route and transit connections between {origin} and {destination}.",
    }]

    # Also search destination accommodations
    recommendations = []
    try:
        async with SessionLocal() as db:
            db_hotels = await search_hotels(db, destination, limit=3)
            for h in db_hotels:
                recommendations.append({
                    "name": h.name,
                    "type": "hotel",
                    "description": h.description or f"Verified stay in {h.district or destination}.",
                    "price": f"NPR {getattr(h, 'min_price', 2500):,}/night",
                    "rating": 4.8,
                    "location": f"{h.district or destination}, Nepal",
                    "action_url": f"/hotels/{h.id}",
                })
    except Exception as e:
        print("Transit DB warning:", e)

    return {
        "recommendations": recommendations,
        "map_cards": map_cards,
        "steps_taken": steps,
        "tools_used": tools,
    }

# SUB-AGENT 3: HOTEL & ACCOMMODATION AGENT
async def hotel_booking_agent(state: TourismAgentState) -> dict[str, Any]:
    dest = state.get("destination") or "Pokhara"
    budget = state.get("budget_npr")
    last_msg = state["messages"][-1].content if state["messages"] else ""
    msg_lower = last_msg.lower()
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))

    steps.append(f"🏨 Hotel Agent: Querying verified platform catalog for {dest}")
    tools.append("hotel_booking_agent")

    recommendations = []
    matched_hotel = None
    try:
        async with SessionLocal() as db:
            db_hotels = await search_hotels(db, dest, max_price=budget, limit=4)
            if db_hotels:
                matched_hotel = db_hotels[0]
                for h in db_hotels:
                    recommendations.append({
                        "name": h.name,
                        "type": "hotel",
                        "description": h.description or f"Top rated accommodation in {h.district or dest}.",
                        "price": f"NPR {getattr(h, 'min_price', 2500):,}/night",
                        "rating": 4.8,
                        "location": f"{h.district or dest}, Nepal",
                        "action_url": f"/hotels/{h.id}",
                    })
    except Exception as e:
        print("Hotel DB Query Error:", e)

    map_url = GoogleMapsService.build_search_url(f"Hotels in {dest} Nepal")
    map_cards = [{
        "title": f"Hotels in {dest}",
        "location": f"{dest}, Nepal",
        "map_url": map_url,
        "place_type": "hotel_map",
        "description": f"Verified hotel listings and Google Maps navigation across {dest}",
    }]

    action_proposal = None
    # If user explicitly asks to book a room/hotel, prepare action proposal
    if any(b in msg_lower for b in ["book", "reserve", "checkout", "booking"]):
        hotel_name = matched_hotel.name if matched_hotel else f"Deluxe Stay {dest}"
        hotel_id = matched_hotel.id if matched_hotel else 1
        price = budget or 3500
        action_proposal = {
            "action_type": "CREATE_BOOKING",
            "title": f"Reserve Stay at {hotel_name}",
            "description": f"Initialize hotel reservation in {dest} for NPR {price:,}. Final payment will be completed via Khalti Digital Wallet.",
            "payload": {
                "booking_type": "hotel",
                "item_id": hotel_id,
                "item_name": hotel_name,
                "total_amount": price,
                "guests": state.get("guests") or 2,
                "check_in_date": "2026-08-24",
            },
        }
        steps.append("📝 Human-In-The-Loop: Prepared Khalti Hotel Booking Card")

    return {
        "recommendations": recommendations,
        "map_cards": map_cards,
        "action_proposal": action_proposal,
        "steps_taken": steps,
        "tools_used": tools,
    }

# SUB-AGENT 4: DINING & FOOD DISCOVERY AGENT
async def dining_discovery_agent(state: TourismAgentState) -> dict[str, Any]:
    dest = state.get("destination") or "Kathmandu"
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))

    steps.append(f"🍽️ Dining Agent: Searching authentic local food & restaurants in {dest}")
    tools.append("dining_discovery_agent")

    recommendations = []
    try:
        async with SessionLocal() as db:
            db_rests = await search_restaurants(db, dest, limit=4)
            if db_rests:
                for r in db_rests:
                    recommendations.append({
                        "name": r.name,
                        "type": "restaurant",
                        "description": r.description or f"Authentic dining in {r.location or dest}.",
                        "price": "NPR 350 - 1,400",
                        "rating": 4.7,
                        "location": f"{r.location or dest}, Nepal",
                        "action_url": f"/restaurants/{r.id}",
                    })
    except Exception as e:
        print("Dining DB Error:", e)

    map_url = GoogleMapsService.build_search_url(f"Popular authentic restaurants in {dest} Nepal")
    map_cards = [{
        "title": f"Dining & Food in {dest}",
        "location": f"{dest}, Nepal",
        "map_url": map_url,
        "place_type": "food_map",
        "description": f"Find authentic Thakali, Newari, Sekuwa, and scenic cafes in {dest}",
    }]

    return {
        "recommendations": recommendations,
        "map_cards": map_cards,
        "steps_taken": steps,
        "tools_used": tools,
    }

# SUB-AGENT 5: ITINERARY & TRIP PLANNING AGENT
async def itinerary_planning_agent(state: TourismAgentState) -> dict[str, Any]:
    dest = state.get("destination") or "Pokhara"
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))

    steps.append(f"🗺️ Itinerary Agent: Compiling custom schedule, attractions & stays for {dest}")
    tools.append("itinerary_planning_agent")

    recommendations = []
    try:
        async with SessionLocal() as db:
            db_hotels = await search_hotels(db, dest, limit=3)
            for h in db_hotels:
                recommendations.append({
                    "name": h.name,
                    "type": "hotel",
                    "description": h.description or f"Recommended platform accommodation in {dest}.",
                    "price": f"NPR {getattr(h, 'min_price', 2500):,}/night",
                    "rating": 4.8,
                    "location": f"{h.district or dest}, Nepal",
                    "action_url": f"/hotels/{h.id}",
                })
    except Exception as e:
        print("Itinerary DB Error:", e)

    map_url = GoogleMapsService.build_search_url(f"Top attractions and sights in {dest} Nepal")
    map_cards = [{
        "title": f"Sights & Attractions in {dest}",
        "location": f"{dest}, Nepal",
        "map_url": map_url,
        "place_type": "attraction_map",
        "description": f"Explore top viewpoints, lakes, and cultural heritage in {dest}",
    }]

    return {
        "recommendations": recommendations,
        "map_cards": map_cards,
        "steps_taken": steps,
        "tools_used": tools,
    }

# SUB-AGENT 6: PARTNER RBAC AGENT (HITL MUTATION GUARD)
def partner_rbac_agent(state: TourismAgentState) -> dict[str, Any]:
    roles = state.get("user_roles", [])
    last_msg = state["messages"][-1].content if state["messages"] else ""
    msg_lower = last_msg.lower()
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))

    # Hotel Owner RBAC
    if any(w in msg_lower for w in ["add room", "create room", "new room", "hotel room"]):
        if "hotelOwner" not in roles and "admin" not in roles:
            steps.append("🚫 RBAC Guard: Traveler blocked from hotel room creation")
            return {
                "is_terminal": True,
                "final_answer": """⚠️ **Access Restricted: Hotel Partner Permission Required**
You are currently signed in as a traveler. Adding hotel rooms requires an approved **Hotel Partner** account.

👉 You can register or upgrade your business at `/partner/business-type`.""",
                "steps_taken": steps,
                "tools_used": tools + ["rbac_guard"],
            }

        num_match = re.findall(r"\b\d+\b", msg_lower)
        room_num = num_match[0] if num_match else "101"
        price = int(num_match[1]) if len(num_match) > 1 else 3000

        action_payload = {
            "room_number": room_num,
            "room_type": "double",
            "price_per_night": price,
            "capacity": 2,
            "description": "Comfortable deluxe room with modern amenities.",
        }
        steps.append("📝 Human-In-The-Loop: Prepared Hotel Room Action Card")
        return {
            "is_terminal": True,
            "action_proposal": {
                "action_type": "ADD_HOTEL_ROOM",
                "title": f"Add Hotel Room {room_num}",
                "description": f"Publish Room #{room_num} (Double, 2 Guests) at NPR {price:,}/night to your hotel catalog.",
                "payload": action_payload,
            },
            "final_answer": f"I have prepared the action proposal for **Room #{room_num}** at **NPR {price:,}/night**. Please review and confirm on the action card below.",
            "steps_taken": steps,
            "tools_used": tools + ["hitl_action_proposal"],
        }

    # Restaurant Owner RBAC
    if any(w in msg_lower for w in ["add dish", "add food", "add menu", "create dish"]):
        if "restaurantOwner" not in roles and "admin" not in roles:
            steps.append("🚫 RBAC Guard: Traveler blocked from restaurant menu creation")
            return {
                "is_terminal": True,
                "final_answer": """⚠️ **Access Restricted: Restaurant Partner Permission Required**
You are currently signed in as a traveler. Adding menu items requires an approved **Restaurant Partner** account.

👉 You can register your restaurant at `/partner/business-type`.""",
                "steps_taken": steps,
                "tools_used": tools + ["rbac_guard"],
            }

        num_match = re.findall(r"\b\d+\b", msg_lower)
        price = int(num_match[0]) if num_match else 400
        action_payload = {
            "name": "Special Local Dish",
            "price": price,
            "description": "Freshly prepared local specialty.",
            "category": "Main Course",
        }
        steps.append("📝 Human-In-The-Loop: Prepared Restaurant Menu Action Card")
        return {
            "is_terminal": True,
            "action_proposal": {
                "action_type": "ADD_RESTAURANT_DISH",
                "title": "Add Menu Dish",
                "description": f"Add new dish at NPR {price:,} to your digital menu.",
                "payload": action_payload,
            },
            "final_answer": f"I have configured the action card to add this new dish at **NPR {price:,}**. Click **Confirm & Execute** below to publish it.",
            "steps_taken": steps,
            "tools_used": tools + ["hitl_action_proposal"],
        }

    return {"is_terminal": False}

# SUB-AGENT 7: EXPENSE TRACKING AGENT
def expense_tracking_agent(state: TourismAgentState) -> dict[str, Any]:
    last_msg = state["messages"][-1].content if state["messages"] else ""
    msg_lower = last_msg.lower()
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))

    num_match = re.findall(r"\b\d+\b", msg_lower)
    amount = int(num_match[0]) if num_match else 1500
    category = "food" if any(f in msg_lower for f in ["food", "dinner", "lunch", "breakfast", "momo", "cafe"]) else "transport"

    action_payload = {
        "name": "Trip Expense",
        "amount": amount,
        "location": state.get("destination") or "Nepal",
        "type": category,
    }
    steps.append("📝 Human-In-The-Loop: Prepared Travel Expense Card")
    return {
        "is_terminal": True,
        "action_proposal": {
            "action_type": "LOG_EXPENSE",
            "title": f"Log Expense: NPR {amount:,}",
            "description": f"Record {category.capitalize()} expense of NPR {amount:,} in your Travel Expense Ledger.",
            "payload": action_payload,
        },
        "final_answer": f"I have prepared your expense entry of **NPR {amount:,}** ({category.capitalize()}). Click **Confirm & Execute** below to record it in your ledger.",
        "steps_taken": steps,
        "tools_used": tools + ["hitl_action_proposal"],
    }

# ============================================================================
# 5. RESPONSE SYNTHESIS NODE (Powered by Gemini 3.6 Flash)
# ============================================================================
async def response_synthesis_node(state: TourismAgentState) -> dict[str, Any]:
    if state.get("is_terminal") and state.get("final_answer"):
        return {}

    intent = state.get("intent", "")
    dest = state.get("destination") or "Nepal"
    sec_dest = state.get("secondary_dest")
    origin = state.get("origin")
    days = state.get("days")
    budget = state.get("budget_npr")
    lang = state.get("language", "en")
    last_msg = state["messages"][-1].content if state["messages"] else ""
    recs = state.get("recommendations", [])
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))

    steps.append("✨ Gemini 3.6 Flash: Synthesizing grounded multi-agent response")
    tools.append("gemini_synthesis")

    prompt = f"""You are the expert AI Travel Assistant for TravelNepal.

User Query: "{last_msg}"
Detected Language: {lang}
Detected Intent: {intent}
Origin: {origin or 'N/A'}
Primary Destination: {dest}
Secondary Destination: {sec_dest or 'N/A'}
Duration Days: {days or 'N/A'}
Budget (NPR): {budget or 'N/A'}
Verified Database Items: {json.dumps(recs, default=str)}

Guidelines:
1. Language matching: If user spoke in Nepali (Devanagari) or Romanized Nepali, respond warmly in the same language or bilingual format.
2. If comparing destinations (e.g. Kathmandu vs Pokhara): Provide structured comparisons (vibe, budget, best for couples/families/adventure, scenic highlights).
3. If transit routing (e.g. Butwal to Dharan, Kathmandu to Pokhara): Give realistic distance (~km), travel time, bus types & fares in NPR, student 45% discount card guidance, and meal stops.
4. If multi-day trip planning: Structure with Morning, Afternoon, Evening, estimated daily costs in NPR, and local food highlights.
5. If user has constraints (e.g. budget under 20k, with kids, no trekking): Strictly honor every constraint in your breakdown.
6. Provide structured, welcoming markdown with clear headers and bullet points.
"""

    try:
        gemini = GeminiService()
        generated = await gemini.generate(prompt, system_instruction=CHAT_SYSTEM)
        final_text = generated or f"Here are your verified travel recommendations for **{dest}**, Nepal."
    except Exception as e:
        print("Gemini synthesis error:", e)
        # Contextual rich fallback
        if intent == "transit_routing":
            orig = origin or "Kathmandu"
            dst = dest or "Pokhara"
            final_text = f"""### 🚌 Transit & Route Guide: {orig} to {dst}

* **Primary Route:** Main National Highway connecting {orig} and {dst}.
* **Estimated Travel Time:** 6 – 9 hours depending on traffic and road conditions.
* **Transit Options:** Tourist AC buses, Deluxe Express buses, and Micro HiAce buses depart daily from central transit terminals.
* **Estimated Fare:** NPR 1,000 – 1,800 per seat (Present student ID card for public transit concessions)."""
        else:
            final_text = f"""### 🌟 Verified Travel Recommendations for {dest}, Nepal

Here is your travel guide and recommendations for exploring **{dest}**:
* **Best Season to Visit:** Autumn (Sept–Nov) & Spring (March–May) for clear weather and mountain views.
* **Accommodations & Dining:** Explore our verified platform partners with direct booking below.
* **Payments:** Instant checkout via Khalti Digital Wallet."""

    return {
        "final_answer": final_text,
        "steps_taken": steps,
        "tools_used": tools,
        "is_terminal": True,
    }

# ============================================================================
# 6. LANGGRAPH HIERARCHICAL WORKFLOW COMPILATION
# ============================================================================
workflow = StateGraph(TourismAgentState)

workflow.add_node("supervisor", supervisor_orchestrator_node)
workflow.add_node("emergency_sos_agent", emergency_sos_agent)
workflow.add_node("transit_route_agent", transit_route_agent)
workflow.add_node("hotel_booking_agent", hotel_booking_agent)
workflow.add_node("dining_discovery_agent", dining_discovery_agent)
workflow.add_node("itinerary_planning_agent", itinerary_planning_agent)
workflow.add_node("partner_rbac_agent", partner_rbac_agent)
workflow.add_node("expense_tracking_agent", expense_tracking_agent)
workflow.add_node("synthesis", response_synthesis_node)

workflow.add_edge(START, "supervisor")

def route_from_supervisor(state: TourismAgentState) -> str:
    if state.get("is_terminal"):
        return END
    intent = state.get("intent", "")
    if intent == "emergency_sos":
        return "emergency_sos_agent"
    if intent == "transit_routing":
        return "transit_route_agent"
    if intent == "hotel_booking":
        return "hotel_booking_agent"
    if intent == "dining_discovery":
        return "dining_discovery_agent"
    if intent == "itinerary_planning":
        return "itinerary_planning_agent"
    if intent == "partner_rbac_action":
        return "partner_rbac_agent"
    if intent == "expense_tracking":
        return "expense_tracking_agent"
    return "itinerary_planning_agent"

workflow.add_conditional_edges("supervisor", route_from_supervisor)

def route_after_agent(state: TourismAgentState) -> str:
    if state.get("is_terminal"):
        return END
    return "synthesis"

workflow.add_conditional_edges("emergency_sos_agent", route_after_agent)
workflow.add_conditional_edges("transit_route_agent", route_after_agent)
workflow.add_conditional_edges("hotel_booking_agent", route_after_agent)
workflow.add_conditional_edges("dining_discovery_agent", route_after_agent)
workflow.add_conditional_edges("itinerary_planning_agent", route_after_agent)
workflow.add_conditional_edges("partner_rbac_agent", route_after_agent)
workflow.add_conditional_edges("expense_tracking_agent", route_after_agent)
workflow.add_edge("synthesis", END)

checkpointer = MemorySaver()
travel_agent_app = workflow.compile(checkpointer=checkpointer)
