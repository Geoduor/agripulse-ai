import requests
import os
from dotenv import load_dotenv

load_dotenv()

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
BASE_URL = "http://api.weatherapi.com/v1/current.json"

def get_weather(location: str):
    """
    Gets real current weather for any Kenya location
    using WeatherAPI.com — accurate per city.
    """
    try:
        response = requests.get(BASE_URL, params={
            "key": WEATHER_API_KEY,
            "q": f"{location}, Kenya",
            "aqi": "no"
        })

        data = response.json()

        # Check for API errors
        if "error" in data:
            return {
                "location": location,
                "status": "error",
                "message": data["error"]["message"]
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
            "status": "success"
        }

    except Exception as e:
        return {
            "location": location,
            "status": "error",
            "message": str(e)
        }


if __name__ == "__main__":
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