import json
import re
from typing import Any
from app.ai.gemini import GeminiService
from app.core.config import settings
from app.schemas.ai import ActionProposal, ChatResponse

ACTION_SYSTEM_PROMPT = """
You are an intelligent Human-In-The-Loop (HITL) Action & Form Assistant for a Nepal Tourism platform.
Your goal is to parse conversational user commands and extract structured form parameters to perform actions on their behalf.

Supported Actions:
1. "LOG_EXPENSE"
   Required fields:
   - name: string (e.g. "Lakeside Dinner", "Pokhara Taxi")
   - amount: number in NPR (positive integer)
   - location: string (e.g. "Pokhara", "Kathmandu", "Chitwan")
   - type: string (one of "food", "accommodation", "transport", "activity", "other")

2. "ADD_HOTEL_ROOM"
   Required fields:
   - room_number: string (e.g. "101", "204")
   - room_type: string (one of "single", "double", "twin", "family", "suite")
   - price_per_night: number in NPR (positive number)
   - capacity: number of guests (default 2 if not stated)
   - description: string

3. "ADD_RESTAURANT_DISH"
   Required fields:
   - name: string (e.g. "Butter Chicken", "Thakali Set", "Veg Momo")
   - price: number in NPR (positive integer)
   - description: string (e.g. "Freshly cooked local spices")
   - category: string (optional, e.g. "Main Course", "Snacks", "Drinks", "Dessert")

4. "PLAN_ITINERARY"
   Required fields:
   - destination: string (e.g. "Pokhara", "Kathmandu", "Mustang")
   - days: integer (number of days, e.g. 3, 5)
   - budget: number in NPR (optional, e.g. 20000)
   - travel_style: string (e.g. "budget", "balanced", "luxury", "adventure")

5. "CREATE_BOOKING"
   Required fields:
   - entity_type: string ("hotel", "room", "restaurant", "guide", "place")
   - entity_name: string (name of the hotel/dish/guide)
   - location: string
   - total_cost: number in NPR
   - notes: string

Analyze the user's message and conversation history.
Determine if the user intends to perform one of the supported actions.

Respond ONLY with a valid JSON object matching this schema:
{
  "is_action": true/false,
  "action_type": "LOG_EXPENSE" | "ADD_HOTEL_ROOM" | "ADD_RESTAURANT_DISH" | "PLAN_ITINERARY" | "CREATE_BOOKING" | null,
  "is_complete": true/false,
  "missing_fields": ["field_name", ...],
  "extracted_payload": { ... },
  "clarification_question": "string asking for missing info if is_complete is false",
  "proposal_title": "string title for action proposal",
  "proposal_summary": "string human-readable summary"
}
"""

def extract_numbers(text: str) -> list[int]:
    matches = re.findall(r"\b\d+\b", text)
    return [int(m) for m in matches]

