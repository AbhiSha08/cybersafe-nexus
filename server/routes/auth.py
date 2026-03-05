from fastapi import APIRouter, HTTPException, Request, Depends, status
from fastapi.security import OAuth2PasswordBearer
from core.security import (
    hash_password, 
    verify_password, 
    create_token, 
    check_brute_force, 
    log_failed_attempt,
    TOKEN_BLACKLIST,
    verify_google_token
)
from core.database import db
from models.schemas import UserCreate, UserLogin, ForgotPasswordRequest, ResetPasswordSubmit
import uuid
import jwt
from datetime import datetime, timezone, timedelta
from core.config import settings
from pydantic import BaseModel

router = APIRouter()

# --- GOOGLE AUTH MODELS ---
class GoogleTokenRequest(BaseModel):
    token: str
    name: str = None
    email: str = None

# --- 1. REGISTRATION ---
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    existing_user = await db.users.find_one({'email': user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")
    
    user_id = str(uuid.uuid4())
    hashed_pw = hash_password(user_data.password)
    
    user_doc = {
        'id': user_id,
        'email': user_data.email,
        'password': hashed_pw,
        'previous_passwords': [],
        'name': user_data.name,
        'role': user_data.role, 
        'user_type': user_data.user_type,
        'organization': user_data.organization,
        'experience_years': user_data.experience_years,
        'age_range': user_data.age_range,
        'gender': user_data.gender,
        'tech_familiarity': user_data.tech_familiarity,
        'streak_count': 1,
        'total_xp': 0,
        'certificates': [],
        'completed_lessons': [],
        'daily_streak': 1,
        'last_login': datetime.now(timezone.utc).isoformat(),
        'profile_picture': None,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    token = create_token(user_id, user_data.email, user_data.role, user_data.name)
    
    return {
        "access_token": token, 
        "token_type": "bearer", 
        "user": user_doc
    }

# --- 2. LOGIN ---
@router.post("/login")
async def login(user_data: UserLogin, request: Request = None):
    ip = request.client.host if request else "unknown"
    check_brute_force(ip)
    
    user = await db.users.find_one({'email': user_data.email})
    
    if not user or not verify_password(user_data.password, user.get('password', '')):
        log_failed_attempt(ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )
    
    token = create_token(user['id'], user['email'], user['role'])
    await db.users.update_one(
        {"id": user['id']},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )

    return {
        "access_token": token, 
        "token_type": "bearer",
        "user": {
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }

# --- 3. GOOGLE SIGN-UP/SIGN-IN ---
@router.post("/google-auth")
async def google_auth(google_request: GoogleTokenRequest, request: Request = None):
    """
    Handle Google OAuth sign-up/sign-in.
    If user exists, logs them in. If not, creates new account.
    """
    ip = request.client.host if request else "unknown"
    check_brute_force(ip)
    
    try:
        # Verify Google token
        idinfo = verify_google_token(google_request.token)
        
        email = idinfo.get('email')
        google_name = idinfo.get('name', 'Google User')
        google_picture = idinfo.get('picture')
        
        if not email:
            raise HTTPException(status_code=400, detail="Google token missing email")
        
        # Check if user exists
        user = await db.users.find_one({'email': email})
        
        if user:
            # User exists - login
            token = create_token(user['id'], user['email'], user['role'], user.get('name', 'Cadet'))
            await db.users.update_one(
                {"id": user['id']},
                {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
            )
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": {
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"]
                },
                "is_new": False
            }
        else:
            # New user - auto-register from Google
            user_id = str(uuid.uuid4())
            
            user_doc = {
                'id': user_id,
                'email': email,
                'password': None,  # No password for Google auth users
                'auth_method': 'google',  # Track auth method
                'google_id': idinfo.get('sub'),
                'previous_passwords': [],
                'name': google_name,
                'role': 'user',
                'user_type': 'individual',
                'organization': '',
                'experience_years': 0,
                'age_range': '',
                'gender': '',
                'tech_familiarity': 'beginner',
                'streak_count': 1,
                'total_xp': 0,
                'certificates': [],
                'completed_lessons': [],
                'daily_streak': 1,
                'last_login': datetime.now(timezone.utc).isoformat(),
                'profile_picture': google_picture,
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            
            await db.users.insert_one(user_doc)
            token = create_token(user_id, email, 'user', google_name)
            
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": {
                    "name": google_name,
                    "email": email,
                    "role": 'user'
                },
                "is_new": True
            }
            
    except HTTPException:
        raise
    except Exception as e:
        log_failed_attempt(ip)
        raise HTTPException(status_code=400, detail=f"Google auth failed: {str(e)}")

# --- 3. PASSWORD RESET (REAL-TIME SIMULATION) ---
@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    user = await db.users.find_one({"email": data.email})
    
    # Simulate email sending even if user not found (Security Best Practice)
    # But for debugging, we check user existence
    if not user:
        # In prod, just return success to avoid user enumeration
        # For dev, we return 404 so frontend shows the specific error
        raise HTTPException(status_code=404, detail="Email not found")
    
    # Generate Token
    reset_payload = {
        "user_id": user["id"],
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "purpose": "password_reset"
    }
    reset_token = jwt.encode(reset_payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    
    # --- SIMULATE EMAIL (PRINT TO CONSOLE) ---
    print("\n" + "="*50)
    print(f"📧 [EMAIL SIMULATION] To: {data.email}")
    print(f"🔑 RECOVERY TOKEN: {reset_token}")
    print("="*50 + "\n")
    
    return {"message": "Recovery token generated (Check Console)."}

@router.post("/reset-password")
async def reset_password(data: ResetPasswordSubmit):
    try:
        payload = jwt.decode(data.token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("purpose") != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid token purpose")
        
        user = await db.users.find_one({"id": payload["user_id"]})
        if not user:
             raise HTTPException(status_code=404, detail="User not found")

        # History Check
        if verify_password(data.new_password, user['password']):
            raise HTTPException(status_code=400, detail="New password cannot be the same as the current password.")

        history = user.get('previous_passwords', [])
        for old_hash in history:
            if verify_password(data.new_password, old_hash):
                raise HTTPException(status_code=400, detail="Password was used recently. Please choose a different one.")

        history.append(user['password'])
        if len(history) > 3: history.pop(0)

        new_hashed = hash_password(data.new_password)
        
        await db.users.update_one(
            {"id": payload["user_id"]}, 
            {
                "$set": {"password": new_hashed, "previous_passwords": history}
            }
        )
        return {"message": "Password updated successfully."}

    except jwt.InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid token")

@router.post("/logout")
async def logout(token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/auth/login"))):
    TOKEN_BLACKLIST.add(token)
    return {"message": "Successfully logged out."}