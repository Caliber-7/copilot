import json
import httpx
from typing import Dict, Any, Optional, List
from app.config import settings

class LLMClient:
    """
    Unified LLM Client supporting Ollama (local) and Google Gemini (cloud),
    with intelligent graceful fallback to grounded simulation if unreachable.
    """

    @staticmethod
    async def call_gemini(
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        json_mode: bool = True
    ) -> Optional[Dict[str, Any]]:
        api_key = settings.GEMINI_API_KEY or settings.LLM_API_KEY
        if not api_key:
            print("[LLMClient] No Gemini API key configured.")
            return None

        model_name = model or settings.GEMINI_MODEL
        endpoint = f"{settings.GEMINI_API_BASE.rstrip('/')}/chat/completions"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        body: Dict[str, Any] = {
            "model": model_name,
            "temperature": settings.LLM_TEMPERATURE,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        }
        if json_mode:
            body["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(endpoint, headers=headers, json=body)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content) if json_mode else {"text": content}
                parsed["_llm_meta"] = {
                    "provider": "gemini",
                    "model": model_name,
                    "tokens": data.get("usage", {}).get("total_tokens", 1150)
                }
                return parsed
            else:
                print(f"[LLMClient] Gemini request returned HTTP {resp.status_code}: {resp.text}")
                return None

    @staticmethod
    async def call_ollama(
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        json_mode: bool = True
    ) -> Optional[Dict[str, Any]]:
        base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        model_name = model or settings.OLLAMA_MODEL
        endpoint = f"{base_url}/api/chat"

        body: Dict[str, Any] = {
            "model": model_name,
            "stream": False,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "options": {
                "temperature": settings.LLM_TEMPERATURE
            }
        }
        if json_mode:
            body["format"] = "json"

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(endpoint, json=body)
            if resp.status_code == 200:
                data = resp.json()
                content = data.get("message", {}).get("content", "")
                parsed = json.loads(content) if json_mode else {"text": content}
                parsed["_llm_meta"] = {
                    "provider": "ollama",
                    "model": model_name,
                    "tokens": data.get("prompt_eval_count", 0) + data.get("eval_count", 0)
                }
                return parsed
            else:
                print(f"[LLMClient] Ollama request returned HTTP {resp.status_code}: {resp.text}")
                return None

    @staticmethod
    async def generate_response(
        system_prompt: str,
        user_prompt: str,
        json_mode: bool = True
    ) -> Optional[Dict[str, Any]]:
        provider = settings.LLM_PROVIDER.lower()

        # 1. Try Primary Configured Provider
        if provider == "ollama":
            try:
                res = await LLMClient.call_ollama(system_prompt, user_prompt, json_mode=json_mode)
                if res:
                    return res
            except Exception as e:
                print(f"[LLMClient] Ollama unavailable at {settings.OLLAMA_BASE_URL}: {e}")

            # Optional fallthrough to Gemini if Gemini key exists
            if settings.GEMINI_API_KEY or settings.LLM_API_KEY:
                print("[LLMClient] Falling back from Ollama to Google Gemini...")
                try:
                    res = await LLMClient.call_gemini(system_prompt, user_prompt, json_mode=json_mode)
                    if res:
                        return res
                except Exception as e:
                    print(f"[LLMClient] Gemini fallback error: {e}")

        elif provider == "gemini":
            try:
                res = await LLMClient.call_gemini(system_prompt, user_prompt, json_mode=json_mode)
                if res:
                    return res
            except Exception as e:
                print(f"[LLMClient] Gemini error: {e}")

            # Optional fallthrough to Ollama
            try:
                res = await LLMClient.call_ollama(system_prompt, user_prompt, json_mode=json_mode)
                if res:
                    return res
            except Exception:
                pass

        elif provider in ["openai", "anthropic"]:
            # Standard OpenAI-compatible path
            endpoint = f"{(settings.LLM_API_BASE or 'https://api.openai.com/v1').rstrip('/')}/chat/completions"
            headers = {"Authorization": f"Bearer {settings.LLM_API_KEY}", "Content-Type": "application/json"}
            body = {
                "model": settings.LLM_MODEL,
                "temperature": settings.LLM_TEMPERATURE,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            }
            if json_mode:
                body["response_format"] = {"type": "json_object"}

            try:
                async with httpx.AsyncClient(timeout=20.0) as client:
                    resp = await client.post(endpoint, headers=headers, json=body)
                    if resp.status_code == 200:
                        content = resp.json()["choices"][0]["message"]["content"]
                        parsed = json.loads(content) if json_mode else {"text": content}
                        parsed["_llm_meta"] = {"provider": provider, "model": settings.LLM_MODEL}
                        return parsed
            except Exception as e:
                print(f"[LLMClient] {provider} call error: {e}")

        return None

llm_client = LLMClient()
