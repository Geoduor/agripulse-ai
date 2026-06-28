import { useState, useEffect, useRef } from "react"
import axios from "axios"

const API = "http://127.0.0.1:8000"

// ── REAL UNSPLASH IMAGES ──────────────────────────────────────
const IMG = {
  hero:      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1800&q=80",
  dashboard: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1400&q=80",
  maize:     "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80",
  tomato:    "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80",
  wheat:     "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80",
  beans:     "https://images.unsplash.com/photo-1628944682084-831f35256163?w=800&q=80",
  farmer:    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80",
  soil:      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
  sunflower: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80",
  potato:    "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80",
  avocado:   "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=800&q=80",
  rain:      "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=800&q=80",
  sunrise:   "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=1400&q=80",
}

const CROP_IMG = {
  maize:IMG.maize, corn:IMG.maize, tomato:IMG.tomato, tomatoes:IMG.tomato,
  wheat:IMG.wheat, beans:IMG.beans, sunflower:IMG.sunflower, potato:IMG.potato, avocado:IMG.avocado,
}
const getCropImg = (c) => CROP_IMG[(c||"").toLowerCase()] || IMG.farmer

const LOCATIONS = ["Nairobi","Kisumu","Nakuru","Eldoret","Mombasa","Thika","Nyeri","Kakamega","Kericho","Machakos","Kitale","Meru","Embu","Kisii","Homabay"]

const AGENT_STEPS = [
  {id:1,icon:"🧠",label:"Parsing input",color:"#3EBD5E"},
  {id:2,icon:"🌤️",label:"Fetching weather",color:"#2E86AB"},
  {id:3,icon:"🔬",label:"Diagnosing crop",color:"#C8940A"},
  {id:4,icon:"📋",label:"Building action plan",color:"#9B59B6"},
  {id:5,icon:"✅",label:"Complete",color:"#3EBD5E"},
]

const KENYA_CROPS = [
  {crop:"Maize",img:IMG.maize,tip:"Kenya's staple. Watch for FAW in humid months.",color:"#C8940A"},
  {crop:"Tomatoes",img:IMG.tomato,tip:"Prone to blight in high humidity. Ensure drainage.",color:"#E74C3C"},
  {crop:"Beans",img:IMG.beans,tip:"Fix nitrogen. Watch for bean fly in seedling stage.",color:"#8B4513"},
  {crop:"Wheat",img:IMG.wheat,tip:"Best in cool highlands. Watch for rust disease.",color:"#DAA520"},
  {crop:"Avocado",img:IMG.avocado,tip:"High value export crop. Needs well-drained soils.",color:"#228B3B"},
  {crop:"Potato",img:IMG.potato,tip:"Common in Nyandarua. Watch for late blight.",color:"#8B7355"},
]

const WEATHER_CITIES = ["Nairobi","Kisumu","Nakuru","Eldoret","Mombasa"]

// ── TYPEWRITER HOOK ───────────────────────────────────────────
function useTypewriter(text, speed=14, active=false){
  const [d,setD]=useState("")
  useEffect(()=>{
    if(!active||!text){return}
    setD("")
    let i=0
    const t=setInterval(()=>{
      if(i<text.length){setD(text.slice(0,i+1));i++}
      else clearInterval(t)
    },speed)
    return()=>clearInterval(t)
  },[text,active])
  return d
}

// ── LOGO SVG ─────────────────────────────────────────────────
function AgriPulseLogo({size=44}){
  return(
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="leafL" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4CD96E"/>
          <stop offset="100%" stopColor="#228B3B"/>
        </linearGradient>
        <linearGradient id="leafR" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#228B3B"/>
          <stop offset="100%" stopColor="#1A5C1A"/>
        </linearGradient>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0A1F09"/>
          <stop offset="100%" stopColor="#06120A"/>
        </linearGradient>
      </defs>
      {/* Background */}
      <rect width="48" height="48" rx="11" fill="url(#bg)"/>
      <rect width="48" height="48" rx="11" fill="none" stroke="#2A5A28" strokeWidth="1"/>
      {/* Left leaf */}
      <path d="M24 40 C20 32, 8 28, 8 16 C8 9, 15 5, 24 8 C22 16, 20 26, 24 40Z"
        fill="url(#leafL)" opacity="0.95"/>
      {/* Right leaf */}
      <path d="M24 40 C28 32, 40 28, 40 16 C40 9, 33 5, 24 8 C26 16, 28 26, 24 40Z"
        fill="url(#leafR)" opacity="0.85"/>
      {/* Center stem line */}
      <line x1="24" y1="8" x2="24" y2="42" stroke="#0A1F09" strokeWidth="1.5" opacity="0.6"/>
      {/* Pulse / EKG line */}
      <polyline
        points="3,25 9,25 12,18 15,33 18,21 21,25 27,25 30,18 33,25 39,25 45,25"
        stroke="#C8940A" strokeWidth="2.2" fill="none"
        strokeLinecap="round" strokeLinejoin="round"/>
      {/* Glow dot on pulse */}
      <circle cx="24" cy="25" r="2.5" fill="#C8940A" opacity="0.9"/>
    </svg>
  )
}

