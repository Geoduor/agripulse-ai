# 🌱 AgriPulse AI

> **Autonomous Agricultural Intelligence Agent for Kenyan Smallholder Farmers**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-Vite-purple.svg)](https://vitejs.dev)
[![Qwen Cloud](https://img.shields.io/badge/Qwen-Cloud-orange.svg)](https://qwen.ai)

---

## 🏆 Hackathon Submission

**Global AI Hackathon Series with Qwen Cloud**
**Track 4: Autopilot Agent**

AgriPulse AI is a production-grade autonomous agent that automates the end-to-end agricultural advisory workflow for Kenyan smallholder farmers — from raw farmer input to ranked, actionable advice in under 10 seconds.

---

## 🌍 The Problem

Kenya has over **7.5 million smallholder farmers** who face:
- Crop diseases that destroy harvests before they can be identified
- No access to affordable agricultural extension officers
- Weather-related crop failures due to lack of real-time data
- Language barriers (many speak Swahili, not English)

**AgriPulse AI solves all of this — autonomously.**

---

## 🤖 How It Works

A farmer sends a message in plain English or Swahili describing their problem. AgriPulse AI runs a 6-agent autonomous pipeline:

```
Farmer Input (English/Swahili)
        ↓
[Agent 1] Input Parser
- Understands natural language
- Extracts: crop, problem, urgency, location
- Handles English, Swahili, and mixed language
        ↓
[Agent 2] Weather Intelligence
- Fetches real-time weather via WeatherAPI.com
- Temperature, humidity, wind, precipitation
- Location-specific for 15+ Kenya counties
        ↓
[Agent 3] Qwen3 Reasoning Agent
- Synthesizes symptoms + weather data
- Diagnoses crop disease/pest/deficiency
- Uses Kenya-specific agricultural context
        ↓
[Agent 4] Action Executor
- Generates ranked 3-step action plan
- Kenya product names + KES pricing
- Prepares SMS alert for emergencies
        ↓
[Agent 5] Follow-Up Scheduler
- Sets 3-day follow-up checkpoint
- Logs all interactions to history
- Tracks treatment outcomes
        ↓
Ranked Recommendations + SMS Alert
```

---

## ✨ Key Features

- 🧠 **Natural Language Understanding** — Works in English, Swahili, or both
- 🌤️ **Real-Time Weather Integration** — WeatherAPI.com for accurate Kenya data
- 🔬 **AI-Powered Diagnosis** — Qwen3 model for precise crop disease identification
- 📋 **Ranked Action Plans** — 3 prioritized recommendations with KES pricing
- 🚨 **Emergency Detection** — Auto-flags urgent situations
- 📱 **SMS Ready** — Formatted alerts via Africa's Talking API
- 📅 **Follow-Up System** — 3-day treatment verification
- 🗺️ **15+ Kenya Counties** — Nairobi, Kisumu, Nakuru, Eldoret, Mombasa and more

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│          React + Vite (Executive Dashboard)          │
│    Dashboard │ Analyze │ History │ Architecture      │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────┐
│                    BACKEND                           │
│              FastAPI (Python)                        │
│  /analyze │ /weather/{city} │ /health │ /history     │
└──────┬──────────┬───────────────┬───────────────────┘
       │          │               │
┌──────▼──┐  ┌────▼─────┐  ┌─────▼──────┐
│  Qwen3  │  │WeatherAPI│  │  Log/DB    │
│  Cloud  │  │  .com    │  │  Storage   │
│(DashScope)│ │(Real-time)│  │(JSON/RDS) │
└─────────┘  └──────────┘  └────────────┘
                       │
        ┌──────────────▼──────────────┐
        │     Alibaba Cloud ECS       │
        │   Production Deployment     │
        └─────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **AI Model** | Qwen3 via DashScope API (Qwen Cloud) |
| **Backend** | Python 3.14 + FastAPI + Uvicorn |
| **Frontend** | React 18 + Vite + Axios |
| **Weather** | WeatherAPI.com (real-time Kenya data) |
| **Deployment** | Alibaba Cloud ECS |
| **Fonts** | Cormorant Garamond + DM Sans + IBM Plex Mono |
| **Images** | Unsplash API (real agricultural photography) |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Qwen Cloud account + DashScope API key
- WeatherAPI.com API key

### 1. Clone the Repository
```bash
git clone https://github.com/geoduor/agripulse-ai.git
cd agripulse-ai
```

### 2. Set Up Backend
```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Mac/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DASHSCOPE_API_KEY=your_qwen_dashscope_api_key
WEATHER_API_KEY=your_weatherapi_key
```

### 4. Start the Backend
```bash
uvicorn backend.main:app --reload --port 8000
```

Backend will be running at: `http://127.0.0.1:8000`

API documentation: `http://127.0.0.1:8000/docs`

### 5. Set Up Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend will be running at: `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/` | API status and info |
| `GET` | `/health` | Health check |
| `POST` | `/analyze` | Main agent — analyze farm problem |
| `GET` | `/weather/{city}` | Real-time weather for Kenya city |
| `GET` | `/history` | All logged farmer interactions |

### Example Request
```bash
curl -X POST http://127.0.0.1:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "message": "My maize leaves are turning yellow and wilting",
    "location": "Kisumu",
    "phone": "+254700000000"
  }'
```

### Example Response
```json
{
  "status": "success",
  "input_understood": {
    "crop": "maize",
    "problem": "yellowing leaves and wilting",
    "urgency": "medium",
    "location": "Kisumu"
  },
  "weather_considered": true,
  "diagnosis": "Nitrogen deficiency aggravated by waterlogging...",
  "recommendations": [
    {
      "rank": 1,
      "action": "Apply CAN fertilizer at 50kg/acre",
      "timeline": "Within 48 hours",
      "cost": "KES 2,500",
      "materials_needed": ["CAN fertilizer", "Knapsack sprayer"]
    }
  ],
  "emergency": false,
  "follow_up": "Check leaf color improvement after 3 days"
}
```

---

## 🌐 Deployment on Alibaba Cloud

This project is deployed on **Alibaba Cloud ECS** as required by the hackathon.

### Services Used
| Service | Purpose |
|---------|---------|
| **ECS** | Backend server running FastAPI |
| **OSS** | Static file and image storage |
| **RDS** | Farmer interaction database |
| **DashScope** | Qwen3 AI model API |

See `deployment/alibaba-cloud-proof.md` for deployment verification.

---

## 📁 Project Structure

```
agripulse-ai/
├── backend/
│   ├── agents/
│   │   ├── input_parser.py      # Understands farmer input
│   │   ├── reasoning_agent.py   # Qwen3 AI diagnosis
│   │   └── action_executor.py   # Generates action plans
│   ├── tools/
│   │   └── weather_tool.py      # WeatherAPI.com integration
│   └── main.py                  # FastAPI server
├── frontend/
│   └── src/
│       └── App.jsx              # React dashboard
├── docs/
│   └── architecture-diagram.png
├── deployment/
│   └── alibaba-cloud-proof.md
├── .env.example
├── requirements.txt
├── run_agent.py
└── README.md
```

---

## 🎯 Track 4: Autopilot Agent — Judging Criteria

| Criteria | How AgriPulse Meets It |
|----------|----------------------|
| **Ambiguous Input Handling** | Understands broken English, Swahili, mixed language |
| **External Tool Invocation** | WeatherAPI.com, DashScope Qwen3, Africa's Talking SMS |
| **Human-in-the-Loop** | Farmer confirms before high-stakes actions |
| **Production Readiness** | Deployed on Alibaba Cloud ECS, not localhost |
| **Real Business Workflow** | Farm problem → AI diagnosis → Ranked advice → SMS → Follow-up |

---

## 👨‍💻 Developer

**Geofry Oduor**
- Final Year Student, Bachelor of Technology (Mechanical Engineering)
- Technical University of Kenya
- Software Engineering Programme, Zone01 Kisumu
- Power Learn Project Africa — AI & Software Development

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Qwen Cloud](https://qwen.ai) — AI model infrastructure
- [Alibaba Cloud](https://alibabacloud.com) — Cloud deployment
- [WeatherAPI.com](https://weatherapi.com) — Real-time Kenya weather
- [FastAPI](https://fastapi.tiangolo.com) — Backend framework
- [Unsplash](https://unsplash.com) — Agricultural photography

---

<div align="center">
  <strong>Built for Kenyan Farmers 🌱 | Global AI Hackathon 2026 | Track 4: Autopilot Agent</strong>
</div>
