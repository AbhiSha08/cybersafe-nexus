# server/services/curriculum.py
from services.security_tools import fetch_wiki_intel, cyber_ai_query
from core.database import db
import json

async def get_or_generate_lesson(lesson_id: str):
    """
    Logic: 
    1. Check if lesson exists in MongoDB.
    2. If not, fetch from Wikipedia.
    3. Use AI to format content and generate a quiz.
    """
    # Try local DB first
    lesson = await db.lessons.find_one({"id": lesson_id})
    if lesson:
        return lesson

    # Step 1: Fetch from Wikipedia
    wiki_intel = await fetch_wiki_intel(lesson_id)
    if not wiki_intel:
        return None

    # Step 2: Request AI to build the Quiz and format the content
    # Note: We ask for JSON format specifically
    ai_prompt = f"""
    Create a cybersecurity lesson module based on this text: {wiki_intel['summary']}.
    Format it as a JSON object with:
    - 'content': Enhanced markdown version of the text.
    - 'quiz': A list of 5 multiple-choice questions with 'question', 'options', and 'correct_answer' (0-3).
    """
    
    raw_ai_response = await cyber_ai_query(ai_prompt, context="Curriculum Engine", is_json=True)
    
    try:
        structured_data = json.loads(raw_ai_response)
        
        # Step 3: Construct the final document
        new_lesson = {
            "id": lesson_id,
            "title": wiki_intel["title"],
            "category": "On-Demand Intelligence",
            "content": structured_data.get("content", wiki_intel["summary"]),
            "quiz": structured_data.get("quiz", [])
        }

        # Step 4: Cache in DB for future use
        await db.lessons.insert_one(new_lesson)
        return new_lesson
    except Exception as e:
        print(f"Curriculum Generation Error: {e}")
        return None