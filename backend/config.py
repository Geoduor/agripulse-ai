"""Shared configuration for the AgriPulse AI backend.

Loads the single root .env once (regardless of the current working
directory) and exposes the project root for resolving file paths.
"""
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOG_FILE = PROJECT_ROOT / "agripulse_log.json"

_ENV_LOADED = False


def load_env():
    """Load the project root .env exactly once, no matter the CWD."""
    global _ENV_LOADED
    if not _ENV_LOADED:
        load_dotenv(PROJECT_ROOT / ".env")
        _ENV_LOADED = True
