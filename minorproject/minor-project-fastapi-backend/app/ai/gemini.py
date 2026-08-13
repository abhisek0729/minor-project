from google import genai
from app.core.config import settings

class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.gemini_api_key) if settings.gemini_api_key else None

    async def generate_json(self, prompt: str, schema: dict):
        if not self.client:
            raise RuntimeError("GEMINI_API_KEY is not configured")
        response = await self.client.aio.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_json_schema": schema,
                "temperature": 0.2,
            },
        )
        return response.text
