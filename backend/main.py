from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import json
import os
import sys

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.agents.input_parser import parse_farmer_input
from backend.agents.reasoning_agent import analyze_and_advise
from backend.agents.action_executor import execute_action
from backend.config import LOG_FILE, load_env
from backend.tools.weather_tool import get_weather

try:
    from backend.database.models import backfill_from_json, database_enabled, init_db, list_diagnoses
    HAS_DATABASE = True
except ImportError:
    HAS_DATABASE = False

load_env()

# Keep emoji-rich console output from crashing on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def _backfill_log():
    """Migrate existing JSON log entries into Supabase (once, when empty)."""
    try:
        if not LOG_FILE.exists():
            return
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            entries = [json.loads(line) for line in f if line.strip()]
        inserted = backfill_from_json(entries)
        if inserted:
            print(f"📦 Backfilled {inserted} existing log entries into Supabase")
    except Exception as e:
        print(f"[db] Backfill skipped: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if HAS_DATABASE:
        if database_enabled():
            if init_db():
                print("✅ Supabase database connected")
                _backfill_log()
            else:
                print("⚠️ Supabase init failed — history will use the JSON log")
        else:
            print("ℹ️ DATABASE_URL not set — history uses the local JSON log")
    yield


app = FastAPI(
    title="AgriPulse AI",
    description="Autonomous Agricultural Agent for Kenyan Smallholder Farmers",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS: origins configurable via CORS_ORIGINS (comma-separated), defaults to open.
# Credentials stay off: the API uses no cookies/tokens, and browsers reject
# the wildcard-origins + credentials combination anyway.
cors_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
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
            "weather_considered": advice.get("weather_available", True),
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
    weather = get_weather(location)
    if weather.get("status") == "error":
        raise HTTPException(status_code=502, detail=weather.get("message", "Weather service unavailable"))
    return {"status": "success", "weather": weather}

@app.get("/history")
def get_history():
    """
    Returns logged farmer interactions (Supabase when configured,
    otherwise the local JSON audit log).
    """
    try:
        if HAS_DATABASE and database_enabled():
            rows = list_diagnoses()
            if rows:
                return {"status": "success", "count": len(rows), "history": rows, "source": "supabase"}

        history = []
        if LOG_FILE.exists():
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        history.append(json.loads(line))
        return {"status": "success", "count": len(history), "history": history, "source": "json_log"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
