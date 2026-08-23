from google import genai
from google.genai import types
from app.core.config import settings

FALLBACK_MODELS = [
    settings.gemini_model,
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-2.5-flash",
]

class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.gemini_api_key) if settings.gemini_api_key else None

    async def generate(self, prompt: str, system_instruction: str | None = None) -> str:
        if not self.client:
            return ""
        
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
        ) if system_instruction else types.GenerateContentConfig(temperature=0.7)

        # Try models in sequence
        for model_name in list(dict.fromkeys(FALLBACK_MODELS)):
            try:
                response = await self.client.aio.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config,
                )
                if response.text:
                    return response.text
            except Exception as e:
                print(f"[GeminiService] Model '{model_name}' Notice:", e)
                continue

        return ""

    async def generate_json(self, prompt: str, schema: dict) -> str:
        if not self.client:
            return "{}"
        
        for model_name in list(dict.fromkeys(FALLBACK_MODELS)):
            try:
                response = await self.client.aio.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_json_schema=schema,
                        temperature=0.2,
                    ),
                )
                if response.text:
                    return response.text
            except Exception as e:
                print(f"[GeminiService] JSON Model '{model_name}' Notice:", e)
                continue

        return "{}"

