from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import List, Optional, Any
import re

# --- 1. SHARED & AUTH MODELS ---

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None # Added role for JWT decoding

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordSubmit(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if not re.search(r'[A-Z]', v): raise ValueError("Must contain uppercase")
        if not re.search(r'[a-z]', v): raise ValueError("Must contain lowercase")
        if not re.search(r'[0-9]', v): raise ValueError("Must contain number")
        if not re.search(r'[!@#$%^&*()]', v): raise ValueError("Must contain special character")
        return v

# --- 2. USER CREATION ---

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str
    role: str = "Cadet" # Updated default to match gamification
    user_type: str = "university"
    organization: Optional[str] = "Mumbai University"
    experience_years: Optional[int] = 0
    age_range: Optional[str] = "18-24"
    gender: Optional[str] = "prefer_not_to_say"
    tech_familiarity: str = "intermediate"

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if not re.search(r'[A-Z]', v): raise ValueError("Must contain uppercase")
        if not re.search(r'[a-z]', v): raise ValueError("Must contain lowercase")
        if not re.search(r'[0-9]', v): raise ValueError("Must contain number")
        if not re.search(r'[!@#$%^&*()]', v): raise ValueError("Must contain special character")
        return v

# --- 3. USER UPDATES (Profile Editing) ---

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    organization: Optional[str] = None
    # Password required to confirm sensitive changes
    password: Optional[str] = None 
    
    # Optional extras
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    tech_familiarity: Optional[str] = None

# --- 4. USER PROFILE MODELS ---

class User(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: str
    email: str
    name: str
    role: str
    user_type: str = "student"
    organization: Optional[str] = None
    tech_familiarity: str = "intermediate"
    profile_picture: Optional[str] = None
    
    # Gamification
    total_xp: int = 0
    streak_count: int = 0
    certificates: List[str] = []
    completed_lessons: List[str] = [] # Changed to List[str] IDs for simpler profile views
    daily_streak: int = 0
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

# --- 5. CURRICULUM & PROGRESS MODELS ---

class QuizSubmission(BaseModel):
    quiz_id: str
    answers: List[int]

class LessonProgress(BaseModel):
    lesson_id: str
    title: str
    completed: bool
    score: int
    total: int
    credential_hash: Optional[str] = None

class UserProfileResponse(BaseModel):
    user: User
    total_xp: int
    completed_lessons: List[LessonProgress] # Detailed progress list
    certificates: List[str]
    profile_completeness: int
    daily_streak: int

# --- 6. LEADERBOARD & AI MODELS (NEW) ---

class LeaderboardEntry(BaseModel):
    name: str
    total_xp: int
    badge: str
    profile_type: str

class AILessonRequest(BaseModel):
    topic: str
    difficulty: str = "beginner"

class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = None