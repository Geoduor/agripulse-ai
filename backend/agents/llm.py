"""Shared Gemini client factory and JSON helpers for the agent pipeline."""
import json
import os
import re

from openai import OpenAI

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"


def get_gemini_client():
    """Build an OpenAI-compatible client pointed at Google Gemini."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY is not set. Please add your Google AI Studio key "
            "to the project .env file."
        )
    return OpenAI(api_key=api_key, base_url=GEMINI_BASE_URL)


def get_gemini_model():
    """Return the configured Gemini model (defaults to gemini-3.6-flash)."""
    return os.getenv("GEMINI_MODEL", "gemini-3.6-flash")


def extract_json(raw: str) -> dict:
    """Parse the JSON object out of a model response.

    Tolerates markdown code fences and stray text around the payload.
    Raises ValueError when the model returns a non-dict (e.g. a bare array).
    """
    text = raw.strip()

    # Strip markdown code fences if present
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    if fence:
        text = fence.group(1).strip()

    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        # Fall back to the first balanced {...} block
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end > start:
            result = json.loads(text[start:end + 1])
        else:
            raise

    if not isinstance(result, dict):
        raise ValueError(
            f"Expected a JSON object from the model, got {type(result).__name__}: {str(result)[:200]}"
        )
    return result
