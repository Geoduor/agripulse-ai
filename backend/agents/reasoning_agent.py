import json

from backend.agents.llm import extract_json, get_gemini_client, get_gemini_model
from backend.config import load_env
from backend.tools.weather_tool import get_weather

load_env()

def analyze_and_advise(parsed_input: dict):
    """
    Takes parsed farmer input + weather data
    and returns ranked actionable recommendations.
    """
    client = get_gemini_client()
    
    # Get real weather for farmer's location
    location = parsed_input.get("location", "Nairobi")
    weather = get_weather(location)
    weather_ok = weather.get("status") == "success"

    if weather_ok:
        weather_block = f"""
    CURRENT WEATHER CONDITIONS:
    - Temperature: {weather.get('temperature')}°C
    - Humidity: {weather.get('humidity')}%
    - Condition: {weather.get('condition')}
    - Wind Speed: {weather.get('wind_speed')} km/h
    """
    else:
        weather_block = """
    CURRENT WEATHER CONDITIONS: unavailable (weather service error).
    Base the advice on the symptoms alone.
    """

    prompt = f"""
    You are AgriPulse AI, an expert agricultural advisor for Kenyan smallholder farmers.
    
    FARMER SITUATION:
    - Crop: {parsed_input.get('crop')}
    - Problem: {parsed_input.get('problem')}
    - Location: {parsed_input.get('location')}
    - Urgency: {parsed_input.get('urgency')}
    
    {weather_block}

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
        model=get_gemini_model(),
        messages=[
            {"role": "system", "content": "You are an expert agricultural advisor for Kenya. Always respond with valid JSON only. Use local Kenya product names and KES pricing."},
            {"role": "user", "content": prompt}
        ]
    )
    
    raw = response.choices[0].message.content.strip()
    advice = extract_json(raw)
    advice["weather_available"] = weather_ok
    return advice

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