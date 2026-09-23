import os

import requests

from backend.config import load_env

load_env()

BASE_URL = "https://api.weatherapi.com/v1/current.json"
REQUEST_TIMEOUT = 10


def get_weather(location: str):
    """
    Gets real current weather for any Kenya location
    using WeatherAPI.com — accurate per city.
    Always returns a dict with a "status" key ("success" or "error").
    """
    api_key = os.getenv("WEATHER_API_KEY")
    if not api_key:
        return {
            "location": location,
            "status": "error",
            "message": "WEATHER_API_KEY is not set in the project .env file.",
        }

    try:
        response = requests.get(
            BASE_URL,
            params={
                "key": api_key,
                "q": f"{location}, Kenya",
                "aqi": "no",
            },
            timeout=REQUEST_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()

        # Check for API errors
        if "error" in data:
            return {
                "location": location,
                "status": "error",
                "message": data["error"]["message"],
            }

        current = data["current"]
        loc_info = data["location"]

        return {
            "location": loc_info["name"],
            "region": loc_info["region"],
            "country": loc_info["country"],
            "temperature": current["temp_c"],
            "feels_like": current["feelslike_c"],
            "humidity": current["humidity"],
            "condition": current["condition"]["text"],
            "wind_speed": current["wind_kph"],
            "wind_direction": current["wind_dir"],
            "precipitation": current["precip_mm"],
            "cloud_cover": current["cloud"],
            "uv_index": current["uv"],
            "visibility": current["vis_km"],
            "last_updated": current["last_updated"],
            "status": "success",
        }

    except Exception as e:
        return {
            "location": location,
            "status": "error",
            "message": str(e),
        }


if __name__ == "__main__":
    import sys

    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    cities = ["Kisumu", "Nairobi", "Nakuru", "Eldoret", "Mombasa"]
    for city in cities:
        result = get_weather(city)
        print(f"\n📍 {city}:")
        if result["status"] == "success":
            print(f"   🌡️  Temp:       {result['temperature']}°C (feels {result['feels_like']}°C)")
            print(f"   💧 Humidity:   {result['humidity']}%")
            print(f"   ☁️  Condition:  {result['condition']}")
            print(f"   💨 Wind:       {result['wind_speed']} km/h {result['wind_direction']}")
            print(f"   🌧️  Rain:       {result['precipitation']}mm")
            print(f"   ☀️  UV Index:   {result['uv_index']}")
            print(f"   🕐 Updated:    {result['last_updated']}")
        else:
            print(f"   ❌ Error: {result['message']}")
