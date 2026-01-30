from fastapi import APIRouter, Depends, HTTPException
from core.security import get_current_user, get_current_user_optional
from core.database import db
from core.config import settings
from models.schemas import ChatMessage 
from pydantic import BaseModel
from datetime import datetime, timezone
import google.generativeai as genai
import random
import whois
import socket
import ssl
from urllib.parse import urlparse
from dateutil import parser 
from bson import ObjectId 

# FIX: Remove the internal prefix. Let main.py handle the "/api/tools" part.
router = APIRouter() 

# --- AI CONFIG ---
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash") 
else:
    model = None

class SimulationLog(BaseModel):
    tool_name: str
    input_data: str
    risk_level: str
    result_summary: str

# --- LIVE ALERTS ---
@router.get("/live-alerts")
async def get_live_alerts():
    alerts = [
        "📡 NEXUS_SYSTEM: All nodes operational.",
        "🛡️ INTEL: Phishing campaigns targeting student emails detected.",
        "⚡ BROADCAST: Enable 2FA on all university accounts.",
        "⚠️ THREAT_INTEL: SQL Injection attempts spiking in region AP-South-1.",
        "🔒 SECURITY: Patch cycle scheduled for 03:00 AM IST."
    ]
    return random.sample(alerts, min(3, len(alerts)))

# --- AI CHAT ---
@router.post("/ai-assistant")
async def chat_with_ai(msg_data: ChatMessage, user=Depends(get_current_user_optional)):
    if not model: 
        return {"response": "System: AI Offline (Missing API Key)."}
    try:
        user_name = user.get("name", "Operative") if user else "Guest"
        system_instruction = (
            f"You are NEXUS, an advanced cybersecurity AI tutor. "
            f"User: {user_name}. "
            f"Keep answers concise, technical yet accessible."
        )
        response = model.generate_content(f"{system_instruction}\nUser Query: {msg_data.message}")
        return {"response": response.text}
    except Exception as e: 
        print(f"AI Error: {e}")
        return {"response": "System: Neural Link Unstable (Connection Failure)."}

# --- REAL-TIME PHISHING ANALYZER ---
@router.post("/analyze-url")
async def analyze_target_url(data: dict, user=Depends(get_current_user)):
    raw_url = data.get("url", "").strip()
    if not raw_url: raise HTTPException(status_code=400, detail="URL required")

    if not raw_url.startswith(('http://', 'https://')):
        target_url = f"https://{raw_url}"
    else:
        target_url = raw_url
        
    parsed = urlparse(target_url)
    domain = parsed.netloc or parsed.path 
    
    risk_score = 0 
    checks = []
    
    # 1. SSL CHECK
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.socket(), server_hostname=domain) as s:
            s.settimeout(3.0)
            s.connect((domain, 443))
            s.getpeercert()
            checks.append({"name": "Secure Connection", "status": "PASS", "owasp": "A02: Crypto", "detail": "Valid HTTPS Encryption"})
    except Exception:
        risk_score += 40
        checks.append({"name": "Secure Connection", "status": "FAIL", "owasp": "A02: Crypto", "detail": "Unsafe (No HTTPS Detected)"})

    # 2. SPOOFING CHECK
    suspicious = ["g00gle", "pypal", "paypaI", "facbook", "mumbai-university", "nexus-secure"]
    if any(s in domain for s in suspicious):
        risk_score += 35
        checks.append({"name": "Identity Check", "status": "FAIL", "owasp": "A07: Auth", "detail": "Likely Fake/Spoofed Brand"})
    else:
        checks.append({"name": "Identity Check", "status": "PASS", "owasp": "A07: Auth", "detail": "No Typosquatting Detected"})

    # 3. DOMAIN REPUTATION (WHOIS)
    try:
        w = whois.whois(domain)
        c_date = w.creation_date
        
        if isinstance(c_date, list): c_date = c_date[0]
        if isinstance(c_date, str):
            try: c_date = parser.parse(c_date)
            except: c_date = None

        if c_date and isinstance(c_date, datetime):
            if c_date.tzinfo is None:
                days = (datetime.now() - c_date).days
            else:
                days = (datetime.now(timezone.utc) - c_date.astimezone(timezone.utc)).days
            
            if days < 30:
                risk_score += 30
                checks.append({"name": "Domain History", "status": "FAIL", "owasp": "A05: Config", "detail": f"Suspiciously New ({days} days old)"})
            else:
                checks.append({"name": "Domain History", "status": "PASS", "owasp": "A05: Config", "detail": f"Established ({days} days old)"})
        else:
            checks.append({"name": "Domain History", "status": "WARN", "owasp": "A05: Config", "detail": "Could not verify age (Privacy Redacted)"})
            
    except Exception as e:
        print(f"Whois Error: {e}")
        checks.append({"name": "Domain History", "status": "WARN", "owasp": "A05: Config", "detail": "Could not access Registry"})

    final_risk = min(risk_score, 100)
    verdict = "SAFE"
    if final_risk >= 50: verdict = "MALICIOUS"
    elif final_risk >= 20: verdict = "SUSPICIOUS"

    return {
        "target": domain,
        "risk_score": final_risk,
        "verdict": verdict,
        "checks": checks
    }

# --- LOGGING & SCORING ---
@router.post("/log-simulation")
async def log_security_event(data: SimulationLog, user_payload=Depends(get_current_user)):
    user_id = user_payload['user_id']
    
    event_doc = {
        "user_id": user_id,
        "cadet_name": user_payload.get('name', 'Cadet'),
        "tool": data.tool_name,
        "risk": data.risk_level,
        "summary": data.result_summary,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "node": "Nexus-Terminal"
    }
    
    await db.security_logs.insert_one(event_doc)

    points = 0
    if data.risk_level == "Critical": points = 50
    elif data.risk_level == "High": points = 30
    elif data.risk_level == "Medium": points = 10
    
    if points > 0:
        await db.users.update_one(
            {"id": user_id}, 
            {"$inc": {"total_xp": points}}
        )

    return {"status": "ok", "points_awarded": points}

@router.get("/security-logs")
async def get_logs(user=Depends(get_current_user)):
    uid = str(user.get('user_id') or user.get('id'))
    logs = await db.security_logs.find({"user_id": uid}).sort("timestamp", -1).limit(20).to_list(20)
    for l in logs: l["_id"] = str(l["_id"])
    return logs