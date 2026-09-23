import os
from openai import OpenAI
from dotenv import load_dotenv
import json

load_dotenv()

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set. Please add your Google AI Studio key to your .env file.")
    return OpenAI(
        api_key=api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )

def parse_farmer_input(farmer_message: str, location: str = "Kenya"):
    """
    Takes raw farmer input and extracts structured information.
    Returns a dictionary with crop, problem, urgency, location.
    """
    client = get_gemini_client()
    
    prompt = f"""
    You are an agricultural AI assistant for Kenyan smallholder farmers.
    
    A farmer from {location} said: "{farmer_message}"
    
    Extract and return ONLY a JSON object with these fields:
    {{
        "crop": "the crop mentioned or 'unknown'",
        "problem": "the main problem described",
        "urgency": "high/medium/low",
        "location": "{location}",
        "language_detected": "english/swahili/mixed",
        "summary": "one sentence summary of the issue"
    }}
    
    Return ONLY the JSON, no extra text.
    """
    
    model = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are an expert agricultural assistant for Kenya. Always respond with valid JSON only."},
            {"role": "user", "content": prompt}
        ]
    )
    
    raw = response.choices[0].message.content.strip()
    
    # Clean up response in case model adds extra text
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()
    
    parsed = json.loads(raw)
    return parsed


# Test it directly
if __name__ == "__main__":
    test_inputs = [
        ("My maize leaves are turning yellow and I don't know why", "Kisumu"),
        ("Mimea yangu ya nyanya inakufa", "Nairobi"),  # Swahili
        ("I have pests destroying my tomatoes urgently help", "Nakuru")
    ]
    
    for message, location in test_inputs:
        print(f"\nInput: {message}")
        result = parse_farmer_input(message, location)
        print(f"Parsed: {json.dumps(result, indent=2)}")