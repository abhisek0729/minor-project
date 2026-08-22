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

# ==========================================
# 1. AGENT STATE DEFINITION
# ==========================================
class TourismAgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    user_id: int | None
    user_name: str | None
    user_roles: list[str]
    intent: str
    destination: str | None
    slots: dict[str, Any]
    action_proposal: dict[str, Any] | None
    recommendations: list[dict[str, Any]]
    map_cards: list[dict[str, Any]]
    steps_taken: list[str]
    tools_used: list[str]
    final_answer: str
    is_terminal: bool

# ==========================================
# 2. INTENT CLASSIFICATION & GUARDRAILS NODE
# ==========================================
KNOWN_NEPALI_CITIES = [
    "pokhara", "kathmandu", "lumbini", "dharan", "chitwan", "mustang",
    "everest", "annapurna", "butwal", "bandipur", "ilam", "janakpur",
    "rara", "nagarkot", "bhaktapur", "lalitpur", "biratnagar", "itahari",
    "bhedetar", "namche", "sauraha", "gorkha", "hetauda", "nepalgunj",
]

OUT_OF_DOMAIN_KEYWORDS = [
    "python", "javascript", "typescript", "c++", "java", "sql", "coding",
    "write code", "fix bug", "algorithm", "solve math", "calculus",
    "stock price", "crypto", "bitcoin", "medical advice", "symptoms"
]

