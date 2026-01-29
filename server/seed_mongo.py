import asyncio
from datetime import datetime, timezone
from core.config import settings
from core.database import db # Reusing our central DB instance

# Your curriculum data remains the same for functionality
lessons_data = [
    {
        "id": "1", "tier": "beginner", "title": "The CIA Triad", "category": "Fundamentals",
        "duration": 10, "order": 1, "content": "Confidentiality, Integrity, Availability.",
        "quiz": [{"question": "What does 'I' stand for?", "options": ["Integrity", "Identity"], "correct_answer": 0}]
    },
    {
        "id": "2", "tier": "beginner", "title": "Strong Passwords", "category": "Defense",
        "duration": 15, "order": 2, "content": "Length > Complexity.",
        "quiz": [{"question": "Best password?", "options": ["123456", "correct-horse-battery"], "correct_answer": 1}]
    },
    {
        "id": "11", "tier": "intermediate", "title": "Phishing Analysis", "category": "Social Engineering",
        "duration": 25, "order": 11, "content": "Check the URL. Don't click.",
        "quiz": [{"question": "Safe to click?", "options": ["No", "Yes"], "correct_answer": 0}]
    },
    {
        "id": "21", "tier": "advanced", "title": "SQL Injection", "category": "Web Hacking",
        "duration": 40, "order": 21, "content": "' OR 1=1; -- Data exfiltration.",
        "quiz": [{"question": "SQLi targets what?", "options": ["Database", "Firewall"], "correct_answer": 0}]
    }
]

async def seed():
    print("🌱 Nexus Seeder: Connecting to DB...")
    
    # Cleaning old data to prevent duplicates during testing
    await db.lessons.delete_many({})
    await db.quizzes.delete_many({})

    print("🚀 Seeding new CyberSafe Nexus curriculum...")
    for l in lessons_data:
        # Insert Lesson
        await db.lessons.insert_one({
            "id": l["id"], "title": l["title"], "category": l["category"],
            "content": l["content"], "duration": l["duration"],
            "order": l["order"], "tier": l["tier"],
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        # Insert Quiz linked to the lesson
        if "quiz" in l:
            await db.quizzes.insert_one({
                "id": f"quiz_{l['id']}",
                "lesson_id": l["id"],
                "questions": l["quiz"]
            })
        print(f"   -> Added: {l['title']}")

    print("✨ CyberSafe Nexus Database Seeding Complete!")

if __name__ == "__main__":
    asyncio.run(seed())