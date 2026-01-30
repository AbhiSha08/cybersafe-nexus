import bcrypt, jwt, time
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.config import settings
from collections import defaultdict

security = HTTPBearer()
FAILED_LOGINS = defaultdict(list)
TOKEN_BLACKLIST = set() # Simple in-memory blacklist (reset on restart)
MAX_ATTEMPTS = 5
BLOCK_TIME = 900 

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    try: 
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except: 
        return False

def create_token(user_id: str, email: str, role: str, name: str = "Cadet") -> str:
    """
    Generates the JWT. 
    Includes 'name' and 'role' for frontend decoding.
    """
    payload = {
        'user_id': user_id, 
        'email': email, 
        'role': role, 
        'name': name,
        'iat': datetime.now(timezone.utc),
        'exp': datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    
    if token in TOKEN_BLACKLIST:
        raise HTTPException(status_code=401, detail="Token revoked (Logged Out).")
        
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired.")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token.")

async def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False))):
    """
    Returns user payload if valid, None if invalid/missing.
    Does NOT raise an exception.
    """
    if not credentials:
        return None
        
    token = credentials.credentials
    
    if token in TOKEN_BLACKLIST:
        return None
        
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except Exception:
        return None

async def validate_admin(user=Depends(get_current_user)):
    """Gatekeeper for /admin routes."""
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Root clearance required."
        )
    return user

def check_brute_force(ip: str):
    now = time.time()
    # Filter out old attempts
    FAILED_LOGINS[ip] = [t for t in FAILED_LOGINS[ip] if now - t < BLOCK_TIME]
    if len(FAILED_LOGINS[ip]) >= MAX_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Security Block: Too many attempts. Try again later.")

def log_failed_attempt(ip: str):
    FAILED_LOGINS[ip].append(time.time())