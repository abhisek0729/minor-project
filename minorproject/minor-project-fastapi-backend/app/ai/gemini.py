from google import genai
from google.genai import types
from app.core.config import settings

class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.gemini_api_key) if settings.gemini_api_key else None

    async def generate(self, prompt: str, system_instruction: str | None = None) -> str:
        if not self.client:
            return "Namaste! TravelNepal AI is here to help you discover destinations, hotels, guides, and dining across Nepal."
        
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
        ) if system_instruction else types.GenerateContentConfig(temperature=0.7)

        try:
            response = await self.client.aio.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
                config=config,
            )
            return response.text or ""
        except Exception as e:
            print(f"[GeminiService] Generation Notice ({settings.gemini_model}):", e)
            return (
                "Namaste! 🙏 Here are the curated Nepal travel recommendations from our verified database.\n\n"
                "You can explore real-time verified hotels, authentic dining eateries, certified mountain guides, and trekking packages below."
            )

    async def generate_json(self, prompt: str, schema: dict):
        if not self.client:
            return "{}"
        try:
            response = await self.client.aio.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_json_schema=schema,
                    temperature=0.2,
                ),
            )
            return response.text
        except Exception as e:
            print(f"[GeminiService] JSON Generation Notice ({settings.gemini_model}):", e)
            return "{}"

