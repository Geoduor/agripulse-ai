import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from backend.tools.weather_tool import get_weather

load_dotenv()

client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
)

def analyze_and_advise(parsed_input: dict):
    """
    Takes parsed farmer input + weather data
    and returns ranked actionable recommendations.
    """
    
    # Get real weather for farmer's location
    weather = get_weather(parsed_input.get("location", "Nairobi"))
    
    prompt = f"""
    You are AgriPulse AI, an expert agricultural advisor for Kenyan smallholder farmers.
    
    FARMER SITUATION:
    - Crop: {parsed_input.get('crop')}
    - Problem: {parsed_input.get('problem')}
    - Location: {parsed_input.get('location')}
    - Urgency: {parsed_input.get('urgency')}
    
    CURRENT WEATHER CONDITIONS:
    - Temperature: {weather.get('temperature')}°C
    - Humidity: {weather.get('humidity')}%
    - Condition: {weather.get('condition')}
    - Wind Speed: {weather.get('wind_speed')} m/s
    
    Based on this real data, provide a JSON response with:
    {{
        "diagnosis": "what is most likely causing the problem",
        "recommendations": [
            {{
                "rank": 1,
                "action": "most important action to take",
                "timeline": "when to do it",
                "cost": "estimated cost in KES",
                "materials_needed": ["item1", "item2"]
            }},
            {{
                "rank": 2,
                "action": "second action",
                "timeline": "when to do it", 
                "cost": "estimated cost in KES",
                "materials_needed": ["item1"]
            }},
            {{
                "rank": 3,
                "action": "third action",
                "timeline": "when to do it",
                "cost": "estimated cost in KES",
                "materials_needed": ["item1"]
            }}
        ],
        "weather_impact": "how current weather affects this problem",
        "follow_up": "what to check in 3 days",
        "emergency": true or false
    }}
    
    Return ONLY valid JSON. Use Kenya-specific products and pricing.
    """
    
    response = client.chat.completions.create(
        model="qwen3.7-plus",
        messages=[
            {"role": "system", "content": "You are an expert agricultural advisor for Kenya. Always respond with valid JSON only. Use local Kenya product names and KES pricing."},
            {"role": "user", "content": prompt}
        ]
    )
    
    raw = response.choices[0].message.content.strip()
    
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()
    
    return json.loads(raw)

if __name__ == "__main__":
    # Test with a parsed farmer input
    test_input = {
        "crop": "maize",
        "problem": "leaves turning yellow",
        "urgency": "medium",
        "location": "Kisumu",
        "language_detected": "english",
        "summary": "Farmer in Kisumu has yellowing maize leaves"
    }
    
    print("Analyzing farmer situation...")
    result = analyze_and_advise(test_input)
    print(json.dumps(result, indent=2))