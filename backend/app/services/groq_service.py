import json
import os
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from pydantic import BaseModel
from app.core.config import settings
from app.core.logging import logger

class GroqServiceError(Exception):
    pass

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
    reraise=True,
)
async def _call_groq(prompt: str, system_prompt: str = "You are a helpful AI assistant.", max_tokens: int = 1024, response_format: dict | None = None) -> dict:
    api_key = settings.GROQ_API_KEY
    if not api_key:
        logger.warning("GROQ_API_KEY is not set. Returning fallback mock response.")
        raise GroqServiceError("GROQ_API_KEY is missing")

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": max_tokens,
        "temperature": 0.1,
    }
    
    if response_format:
        payload["response_format"] = response_format

    async with httpx.AsyncClient(timeout=settings.AI_HTTP_TIMEOUT_SECONDS) as client:
        response = await client.post(url, headers=headers, json=payload)
        
        if response.status_code != 200:
            logger.error("Groq API error: %s - %s", response.status_code, response.text)
            response.raise_for_status()
            
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        
        if response_format and response_format.get("type") == "json_object":
            try:
                return json.loads(content)
            except json.JSONDecodeError as e:
                logger.error("Failed to parse Groq JSON output: %s", content)
                raise GroqServiceError("Invalid JSON from Groq") from e
                
        return {"content": content}

async def analyze_with_groq(prompt: str, schema_class: type[BaseModel]) -> BaseModel:
    """
    Calls Groq and validates the output against a Pydantic schema.
    """
    system_prompt = f"""You are SentinelX, an Autonomous Enterprise Incident Resolution Engine.
You must analyze the provided telemetry, logs, and RAG knowledge.
Output ONLY valid JSON matching this schema:
{schema_class.model_json_schema()}
"""
    
    # We use response_format={"type": "json_object"} to enforce JSON mode if supported,
    # but the system prompt is strictly necessary.
    result = await _call_groq(
        prompt=prompt,
        system_prompt=system_prompt,
        max_tokens=2048,
        response_format={"type": "json_object"}
    )
    
    return schema_class.model_validate(result)
