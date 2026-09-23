# 🌱 AgriPulse AI

> **Autonomous Agricultural Intelligence Platform for Kenyan Smallholder Farmers**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.138+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-purple.svg)](https://react.dev)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.6_Flash-orange.svg)](https://aistudio.google.com/)
[![Render](https://img.shields.io/badge/Backend-Render-black.svg)](https://render.com)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black.svg)](https://vercel.com)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E.svg)](https://supabase.com)

---

## 🌍 The Mission

Kenya has over **7.5 million smallholder farmers** producing 78% of the country's food, yet they encounter critical barriers:
- **Delayed Crop Pathology:** Pests and fungal diseases destroy yields before farmers can consult extension officers.
- **Extension Worker Shortage:** The national ratio is approximately 1 officer to 1,500+ farmers.
- **Microclimate Vulnerability:** Sudden weather shifts exacerbate pest outbreaks and fertilizer leaching.
- **Linguistic Inaccessibility:** Farmers communicate predominantly in Swahili, regional dialects, or Sheng rather than technical English.

**AgriPulse AI** bridges this gap as an autonomous 24/7 agronomist. It interprets natural language descriptions in English or Swahili, synthesizes real-time microclimate weather data, diagnoses crop stress using **Google Gemini 3.6 Flash**, and generates ranked, localized treatment plans with Kenyan agro-dealer product names and pricing in Kenyan Shillings (KES).

---

## 🤖 Autonomous Multi-Agent Pipeline

When a farmer sends a message describing a crop problem, AgriPulse AI triggers a coordinated agent pipeline:

```
Farmer Input (English / Swahili / Sheng)
        ↓
[Agent 1] Input Parser Agent (Gemini 3.6 Flash)
- Multilingual Natural Language Understanding
- Extracts: crop, symptoms, urgency level, and county location
        ↓
[Agent 2] Weather Intelligence Tool (WeatherAPI.com)
- Queries real-time microclimate conditions for 15+ Kenyan counties
- Temperature, relative humidity, wind speed, precipitation
        ↓
[Agent 3] Reasoning Agent (Gemini 3.6 Flash)
- Correlates plant symptoms with localized weather metrics
- Diagnoses root causes (fungal/bacterial blight, pest infestation, nutrient lockout)
- Contextualized for Kenyan agro-ecological zones
        ↓
[Agent 4] Action Executor
- Compiles prioritized 3-step intervention plans
- Recommends Kenya-registered chemical/organic inputs with KES market prices
- Formats instant SMS alerts for rapid dispatch
        ↓
[Agent 5] Follow-Up Scheduler
- Establishes a 3-day recovery checkpoint
- Records telemetry to Supabase / local audit log
        ↓
Ranked Advisory Plan + Formatted SMS Notification
```

---

## ✨ Key Features

- 🧠 **Native Multilingual NLU:** Understands colloquial English, Swahili (*"Mimea yangu ya nyanya inakufa"*), and mixed dialects.
- 🌤️ **Real-Time Agro-Weather Integration:** Direct API telemetry for temperature, humidity, and rainfall to detect weather-driven diseases (e.g., powdery mildew, blights).
- 🔬 **Next-Gen AI Diagnostics:** Powered by **Google Gemini 3.6 Flash** for fast, high-accuracy reasoning.
- 📋 **Hyper-Localized Action Plans:** Concrete steps with Kenya-specific agrochemicals (e.g., MEA CAN fertilizer, Ridomil Gold, Thunder) and estimated KES pricing.
- 🚨 **Emergency Triage:** Automated severity detection with critical-alert tagging for rapid intervention.
- 📱 **SMS Integration Ready:** Structured payloads formatted for Africa's Talking and local telco SMS gateways.
- 📅 **Automated Follow-Up Tracking:** 72-hour checkpoint schedules to assess recovery.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   FRONTEND (Vercel)                    │
│             React 19 + Vite Executive UI               │
│     Overview │ Farm Diagnostic │ History │ Topology    │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / REST
┌───────────────────────────▼────────────────────────────┐
│                    BACKEND (Render)                    │
│               FastAPI (Python 3.14)                    │
│    /analyze │ /weather/{location} │ /history │ /health │
└──────┬────────────────────┬────────────────────┬───────┘
       │                    │                    │
┌──────▼──────┐      ┌──────▼──────┐      ┌──────▼──────┐
│Google Gemini│      │WeatherAPI   │      │  Supabase   │
│  3.6 Flash  │      │  Real-Time  │      │ PostgreSQL  │
│  AI Engine  │      │  Weather    │      │  & Storage  │
└─────────────┘      └─────────────┘      └─────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|:---|:---|:---|
| **AI Model** | Google Gemini 3.6 Flash | Fast multilingual reasoning & low latency |
| **Backend API** | FastAPI + Uvicorn (Python 3.14) | Asynchronous REST backend |
| **Frontend UI** | React 19 + Vite + Axios | Responsive farmer & extension officer dashboard |
| **Weather Telemetry** | WeatherAPI.com | Real-time weather by Kenyan city/county |
| **Database & Auth** | Supabase (PostgreSQL) | Interaction logging, treatment history, farmer profiles |
| **Hosting & Cloud** | Render (API) + Vercel (Frontend) | Serverless, zero-maintenance global deployment |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- [Google AI Studio API Key](https://aistudio.google.com/) (Free tier available)
- [WeatherAPI.com API Key](https://www.weatherapi.com/) (Free tier available)

---

### 1. Clone & Set Up Environment

```bash
git clone https://github.com/geoduor/agripulse-ai.git
cd agripulse-ai
```

Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash  # Optional (defaults to gemini-3.6-flash)
WEATHER_API_KEY=your_weatherapi_key_here
```

---

### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS / Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify Gemini connectivity
python test_gemini.py

# Launch FastAPI development server
uvicorn backend.main:app --reload --port 8000
```

The backend documentation will be accessible at:
- Swagger Docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

---

### 3. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be live at `http://localhost:5173`.

---

## 📡 API Reference

### Analyze Crop Problem
`POST /analyze`

**Request:**
```json
{
  "message": "My maize leaves have yellow streaks and the plants are stunted",
  "location": "Kisumu",
  "phone": "+254700000000"
}
```

**Response:**
```json
{
  "status": "success",
  "input_understood": {
    "crop": "maize",
    "problem": "yellow streaks on leaves and stunted growth",
    "urgency": "medium",
    "location": "Kisumu",
    "language_detected": "english",
    "summary": "Maize crop in Kisumu displaying yellow streaks and stunting."
  },
  "weather_considered": true,
  "diagnosis": "Maize Streak Virus (MSV) transmitted by leafhoppers, exacerbated by current high temperatures...",
  "recommendations": [
    {
      "rank": 1,
      "action": "Spray insecticide (e.g., Actara or Thunder) to control the leafhopper vector population.",
      "timeline": "Within 24 to 48 hours",
      "cost": "KES 1,200",
      "materials_needed": ["Thunder insecticide", "Knapsack sprayer", "PPE"]
    },
    {
      "rank": 2,
      "action": "Rogue out and destroy severely infected, stunted plants to prevent further spread.",
      "timeline": "Immediately",
      "cost": "KES 0",
      "materials_needed": ["Hand tools"]
    },
    {
      "rank": 3,
      "action": "Apply a mild foliar feed rich in zinc and nitrogen to assist remaining healthy plants.",
      "timeline": "Within 5 days",
      "cost": "KES 800",
      "materials_needed": ["Foliar fertilizer"]
    }
  ],
  "weather_impact": "High ambient temperature (28°C) accelerates leafhopper reproduction cycles.",
  "emergency": false,
  "follow_up": "Check leafhopper presence under leaves and evaluate new leaf growth in 3 days."
}
```

### Real-Time Weather
`GET /weather/{location}`
Retrieves temperature, humidity, precipitation, wind speed, and conditions for any Kenyan location.

### Diagnostic History
`GET /history`
Returns recorded diagnoses and treatment logs.

---

## ☁️ Production Deployment

### Frontend on Vercel
1. Link your GitHub repository to [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Set Build Command to `npm run build` and Output Directory to `dist`.
4. Add environment variable `VITE_API_URL` pointing to your Render backend URL.

### Backend on Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect the repository and select Python environment.
3. Set Build Command: `pip install -r requirements.txt`.
4. Set Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.
5. Add Environment Variables: `GEMINI_API_KEY` and `WEATHER_API_KEY`.

### Database on Supabase
1. Create a project on [Supabase](https://supabase.com).
2. Connect PostgreSQL via SQLAlchemy in `backend/database/models.py`.

---

## 🔮 Roadmap

- [ ] **Multimodal Visual Diagnosis:** Enable direct photo uploads of damaged foliage using Gemini 2.0 Flash vision capabilities.
- [ ] **WhatsApp & USSD Bot:** Interface with WhatsApp Business API and Africa's Talking USSD to serve non-smartphone farmers.
- [ ] **Soil Testing Integration:** Ingest NPK soil sample data to calibrate fertilizer recommendations.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
