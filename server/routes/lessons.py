from fastapi import APIRouter, HTTPException, Depends, Query
from core.database import db
from core.config import settings
from core.security import get_current_user
from models.schemas import QuizSubmission
from pydantic import BaseModel
from typing import List
import google.generativeai as genai
import json
import uuid
from datetime import datetime, timezone

router = APIRouter()

# --- SETUP AI ENGINE ---
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")

# --- SCHEMAS ---
class LeaderboardEntry(BaseModel):
    name: str
    total_xp: int
    badge: str
    profile_type: str

class AILessonRequest(BaseModel):
    topic: str
    difficulty: str = "beginner"

# --- 1. LESSON MANAGEMENT ---

@router.get("/", include_in_schema=False)
@router.get("")
async def get_lessons():
    """Retrieves all static curriculum modules from MongoDB."""
    try:
        lessons = await db.lessons.find({}, {'_id': 0}).sort('xp', 1).to_list(100)
        return lessons
    except Exception as e:
        print(f"Error fetching lessons: {e}")
        return []

@router.get("/leaderboard/top", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    limit: int = Query(10, description="Number of top users to fetch"),
    category: str = "overall"
):
    try:
        query = {}
        if category in ["student", "professional"]:
            query["profile_type"] = category

        cursor = db.users.find(query, {"name": 1, "total_xp": 1, "profile_type": 1}).sort([("total_xp", -1), ("_id", 1)]).limit(limit)
        
        leaders = []
        async for user in cursor:
            xp = user.get("total_xp", 0)
            badge = "Cadet"
            if xp >= 500: badge = "Sentinel"
            if xp >= 2000: badge = "Elite"
            if xp >= 5000: badge = "CyberGuardian"
            
            leaders.append({
                "name": user.get("name", "Unknown Agent"),
                "total_xp": xp,
                "badge": badge,
                "profile_type": user.get("profile_type", "student")
            })
            
        return leaders
    except Exception as e:
        print(f"Leaderboard Error: {e}")
        return []

# --- 2. AI QUIZ GENERATION (FIXED PROMPT) ---

@router.post("/{lesson_id}/generate-quiz")
async def generate_dynamic_quiz(lesson_id: str, user=Depends(get_current_user)):
    """
    Generates a quiz. Returns a Fallback Quiz if AI is offline.
    """
    
    # 1. Fetch Current Lesson
    current_lesson = await db.lessons.find_one({"id": lesson_id})
    if not current_lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # 2. SEQUENTIAL LOCK LOGIC (DISABLED FOR TESTING)
    # Uncomment below to re-enable lock
    # ... (Lock logic here) ...

    # 3. GENERATE QUIZ
    try:
        if not settings.GEMINI_API_KEY:
            raise Exception("AI Key not configured") 
        
        # --- UPDATED PROMPT: Forces Normal Sentence Case ---
        prompt = f"""
        Based on this cybersecurity lesson:
        Title: {current_lesson.get('title')}
        Content Snippet: "{current_lesson.get('content', '')[:1500]}"
        
        Generate 5 multiple-choice questions.
        CRITICAL FORMATTING RULES:
        1. Write questions in standard sentence case (e.g., "What is a firewall?").
        2. DO NOT use all capital letters.
        3. Make questions practical and scenario-based.
        
        Return ONLY valid JSON array format. No markdown.
        Example:
        [
          {{"question": "A user receives an email...", "options": ["A", "B", "C", "D"], "correct_answer": 0}},
          ...
        ]
        """
        
        response = model.generate_content(prompt)
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        quiz_data = json.loads(clean_text)
        return quiz_data[:5]

    except Exception as e:
        print(f"⚠️ AI Quiz Gen Error: {e}")
        print("➡️ Serving Fallback Quiz to prevent crash.")
        
        return [
            {"question": "What is the primary goal of the CIA Triad?", "options": ["Confidentiality, Integrity, Availability", "Coding, Intelligence, Algorithms", "Central Intelligence Agency", "Computer Integrated Architecture"], "correct_answer": 0},
            {"question": "Which attack involves overwhelming a server with traffic?", "options": ["Phishing", "DDoS", "SQL Injection", "Man-in-the-Middle"], "correct_answer": 1},
            {"question": "What is the best defense against brute force attacks?", "options": ["Short passwords", "Account Lockout Policies", "Sharing passwords", "Using HTTP"], "correct_answer": 1},
            {"question": "Which protocol is secure?", "options": ["HTTP", "FTP", "Telnet", "HTTPS"], "correct_answer": 3},
            {"question": "What does 'hashing' ensure?", "options": ["Confidentiality", "Integrity", "Availability", "Authorization"], "correct_answer": 1}
        ]

@router.get("/{lesson_id}")
async def get_lesson_detail(lesson_id: str):
    lesson = await db.lessons.find_one({'id': lesson_id}, {'_id': 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")
    return lesson

# --- 3. SUBMISSION & CERTIFICATION LOGIC ---

@router.post("/submit-quiz")
async def submit_quiz(sub: QuizSubmission, user=Depends(get_current_user)):
    lesson = await db.lessons.find_one({'id': sub.quiz_id})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson data missing.")

    passed = True
    percentage = 100
    xp_gained = 100

    credential_hash = None
    if passed:
        credential_hash = f"NEXUS-{uuid.uuid4().hex[:8].upper()}"

    # Update Progress
    await db.user_progress.update_one(
        {'user_id': user['user_id'], 'lesson_id': sub.quiz_id},
        {'$set': {
            'completed': True,
            'score': percentage,
            'xp_gained': xp_gained,
            'credential_hash': credential_hash,
            'updated_at': datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )

    # Update User Stats
    await db.users.update_one(
        {'id': user['user_id']},
        {
            '$inc': {'total_xp': xp_gained},
            '$addToSet': {'completed_lessons': sub.quiz_id}
        }
    )

    # BADGE & CERT LOGIC
    updated_user = await db.users.find_one({'id': user['user_id']})
    completed_count = len(updated_user.get('completed_lessons', []))
    
    new_badge = None
    if completed_count >= 1: new_badge = "Cadet"
    if completed_count >= 3: new_badge = "Sentinel"
    if completed_count >= 5: new_badge = "Elite"
    if completed_count >= 8: new_badge = "CyberGuardian"

    if new_badge:
        await db.users.update_one({'id': user['user_id']}, {'$set': {'role': new_badge}})

    TOTAL_MODULES = 8
    new_certificate = None
    if completed_count >= TOTAL_MODULES:
        pipeline = [
            {'$match': {'user_id': user['user_id'], 'completed': True}},
            {'$group': {'_id': None, 'avg_score': {'$avg': '$score'}}}
        ]
        agg_result = await db.user_progress.aggregate(pipeline).to_list(1)
        if agg_result:
            avg_score = agg_result[0]['avg_score']
            if avg_score >= 80:
                cert_title = "Nexus Certified Operative (Gold)"
                if cert_title not in updated_user.get('certificates', []):
                    await db.users.update_one({'id': user['user_id']}, {'$addToSet': {'certificates': cert_title}})
                    new_certificate = cert_title
            elif avg_score >= 60:
                cert_title = "Nexus Certified Operative (Silver)"
                if cert_title not in updated_user.get('certificates', []):
                      await db.users.update_one({'id': user['user_id']}, {'$addToSet': {'certificates': cert_title}})
                      new_certificate = cert_title

    return {
        "passed": passed,
        "xp_earned": xp_gained,
        "credential_hash": credential_hash,
        "new_badge": new_badge,
        "new_certificate": new_certificate
    }