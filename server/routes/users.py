from fastapi import APIRouter, Depends, HTTPException, Body, status
from core.security import get_current_user, verify_password
from core.database import db
from models.schemas import UserProfileResponse, User, LessonProgress, UserUpdate
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import List

router = APIRouter()

class ProfileTypeUpdate(BaseModel):
    profile_type: str 

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(user_payload=Depends(get_current_user)):
    """
    Retrieves full profile, calculates streaks, and aggregates gamification data.
    """
    user_id = user_payload['user_id']
    user_doc = await db.users.find_one({'id': user_id}, {'_id': 0})
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User node not found in Nexus.")

    # --- 1. ELITE STATUS CHECK (Leaderboard Top 3) ---
    top_3_cursor = db.user_progress.aggregate([
        {"$group": {"_id": "$user_id", "total_xp": {"$sum": "$xp_gained"}}},
        {"$sort": {"total_xp": -1}},
        {"$limit": 3}
    ])
    top_3_ids = [doc['_id'] async for doc in top_3_cursor]
    is_elite = user_id in top_3_ids

    # --- 2. STREAK MAINTENANCE ---
    now = datetime.now(timezone.utc)
    last_login_str = user_doc.get('last_login')
    streak = user_doc.get('streak_count', 1)

    if last_login_str:
        try:
            # Handle ISO format parsing
            if isinstance(last_login_str, str):
                last_login = datetime.fromisoformat(last_login_str.replace('Z', '+00:00'))
            else:
                last_login = last_login_str

            delta = (now.date() - last_login.date()).days
            
            if delta == 1: 
                streak += 1
            elif delta > 1: 
                streak = 1 # Reset streak
        except Exception:
            pass 

    # Update streak/login in background
    await db.users.update_one(
        {'id': user_id},
        {'$set': {'streak_count': streak, 'last_login': now.isoformat()}}
    )

    # --- 3. PROGRESS AGGREGATION ---
    progress_cursor = db.user_progress.find({'user_id': user_id})
    progress_list = await progress_cursor.to_list(length=100)
    
    completed_lessons = []
    total_xp = 0
    
    for item in progress_list:
        total_xp += item.get('xp_gained', 0)
        lesson = await db.lessons.find_one({'id': item['lesson_id']})
        if lesson:
            completed_lessons.append(LessonProgress(
                lesson_id=item['lesson_id'], 
                title=lesson.get('title', 'Unknown Module'),
                completed=item.get('completed', False), 
                score=item.get('quiz_score', 0), 
                total=item.get('quiz_total', 0),
                credential_hash=item.get('credential_hash')
            ))

    # --- 4. CERTIFICATE GENERATION ---
    certs = ["Nexus Rookie"]
    if is_elite: certs.append("Elite Nexus")
    if user_doc.get("role") == "admin": certs.append("System Administrator")
    if len(completed_lessons) >= 5: certs.append("Security Scholar")
    
    db_certs = user_doc.get("certificates", [])
    if isinstance(db_certs, list):
        certs.extend(db_certs)
    
    unique_certs = list(dict.fromkeys(certs))
    
    # Calculate Profile Completeness
    fields = ['organization', 'gender', 'profile_picture']
    completeness = int((sum(1 for f in fields if user_doc.get(f)) / len(fields)) * 100)

    user_doc['streak_count'] = streak
    
    return UserProfileResponse(
        user=User(**user_doc),
        total_xp=total_xp,
        completed_lessons=completed_lessons,
        certificates=unique_certs,
        profile_completeness=completeness,
        daily_streak=streak
    )

@router.post("/update-type")
async def toggle_profile_type(data: ProfileTypeUpdate, user_payload=Depends(get_current_user)):
    """
    Switches user role between 'Student' and 'Professional' mode.
    """
    if data.profile_type not in ["student", "professional"]:
        raise HTTPException(status_code=400, detail="Invalid identity protocol.")

    await db.users.update_one(
        {'id': user_payload['user_id']},
        {'$set': {'profile_type': data.profile_type}}
    )
    return {"status": "Identity Updated", "profile_type": data.profile_type}

# --- SECURE UPDATE ENDPOINT ---
@router.put("/update", response_model=User)
async def update_profile(update_data: UserUpdate, user_payload=Depends(get_current_user)):
    """
    Updates profile details securely. Requires password for verification.
    """
    user_id = user_payload['user_id']
    
    # 1. Fetch current user (need password hash)
    current_user = await db.users.find_one({'id': user_id})
    if not current_user:
        raise HTTPException(status_code=404, detail="User node lost.")

    # 2. Verify Password (SECURITY CHECK)
    if not update_data.password:
        raise HTTPException(status_code=400, detail="Password required to authorize changes.")
        
    if not verify_password(update_data.password, current_user['password']):
        raise HTTPException(status_code=403, detail="Access Denied: Invalid Password.")

    # 3. Prepare Update Dict
    # Exclude password so it isn't overwritten by the plain text verification password
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None and k != 'password'}

    # 4. Check Email Uniqueness (if email is changing)
    if 'email' in update_dict and update_dict['email'] != current_user['email']:
        existing = await db.users.find_one({'email': update_dict['email']})
        if existing:
            raise HTTPException(status_code=400, detail="Email address already registered.")

    if not update_dict:
        raise HTTPException(status_code=400, detail="No valid intel provided for update.")

    # 5. Execute Update
    updated_user = await db.users.find_one_and_update(
        {'id': user_id},
        {'$set': update_dict},
        return_document=True
    )
    
    return User(**updated_user)