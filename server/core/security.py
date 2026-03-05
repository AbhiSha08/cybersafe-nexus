import bcrypt, jwt, time

from datetime import datetime, timezone, timedelta

from fastapi import HTTPException, Depends, status

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from typing import Optional, Dict, Any

from core.config import settings

from collections import defaultdict

try:
    from google.auth.transport import requests
    from google.oauth2 import id_token
    GOOGLE_AUTH_AVAILABLE = True
except ImportError:
    GOOGLE_AUTH_AVAILABLE = False

security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)

FAILED_LOGINS = defaultdict(list)

TOKEN_BLACKLIST = set() # Single source of truth for logout

MAX_ATTEMPTS = 5

BLOCK_TIME = 900 



def hash_password(password: str) -> str:

    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')



def verify_password(password: str, hashed: str) -> bool:

    try: return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

    except: return False



def create_token(user_id: str, email: str, role: str, name: str = "Cadet") -> str:

    """

    Generates the JWT. 

    Added 'name' to payload so SIEM logs can identify users instantly.

    """

    payload = {

        'user_id': user_id, 

        'email': email, 

        'role': role, 

        'name': name,  # Added for UI/Logs context

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



async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional)):
    """Optional authentication - returns user payload if valid token, None otherwise."""
    
    if not credentials:
        return None
    
    token = credentials.credentials
    
    if token in TOKEN_BLACKLIST:
        return None
    
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except:
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

    FAILED_LOGINS[ip] = [t for t in FAILED_LOGINS[ip] if now - t < BLOCK_TIME]

    if len(FAILED_LOGINS[ip]) >= MAX_ATTEMPTS:

        raise HTTPException(status_code=429, detail="Security Block: Too many attempts.")



def log_failed_attempt(ip: str):

    FAILED_LOGINS[ip].append(time.time())


def verify_google_token(token: str) -> Dict[str, Any]:
    """
    Verify Google ID token and return user information.
    
    Args:
        token: Google ID token from frontend
        
    Returns:
        Dictionary with user info (email, name, picture, etc.)
        
    Raises:
        HTTPException if token is invalid
    """
    print(f"[DEBUG] Google token verification started")
    print(f"[DEBUG] GOOGLE_AUTH_AVAILABLE: {GOOGLE_AUTH_AVAILABLE}")
    print(f"[DEBUG] GOOGLE_CLIENT_ID: {settings.GOOGLE_CLIENT_ID}")
    
    if not GOOGLE_AUTH_AVAILABLE:
        print("[DEBUG] Google auth library not available")
        raise HTTPException(
            status_code=400, 
            detail="Google OAuth library not installed on server."
        )
    
    if not settings.GOOGLE_CLIENT_ID:
        print("[DEBUG] Google Client ID not configured")
        raise HTTPException(
            status_code=400, 
            detail="Google OAuth not configured on server. Missing GOOGLE_CLIENT_ID."
        )
    
    try:
        print(f"[DEBUG] Attempting to verify token...")
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        print(f"[DEBUG] Token verified successfully: {idinfo.get('email')}")
        
        # Verify token is not expired and issued by Google
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise HTTPException(status_code=400, detail="Invalid issuer.")
            
        return idinfo
    except Exception as e:
        print(f"[DEBUG] Token verification failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")