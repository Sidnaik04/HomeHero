import google.generativeai as genai
from app.core.config import settings
import json
from typing import Dict, Any, List
import logging
import re
import time
import traceback

logger = logging.getLogger(__name__)

GEMINI_API_KEY = getattr(settings, "GEMINI_API_KEY", None)
if not GEMINI_API_KEY:
    logger.warning(
        "GEMINI_API_KEY is not configured in settings (read from .env). Gemini calls will fail until configured."
    )

try:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")
except Exception:
    logger.exception("Failed to configure Gemini model. AI features will degrade.")
    model = None


class GeminiService:

    @staticmethod
    def create_system_prompt(providers_context: str = "") -> str:
        return f"""You are HomeHero AI Assistant, helping users find and book local service providers in Goa, India.

AVAILABLE SERVICES:
- plumber
- electrician
- carpenter
- cleaner
- painter
- appliance_repair
- pest_control
- gardening

LOCATIONS IN GOA:
- Panaji (403001)
- Margao (403601)
- Calangute (403516)
- Mapusa (403507)
- Vasco da Gama (403802)
- Baga (403516)

YOUR CAPABILITIES:
1. Help users find service providers
2. Extract: service_type, location, budget, urgency
3. Suggest providers based on ratings and availability
4. Guide booking process

PROVIDER DATABASE CONTEXT:
{providers_context}

RESPONSE FORMAT:
You MUST respond in valid JSON format:
{{
    "intent": "search_provider" | "book_service" | "general_query" | "greeting",
    "extracted_data": {{
        "service_type": "plumber" | "electrician" | etc,
        "location": "location_name",
        "budget": number,
        "urgency": "urgent" | "flexible"
    }},
    "message": "Your friendly response to user",
    "suggested_providers": ["provider_id1", "provider_id2"],
    "next_action": "show_providers" | "confirm_booking" | "ask_details"
}}

RULES:
- NEVER hallucinate provider names or details
- Only suggest providers from the database context
- If no providers match, politely suggest alternatives
- Be concise, friendly, and helpful
- Always respond in JSON format
- Use Indian Rupees (₹) for pricing
"""

    @staticmethod
    def extract_intent_and_data(
        user_message: str, providers_data: List[Dict]
    ) -> Dict[str, Any]:
        try:
            provider_context = ""
            if providers_data:
                provider_context = "AVAILABLE PROVIDERS:\n"
                for p in providers_data[:10]:
                    provider_context += f"- {p.get('name', 'N/A')} | Services: {', '.join(p.get('services', []))} | Location: {p.get('location', 'N/A')} | Rating: {p.get('rating', 0)} | Price: ₹{p.get('pricing', 0)}\n"

            # create prompt
            system_prompt = GeminiService.create_system_prompt(provider_context)

            full_prompt = f"""{system_prompt}
            USER MESSAGE: "{user_message}"
            Analyze the user's message and respond in JSON format."""

            # call Gemini API (with a couple of retries)
            response_text = ""
            if model is None:
                raise RuntimeError("Gemini model is not configured")

            max_retries = 2
            for attempt in range(max_retries + 1):
                try:
                    response = model.generate_content(full_prompt)
                    response_text = getattr(response, "text", "") or ""
                    response_text = response_text.strip()
                    break
                except Exception as inner_e:
                    logger.warning(
                        f"Gemini generate attempt {attempt+1} failed: {inner_e}"
                    )
                    if attempt < max_retries:
                        time.sleep(0.5 * (attempt + 1))
                        continue
                    # re-raise to be caught by outer exception handler
                    raise

            # Parse JSON response
            # Remove Markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]

            response_text = response_text.strip()

            # Try to parse JSON robustly. If the model wraps JSON in text or markdown,
            # try to extract the first JSON object found.
            try:
                parsed_response = json.loads(response_text)
            except json.JSONDecodeError:
                # attempt to extract JSON blob with regex
                m = re.search(r"\{.*\}", response_text, re.S)
                if m:
                    try:
                        parsed_response = json.loads(m.group(0))
                    except json.JSONDecodeError:
                        logger.error("Failed to parse JSON from regex-extracted blob")
                        logger.error(f"Response text: {response_text}")
                        raise
                else:
                    logger.error("No JSON object found in model response")
                    logger.error(f"Response text: {response_text}")
                    raise

            return {"success": True, "data": parsed_response}

        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e}")
            logger.error(f"Response text: {response_text}")
            return {
                "success": False,
                "error": "Failed to parse AI response",
                "fallback": {
                    "intent": "general_query",
                    "message": "I'm here to help you find service providers. Could you tell me what service you need?",
                    "next_action": "ask_details",
                },
            }

        except Exception as e:
            # Log full traceback to help debugging remote API failures
            logger.error("Gemini API error: %s", e)
            logger.error(traceback.format_exc())

            # If model is not configured, provide a clear fallback message
            if model is None:
                fallback_message = "AI assistant is not configured. Please set GEMINI_API_KEY to enable AI features."
            else:
                fallback_message = (
                    "I'm having trouble processing that. Could you rephrase?"
                )

            return {
                "success": False,
                "error": str(e),
                "fallback": {
                    "intent": "general_query",
                    "message": fallback_message,
                    "next_action": "ask_details",
                },
            }

    @staticmethod
    def generate_chat_response(
        user_message: str,
        conversation_history: List[Dict],
        providers_data: List[Dict] = None,
    ) -> Dict[str, Any]:
        try:
            conversation_context = "\n".join(
                [
                    f"{msg['sender'].upper()}: {msg['message']}"
                    for msg in conversation_history[-5:]  # last 5 messages
                ]
            )

            provider_context = ""
            if providers_data:
                provider_context = "MATCHING PROVIDERS:\n"
                for p in providers_data[:5]:
                    provider_context += f"- {p.get('name', 'N/A')} | {', '.join(p.get('services', []))} | {p.get('location', 'N/A')} | ⭐{p.get('rating', 0)} | ₹{p.get('pricing', 0)}\n"

            prompt = f"""You are HomeHero AI Assistant.

            CONVERSATION HISTORY:
            {conversation_context}
            {provider_context}
            USER: {user_message}
            Respond naturally and helpfully. If providers are available, mention them. Guide user to book if appropriate."""

            response = model.generate_content(prompt)

            return {"success": True, "message": response.text.strip()}

        except Exception as e:
            logger.error(f"Chat response error: {e}")
            return {
                "success": False,
                "message": "I'm here to help! What service do you need?",
            }
