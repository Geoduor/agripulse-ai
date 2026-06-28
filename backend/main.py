from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
import sys

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.agents.input_parser import parse_farmer_input
from backend.agents.reasoning_agent import analyze_and_advise
from backend.agents.action_executor import execute_action
from backend.tools.weather_tool import get_weather

app = FastAPI(
    title="AgriPulse AI",
    description="Autonomous Agricultural Agent for Kenyan Smallholder Farmers",
    version="1.0.0"
)

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Models ──────────────────────────────────────
class FarmerQuery(BaseModel):
    message: str
    location: str
    phone: str = "+254700000000"

class WeatherRequest(BaseModel):
    location: str

# ── Routes ──────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "name": "AgriPulse AI",
        "status": "running",
        "version": "1.0.0",
        "description": "Agricultural AI Agent for Kenyan Farmers"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "AgriPulse AI is running"}

@app.post("/analyze")
async def analyze_farm_problem(query: FarmerQuery):
    """
    Main endpoint - takes farmer message and returns
    full AI analysis with ranked recommendations.
    """
    try:
        # Step 1: Parse what farmer said
        parsed = parse_farmer_input(query.message, query.location)
        
        # Step 2: Analyze with weather + AI reasoning
        advice = analyze_and_advise(parsed)
        
        # Step 3: Execute actions and log
        farmer_info = {
            **parsed,
            "phone": query.phone
        }
        log = execute_action(advice, farmer_info)
        
        return {
            "status": "success",
            "input_understood": parsed,
            "weather_considered": True,
            "diagnosis": advice.get("diagnosis"),
            "recommendations": advice.get("recommendations"),
            "weather_impact": advice.get("weather_impact"),
            "follow_up": advice.get("follow_up"),
            "emergency": advice.get("emergency", False),
            "sms_prepared": log.get("sms_sent")
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/weather/{location}")
async def get_farm_weather(location: str):
    """
    Get real-time weather for any Kenya farming location.
    """
    try:
        weather = get_weather(location)
        return {"status": "success", "weather": weather}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
def get_history():
    """
    Returns logged farmer interactions.
    """
    try:
        history = []
        if os.path.exists("agripulse_log.json"):
            with open("agripulse_log.json", "r") as f:
                for line in f:
                    if line.strip():
                        history.append(json.loads(line))
        return {"status": "success", "count": len(history), "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))