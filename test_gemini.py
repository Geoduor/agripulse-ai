import os
import sys
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Always load from the project root .env regardless of CWD
load_dotenv(Path(__file__).resolve().parent / ".env")

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("[!] GEMINI_API_KEY is not set in .env. Please add your key from Google AI Studio (https://aistudio.google.com/) to test Gemini.")
    sys.exit(1)

model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

client = OpenAI(
    api_key=api_key,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

try:
    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {"role": "system", "content": "You are AgriPulse AI, an agricultural intelligence assistant for Kenyan smallholder farmers."},
            {"role": "user", "content": "My maize leaves are turning yellow in Kisumu. What is the most likely cause and first step?"}
        ]
    )
    print(f"[+] Gemini ({model_name}) Connection Successful!\n")
    print(response.choices[0].message.content)
except Exception as e:
    print(f"[-] Error connecting to Gemini ({model_name}): {e}")