def heuristic_action_parse(msg: str, user_roles: list[str], history: list[Any] = []) -> dict[str, Any] | None:
    msg_lower = msg.lower().strip()
    numbers = extract_numbers(msg)
    
    # 0. Check Multi-turn Slot-Filling (If user is responding to previous clarification question)
    last_assistant_msg = ""
    if history:
        for prev in reversed(history):
            role = getattr(prev, "role", None) or (prev.get("role") if isinstance(prev, dict) else "")
            if role in ["assistant", "model"]:
                last_assistant_msg = getattr(prev, "content", None) or getattr(prev, "text", None) or (prev.get("text", "") if isinstance(prev, dict) else "") or (prev.get("content", "") if isinstance(prev, dict) else "")
                break

    last_assistant_lower = str(last_assistant_msg).lower()

    # Slot Fill A: Response to Hotel Room Price Question
    if "price per night" in last_assistant_lower or "price (in npr) for this room" in last_assistant_lower:
        if "hotelOwner" not in user_roles and "admin" not in user_roles:
            return {
                "is_action": True,
                "action_type": "ACCESS_DENIED",
                "is_complete": False,
                "clarification_question": "⚠️ Access Restricted: You must be an approved Hotel Owner to add hotel rooms to the platform. You can register your hotel at /partner/business-type.",
            }
        price = numbers[0] if numbers else 1500
        return {
            "is_action": True,
            "action_type": "ADD_HOTEL_ROOM",
            "is_complete": True,
            "missing_fields": [],
            "extracted_payload": {
                "room_number": "101",
                "room_type": "single",
                "price_per_night": price,
                "capacity": 2,
                "description": "Comfortable room with modern amenities.",
            },
            "proposal_title": "Add Hotel Room",
            "proposal_summary": f"Add Single Room #101 at NPR {price:,}/night to your room inventory.",
        }

    # Slot Fill B: Response to Dish Price Question
    if "price in npr for" in last_assistant_lower or "price for this dish" in last_assistant_lower:
        if "restaurantOwner" not in user_roles and "admin" not in user_roles:
            return {
                "is_action": True,
                "action_type": "ACCESS_DENIED",
                "is_complete": False,
                "clarification_question": "⚠️ Access Restricted: You must be an approved Restaurant Owner to add menu items to the platform.",
            }
        price = numbers[0] if numbers else 250
        return {
            "is_action": True,
            "action_type": "ADD_RESTAURANT_DISH",
            "is_complete": True,
            "missing_fields": [],
            "extracted_payload": {
                "name": "Special Dish",
                "price": price,
                "description": "Freshly prepared authentic local dish.",
                "category": "Main Course",
            },
            "proposal_title": "Add Restaurant Menu Item",
            "proposal_summary": f"Add Special Dish to menu for NPR {price:,}.",
        }

    # Slot Fill C: Response to Expense Amount Question
    if "expense amount in npr" in last_assistant_lower or "how much was the expense" in last_assistant_lower:
        amount = numbers[0] if numbers else 500
        return {
            "is_action": True,
            "action_type": "LOG_EXPENSE",
            "is_complete": True,
            "missing_fields": [],
            "extracted_payload": {
                "name": "Trip Expense",
                "amount": amount,
                "location": "Nepal",
                "type": "food",
            },
            "proposal_title": "Record Travel Expense",
            "proposal_summary": f"Log Trip Expense of NPR {amount:,} in Nepal.",
        }

    # 1. Log Expense Intent (All users)
    if any(k in msg_lower for k in ["expense", "spent", "spend", "cost me", "paid", "log expense", "add expense", "track expense"]):
        amount = numbers[0] if numbers else None
        
        # Location detection
        location = "Kathmandu"
        for loc in ["pokhara", "kathmandu", "chitwan", "lumbini", "bhaktapur", "patan", "namche", "nagarkot", "mustang", "itahari", "dharan", "butwal"]:
            if loc in msg_lower:
                location = loc.capitalize()
                break
                
        # Type detection
        exp_type = "other"
        if any(w in msg_lower for w in ["food", "dinner", "lunch", "breakfast", "momo", "thali", "eat", "cafe", "restaurant"]):
            exp_type = "food"
        elif any(w in msg_lower for w in ["hotel", "room", "stay", "resort", "lodge"]):
            exp_type = "accommodation"
        elif any(w in msg_lower for w in ["taxi", "cab", "bus", "flight", "plane", "ride", "transport"]):
            exp_type = "transport"
        elif any(w in msg_lower for w in ["trek", "tour", "ticket", "guide", "entry", "rafting", "activity"]):
            exp_type = "activity"

        name_match = re.sub(r"(log|add|track|record)\s+(an\s+|the\s+)?expense\s+(for|of)?", "", msg, flags=re.IGNORECASE).strip()
        name = name_match if len(name_match) > 2 else "Trip Expense"

        is_complete = amount is not None and amount > 0
        missing = [] if is_complete else ["amount"]

        return {
            "is_action": True,
            "action_type": "LOG_EXPENSE",
            "is_complete": is_complete,
            "missing_fields": missing,
            "extracted_payload": {
                "name": name,
                "amount": amount or 0,
                "location": location,
                "type": exp_type,
            },
            "clarification_question": "How much was the expense amount in NPR?" if not is_complete else "",
            "proposal_title": "Record Travel Expense",
            "proposal_summary": f"Log {name} of NPR {amount or 0:,} in {location} ({exp_type}).",
        }

    # 2. Add Room Intent (RBAC: Hotel Owners & Super Admins)
    if any(k in msg_lower for k in ["add room", "create room", "new room", "add a room", "list room"]):
        if "hotelOwner" not in user_roles and "admin" not in user_roles:
            return {
                "is_action": True,
                "action_type": "ACCESS_DENIED",
                "is_complete": False,
                "clarification_question": "⚠️ Access Restricted: You must be an approved Hotel Owner to add hotel rooms to the platform. You can register your hotel at /partner/business-type.",
            }

        room_num = str(numbers[0]) if numbers else "101"
        price = numbers[1] if len(numbers) > 1 else (numbers[0] if numbers and numbers[0] > 500 else None)
        
        room_type = "single"
        for t in ["suite", "family", "twin", "double", "single"]:
            if t in msg_lower:
                room_type = t
                break
                
        is_complete = price is not None and price > 0
        return {
            "is_action": True,
            "action_type": "ADD_HOTEL_ROOM",
            "is_complete": is_complete,
            "missing_fields": [] if is_complete else ["price_per_night"],
            "extracted_payload": {
                "room_number": room_num,
                "room_type": room_type,
                "price_per_night": price or 0,
                "capacity": 2 if room_type in ["double", "twin"] else (4 if room_type == "family" else 1),
                "description": f"Comfortable {room_type} room with modern amenities.",
            },
            "clarification_question": "What is the price per night (in NPR) for this room?" if not is_complete else "",
            "proposal_title": "Add Hotel Room",
            "proposal_summary": f"Add {room_type.capitalize()} Room #{room_num} at NPR {price or 0:,}/night.",
        }

    # 3. Add Dish Intent (RBAC: Restaurant Owners & Super Admins)
    if any(k in msg_lower for k in ["add dish", "add food", "add menu", "new dish", "add item", "menu item"]):
        if "restaurantOwner" not in user_roles and "admin" not in user_roles:
            return {
                "is_action": True,
                "action_type": "ACCESS_DENIED",
                "is_complete": False,
                "clarification_question": "⚠️ Access Restricted: You must be an approved Restaurant Owner to add menu dishes to the platform.",
            }

        price = numbers[0] if numbers else None
        dish_name = re.sub(r"(add|create|new)\s+(dish|food|menu item|item)\s*(called|named)?", "", msg, flags=re.IGNORECASE).strip()
        dish_name = re.sub(r"\b(for|price|npr|rs|\d+)\b.*", "", dish_name, flags=re.IGNORECASE).strip() or "Special Dish"

        is_complete = price is not None and price > 0
        return {
            "is_action": True,
            "action_type": "ADD_RESTAURANT_DISH",
            "is_complete": is_complete,
            "missing_fields": [] if is_complete else ["price"],
            "extracted_payload": {
                "name": dish_name,
                "price": price or 0,
                "description": f"Freshly prepared {dish_name} with authentic spices.",
                "category": "Main Course",
            },
            "clarification_question": f"What is the price in NPR for {dish_name}?" if not is_complete else "",
            "proposal_title": "Add Restaurant Menu Item",
            "proposal_summary": f"Add {dish_name} to menu for NPR {price or 0:,}.",
        }

    return None

async def process_action_request(msg: str, user_roles: list[str], history: list[dict] = []) -> dict[str, Any] | None:
    # 1. Try Gemini LLM parser if API key is available
    service = GeminiService()
    if service.client:
        try:
            prompt = f"{ACTION_SYSTEM_PROMPT}\nUser Roles: {user_roles}\nConversation History: {history}\nUser Message: {msg}"
            response = await service.client.aio.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
            )
            raw_text = response.text or ""
            # Extract JSON block
            json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group(0))
                if parsed.get("is_action"):
                    return parsed
        except Exception as err:
            print("Gemini Action Parser Error:", err)

    # 2. Heuristic rule-based fallback
    return heuristic_action_parse(msg, user_roles, history)
