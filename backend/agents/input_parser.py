import os
from openai import OpenAI
from dotenv import load_dotenv
import json

load_dotenv()

client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
)

def parse_farmer_input(farmer_message: str, location: str = "Kenya"):
    """
    Takes raw farmer input and extracts structured information.
    Returns a dictionary with crop, problem, urgency, location.
    """
    
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
    
    response = client.chat.completions.create(
        model="qwen3.7-plus",
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