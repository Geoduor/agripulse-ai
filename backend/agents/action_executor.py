import json
import sys
from datetime import datetime

from backend.config import LOG_FILE

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def execute_action(advice: dict, farmer_info: dict):
    """
    Takes the AI recommendations and executes actions:
    - Logs advice to history
    - Prepares SMS message
    - Sets follow-up reminder
    """
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Format top recommendation as SMS
    recommendations = advice.get("recommendations") or []
    top_recommendation = recommendations[0] if recommendations else {}
    
    sms_message = f"""
AgriPulse AI Alert 🌱
Crop: {farmer_info.get('crop', 'Your crop')}
Issue: {advice.get('diagnosis', '')}
Action: {top_recommendation.get('action', '')}
When: {top_recommendation.get('timeline', '')}
Cost: {top_recommendation.get('cost', '')}
Follow up in 3 days.
    """.strip()
    
    # Log the full interaction
    log_entry = {
        "timestamp": timestamp,
        "farmer": farmer_info,
        "diagnosis": advice.get("diagnosis"),
        "top_action": top_recommendation.get("action"),
        "emergency": advice.get("emergency", False),
        "follow_up_date": "3 days from now",
        "sms_sent": sms_message
    }
    
    # Save to local log file
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(log_entry) + "\n")

    # Persist to Supabase when configured (best-effort; the JSON log above
    # remains the fallback audit trail). Imported lazily so the app keeps
    # running even before SQLAlchemy is installed.
    try:
        from backend.database.models import save_diagnosis
        save_diagnosis(log_entry)
    except ImportError:
        pass
    
    print("\n✅ Action Executed:")
    print(f"📱 SMS Message Prepared:\n{sms_message}")
    print(f"\n📋 Logged to history at {timestamp}")
    
    if advice.get("emergency"):
        print("\n🚨 EMERGENCY ALERT: This farmer needs urgent help!")
    
    return log_entry

if __name__ == "__main__":
    # Test with sample data
    sample_advice = {
        "diagnosis": "Nitrogen deficiency worsened by waterlogging",
        "recommendations": [
            {
                "rank": 1,
                "action": "Apply CAN fertilizer at 50kg/acre",
                "timeline": "Within 48 hours",
                "cost": "KES 2,500",
                "materials_needed": ["CAN fertilizer", "Knapsack sprayer"]
            }
        ],
        "weather_impact": "High humidity is accelerating nutrient loss",
        "follow_up": "Check leaf color improvement after 3 days",
        "emergency": False
    }
    
    sample_farmer = {
        "crop": "maize",
        "location": "Kisumu",
        "phone": "+254700000000"
    }
    
    execute_action(sample_advice, sample_farmer)