def guardrail_and_classifier_node(state: TourismAgentState) -> dict[str, Any]:
    last_msg = state["messages"][-1].content if state["messages"] else ""
    msg_lower = last_msg.lower().strip()
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))

    # A. Check Capabilities / Help
    if any(q in msg_lower for q in ["what can you do", "your capabilities", "what are your capabilities", "what do you do", "who are you", "what are your features"]):
        steps.append("🤖 LangGraph Agent: Identified platform capabilities query")
        return {
            "intent": "capabilities",
            "is_terminal": True,
            "final_answer": """Namaste! 🙏 I am your **TravelNepal AI Specialist**, powered by our multi-agent travel intelligence graph.

🌟 **Here is what I can do for you:**

• 🗺️ **Intelligent Trip Planning**: Generate custom multi-day itineraries, transit routes, and budget breakdowns for any destination in Nepal.
• 🏨 **Hotels & Stays**: Search verified platform hotels, check real-time pricing in NPR, and initiate instant bookings with secure **Khalti** checkout.
• 🍽️ **Food & Dining Discovery**: Find authentic local cuisines (Thakali, Newari, Dharan Sekuwa, Momo) and local eatery locations with live Google Maps directions.
• 🧗 **Licensed Tour Guides**: Connect with verified mountain trekking guides and cultural experts.
• 💰 **Expense Tracking**: Log, categorize, and monitor your travel expenditures in NPR.
• 🏢 **Partner Workspace Management**: Verified hotel and restaurant owners can add rooms and update menus using interactive action cards.

💬 *Ask me anything about traveling in Nepal or managing your TravelNepal listings!*""",
            "steps_taken": steps,
            "tools_used": tools + ["capabilities_provider"],
        }

    # B. Out-of-Domain Guardrail
    has_travel_terms = any(t in msg_lower for t in ["nepal", "travel", "trip", "trek", "hotel", "food", "restaurant", "guide", "stay", "khalti", "expense"])
    if any(re.search(rf"\b{kw}\b", msg_lower) for kw in OUT_OF_DOMAIN_KEYWORDS) and not has_travel_terms:
        steps.append("🔒 LangGraph Guardrail: Filtered out-of-domain query")
        return {
            "intent": "guardrail_violation",
            "is_terminal": True,
            "final_answer": """Namaste! 🙏 I am your **TravelNepal AI Specialist**, focused exclusively on travel, tourism, and platform operations across Nepal.

I cannot assist with programming, general coding, academic assignments, or topics outside Nepal tourism.

🌟 **Please feel free to ask about:**
• 🗺️ Trip & Trek itineraries in Nepal
• 🏨 Finding and booking verified hotels via Khalti
• 🍽️ Discovering authentic Nepali dining & street food
• 💰 Logging and tracking your travel expenses""",
            "steps_taken": steps,
            "tools_used": tools + ["guardrail_filter"],
        }

    # C. Location Prompting (Near Me without city)
    is_near_me = any(phrase in msg_lower for phrase in ["near me", "nearby hotel", "nearest hotel", "nearby stay", "hotels close by"])
    has_city = any(re.search(rf"\b{city}\b", msg_lower) for city in KNOWN_NEPALI_CITIES)
    if is_near_me and not has_city:
        steps.append("📍 LangGraph Agent: Prompting traveler for current location")
        return {
            "intent": "near_me_prompt",
            "is_terminal": True,
            "final_answer": """📍 **Where are you currently located in Nepal?**

Please reply with your current city or district (e.g. *Butwal, Dharan, Kathmandu, Pokhara, Chitwan, Itahari, Biratnagar*) and I will immediately fetch the closest verified hotels, rates in NPR, and direct Google Maps navigation for you!""",
            "steps_taken": steps,
            "tools_used": tools + ["location_prompter"],
        }

    # D. Detect Owner Mutation Action vs Traveler Action
    is_add_room = any(phrase in msg_lower for phrase in ["add room", "create room", "new room", "add hotel room"])
    is_add_dish = any(phrase in msg_lower for phrase in ["add dish", "add food", "add menu", "new dish", "create dish"])
    is_log_expense = any(phrase in msg_lower for phrase in ["log expense", "spent", "spent rs", "spent npr", "record expense", "add expense"])

    if is_add_room:
        return {"intent": "owner_add_room", "is_terminal": False, "steps_taken": steps + ["🏢 LangGraph Agent: Routing to Hotel Owner Action Node"]}
    if is_add_dish:
        return {"intent": "owner_add_dish", "is_terminal": False, "steps_taken": steps + ["🍽️ LangGraph Agent: Routing to Restaurant Owner Action Node"]}
    if is_log_expense:
        return {"intent": "traveler_log_expense", "is_terminal": False, "steps_taken": steps + ["💰 LangGraph Agent: Routing to Expense Tracker Node"]}

    # E. Detect Food Search vs Hotel Search vs Trip Plan
    is_food = any(f in msg_lower for f in ["food", "eat", "restaurant", "cafe", "momo", "sekuwa", "thakali", "khaja", "dinner", "lunch"])
    is_hotel = any(h in msg_lower for h in ["hotel", "stay", "resort", "lodge", "room", "booking", "accommodation"])

    detected_dest = None
    for city in KNOWN_NEPALI_CITIES:
        if re.search(rf"\b{city}\b", msg_lower):
            detected_dest = city.capitalize()
            break

    if is_food:
        return {"intent": "food_search", "destination": detected_dest, "is_terminal": False, "steps_taken": steps + ["🍲 LangGraph Agent: Routing to Food Discovery Node"]}
    if is_hotel:
        return {"intent": "hotel_search", "destination": detected_dest, "is_terminal": False, "steps_taken": steps + ["🏨 LangGraph Agent: Routing to Hotel Search & Booking Node"]}

    return {
        "intent": "trip_plan" if detected_dest else "general_query",
        "destination": detected_dest,
        "is_terminal": False,
        "steps_taken": steps + ["🗺️ LangGraph Agent: Routing to Trip Planning & RAG Node"],
    }