// ── SIDEBAR ───────────────────────────────────────────────────
function Sidebar({page,setPage,isOpen,onClose}){
  const nav=[
    {id:"dashboard",icon:"⊞",label:"Dashboard"},
    {id:"analyze",icon:"🔬",label:"Analyze"},
    {id:"history",icon:"📋",label:"History"},
    {id:"about",icon:"⬡",label:"Architecture"},
  ]
  return(
    <div className={`sidebar ${isOpen?"open":""}`} style={{
      width:240,minHeight:"100vh",background:"#080E07",
      borderRight:"1px solid #1A2E18",display:"flex",
      flexDirection:"column",position:"fixed",top:0,left:0,zIndex:100
    }}>
      {/* Logo block */}
      <div style={{padding:"24px 20px 20px",borderBottom:"1px solid #1A2E18"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <AgriPulseLogo size={44}/>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:700,color:"#EBF0E8",letterSpacing:0.3}}>AgriPulse</div>
            <div style={{fontSize:10,color:"#3EBD5E",letterSpacing:2,textTransform:"uppercase",fontWeight:600}}>AI · Kenya</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{flex:1,padding:"18px 12px"}}>
        <div style={{fontSize:10,color:"#4A6A44",letterSpacing:2,textTransform:"uppercase",padding:"0 8px",marginBottom:10,fontWeight:600}}>Navigation</div>
        {nav.map(n=>(
          <button key={n.id} onClick={()=>{setPage(n.id);onClose&&onClose()}}
            style={{
              display:"flex",alignItems:"center",gap:12,width:"100%",
              padding:"11px 14px",borderRadius:10,border:"none",
              background:page===n.id?"linear-gradient(135deg,#162414,#1E3019)":"none",
              color:page===n.id?"#3EBD5E":"#7A9274",
              fontSize:14,fontWeight:page===n.id?600:400,
              cursor:"pointer",marginBottom:4,transition:"all 0.2s",
              textAlign:"left",fontFamily:"'DM Sans',sans-serif",
              borderLeft:page===n.id?"2px solid #3EBD5E":"2px solid transparent"
            }}>
            <span style={{fontSize:16}}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      {/* Status */}
      <div style={{padding:"16px 20px",borderTop:"1px solid #1A2E18"}}>
        <div style={{background:"#0E1A0C",borderRadius:10,padding:"12px 14px",border:"1px solid #1A2E18"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#3EBD5E",animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:12,color:"#3EBD5E",fontWeight:600}}>System Online</span>
          </div>
          <div style={{fontSize:11,color:"#4A6A44"}}>Qwen Cloud · Track 4</div>
          <div style={{fontSize:11,color:"#4A6A44",fontFamily:"'IBM Plex Mono',monospace",marginTop:2}}>v1.0.0</div>
        </div>
      </div>
    </div>
  )
}

// ── STAT CARD ─────────────────────────────────────────────────
function StatCard({icon,value,label,sub,color="#3EBD5E",img}){
  return(
    <div style={{
      background:"#0E1A0C",border:"1px solid #1A2E18",borderRadius:16,
      overflow:"hidden",position:"relative",minHeight:120
    }}>
      {img&&<img src={img} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.18)",opacity:0.8}}/>}
      <div style={{position:"relative",padding:"20px 22px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:11,color:"#7A9274",textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,fontWeight:600}}>{label}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:700,color,lineHeight:1}}>{value}</div>
            {sub&&<div style={{fontSize:12,color:"#4A6A44",marginTop:6}}>{sub}</div>}
          </div>
          <div style={{fontSize:28,opacity:0.8}}>{icon}</div>
        </div>
      </div>
    </div>
  )
}

// ── WEATHER MINI CARD ─────────────────────────────────────────
function WeatherMini({city,data}){
  const icon=()=>{
    if(!data) return "⏳"
    const c=(data.condition||"").toLowerCase()
    if(c.includes("rain")||c.includes("shower")) return "🌧️"
    if(c.includes("thunder")) return "⛈️"
    if(c.includes("cloud")) return "☁️"
    if(c.includes("clear")||c.includes("sunny")) return "☀️"
    return "🌤️"
  }
  return(
    <div style={{background:"#0A1508",border:"1px solid #1A2E18",borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <div style={{fontSize:12,color:"#7A9274",fontWeight:600}}>{city}</div>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,color:"#EBF0E8",fontWeight:700,marginTop:2}}>
          {data?`${data.temperature}°C`:"—"}
        </div>
        <div style={{fontSize:11,color:"#4A6A44",marginTop:2}}>{data?.condition||"Loading..."}</div>
      </div>
      <div style={{fontSize:32}}>{icon()}</div>
    </div>
  )
}

// ── DASHBOARD PAGE ────────────────────────────────────────────
function DashboardPage({history,cityWeather,loadingWeather}){
  const today=new Date().toLocaleDateString("en-KE",{weekday:"long",year:"numeric",month:"long",day:"numeric"})
  const hour=new Date().getHours()
  const greeting=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening"

  const cropCounts={}
  history.forEach(h=>{if(h.crop){cropCounts[h.crop]=(cropCounts[h.crop]||0)+1}})
  const chartData=Object.entries(cropCounts).map(([crop,count])=>({crop,count}))

  const emergencies=history.filter(h=>h.emergency).length
  const counties=[...new Set(history.map(h=>h.location).filter(Boolean))].length

  return(
    <div>
      {/* Dashboard hero */}
      <div style={{position:"relative",height:240,borderRadius:20,overflow:"hidden",marginBottom:28}}>
        <img src={IMG.dashboard} alt="Kenya farm" style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.35)"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(6,12,5,0.7),rgba(14,26,12,0.3))"}}/>
        <div style={{position:"absolute",inset:0,padding:"30px 36px",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div style={{fontSize:12,color:"#C8940A",letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontWeight:600}}>{today}</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:700,color:"#fff",marginBottom:8}}>
            {greeting} 👋
          </h1>
          <p style={{color:"#A8C4A4",fontSize:15,maxWidth:500}}>
            AgriPulse AI is monitoring Kenya's agricultural landscape. {history.length} analyses completed this session.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="stats-grid" style={{marginBottom:28}}>
        <StatCard icon="🔬" value={history.length} label="Analyses Run" sub="This session" color="#3EBD5E" img={IMG.farmer}/>
        <StatCard icon="🌾" value={Object.keys(cropCounts).length||0} label="Crops Identified" sub="Unique crops" color="#C8940A" img={IMG.maize}/>
        <StatCard icon="📍" value={counties||0} label="Counties Covered" sub="Distinct locations" color="#2E86AB" img={IMG.soil}/>
        <StatCard icon="🚨" value={emergencies} label="Emergency Alerts" sub="Urgent cases" color={emergencies>0?"#E74C3C":"#3EBD5E"} img={IMG.rain}/>
      </div>

      <div className="dash-grid">
        {/* LEFT: Activity feed + crop chart */}
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          {/* Crop breakdown */}
          <div style={{background:"#0E1A0C",border:"1px solid #1A2E18",borderRadius:16,padding:"22px 24px"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"#EBF0E8",marginBottom:16}}>Crop Analysis Breakdown</div>
            {chartData.length===0?(
              <div style={{textAlign:"center",padding:"40px 0",color:"#4A6A44"}}>
                <div style={{fontSize:36,marginBottom:12}}>🌱</div>
                <div style={{fontSize:13}}>Run your first analysis to see crop breakdown here</div>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {chartData.map((d,i)=>(
                  <div key={i}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:13,color:"#A8C4A4",textTransform:"capitalize"}}>{d.crop}</span>
                      <span style={{fontSize:13,color:"#3EBD5E",fontFamily:"'IBM Plex Mono',monospace",fontWeight:600}}>{d.count}</span>
                    </div>
                    <div style={{height:6,background:"#162414",borderRadius:4,overflow:"hidden"}}>
                      <div style={{
                        height:"100%",
                        width:`${(d.count/Math.max(...chartData.map(x=>x.count)))*100}%`,
                        background:"linear-gradient(90deg,#3EBD5E,#C8940A)",
                        borderRadius:4,transition:"width 0.8s ease"
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div style={{background:"#0E1A0C",border:"1px solid #1A2E18",borderRadius:16,padding:"22px 24px"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"#EBF0E8",marginBottom:16}}>Recent Activity</div>
            {history.length===0?(
              <div style={{textAlign:"center",padding:"30px 0",color:"#4A6A44"}}>
                <div style={{fontSize:13}}>No analyses yet. Go to Analyze to get started.</div>
              </div>
            ):(
              history.slice(0,5).map((h,i)=>(
                <div key={i} style={{display:"flex",gap:14,padding:"12px 0",borderBottom:i<Math.min(history.length,5)-1?"1px solid #1A2E18":"none",alignItems:"center"}}>
                  <div style={{width:44,height:44,borderRadius:10,overflow:"hidden",flexShrink:0}}>
                    <img src={getCropImg(h.crop)} alt={h.crop} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:13,color:"#3EBD5E",fontWeight:600,textTransform:"capitalize"}}>{h.crop||"Unknown"}</span>
                      <span style={{fontSize:11,color:"#4A6A44",fontFamily:"'IBM Plex Mono',monospace"}}>{h.timestamp}</span>
                    </div>
                    <div style={{fontSize:12,color:"#7A9274",marginTop:2}}>📍 {h.location}</div>
                    <div style={{fontSize:11,color:"#4A6A44",marginTop:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h.diagnosis}</div>
                  </div>
                  {h.emergency&&<div style={{background:"#3A0808",border:"1px solid #C0392B",borderRadius:6,padding:"2px 8px",fontSize:10,color:"#E74C3C",whiteSpace:"nowrap",flexShrink:0}}>URGENT</div>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Weather + crop tips */}
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          {/* Multi-city weather */}
          <div style={{background:"#0E1A0C",border:"1px solid #1A2E18",borderRadius:16,padding:"22px 24px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"#EBF0E8"}}>Kenya Weather</div>
              {loadingWeather&&<div style={{fontSize:11,color:"#4A6A44"}}>Updating...</div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {WEATHER_CITIES.map(city=>(
                <WeatherMini key={city} city={city} data={cityWeather[city]}/>
              ))}
            </div>
          </div>

          {/* Crop tips */}
          <div style={{background:"#0E1A0C",border:"1px solid #1A2E18",borderRadius:16,padding:"22px 24px"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"#EBF0E8",marginBottom:16}}>Kenya Crop Guide</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {KENYA_CROPS.slice(0,4).map((c,i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 12px",background:"#0A1508",borderRadius:10,border:"1px solid #1A2E18"}}>
                  <div style={{width:38,height:38,borderRadius:8,overflow:"hidden",flexShrink:0}}>
                    <img src={c.img} alt={c.crop} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  </div>
                  <div>
                    <div style={{fontSize:13,color:c.color,fontWeight:600}}>{c.crop}</div>
                    <div style={{fontSize:11,color:"#4A6A44",marginTop:2,lineHeight:1.4}}>{c.tip}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ANALYZE PAGE ──────────────────────────────────────────────
function AnalyzePage({onResult}){
  const [message,setMessage]=useState("")
  const [location,setLocation]=useState("Nairobi")
  const [phone,setPhone]=useState("")
  const [result,setResult]=useState(null)
  const [weather,setWeather]=useState(null)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState("")
  const [agentStep,setAgentStep]=useState(0)
  const resultRef=useRef(null)
  const diagnosisTyped=useTypewriter(result?.diagnosis,14,!!result)

  const simulateSteps=async()=>{
    for(let i=1;i<=AGENT_STEPS.length;i++){
      setAgentStep(i)
      await new Promise(r=>setTimeout(r,850))
    }
  }

  const analyze=async()=>{
    if(!message.trim()){setError("Please describe your farm problem");return}
    setLoading(true);setError("");setResult(null);setAgentStep(0)
    try{
      simulateSteps()
      const [ar,wr]=await Promise.all([
        axios.post(`${API}/analyze`,{message,location,phone}),
        axios.get(`${API}/weather/${location}`)
      ])
      setResult(ar.data)
      setWeather(wr.data.weather)
      onResult({
        timestamp:new Date().toLocaleTimeString(),
        crop:ar.data.input_understood?.crop,
        location,
        diagnosis:ar.data.diagnosis?.slice(0,70)+"...",
        emergency:ar.data.emergency
      })
      setTimeout(()=>resultRef.current?.scrollIntoView({behavior:"smooth"}),400)
    }catch(e){
      setError("Cannot connect to backend. Make sure your FastAPI server is running on port 8000.")
      setAgentStep(0)
    }finally{setLoading(false)}
  }

  return(
    <div className="analyze-grid">
      {/* LEFT */}
      <div>
        {/* Input card */}
        <div style={{background:"#0E1A0C",border:"1px solid #1A2E18",borderRadius:16,padding:"28px 30px",marginBottom:22}}>
          {/* Header with image */}
          <div style={{position:"relative",height:120,borderRadius:12,overflow:"hidden",marginBottom:22}}>
            <img src={IMG.sunrise} alt="Kenya farm sunrise" style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.45)"}}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",padding:"0 22px"}}>
              <div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"#fff"}}>Describe Your Farm Problem</div>
                <div style={{fontSize:13,color:"#A8C4A4",marginTop:4}}>English, Swahili, or both — AgriPulse understands you</div>
              </div>
            </div>
          </div>

          {/* Quick examples */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:"#4A6A44",textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,fontWeight:600}}>Quick Examples</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {["Maize leaves turning yellow","White spots on tomatoes","Beans wilting after rain","Mimea yangu inakufa"].map(ex=>(
                <button key={ex} onClick={()=>{setMessage(ex);setError("")}}
                  style={{background:"#162414",border:"1px solid #2A4A28",color:"#7A9274",borderRadius:20,padding:"5px 14px",fontSize:12,cursor:"pointer",transition:"all 0.2s",fontFamily:"DM Sans"}}>
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <textarea value={message} onChange={e=>{setMessage(e.target.value);setError("")}}
            placeholder="e.g. My maize crop in Eldoret has brown spots on the leaves and some plants are wilting badly. It started 5 days ago after the long rains..."
            style={{width:"100%",minHeight:120,background:"#0A1508",border:"1px solid #1A2E18",borderRadius:10,padding:"15px",color:"#EBF0E8",fontSize:15,resize:"vertical",fontFamily:"DM Sans",lineHeight:1.6}}
          />

          <div className="form-grid" style={{marginTop:14}}>
            <div>
              <label style={{fontSize:11,color:"#7A9274",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:7,fontWeight:600}}>📍 Your Location</label>
              <select value={location} onChange={e=>setLocation(e.target.value)}
                style={{width:"100%",background:"#0A1508",border:"1px solid #1A2E18",borderRadius:10,padding:"11px 14px",color:"#EBF0E8",fontSize:14,fontFamily:"DM Sans"}}>
                {LOCATIONS.map(l=><option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:11,color:"#7A9274",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:7,fontWeight:600}}>📱 Phone (optional)</label>
              <input type="text" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+254 7XX XXX XXX"
                style={{width:"100%",background:"#0A1508",border:"1px solid #1A2E18",borderRadius:10,padding:"11px 14px",color:"#EBF0E8",fontSize:14,fontFamily:"DM Sans"}}
              />
            </div>
          </div>

          {error&&<div style={{marginTop:12,padding:"10px 14px",background:"#2A0808",border:"1px solid #C0392B",borderRadius:8,color:"#E57373",fontSize:13}}>⚠️ {error}</div>}

          <button onClick={analyze} disabled={loading}
            style={{width:"100%",marginTop:18,padding:16,background:loading?"#1A3A1A":"linear-gradient(135deg,#3EBD5E,#1A8A35)",
              color:"#fff",border:"none",borderRadius:10,fontSize:15,fontWeight:600,cursor:loading?"not-allowed":"pointer",
              fontFamily:"DM Sans",letterSpacing:0.5,transition:"all 0.3s"}}>
            {loading?"🔄  AgriPulse AI is working...":"🚀  Analyze My Farm Problem"}
          </button>
        </div>

        {/* Results */}
        {result&&(
          <div ref={resultRef}>
            {result.emergency&&(
              <div style={{background:"linear-gradient(135deg,#4A0808,#6B1010)",border:"1px solid #C0392B",borderRadius:12,padding:"16px 22px",display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
                <span style={{fontSize:28}}>🚨</span>
                <div>
                  <div style={{fontWeight:700,fontSize:16,color:"#fff"}}>EMERGENCY — Act Today</div>
                  <div style={{color:"#FFCDD2",fontSize:13,marginTop:2}}>This situation requires immediate intervention</div>
                </div>
              </div>
            )}

            {/* Crop banner */}
            <div style={{borderRadius:16,overflow:"hidden",marginBottom:18,position:"relative",height:190}}>
              <img src={getCropImg(result.input_understood?.crop)} alt={result.input_understood?.crop} style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.45)"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(6,12,5,0.85),transparent)",display:"flex",alignItems:"flex-end",padding:"22px 28px"}}>
                <div>
                  <div style={{fontSize:10,color:"#C8940A",letterSpacing:2.5,textTransform:"uppercase",marginBottom:4}}>Detected Crop</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,color:"#fff",fontWeight:700,textTransform:"capitalize"}}>{result.input_understood?.crop||"Unknown"}</div>
                  <div style={{display:"flex",gap:10,marginTop:8}}>
                    <span style={{background:"rgba(62,189,94,0.2)",border:"1px solid rgba(62,189,94,0.4)",color:"#3EBD5E",borderRadius:20,padding:"3px 12px",fontSize:12}}>📍 {result.input_understood?.location}</span>
                    <span style={{
                      background:result.input_understood?.urgency==="high"?"rgba(231,76,60,0.2)":"rgba(200,148,10,0.2)",
                      border:`1px solid ${result.input_understood?.urgency==="high"?"rgba(231,76,60,0.5)":"rgba(200,148,10,0.5)"}`,
                      color:result.input_understood?.urgency==="high"?"#E74C3C":"#C8940A",
                      borderRadius:20,padding:"3px 12px",fontSize:12
                    }}>
                      {result.input_understood?.urgency?.toUpperCase()} URGENCY
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <div style={{background:"#0E1A0C",border:"1px solid #1A2E18",borderRadius:16,padding:"24px 28px",marginBottom:18}}>
              <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:14}}>
                <div style={{width:36,height:36,borderRadius:10,background:"rgba(200,148,10,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🔬</div>
                <div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"#EBF0E8"}}>AI Diagnosis</div>
                  <div style={{fontSize:12,color:"#4A6A44"}}>Symptoms + real-time weather analysis</div>
                </div>
              </div>
              <p style={{color:"#C8DCC4",fontSize:15,lineHeight:1.85,fontFamily:"DM Sans"}}>{diagnosisTyped}</p>
              {result.weather_impact&&(
                <div style={{marginTop:16,background:"#0A1508",borderRadius:10,padding:"13px 16px",borderLeft:"3px solid #2E86AB"}}>
                  <div style={{fontSize:10,color:"#2E86AB",letterSpacing:1.5,textTransform:"uppercase",marginBottom:4,fontWeight:600}}>Weather Impact</div>
                  <p style={{color:"#7A9EBE",fontSize:13,lineHeight:1.6}}>{result.weather_impact}</p>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div style={{background:"#0E1A0C",border:"1px solid #1A2E18",borderRadius:16,padding:"24px 28px",marginBottom:18}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#EBF0E8",marginBottom:18}}>📋 Ranked Action Plan</div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {result.recommendations?.map((rec,i)=>(
                  <div key={i} style={{
                    background:i===0?"linear-gradient(135deg,#0C2010,#122818)":"#0A1508",
                    border:`1px solid ${i===0?"#2A5A28":"#1A2E18"}`,
                    borderRadius:12,padding:"18px 20px"
                  }}>
                    <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                      <div style={{
                        minWidth:30,height:30,borderRadius:8,
                        background:i===0?"linear-gradient(135deg,#3EBD5E,#228B3B)":"#162414",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontWeight:700,fontSize:13,color:"#fff"
                      }}>{rec.rank}</div>
                      <div style={{flex:1}}>
                        {i===0&&<div style={{fontSize:10,color:"#C8940A",letterSpacing:1.5,textTransform:"uppercase",marginBottom:4,fontWeight:600}}>⭐ Priority Action</div>}
                        <p style={{color:"#EBF0E8",fontSize:14,lineHeight:1.65,marginBottom:10}}>{rec.action}</p>
                        <div style={{display:"flex",gap:18,flexWrap:"wrap"}}>
                          <span style={{fontSize:12,color:"#7A9274"}}>⏰ {rec.timeline}</span>
                          <span style={{fontSize:13,color:"#C8940A",fontWeight:600,fontFamily:"'IBM Plex Mono',monospace"}}>💰 {rec.cost}</span>
                        </div>
                        {rec.materials_needed?.length>0&&(
                          <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:6}}>
                            {rec.materials_needed.map((item,j)=>(
                              <span key={j} style={{background:"#162414",border:"1px solid #2A4A28",color:"#7A9274",borderRadius:20,padding:"3px 12px",fontSize:11}}>{item}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result.follow_up&&(
              <div style={{background:"#0E1A0C",border:"1px solid #1A2E18",borderRadius:16,padding:"22px 28px"}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span style={{fontSize:24}}>📅</span>
                  <div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"#C8940A",marginBottom:8}}>3-Day Follow-Up</div>
                    <p style={{color:"#7A9274",fontSize:14,lineHeight:1.7}}>{result.follow_up}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR */}
      <div>
        {/* Agent steps */}
        {(loading||agentStep>0)&&(
          <div style={{background:"#0E1A0C",border:"1px solid #1A2E18",borderRadius:16,padding:"22px 20px",marginBottom:18}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,marginBottom:14,color:"#EBF0E8"}}>🤖 Agent Activity</div>
            {AGENT_STEPS.map(step=>(
              <div key={step.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,background:agentStep===step.id?"#162414":"transparent",marginBottom:4}}>
                <div style={{
                  width:30,height:30,borderRadius:8,
                  background:agentStep>=step.id?`${step.color}22`:"#0A1508",
                  border:`1px solid ${agentStep>=step.id?step.color:"#1A2E18"}`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,transition:"all 0.4s"
                }}>
                  {agentStep>step.id?"✓":step.icon}
                </div>
                <span style={{fontSize:13,color:agentStep===step.id?"#EBF0E8":agentStep>step.id?"#3EBD5E":"#4A6A44",transition:"all 0.3s"}}>{step.label}</span>
                {agentStep===step.id&&loading&&<div style={{marginLeft:"auto",width:7,height:7,borderRadius:"50%",background:step.color,animation:"pulse 1.5s infinite"}}/>}
              </div>
            ))}
          </div>
        )}

        {/* Live weather */}
        {weather&&(
          <div style={{background:"#0E1A0C",border:"1px solid #1A2E18",borderRadius:16,overflow:"hidden",marginBottom:18}}>
            <div style={{position:"relative",height:100}}>
              <img src={IMG.rain} alt="weather" style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.3)"}}/>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px"}}>
                <div>
                  <div style={{fontSize:10,color:"#7A9274",textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>Live Weather</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:"#EBF0E8"}}>{weather.location}, Kenya</div>
                </div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:40,color:"#fff",fontWeight:700}}>{weather.temperature}°</div>
              </div>
            </div>
            <div style={{padding:"16px 20px"}}>
              <div className="weather-grid">
                {[["💧","Humidity",`${weather.humidity}%`,"#2E86AB"],["💨","Wind",`${weather.wind_speed} km/h`,"#9B59B6"],["🌧️","Rain",`${weather.precipitation}mm`,"#3EBD5E"],["☁️","Condition",weather.condition?.split(" ").slice(0,2).join(" "),"#7A9274"]].map(([icon,label,val,col])=>(
                  <div key={label} style={{background:"#0A1508",borderRadius:10,padding:"10px 12px",border:"1px solid #1A2E18"}}>
                    <div style={{fontSize:14,marginBottom:4}}>{icon}</div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,color:col,fontWeight:600}}>{val}</div>
                    <div style={{fontSize:10,color:"#4A6A44",marginTop:2}}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        {result&&(
          <div style={{background:"#0E1A0C",border:"1px solid #1A2E18",borderRadius:16,padding:"20px 22px"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,marginBottom:14,color:"#EBF0E8"}}>Query Summary</div>
            {[["Crop",result.input_understood?.crop],["Problem",result.input_understood?.problem],["Language",result.input_understood?.language_detected],["Urgency",result.input_understood?.urgency],["Weather Used","✓ Open-Meteo"]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #1A2E18"}}>
                <span style={{fontSize:11,color:"#4A6A44",textTransform:"uppercase",letterSpacing:0.8}}>{l}</span>
                <span style={{fontSize:12,color:"#EBF0E8",fontWeight:500,textTransform:"capitalize",textAlign:"right",maxWidth:160}}>{v||"—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── HISTORY PAGE ──────────────────────────────────────────────
function HistoryPage({history}){
  return(
    <div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:"#EBF0E8",marginBottom:6}}>Analysis History</div>
      <div style={{fontSize:13,color:"#4A6A44",marginBottom:24}}>{history.length} analyses completed this session</div>
      {history.length===0?(
        <div style={{background:"#0E1A0C",border:"1px solid #1A2E18",borderRadius:16,padding:"80px 20px",textAlign:"center"}}>
          <div style={{fontSize:52,marginBottom:16}}>🌱</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#EBF0E8",marginBottom:8}}>No analyses yet</div>
          <div style={{color:"#4A6A44",fontSize:14}}>Go to Analyze and describe a farm problem to get started</div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {history.map((h,i)=>(
            <div key={i} style={{background:"#0E1A0C",border:`1px solid ${h.emergency?"#C0392B":"#1A2E18"}`,borderRadius:16,overflow:"hidden",display:"flex"}}>
              <div style={{width:90,flexShrink:0}}>
                <img src={getCropImg(h.crop)} alt={h.crop} style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.6)"}}/>
              </div>
              <div style={{flex:1,padding:"18px 22px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <span style={{fontSize:16,color:"#3EBD5E",fontWeight:600,textTransform:"capitalize"}}>{h.crop||"Unknown crop"}</span>
                    <span style={{fontSize:13,color:"#4A6A44",marginLeft:12}}>📍 {h.location}</span>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    {h.emergency&&<span style={{background:"#3A0808",border:"1px solid #C0392B",borderRadius:6,padding:"3px 10px",fontSize:11,color:"#E74C3C"}}>URGENT</span>}
                    <span style={{fontSize:11,color:"#4A6A44",fontFamily:"'IBM Plex Mono',monospace"}}>{h.timestamp}</span>
                  </div>
                </div>
                <p style={{color:"#7A9274",fontSize:13,lineHeight:1.6}}>{h.diagnosis}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── ABOUT PAGE ────────────────────────────────────────────────
function AboutPage(){
  const agents=[
    {icon:"🧠",title:"Input Parser Agent",desc:"Understands farmer messages in English, Swahili, or both. Extracts crop, problem, urgency, and location with high accuracy.",color:"#3EBD5E"},
    {icon:"🌤️",title:"Weather Intelligence",desc:"Fetches real-time conditions from WeatherAPI.com for every Kenya county. Temperature, humidity, wind and precipitation all factor into the AI diagnosis.",color:"#2E86AB"},
    {icon:"🔬",title:"Reasoning Agent (Qwen3)",desc:"Core AI brain. Synthesizes symptoms + weather + Kenya agricultural context to produce precise diagnoses.",color:"#C8940A"},
    {icon:"📋",title:"Action Executor",desc:"Converts AI analysis into a ranked 3-step action plan with Kenyan product names and KES pricing.",color:"#9B59B6"},
    {icon:"📱",title:"SMS Notifier",desc:"Prepares formatted SMS alerts for emergency situations, ready to send via Africa's Talking API.",color:"#E74C3C"},
    {icon:"📅",title:"Follow-Up Scheduler",desc:"Sets a 3-day follow-up checkpoint to verify treatment success and update farmer history.",color:"#3EBD5E"},
  ]
  return(
    <div>
      <div style={{position:"relative",height:200,borderRadius:20,overflow:"hidden",marginBottom:28}}>
        <img src={IMG.farmer} alt="Kenyan farmer" style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.35)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",padding:"0 40px"}}>
          <div>
            <div style={{fontSize:11,color:"#C8940A",letterSpacing:2.5,textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Track 4 · Autopilot Agent · Qwen Cloud</div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:700,color:"#fff",marginBottom:8}}>How AgriPulse AI Works</h2>
            <p style={{color:"#A8C4A4",fontSize:14,maxWidth:500}}>A 6-agent autonomous pipeline that takes a farmer's message from raw input to ranked, actionable advice in under 10 seconds.</p>
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18,marginBottom:24}}>
        {agents.map(a=>(
          <div key={a.title} style={{background:"#0E1A0C",border:"1px solid #1A2E18",borderRadius:16,padding:"24px",transition:"all 0.2s",cursor:"default"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=a.color}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#1A2E18"}>
            <div style={{fontSize:30,marginBottom:12}}>{a.icon}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:a.color,marginBottom:8}}>{a.title}</div>
            <p style={{fontSize:13,color:"#7A9274",lineHeight:1.7}}>{a.desc}</p>
          </div>
        ))}
      </div>
      <div style={{background:"#0E1A0C",border:"1px solid #1A2E18",borderRadius:16,padding:"26px 30px"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#C8940A",marginBottom:16}}>System Architecture</div>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"#3EBD5E",lineHeight:2.2,background:"#0A1508",padding:"22px",borderRadius:12}}>
          <span style={{color:"#EBF0E8"}}>Farmer</span> ──► <span style={{color:"#3EBD5E"}}>Input Parser</span> ──► <span style={{color:"#2E86AB"}}>WeatherAPI.com</span>{"\n"}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│{"\n"}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼{"\n"}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{color:"#C8940A"}}>Qwen3 Reasoning Agent</span>{"\n"}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│{"\n"}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼{"\n"}
          &nbsp;&nbsp;&nbsp;&nbsp;<span style={{color:"#9B59B6"}}>Action Executor</span> ──► <span style={{color:"#E74C3C"}}>SMS Alert</span> + <span style={{color:"#3EBD5E"}}>Ranked Advice</span>{"\n"}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│{"\n"}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼{"\n"}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{color:"#2E86AB"}}>Alibaba Cloud ECS</span> + RDS + OSS
        </div>
      </div>
    </div>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function App(){
  const [page,setPage]=useState("dashboard")
  const [history,setHistory]=useState([])
  const [cityWeather,setCityWeather]=useState({})
  const [loadingWeather,setLoadingWeather]=useState(false)
  const [sidebarOpen,setSidebarOpen]=useState(false)

  // Load weather for all cities on mount
  useEffect(()=>{
    const fetchAll=async()=>{
      setLoadingWeather(true)
      const results={}
      for(const city of WEATHER_CITIES){
        try{
          const r=await axios.get(`${API}/weather/${city}`)
          results[city]=r.data.weather
        }catch(e){results[city]=null}
      }
      setCityWeather(results)
      setLoadingWeather(false)
    }
    fetchAll()
  },[])

  const handleResult=(entry)=>{
    setHistory(prev=>[entry,...prev.slice(0,19)])
  }

  return(
    <div style={{display:"flex",minHeight:"100vh",background:"#060B05",fontFamily:"'DM Sans',sans-serif",color:"#EBF0E8"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        textarea:focus,input:focus,select:focus{outline:none;border-color:#3EBD5E!important;}
        .pulse{animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
        button:focus{outline:none;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:#060B05;}
        ::-webkit-scrollbar-thumb{background:#2A4A28;border-radius:4px;}
        select option{background:#0A1508;}

        /* ── RESPONSIVE ── */
        .sidebar{width:240px;transition:transform 0.3s ease;}
        .main-content{margin-left:240px;transition:margin 0.3s ease;}
        .hamburger{display:none;background:none;border:none;color:#EBF0E8;font-size:24px;cursor:pointer;padding:8px;}
        .overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99;}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
        .dash-grid{display:grid;grid-template-columns:1.6fr 1fr;gap:20px;}
        .analyze-grid{display:grid;grid-template-columns:1fr 360px;gap:24px;}
        .about-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .weather-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}

        @media(max-width:1100px){
          .stats-grid{grid-template-columns:repeat(2,1fr);}
          .dash-grid{grid-template-columns:1fr;}
          .analyze-grid{grid-template-columns:1fr;}
          .about-grid{grid-template-columns:repeat(2,1fr);}
        }

        @media(max-width:768px){
          .sidebar{position:fixed;top:0;left:0;z-index:100;transform:translateX(-100%);}
          .sidebar.open{transform:translateX(0);}
          .main-content{margin-left:0!important;}
          .hamburger{display:block;}
          .overlay.open{display:block;}
          .stats-grid{grid-template-columns:repeat(2,1fr);gap:10px;}
          .dash-grid{grid-template-columns:1fr;}
          .analyze-grid{grid-template-columns:1fr;}
          .about-grid{grid-template-columns:1fr;}
          .form-grid{grid-template-columns:1fr;}
          .weather-grid{grid-template-columns:1fr 1fr;}
          .main-padding{padding:16px!important;}
          .hero-padding{padding:0 20px!important;}
          .hero-title{font-size:28px!important;}
          .hero-height{height:380px!important;}
          .dash-hero-height{height:180px!important;}
          .top-bar{padding:16px 20px!important;}
        }

        @media(max-width:480px){
          .stats-grid{grid-template-columns:1fr 1fr;}
          .weather-grid{grid-template-columns:1fr;}
          .about-grid{grid-template-columns:1fr;}
          .hero-title{font-size:22px!important;}
          .hero-height{height:320px!important;}
        }
      `}</style>

      {/* Mobile overlay */}
      <div className={`overlay ${sidebarOpen?"open":""}`} onClick={()=>setSidebarOpen(false)}/>

      <Sidebar page={page} setPage={setPage} isOpen={sidebarOpen} onClose={()=>setSidebarOpen(false)}/>

      {/* Main content */}
      <div className="main-content" style={{flex:1,padding:"32px 36px",minHeight:"100vh",overflowY:"auto"}}>
        {/* Top bar */}
        <div className="top-bar" style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28,paddingBottom:20,borderBottom:"1px solid #1A2E18",padding:"0 0 20px 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button className="hamburger" onClick={()=>setSidebarOpen(!sidebarOpen)}>☰</button>
            <div>
              <div style={{fontSize:11,color:"#4A6A44",textTransform:"uppercase",letterSpacing:2,marginBottom:4,fontWeight:600}}>
                AgriPulse AI · {page.charAt(0).toUpperCase()+page.slice(1)}
              </div>
              <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:"#EBF0E8"}}>
                {page==="dashboard"&&"Overview"}
                {page==="analyze"&&"Analyze Farm Problem"}
                {page==="history"&&"Analysis History"}
                {page==="about"&&"Architecture"}
              </h1>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"#4A6A44"}}>
              {new Date().toLocaleTimeString("en-KE")}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(62,189,94,0.1)",border:"1px solid rgba(62,189,94,0.3)",borderRadius:20,padding:"7px 14px"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#3EBD5E"}} className="pulse"/>
              <span style={{fontSize:12,color:"#3EBD5E",fontWeight:600}}>Online</span>
            </div>
          </div>
        </div>

        {/* Pages */}
        {page==="dashboard"&&<DashboardPage history={history} cityWeather={cityWeather} loadingWeather={loadingWeather}/>}
        {page==="analyze"&&<AnalyzePage onResult={handleResult}/>}
        {page==="history"&&<HistoryPage history={history}/>}
        {page==="about"&&<AboutPage/>}
      </div>
    </div>
  )
}
