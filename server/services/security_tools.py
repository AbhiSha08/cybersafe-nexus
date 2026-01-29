from google import genai
import httpx
import re
from urllib.parse import urlparse
from core.config import settings

# --- 1. INITIALIZE CLIENT ---
# Uses the modern Google GenAI SDK
client = None
if settings.GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        print(f"⚠️ AI Client Init Failed: {e}")

# --- 2. PHISHING HEURISTICS (Unchanged - Logic is solid) ---
async def analyze_phishing(url: str) -> dict:
    """
    Analyzes URLs for phishing indicators like IP hostnames, 
    risky TLDs, and typosquatting.
    """
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
        
    score = 100 
    findings = []
    
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower() or url.split('/')[0]

        # Critical: IP Address Hostname
        if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", domain):
            score -= 50
            findings.append("CRITICAL: URL uses a raw IP address.")

        # Warning: Risky TLDs
        risky_tlds = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.top', '.zip', '.click']
        if any(domain.endswith(tld) for tld in risky_tlds):
            score -= 30
            findings.append(f"WARNING: High-risk TLD ({domain.split('.')[-1]}).")

        # Suspicious: Typosquatting
        targets = ['google', 'facebook', 'amazon', 'mumbai', 'university', 'bank', 'secure']
        for target in targets:
            # Regex to match l33t speak substitutions (0 for o, 1 for l/i)
            pattern = target.replace('o', '[o0]').replace('l', '[l1]').replace('i', '[i1]')
            if re.search(pattern, domain) and target not in domain:
                score -= 40
                findings.append(f"SUSPICIOUS: Potential impersonation of '{target}'.")

        if parsed.scheme == 'http':
            score -= 20
            findings.append("Insecure HTTP protocol.")

        return {
            "url": url,
            "score": max(0, score),
            "risk_level": "Critical" if score < 50 else "Moderate" if score < 80 else "Low",
            "flags": findings,
            "domain": domain
        }

    except Exception:
        return {"error": "Invalid URL"}

# --- 3. ROBUST AI QUERY (Updated to Gemini 3) ---
async def cyber_ai_query(msg: str, context: str) -> str:
    """
    Attempts to query Gemini 3 Flash (The current 2026 Standard).
    FALLBACK: Returns hardcoded security definitions if API fails.
    """
    # 1. Try Real AI (Primary)
    if client:
        try:
            # Strict system prompt
            sys_prompt = f"Role: Cybersecurity Expert. Context: {context}. Question: {msg}. Keep it brief."
            
            # UPGRADED: Switched to 'gemini-3-flash-preview'
            # This is the current free/stable model as of Jan 2026.
            # (Gemini 1.5 was deprecated in Oct 2025)
            response = client.models.generate_content(
                model="gemini-3-flash-preview", 
                contents=sys_prompt
            )
            return response.text
        except Exception as e:
            # Prints the REAL error for debugging
            print(f"\n🔥 GEMINI 3 API FAILURE: {e}\n")

    # 2. Mock Mode (Backup for Presentation)
    msg_lower = msg.lower()
    
    if "sql" in msg_lower:
        return "SQL Injection (SQLi) is a vulnerability where attackers interfere with database queries. Prevention: Use Prepared Statements and Input Validation."
    
    if "phish" in msg_lower:
        return "Phishing involves fraudulent communications (like emails) appearing to come from reputable sources to steal sensitive data. Always verify the sender and URL."
    
    if "xss" in msg_lower:
        return "Cross-Site Scripting (XSS) allows attackers to inject malicious scripts into web pages. Prevention: Sanitize inputs and use Content Security Policy."
        
    if "password" in msg_lower:
        return "Strong passwords use a mix of chars, numbers, and symbols (12+ length). Never reuse passwords. Enable 2FA for added security."

    return "⚠️ Uplink Failed. I am currently operating in Offline Mode. I can define SQLi, Phishing, XSS, and Password Security."

# --- 4. INTEL HARVESTER ---
async def fetch_wiki_intel(topic: str):
    clean_topic = topic.replace(" ", "_")
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{clean_topic}"
    async with httpx.AsyncClient() as c:
        try:
            resp = await c.get(url, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                return {"title": data.get("title"), "summary": data.get("extract")}
        except Exception:
            pass
    return None