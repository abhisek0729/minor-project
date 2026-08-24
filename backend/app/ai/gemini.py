from google import genai
from google.genai import types
from app.core.config import settings

FALLBACK_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemma-4-26b-a4b-it",
]

import asyncio

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
                response = await asyncio.wait_for(
                    self.client.aio.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=config,
                    ),
                    timeout=2.5
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                err_str = str(e)
                print(f"[GeminiService] Model '{model_name}' Notice:", err_str[:120])
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    # If project quota is exhausted, stop immediate retry chain to keep response instantaneous
                    break
                continue

        return ""

    async def generate_json(self, prompt: str, schema: dict) -> str:
        if not self.client:
            return "{}"
        
        for model_name in list(dict.fromkeys(FALLBACK_MODELS)):
            try:
                response = await asyncio.wait_for(
                    self.client.aio.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            response_json_schema=schema,
                            temperature=0.2,
                        ),
                    ),
                    timeout=2.5
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                err_str = str(e)
                print(f"[GeminiService] JSON Model '{model_name}' Notice:", err_str[:120])
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    break
                continue

        return "{}"