# ==========================================
# 3. RBAC GATEKEEPER & HITL ACTION NODE
# ==========================================
def rbac_and_action_node(state: TourismAgentState) -> dict[str, Any]:
    intent = state.get("intent", "")
    roles = state.get("user_roles", [])
    last_msg = state["messages"][-1].content if state["messages"] else ""
    msg_lower = last_msg.lower()
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))

    # RBAC 1: Hotel Owner Permission Gate
    if intent == "owner_add_room":
        if "hotelOwner" not in roles and "admin" not in roles:
            steps.append("🚫 RBAC Gate: Traveler denied access to hotel room mutation")
            return {
                "is_terminal": True,
                "final_answer": """⚠️ **Access Restricted: Hotel Partner Permission Required**

You are currently signed in as a traveler. Adding hotel rooms requires an approved **Hotel Partner** account.

👉 You can register or upgrade your account as a verified Hotel Owner at `/partner/business-type`.""",
                "steps_taken": steps,
                "tools_used": tools + ["rbac_enforcer"],
            }
        
        # Parse room fields
        num_match = re.findall(r"\b\d+\b", msg_lower)
        room_num = num_match[0] if num_match else "101"
        price = int(num_match[1]) if len(num_match) > 1 else 2500
        
        action_payload = {
            "room_number": room_num,
            "room_type": "double",
            "price_per_night": price,
            "capacity": 2,
            "description": "Spacious room with modern amenities and scenic view",
        }
        steps.append("📝 Human-In-The-Loop: Prepared Hotel Room Action Card")
        return {
            "is_terminal": True,
            "action_proposal": {
                "action_type": "ADD_HOTEL_ROOM",
                "title": f"Add Hotel Room {room_num}",
                "description": f"Publish Room #{room_num} (Double, Capacity 2) at NPR {price:,}/night to your hotel catalog.",
                "payload": action_payload,
            },
            "final_answer": f"I have prepared the action proposal to list **Room #{room_num}** in your hotel dashboard. Please review the details on the action card below and click **Confirm & Add Room** to finalize.",
            "steps_taken": steps,
            "tools_used": tools + ["hitl_action_proposal"],
        }

    # RBAC 2: Restaurant Owner Permission Gate
    if intent == "owner_add_dish":
        if "restaurantOwner" not in roles and "admin" not in roles:
            steps.append("🚫 RBAC Gate: Traveler denied access to restaurant menu mutation")
            return {
                "is_terminal": True,
                "final_answer": """⚠️ **Access Restricted: Restaurant Partner Permission Required**

You are currently signed in as a traveler. Adding menu items requires an approved **Restaurant Partner** account.

👉 You can register or upgrade your business at `/partner/business-type`.""",
                "steps_taken": steps,
                "tools_used": tools + ["rbac_enforcer"],
            }

        num_match = re.findall(r"\b\d+\b", msg_lower)
        price = int(num_match[0]) if num_match else 350
        action_payload = {
            "name": "Special Local Dish",
            "price": price,
            "description": "Authentic local recipe made with fresh ingredients",
            "category": "Main Course",
        }
        steps.append("📝 Human-In-The-Loop: Prepared Restaurant Menu Action Card")
        return {
            "is_terminal": True,
            "action_proposal": {
                "action_type": "ADD_RESTAURANT_DISH",
                "title": "Add Menu Dish",
                "description": f"Add new dish priced at NPR {price:,} to your digital restaurant menu.",
                "payload": action_payload,
            },
            "final_answer": f"I have configured the action card to add this new dish at **NPR {price:,}** to your restaurant menu. Please review and confirm below.",
            "steps_taken": steps,
            "tools_used": tools + ["hitl_action_proposal"],
        }

    # Traveler: Log Expense
    if intent == "traveler_log_expense":
        num_match = re.findall(r"\b\d+\b", msg_lower)
        amount = int(num_match[0]) if num_match else 500
        action_payload = {
            "name": "Travel Expense",
            "amount": amount,
            "location": state.get("destination") or "Nepal",
            "type": "food" if any(f in msg_lower for f in ["food", "lunch", "dinner", "momo"]) else "transport",
        }
        steps.append("📝 Human-In-The-Loop: Prepared Travel Expense Card")
        return {
            "is_terminal": True,
            "action_proposal": {
                "action_type": "LOG_EXPENSE",
                "title": f"Log Expense: NPR {amount:,}",
                "description": f"Record spending of NPR {amount:,} in your Travel Expense Tracker.",
                "payload": action_payload,
            },
            "final_answer": f"I have prepared the expense entry of **NPR {amount:,}**. Click **Confirm & Log Expense** to record it in your personal travel spending tracker.",
            "steps_taken": steps,
            "tools_used": tools + ["hitl_action_proposal"],
        }

    return {"is_terminal": False}

