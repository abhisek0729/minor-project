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

def heuristic_action_parse(msg: str, user_roles: list[str]) -> dict[str, Any] | None:
    msg_lower = msg.lower()
    
    # 1. Log Expense Intent
    if any(k in msg_lower for k in ["expense", "spent", "spend", "cost me", "paid", "log expense", "add expense", "track expense"]):
        numbers = extract_numbers(msg)
        amount = numbers[0] if numbers else None
        
        # Location detection
        location = "Kathmandu"
        for loc in ["pokhara", "kathmandu", "chitwan", "lumbini", "bhaktapur", "patan", "namche", "nagarkot", "mustang", "itahari", "dharan"]:
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

        name_match = re.sub(r"(log|add|track|record)\s+(an\s+)?expense\s+(for|of)?", "", msg, flags=re.IGNORECASE).strip()
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

    # 2. Add Room Intent (Hotel Owners)
    if any(k in msg_lower for k in ["add room", "create room", "new room", "add a room", "room 1", "room 2", "room 3"]):
        numbers = extract_numbers(msg)
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

    # 3. Add Dish Intent (Restaurant Owners)
    if any(k in msg_lower for k in ["add dish", "add food", "add menu", "new dish", "add item", "menu item"]):
        numbers = extract_numbers(msg)
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
    return heuristic_action_parse(msg, user_roles)
