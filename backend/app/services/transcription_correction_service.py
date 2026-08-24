import logging
import re
from typing import Any
from app.ai.gemini import GeminiService

logger = logging.getLogger("travelnepal.transcription_correction")
logging.basicConfig(level=logging.INFO)

CORRECTION_SYSTEM_PROMPT = """You are a context-aware text correction layer for a Nepal tourism AI agent.

Your task is to correct spelling mistakes and Speech-to-Text (STT) transcription errors in the user's query before it reaches the tourism agent.

IMPORTANT RULES:
1. Correct only genuine or highly probable errors.
2. Do not perform word-by-word correction without considering context.
3. Analyze the entire sentence before making corrections.
4. Use the words immediately before and after an uncertain word to determine its intended meaning.
5. Consider the overall user intent.
6. Recognize Nepalese tourism destinations, attractions, cities, districts, hotels, activities, transportation terms, and other tourism entities (e.g. Kathmandu, Pokhara, Chitwan, Lumbini, Mustang, Jomsom, Muktinath, Annapurna, Everest, Sagarmatha, Nagarkot, Bandipur, Ghandruk, Poon Hill, Rara, Ilam, Janakpur, Dharan, Sauraha, Tilicho, Shey Phoksundo, Biratnagar, Itahari, Birtamod, Butwal, Bhairahawa, Phewa Lake, Sarangkot, Davis Fall, Thamel, Peace Pagoda).
7. Correct common STT errors involving tourism-related names and numbers (e.g. "Pokhra" -> "Pokhara", "tree days" -> "three days", "Muktinathh" -> "Muktinath", "itenary" -> "itinerary", "hotel barahi in pokhra" -> "Hotel Barahi in Pokhara").
8. Preserve numbers, dates, prices, durations, names, and other factual information supplied by the user.
9. Preserve the user's original intent.
10. Do not add information that is not present in the user's query.
11. Do not rewrite the query unnecessarily.
12. Do not change a word merely because another word looks more probable.
13. If a word is ambiguous and there is insufficient context to determine the intended word, leave it unchanged.
14. Support English, Nepali (Devanagari), and Nepali-English code-mixed queries (e.g. "malai pokhra jana man xa" -> "Malai Pokhara jana man xa").
15. Return ONLY the corrected query string, with no quotes, no markdown explanations, and no surrounding text.

Example 1:
Input: "I want to visit Pokhra for tree days"
Output: I want to visit Pokhara for three days

Example 2:
Input: "malai pokhra jana man xa"
Output: Malai Pokhara jana man xa

Example 3:
Input: "I want to go to Muktinathh temple"
Output: I want to go to Muktinath Temple

Example 4:
Input: "give me a 3 day itenary for kathmandu"
Output: Give me a 3-day itinerary for Kathmandu

Example 5:
Input: "I want to visit rara lake in 5 days"
Output: I want to visit Rara Lake in 5 days

If the input is already correct, return it unchanged."""

class TranscriptionCorrectionService:
    def __init__(self):
        self.gemini = GeminiService()

    async def correct_transcription(self, raw_text: str, context: dict[str, Any] | None = None) -> tuple[str, bool]:
        """
        Takes raw user query or STT transcription, applies context-aware correction,
        and returns (corrected_text, is_modified).
        
        Guaranteed to fallback to raw_text on any error or timeout.
        """
        if not raw_text or not raw_text.strip():
            return "", False

        cleaned_raw = raw_text.strip()

        # Fast-path bypass for empty, punctuation-only, or ultra-short non-words
        if not re.search(r"\w", cleaned_raw) or len(cleaned_raw) <= 1:
            return cleaned_raw, False

        import asyncio

        # Fast-path bypass for ultra-short simple greetings and capability questions to minimize latency
        lower_raw = cleaned_raw.lower()
        if len(cleaned_raw.split()) <= 2 and lower_raw in [
            "hi", "hello", "hey", "namaste", "good morning", "good evening", "help", "thanks", "thank you"
        ]:
            return cleaned_raw, False

        if any(p in lower_raw for p in [
            "what are your capabilities", "your capabilities", "what can you do", "who are you", "features"
        ]):
            return cleaned_raw, False

        # Build prompt for LLM
        prompt = f"""Input:
"{cleaned_raw}"

Return only the corrected text:"""

        try:
            corrected = await asyncio.wait_for(
                self.gemini.generate(prompt, system_instruction=CORRECTION_SYSTEM_PROMPT),
                timeout=2.5
            )
            if not corrected or not corrected.strip():
                logger.info(f"[TranscriptionCorrection] Raw transcription: \"{cleaned_raw}\" (Preserved unchanged, empty LLM response)")
                return cleaned_raw, False

            # Clean output formatting
            corrected_text = corrected.strip()
            # Remove any wrapping quotes if returned by model
            if (corrected_text.startswith('"') and corrected_text.endswith('"')) or (
                corrected_text.startswith("'") and corrected_text.endswith("'")
            ):
                corrected_text = corrected_text[1:-1].strip()

            # Strip any accidental prefix like "Output: "
            if corrected_text.lower().startswith("output:"):
                corrected_text = corrected_text[7:].strip()

            is_modified = corrected_text.lower() != cleaned_raw.lower()

            logger.info(
                f"[TranscriptionCorrection]\n"
                f"Raw transcription:       \"{cleaned_raw}\"\n"
                f"Corrected transcription: \"{corrected_text}\"\n"
                f"Modified: {is_modified}"
            )

            return corrected_text, is_modified

        except Exception as e:
            logger.warning(f"[TranscriptionCorrection Error/Timeout]: {e}. Falling back to raw transcription.")
            return cleaned_raw, False

# Global singleton
transcription_corrector = TranscriptionCorrectionService()

async def correct_transcription(raw_text: str, context: dict[str, Any] | None = None) -> tuple[str, bool]:
    """Convenience functional interface for transcription correction."""
    return await transcription_corrector.correct_transcription(raw_text, context)