# ==========================================
# 4. RAG RETRIEVAL & GROUNDING NODE
# ==========================================
async def rag_and_tools_node(state: TourismAgentState) -> dict[str, Any]:
    if state.get("is_terminal"):
        return {}

    intent = state.get("intent", "")
    dest = state.get("destination") or "Kathmandu"
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))
    recommendations = []
    map_cards = []

    if intent == "hotel_search":
        steps.append(f"🔍 PostgreSQL DB Tool: Querying hotels in {dest}")
        tools.append("database_hotel_search")
        db_hotels = await search_hotels(dest)
        if db_hotels:
            for h in db_hotels[:4]:
                recommendations.append({
                    "name": h.name,
                    "type": "hotel",
                    "description": h.description or f"Verified accommodation in {h.district or dest}.",
                    "price": f"NPR {getattr(h, 'min_price', 2500):,}/night",
                    "rating": 4.8,
                    "location": f"{h.district or dest}, Nepal",
                    "action_url": f"/hotels/{h.id}",
                })
        else:
            steps.append(f"🌐 Web Search Tool: Finding verified stays in {dest}")
            tools.append("web_search_grounding")
            web_res = await WebSearchService.search_web(f"best verified hotels stays in {dest} Nepal prices NPR")
            map_url = GoogleMapsService.get_place_search_url(f"Hotels in {dest} Nepal")
            map_cards.append({
                "title": f"Hotels in {dest}",
                "location": dest,
                "map_url": map_url,
                "description": f"Live Google Maps directions to accommodations in {dest}",
            })

    elif intent == "food_search":
        steps.append(f"🍜 PostgreSQL DB Tool: Querying authentic dining in {dest}")
        tools.append("database_restaurant_search")
        db_rests = await search_restaurants(dest)
        if db_rests:
            for r in db_rests[:4]:
                recommendations.append({
                    "name": r.name,
                    "type": "restaurant",
                    "description": r.description or f"Popular dining for authentic local cuisine in {dest}.",
                    "price": "NPR 300 - 1,200",
                    "rating": 4.7,
                    "location": f"{r.location or dest}, Nepal",
                    "action_url": f"/restaurants/{r.id}",
                })
        map_cards.append({
            "title": f"Dining & Eateries in {dest}",
            "location": dest,
            "map_url": GoogleMapsService.get_place_search_url(f"Popular restaurants and food in {dest} Nepal"),
            "description": f"Find authentic Thakali, Sekuwa, and local dining spots in {dest}",
        })

    return {
        "recommendations": recommendations,
        "map_cards": map_cards,
        "steps_taken": steps,
        "tools_used": tools,
    }

# ==========================================
# 5. RESPONSE SYNTHESIS NODE
# ==========================================
async def response_synthesis_node(state: TourismAgentState) -> dict[str, Any]:
    if state.get("is_terminal") and state.get("final_answer"):
        return {}

    intent = state.get("intent", "")
    dest = state.get("destination") or "Nepal"
    last_msg = state["messages"][-1].content if state["messages"] else ""
    recs = state.get("recommendations", [])
    steps = list(state.get("steps_taken", []))
    tools = list(state.get("tools_used", []))

    steps.append("✨ Gemini 2.0 Flash: Synthesizing verified response and itinerary")
    tools.append("gemini_synthesis")

    prompt = f"""You are the TravelNepal AI Assistant.
User Query: "{last_msg}"
Detected Intent: {intent}
Destination: {dest}
Database Recommendations: {json.dumps(recs)}

Provide a warm, detailed, accurate markdown response with practical travel insights, transparent NPR pricing, and direct recommendation highlights.
"""
    try:
        gemini = GeminiService()
        generated = await gemini.generate(prompt, system_instruction=CHAT_SYSTEM)
        final_text = generated or f"Here are the top travel recommendations for **{dest}**, Nepal."
    except Exception as e:
        final_text = f"Here are your verified recommendations for **{dest}**, Nepal. You can explore stays and bookings directly through the platform."

    return {
        "final_answer": final_text,
        "steps_taken": steps,
        "tools_used": tools,
        "is_terminal": True,
    }

# ==========================================
# 6. LANGGRAPH COMPILATION
# ==========================================
workflow = StateGraph(TourismAgentState)

workflow.add_node("classifier", guardrail_and_classifier_node)
workflow.add_node("rbac_and_action", rbac_and_action_node)
workflow.add_node("retrieval_and_tools", rag_and_tools_node)
workflow.add_node("synthesis", response_synthesis_node)

workflow.add_edge(START, "classifier")

def route_after_classifier(state: TourismAgentState) -> str:
    if state.get("is_terminal"):
        return END
    intent = state.get("intent", "")
    if intent in ["owner_add_room", "owner_add_dish", "traveler_log_expense"]:
        return "rbac_and_action"
    return "retrieval_and_tools"

def route_after_rbac(state: TourismAgentState) -> str:
    if state.get("is_terminal"):
        return END
    return "retrieval_and_tools"

workflow.add_conditional_edges("classifier", route_after_classifier)
workflow.add_conditional_edges("rbac_and_action", route_after_rbac)
workflow.add_edge("retrieval_and_tools", "synthesis")
workflow.add_edge("synthesis", END)

checkpointer = MemorySaver()
travel_agent_app = workflow.compile(checkpointer=checkpointer)
