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
# 3. SUPERVISOR & ORCHESTRATOR AGENT NODE (LLM NLU DRIVEN)
# ============================================================================
async def supervisor_orchestrator_node(state: TourismAgentState) -> dict[str, Any]:
    """
    Hierarchical Supervisor Node:
    Uses Gemini LLM NLU reasoning to determine user intent, extracted parameters,
    and delegating sub-agents, combined with zero-tolerance safety guardrails.
    """
    last_msg = state["messages"][-1].content if state["messages"] else ""
    msg_lower = last_msg.lower().strip()
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))
    roles = state.get("user_roles", []) or []

    steps.append("🧠 Supervisor NLU: Analyzing intent, semantic roles, entities & safety")
    tools.append("supervisor_orchestrator")

    lang = detect_language(last_msg)
    days, budget = parse_duration_and_budget(last_msg)

    # 1. IMMEDIATE SECURITY & PROMPT INJECTION GUARDRAIL
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

    # 2. INVALID INPUT TESTING
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

    # 4. PURE CONVERSATIONAL GREETINGS
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
    has_travel_terms = any(t in msg_lower for t in ["nepal", "travel", "trip", "trek", "hotel", "food", "restaurant", "guide", "stay", "khalti", "expense", "bus", "student", "route", "visit", "destination", "book", "reserve", "pokhara", "kathmandu", "chitwan", "dharan", "mustang"])
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

    # 6. LLM NLU INTENT & SCHEMA EXTRACTION VIA GEMINI
    nlu_intent = None
    extracted_data: dict[str, Any] = {}
    origin = None
    destination = state.get("destination")
    secondary_dest = None
    messages = state.get("messages", [])

    # Build recent dialogue history for conversational context continuity
    recent_history = []
    if len(messages) > 1:
        for m in messages[-4:-1]:
            sender = "Traveler" if isinstance(m, HumanMessage) else "Assistant"
            recent_history.append(f"{sender}: {m.content[:200]}")
    history_str = "\n".join(recent_history) if recent_history else "None"

    try:
        gemini = GeminiService()
        nlu_prompt = f"""You are the Supervisor NLU Router for TravelNepal AI platform.
User Roles: {roles}
Recent Dialogue History:
{history_str}

Active Destination in State: {destination or 'None'}
Latest User Message: "{last_msg}"

Determine:
1. "intent": One of:
   - "partner_rbac_action": User wants to add, create, or mutate workspace items (hotel owner adding room/hotel, restaurant owner adding dish/menu, guide setting package/availability).
   - "hotel_booking": Traveler searching or booking hotel stays.
   - "dining_discovery": Traveler searching for food, restaurants, or cuisines.
   - "transit_routing": Traveler asking how to travel between cities, bus routes, bus fares.
   - "itinerary_planning": Multi-day custom trip schedule for a specific destination.
   - "destination_discovery": Open-ended "where should I go in Nepal".
   - "expense_tracking": Logging a travel expense.
   - "out_of_domain": Non-travel questions.

2. "origin": starting city if transit (e.g. Butwal, Kathmandu).
3. "destination": target city in Nepal if mentioned or implied from conversation history (e.g. Kathmandu, Pokhara, Chitwan, Mustang, Dharan).
4. "extracted_data": JSON with any parameters extracted (room_number, price_per_night, dish_name, dish_price, expense_amount).

Respond ONLY with valid JSON."""

        nlu_schema = {
            "type": "OBJECT",
            "properties": {
                "intent": {"type": "STRING"},
                "action_type": {"type": "STRING"},
                "origin": {"type": "STRING"},
                "destination": {"type": "STRING"},
                "days": {"type": "INTEGER"},
                "budget_npr": {"type": "NUMBER"},
                "extracted_data": {
                    "type": "OBJECT",
                    "properties": {
                        "room_number": {"type": "STRING"},
                        "price_per_night": {"type": "NUMBER"},
                        "room_type": {"type": "STRING"},
                        "capacity": {"type": "INTEGER"},
                        "dish_name": {"type": "STRING"},
                        "dish_price": {"type": "NUMBER"},
                        "expense_amount": {"type": "NUMBER"},
                        "expense_category": {"type": "STRING"},
                    }
                }
            },
            "required": ["intent"]
        }

        res_json_str = await gemini.generate_json(nlu_prompt, nlu_schema)
        if res_json_str and res_json_str != "{}":
            parsed = json.loads(res_json_str)
            nlu_intent = parsed.get("intent")
            extracted_data = parsed.get("extracted_data") or {}
            if parsed.get("origin"):
                origin = parsed["origin"]
            if parsed.get("destination"):
                destination = parsed["destination"]
            if parsed.get("days"):
                days = parsed["days"]
            if parsed.get("budget_npr"):
                budget = int(parsed["budget_npr"])
    except Exception as e:
        print("[Supervisor LLM NLU Warning]:", e)

    # Multi-turn Contextual Follow-up Continuity
    if not destination:
        if state.get("destination"):
            destination = state["destination"]
        elif len(messages) > 1:
            for prev_m in reversed(messages[:-1]):
                for city in KNOWN_NEPALI_CITIES:
                    if re.search(rf"\b{city}\b", prev_m.content.lower()):
                        destination = city.capitalize()
                        break
                if destination:
                    break

    # If the user gives a short affirmative confirmation ("yes", "sure", "show me", "okay", "yes please")
    is_affirmative = msg_lower in ["yes", "yeah", "sure", "yep", "ok", "okay", "show me", "yes please", "tell me more", "proceed", "go ahead", "show them"]
    if is_affirmative and len(messages) > 1:
        prev_assistant = messages[-2].content.lower()
        if any(w in prev_assistant for w in ["hotel", "stay", "resort", "accommodation", "hostel", "budget"]):
            nlu_intent = "hotel_booking"
            steps.append(f"🧠 Context Continuity: Linked affirmative response to hotel search in {destination or 'Kathmandu'}")
        elif any(w in prev_assistant for w in ["food", "dish", "restaurant", "eat", "dining", "cuisine"]):
            nlu_intent = "dining_discovery"
            steps.append(f"🧠 Context Continuity: Linked affirmative response to dining discovery in {destination or 'Kathmandu'}")
        elif any(w in prev_assistant for w in ["itinerary", "trip", "day", "days", "schedule"]):
            nlu_intent = "itinerary_planning"
            steps.append(f"🧠 Context Continuity: Linked affirmative response to trip itinerary in {destination or 'Nepal'}")

    # Fast fallback / Semantic Pattern Reinforcement
    if not origin or not destination:
        route_match = re.search(r"from\s+([a-zA-Z]+)\s+to\s+([a-zA-Z]+)", msg_lower)
        if route_match:
            c1, c2 = route_match.group(1), route_match.group(2)
            for city in KNOWN_NEPALI_CITIES:
                if c1 == city:
                    origin = city.capitalize()
                if c2 == city:
                    destination = city.capitalize()

    if not destination:
        for city in KNOWN_NEPALI_CITIES:
            if re.search(rf"\b{city}\b", msg_lower):
                destination = city.capitalize()
                break

    # 0. Excessive / Invalid Trip Duration Guardrail
    if days and (days > 60 or days <= 0):
        steps.append(f"🛡️ Guardrail: Detected out-of-range trip duration ({days:,} days)")
        return {
            "is_terminal": True,
            "final_answer": (
                f"🏔️ **Trip Duration Notice ({days:,} Days)**\n\n"
                f"A continuous {days:,}-day itinerary exceeds typical travel visa durations (Nepal tourist visas are issued for a maximum of 150 days per calendar year).\n\n"
                f"🌟 **Recommended Trip Durations:**\n"
                f"• **Weekend Getaways:** 2 – 4 Days (e.g. Pokhara, Chitwan, Nagarkot)\n"
                f"• **Classic Circuits:** 7 – 14 Days (e.g. Annapurna Base Camp, Everest Panorama, Langtang)\n"
                f"• **Grand Himalayan Traverses:** 21 – 30 Days (e.g. Great Himalaya Trail sectors, Manaslu & Mustang)\n\n"
                f"Would you like me to plan a custom **3-Day, 7-Day, or 14-Day** itinerary for your favorite destinations?"
            ),
            "steps_taken": steps,
            "tools_used": tools + ["duration_guardrail"],
        }

    # Check for Partner Workspace Mutation intent via NLU or regex
    is_owner_mutation = (
        nlu_intent == "partner_rbac_action" or
        bool(re.search(r"\b(add|create|new|insert|publish|list)\s+(?:a\s+)?(?:new\s+)?(?:hotel\s+)?(room|dish|food|menu|package)\b", msg_lower)) or
        bool("hotel owner" in msg_lower and any(w in msg_lower for w in ["room", "hotel", "listed", "price"])) or
        bool("restaurant owner" in msg_lower and any(w in msg_lower for w in ["dish", "menu", "food"]))
    )

    if is_owner_mutation:
        return {
            "intent": "partner_rbac_action",
            "destination": destination,
            "language": lang,
            "extracted_data": extracted_data,
            "is_terminal": False,
            "steps_taken": steps + ["🏢 Supervisor: Delegated to Partner RBAC Agent (LLM NLU)"],
        }

    # B. Expense Logging
    if nlu_intent == "expense_tracking" or any(phrase in msg_lower for phrase in ["log expense", "spent", "spent rs", "spent npr", "record expense", "add expense"]):
        return {
            "intent": "expense_tracking",
            "destination": destination,
            "language": lang,
            "extracted_data": extracted_data,
            "is_terminal": False,
            "steps_taken": steps + ["💰 Supervisor: Delegated to Expense Tracking Agent"],
        }

    # C. Transit & Intercity Routing
    if nlu_intent == "transit_routing" or (origin and destination) or any(t in msg_lower for t in ["how to travel", "how to reach", "how to go", "how do i travel", "bus from", "flight to", "cheapest way to reach", "fastest way to reach", "travel time", "travel by bus", "bus route", "bus fare", "bus ticket"]):
        return {
            "intent": "transit_routing",
            "origin": origin,
            "destination": destination,
            "days": days,
            "budget_npr": budget,
            "language": lang,
            "is_terminal": False,
            "steps_taken": steps + ["🚌 Supervisor: Delegated to Transit & Route Agent"],
        }

    # D. Hotel Search & Booking
    if nlu_intent == "hotel_booking" or any(h in msg_lower for h in ["hotel", "stay", "resort", "lodge", "room", "accommodation", "booking", "reserve room"]):
        return {
            "intent": "hotel_booking",
            "destination": destination,
            "days": days,
            "budget_npr": budget,
            "language": lang,
            "is_terminal": False,
            "steps_taken": steps + [f"🏨 Supervisor: Delegated to Hotel & Stay Agent ({destination or 'Location Required'})"],
        }

    # E. Dining & Food Discovery
    if nlu_intent == "dining_discovery" or any(f in msg_lower for f in ["food", "eat", "restaurant", "cafe", "momo", "sekuwa", "thakali", "khaja", "breakfast", "dinner", "lunch", "cuisine", "dining"]):
        return {
            "intent": "dining_discovery",
            "destination": destination,
            "language": lang,
            "is_terminal": False,
            "steps_taken": steps + [f"🍽️ Supervisor: Delegated to Dining & Food Agent ({destination or 'Location Required'})"],
        }

    # F. Open-ended Vacation / Destination Discovery (No specific city named)
    if not destination or nlu_intent == "destination_discovery":
        return {
            "intent": "destination_discovery",
            "destination": None,
            "days": days or 4,
            "budget_npr": budget,
            "language": lang,
            "is_terminal": False,
            "steps_taken": steps + [f"🗺️ Supervisor: Open-ended trip query — Curating {days or 4}-day options & clarifying location with traveler"],
        }

    # G. Itinerary & Personalized Trip Planning for Named Destination
    return {
        "intent": "itinerary_planning",
        "destination": destination,
        "secondary_dest": secondary_dest,
        "days": days or 3,
        "budget_npr": budget,
        "language": lang,
        "is_terminal": False,
        "steps_taken": steps + [f"🗺️ Supervisor: Delegated to Itinerary Planning Agent ({destination})"],
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
    origin = state.get("origin")
    destination = state.get("destination")
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))

    if not origin or not destination:
        steps.append("❓ Transit Agent: Missing route endpoints — Prompted traveler for origin and destination")
        return {
            "is_terminal": True,
            "final_answer": """🚌 **Nepal Intercity Transit & Route Planner**

Please let me know your **starting location** and **destination city** (for example: *Kathmandu to Pokhara*, *Butwal to Dharan*, or *Pokhara to Chitwan*).

Once you specify your route, I will provide:
• 🛣️ Exact highway distances & realistic travel durations
• 🎫 Bus types (Tourist AC, Micro HiAce, Deluxe) & approximate fares
• 🎓 Student 45% discount guidance
• 🍲 Recommended highway meal stops""",
            "steps_taken": steps,
            "tools_used": tools + ["clarification_guard"],
        }

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
    dest = state.get("destination")
    budget = state.get("budget_npr")
    last_msg = state["messages"][-1].content if state["messages"] else ""
    msg_lower = last_msg.lower()
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))

    if not dest:
        steps.append("❓ Hotel Agent: Missing target city — Prompted traveler for destination")
        return {
            "is_terminal": True,
            "final_answer": """🏨 **Hotel & Accommodations Search**

Which city or area in Nepal are you planning to stay in?
*(e.g., **Pokhara Lakeside, Kathmandu Thamel, Chitwan Sauraha, Lumbini, Mustang, Dharan, Nagarkot**)*

Tell me your location (and your budget per night if you have one), and I will search our live database of verified partner stays with instant Khalti checkout!""",
            "steps_taken": steps,
            "tools_used": tools + ["clarification_guard"],
        }

    steps.append(f"🏨 Hotel Agent: Querying verified platform catalog for {dest}")
    tools.append("hotel_booking_agent")

    recommendations = []
    matched_hotel = None
    web_insights = []
    try:
        async with SessionLocal() as db:
            db_hotels = await search_hotels(db, dest, max_price=budget, limit=8)
            if db_hotels:
                # 1. Filter out dummy test listings like "gggggggg", "test" unless no other exist
                valid_hotels = [h for h in db_hotels if h.name.lower() not in ["gggggggg", "test", "asdf"]] or db_hotels
                
                # 2. Score candidate hotels against words in user query
                query_words = set(re.findall(r"\b[a-zA-Z]{3,}\b", msg_lower))
                best_match = None
                best_score = 0

                for h in valid_hotels:
                    h_lower = h.name.lower()
                    h_words = set(re.findall(r"\b[a-zA-Z]{3,}\b", h_lower))
                    score = 0
                    
                    # Direct substring match
                    if h_lower in msg_lower:
                        score += 10
                    
                    # Word overlap
                    overlap = len(query_words.intersection(h_words))
                    score += overlap * 4

                    # Stemming / prefix fuzzy match (e.g. pindeshware -> pindeshwari)
                    for qw in query_words:
                        if len(qw) >= 4 and any(hw.startswith(qw[:4]) or qw.startswith(hw[:4]) for hw in h_words):
                            score += 5

                    if score > best_score:
                        best_score = score
                        best_match = h

                matched_hotel = best_match or valid_hotels[0]

                # Put matched hotel first in recommendations
                sorted_hotels = [matched_hotel] + [h for h in valid_hotels if h.id != matched_hotel.id]
                for h in sorted_hotels[:4]:
                    recommendations.append({
                        "name": h.name,
                        "type": "hotel",
                        "description": h.description or f"Top rated accommodation in {h.district or dest}.",
                        "price": f"NPR {getattr(h, 'min_price', 2500):,}/night",
                        "rating": 4.8,
                        "location": f"{h.district or dest}, Nepal",
                        "action_url": f"/hotels/{h.id}",
                    })
            else:
                # Web Search Grounding Fallback for stays
                steps.append(f"🌐 Web Search Grounding: Searching top hotels & resorts in {dest}")
                searcher = WebSearchService()
                web_insights = await searcher.search(f"Top best hotels resorts in {dest} Nepal", max_results=3)
                for w in web_insights:
                    recommendations.append({
                        "name": w.get("title", f"Stay in {dest}"),
                        "type": "hotel",
                        "description": w.get("snippet", f"Recommended accommodation in {dest}."),
                        "price": "NPR 2,500 – 5,500/night",
                        "rating": 4.7,
                        "location": f"{dest}, Nepal",
                        "action_url": w.get("url", GoogleMapsService.build_search_url(f"Hotels in {dest} Nepal")),
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
    dest = state.get("destination")
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))

    if not dest:
        steps.append("❓ Dining Agent: Missing target city — Prompted traveler for dining location")
        return {
            "is_terminal": True,
            "final_answer": """🍽️ **Authentic Dining & Food Discovery**

Which city or area in Nepal are you dining in?
*(e.g., **Kathmandu (Newari & Thakali), Pokhara Lakeside (Cafes & Fish), Chitwan (Tharu delicacies), Janakpur (Mithila sweets)**)*

Let me know your city, and I will find verified local restaurants, famous eateries, and traditional dishes!""",
            "steps_taken": steps,
            "tools_used": tools + ["clarification_guard"],
        }

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
            else:
                # Web Search Grounding for dining
                steps.append(f"🌐 Web Search Grounding: Searching local dining in {dest}")
                searcher = WebSearchService()
                web_insights = await searcher.search(f"Best authentic local food restaurants in {dest} Nepal", max_results=3)
                for w in web_insights:
                    recommendations.append({
                        "name": w.get("title", f"Local Dining in {dest}"),
                        "type": "restaurant",
                        "description": w.get("snippet", f"Authentic regional cuisine in {dest}."),
                        "price": "NPR 300 – 900",
                        "rating": 4.7,
                        "location": f"{dest}, Nepal",
                        "action_url": w.get("url", GoogleMapsService.build_search_url(f"Restaurants in {dest} Nepal")),
                    })
    except Exception as e:
        print("Dining DB Error:", e)

    map_url = GoogleMapsService.build_search_url(f"Popular authentic restaurants in {dest} Nepal")
    map_cards = [{
        "title": f"Dining & Food in {dest}",
        "location": f"{dest}, Nepal",
        "map_url": map_url,
        "place_type": "dining_map",
        "description": f"Discover top local kitchens, Thakali sets, and restaurants in {dest}",
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
            if db_hotels:
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
            else:
                steps.append(f"🌐 Web Search Grounding: Discovering top sights and stays in {dest}")
                searcher = WebSearchService()
                web_insights = await searcher.search(f"Top attractions sights things to do in {dest} Nepal", max_results=3)
                for w in web_insights:
                    recommendations.append({
                        "name": w.get("title", f"Attraction in {dest}"),
                        "type": "place",
                        "description": w.get("snippet", f"Must-visit landmark in {dest}."),
                        "location": f"{dest}, Nepal",
                        "action_url": w.get("url", GoogleMapsService.build_search_url(f"{dest} Nepal attractions")),
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
    extracted = state.get("extracted_data") or {}

    # 1. HOTEL ROOM CREATION / MUTATION
    is_room_mutation = (
        any(w in msg_lower for w in ["room", "hotel owner", "add room", "add a room", "create room", "new room", "list room"]) or
        bool(extracted.get("price_per_night")) or
        bool(extracted.get("room_number"))
    ) and not any(w in msg_lower for w in ["dish", "menu", "food", "package"])

    if is_room_mutation:
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

        # Extract values using NLU parsed data with robust fallbacks
        price = int(extracted.get("price_per_night") or 0)
        if not price:
            num_matches = [int(n) for n in re.findall(r"\b\d+\b", msg_lower)]
            price = num_matches[0] if num_matches else 2500

        room_num = str(extracted.get("room_number") or "101")
        if room_num == str(price) and price < 500:
            room_num = "101"

        room_type = str(extracted.get("room_type") or "double").lower()
        if room_type not in ["single", "double", "twin", "family", "suite"]:
            room_type = "double"

        capacity = int(extracted.get("capacity") or (1 if room_type == "single" else 4 if room_type in ["family", "suite"] else 2))
        desc = extracted.get("description") or f"Comfortable {room_type.capitalize()} room with modern amenities."

        action_payload = {
            "room_number": room_num,
            "room_type": room_type,
            "price_per_night": price,
            "capacity": capacity,
            "description": desc,
            "image_url": "",
        }
        steps.append("📝 Human-In-The-Loop: Prepared Hotel Room Action Card with Cloudinary Upload")
        return {
            "is_terminal": True,
            "action_proposal": {
                "action_type": "ADD_HOTEL_ROOM",
                "title": f"Add Hotel Room #{room_num}",
                "description": f"Publish Room #{room_num} ({room_type.capitalize()}, Max {capacity} Guests) at NPR {price:,}/night to your hotel catalog. You can attach a room photo below.",
                "payload": action_payload,
            },
            "final_answer": f"I have prepared the action proposal for **Room #{room_num} ({room_type.capitalize()})** at **NPR {price:,}/night**.\n\n📸 You can upload a room image via Cloudinary on the card below, edit any field, and click **Confirm & Execute** to publish it live!",
            "steps_taken": steps,
            "tools_used": tools + ["hitl_action_proposal", "cloudinary_upload"],
        }

    # 2. RESTAURANT OWNER RBAC
    if any(w in msg_lower for w in ["add dish", "add food", "add menu", "create dish", "dish", "food item"]):
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

        price = int(extracted.get("dish_price") or 0)
        if not price:
            num_match = re.findall(r"\b\d+\b", msg_lower)
            price = int(num_match[0]) if num_match else 400

        dish_name = extracted.get("dish_name") or "Special Local Dish"
        action_payload = {
            "name": dish_name,
            "price": price,
            "description": f"Freshly prepared authentic {dish_name}.",
            "category": "Main Course",
            "menus_image_url": "",
        }
        steps.append("📝 Human-In-The-Loop: Prepared Restaurant Menu Action Card with Cloudinary Upload")
        return {
            "is_terminal": True,
            "action_proposal": {
                "action_type": "ADD_RESTAURANT_DISH",
                "title": f"Add Menu Dish: {dish_name}",
                "description": f"Add {dish_name} at NPR {price:,} to your digital menu.",
                "payload": action_payload,
            },
            "final_answer": f"I have configured the action card to add **{dish_name}** at **NPR {price:,}**. You can upload a photo and click **Confirm & Execute** to publish it.",
            "steps_taken": steps,
            "tools_used": tools + ["hitl_action_proposal", "cloudinary_upload"],
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

# SUB-AGENT 8: DESTINATION DISCOVERY & VACATION SUGGESTIONS AGENT
async def destination_discovery_agent(state: TourismAgentState) -> dict[str, Any]:
    days = state.get("days") or 5
    budget = state.get("budget_npr")
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))

    steps.append(f"🗺️ Discovery Agent: Curating top {days}-day vacation ideas across Nepal")
    tools.append("destination_discovery_agent")

    # Multi-destination map cards
    map_cards = [
        {
            "title": "Pokhara Valley & Annapurna Foothills",
            "location": "Pokhara, Gandaki Province, Nepal",
            "map_url": GoogleMapsService.build_search_url("Pokhara Nepal attractions"),
            "place_type": "attraction_map",
            "description": "Lakeside relaxation, Phewa boating, Sarangkot sunrise, World Peace Pagoda, and paragliding.",
        },
        {
            "title": "Chitwan National Park & Sauraha",
            "location": "Chitwan, Bagmati Province, Nepal",
            "map_url": GoogleMapsService.build_search_url("Chitwan National Park Nepal"),
            "place_type": "safari_map",
            "description": "Jeep safaris, one-horned rhinos, elephant breeding center, canoe rides & authentic Tharu cultural dance.",
        },
        {
            "title": "Kathmandu Valley & Nagarkot Heritage",
            "location": "Kathmandu Valley, Nepal",
            "map_url": GoogleMapsService.build_search_url("Kathmandu UNESCO Heritage Nepal"),
            "place_type": "heritage_map",
            "description": "Ancient Durbar Squares, Swayambhunath, Boudhanath Stupa, and panoramic Himalayan sunrise in Nagarkot.",
        },
        {
            "title": "Mustang & Muktinath Spiritual Circuit",
            "location": "Mustang, Gandaki Province, Nepal",
            "map_url": GoogleMapsService.build_search_url("Mustang Muktinath Nepal"),
            "place_type": "adventure_map",
            "description": "High-altitude desert landscapes, ancient cliff monasteries, sacred Muktinath Temple, and apple orchards.",
        }
    ]

    # Gather top verified platform stays across these premier regions
    recommendations = []
    try:
        async with SessionLocal() as db:
            p_hotels = await search_hotels(db, "Pokhara", limit=2)
            c_hotels = await search_hotels(db, "Chitwan", limit=1)
            k_hotels = await search_hotels(db, "Kathmandu", limit=1)
            for h in (p_hotels + c_hotels + k_hotels):
                recommendations.append({
                    "name": h.name,
                    "type": "hotel",
                    "description": f"Verified accommodation in {h.district or 'Nepal'}.",
                    "price": f"NPR {getattr(h, 'min_price', 2800):,}/night",
                    "rating": 4.8,
                    "location": f"{h.district or 'Nepal'}, Nepal",
                    "action_url": f"/hotels/{h.id}",
                })
    except Exception as e:
        print("Discovery DB warning:", e)

    return {
        "recommendations": recommendations,
        "map_cards": map_cards,
        "steps_taken": steps,
        "tools_used": tools,
    }

# ============================================================================
# 5. RESPONSE SYNTHESIS NODE (Powered by Multi-Model Gemini Engine)
# ============================================================================
async def response_synthesis_node(state: TourismAgentState) -> dict[str, Any]:
    if state.get("is_terminal") and state.get("final_answer"):
        return {}

    intent = state.get("intent", "")
    dest = state.get("destination")
    sec_dest = state.get("secondary_dest")
    origin = state.get("origin")
    days = state.get("days") or (5 if intent == "destination_discovery" else 3)
    budget = state.get("budget_npr")
    lang = state.get("language", "en")
    last_msg = state["messages"][-1].content if state["messages"] else ""
    recs = state.get("recommendations", [])
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))

    steps.append("✨ Multi-Agent Synthesis: Generating comprehensive grounded response")
    tools.append("gemini_synthesis")

    user_name = state.get("user_name") or "Traveler"
    user_roles = state.get("user_roles") or []

    prompt = f"""You are the expert AI Travel Specialist for TravelNepal platform.

Traveler Name: {user_name}
Traveler Roles: {user_roles}
User Query: "{last_msg}"
Detected Language: {lang}
Detected Intent: {intent}
Origin: {origin or 'N/A'}
Primary Destination: {dest or 'Nepal Destinations'}
Secondary Destination: {sec_dest or 'N/A'}
Duration Days: {days}
Budget (NPR): {budget or 'N/A'}
Verified Database Items: {json.dumps(recs, default=str)}

Guidelines:
1. Greet the traveler naturally using their name ({user_name}) if appropriate, or jump straight into the practical response. Never output template variables like '{{userName}}' or '{{spendingHabit}}'.
2. If user is searching for hotels (intent: hotel_booking):
   - Present the verified hotel listings found in {dest} with room types, prices in NPR, and features.
   - If budget is below typical market rates (e.g. under NPR 1,000 in Kathmandu), realistically explain that verified stays start around NPR 1,500–2,500 and show the closest affordable verified options.
3. If user is asking for vacation suggestions (intent: destination_discovery or no specific city named):
   - Provide 3-4 top, distinct {days}-day Nepal vacation options (e.g. Option 1: Pokhara Leisure, Option 2: Chitwan Wildlife Safari, Option 3: Lower Mustang, Option 4: Kathmandu Heritage).
   - Ask which destination excites them most so you can generate a detailed itinerary.
4. If multi-day trip planning for a specific destination:
   - Create a realistic day-by-day plan with Morning, Afternoon, Evening schedule, local food specialties, and estimated cost breakdowns in NPR.
5. If transit routing: Give realistic distance (~km), travel time, tourist vs local bus fares in NPR, and student 45% discount card guidance.
6. Keep all responses well-formatted in clean Markdown with headers (###), bold accents, and neat bullet points (•).
7. When referencing verified platform stays or restaurants, format links strictly without spaces inside parentheses: [Hotel Name](/hotels/{id}) or [Restaurant Name](/restaurants/{id}).
"""

    generated = ""
    try:
        gemini = GeminiService()
        generated = await gemini.generate(prompt, system_instruction=CHAT_SYSTEM)
    except Exception as e:
        print("Gemini synthesis error:", e)

    if generated:
        final_text = generated
    else:
        # High-Quality Contextual Fallback
        if intent == "destination_discovery" or not dest:
            final_text = f"""### 🏔️ Top Recommended Destinations for a {days}-Day Nepal Vacation

Here are 3 premier travel ideas curated for your **{days}-Day** holiday in Nepal:

---

#### 1. 🌅 **Pokhara Valley & Annapurna Foothills (Lakeside, Adventure & Serenity)**
* **Ideal For:** Couples, families, and leisure travelers who love mountain panoramas and lake vibes.
* **{days}-Day Highlights:**
  • **Day 1–2:** Boating on Phewa Lake, Tal Barahi Temple, Peace Pagoda & Davis Fall.
  • **Day 3:** Sarangkot sunrise over Machhapuchhre (Fishtail) & optional tandem paragliding.
  • **Day 4:** Day trip to Ghandruk ethnic Gurung heritage village or Begnas Lake.
  • **Day 5:** Lakeside cafe hopping, souvenir shopping, and return journey.
* **Estimated Budget:** NPR 18,000 – 30,000 per person (Comfort stay, meals & local transport).

---

#### 2. 🐘 **Chitwan National Park & Sauraha (Wildlife Safari & Jungle Adventure)**
* **Ideal For:** Nature lovers, wildlife enthusiasts, and family vacations.
* **{days}-Day Highlights:**
  • **Day 1:** Arrival in Sauraha, sunset view from Rapti River bank, and Tharu Cultural Dance.
  • **Day 2:** Full-day Jeep Safari in National Park core area (spot one-horned rhinos, deer & tigers).
  • **Day 3:** Canoe ride along Rapti river (gharial crocodiles & birdwatching) + Elephant breeding center.
  • **Day 4:** 20,000 Lakes (Bishajari Tal) cycling tour & authentic Tharu village walk.
  • **Day 5:** Morning jungle walk and return trip.
* **Estimated Budget:** NPR 16,000 – 26,000 per person (Includes safari permits & resort stay).

---

#### 3. 🏯 **Kathmandu Valley & Nagarkot Panoramic Trail (UNESCO Heritage & Sunrises)**
* **Ideal For:** Cultural heritage, historic architecture, and gentle hiking.
* **{days}-Day Highlights:**
  • **Day 1–2:** Kathmandu & Patan Durbar Squares, Swayambhunath (Monkey Temple) & Boudhanath Stupa.
  • **Day 3:** Scenic drive to Nagarkot hill station via medieval Bhaktapur city.
  • **Day 4:** Majestic Himalayan sunrise view from Nagarkot tower & hiking to Changunarayan Temple.
  • **Day 5:** Return to Kathmandu for Thamel shopping and traditional Newari dinner.
* **Estimated Budget:** NPR 14,000 – 22,000 per person.

---

💬 **Which of these destinations interests you the most?** Let me know, and I will generate your exact day-by-day plan and book verified accommodations!"""

        elif intent == "transit_routing":
            orig = origin or "Kathmandu"
            dst = dest or "Pokhara"
            final_text = f"""### 🚌 Transit & Route Guide: {orig} to {dst}

* **Primary Route:** Main National Highway connecting {orig} and {dst}.
* **Estimated Travel Time:** 6 – 9 hours depending on road expansion and traffic conditions.
* **Transit Options & Fares:**
  • **Tourist AC Deluxe Bus:** NPR 1,200 – 1,800 per seat (Comfortable recliner seats with AC and highway lunch stop).
  • **Micro HiAce Bus:** NPR 900 – 1,300 per seat (Faster transit, departs every 30 mins).
  • **Public Deluxe Bus:** NPR 700 – 1,000 per seat *(Students receive 45% discount on presentation of valid ID card)*.
* **Recommended Highway Stops:** Malekhu / Mugling for fresh river fish and Nepali Dal Bhat."""

        else:
            final_text = f"""### 🌟 {days}-Day Complete Itinerary & Travel Guide: {dest}, Nepal

Here is your detailed, day-by-day travel plan curated for **{days} Days in {dest}**:

---

#### 🗓️ Day-by-Day Schedule:
* **Day 1: Arrival, Check-In & Local Atmosphere**
  • **Morning:** Arrive in {dest}, check into your lodge/hotel, and settle in.
  • **Afternoon:** Stroll through local markets, scenic waterfronts, and cultural viewpoints.
  • **Evening:** Savor authentic local cuisine (Thakali Thali / Newari Khaja / Tharu specialities) and relax.

* **Day 2: Signature Attractions & Guided Excursions**
  • **Morning:** Early morning sunrise excursion or core landmark visit.
  • **Afternoon:** Guided tour of prime attractions, heritage sites, and nature trails.
  • **Evening:** Sunset vantage point followed by local cafe hopping.

* **Day 3: Outdoor Adventure & Cultural Immersion**
  • **Morning:** Outdoor excursion (Jeep safari / boat ride / nature hike / viewpoint walk).
  • **Afternoon:** Visit traditional ethnic settlements, organic farms, and artisan centers.
  • **Evening:** Evening leisure, bonfire dinner, and local music.

* **Day 4: Highlights & Souvenir Walk**
  • **Morning:** Morning photo walk, organic tea/coffee, and authentic souvenir shopping.
  • **Afternoon:** Departure and smooth transit to your next destination.

---

#### 🏨 Recommended Stays & Pricing in {dest}:
* **Verified Deluxe & Boutique Stays:** NPR 2,800 – 6,500 / night (With instant Khalti checkout).
* **Authentic Local Homestays:** NPR 1,200 – 2,200 / night (Includes home-cooked meals).

---

#### 💰 Estimated Budget Breakdown ({days} Days):
* **Accommodation ({max(1, days-1)} Nights):** NPR {int(max(1, days-1) * 2800):,}
* **Meals & Authentic Dining:** NPR {int(days * 1200):,}
* **Local Sightseeing & Entry Permits:** NPR {int(days * 1500):,}
* **Total Estimated Budget:** **NPR {int(max(1, days-1) * 2800 + days * 1200 + days * 1500):,} per person**"""

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
workflow.add_node("destination_discovery_agent", destination_discovery_agent)
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
    if intent == "destination_discovery":
        return "destination_discovery_agent"
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

workflow.add_conditional_edges("destination_discovery_agent", route_after_agent)
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
