import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

# 1. Setup Test Data
test_student = {
    "name": "Abhijeet Sharma",
    "email": "abhijeet_test@nexus.com",
    "password": "SecurePassword123!",
    "role": "student"
}

def run_curriculum_test():
    print("🚀 Starting CyberSafe Nexus Logic Verification...")

    # --- STEP 1: Registration ---
    print("\n[1/4] Registering new student...")
    reg_resp = requests.post(f"{BASE_URL}/auth/register", json=test_student)
    if reg_resp.status_code not in [201, 400]: # 400 if already exists
        print(f"❌ Registration failed: {reg_resp.text}")
        return
    
    # --- STEP 2: Login to get JWT ---
    print("[2/4] Logging in to retrieve session token...")
    login_resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": test_student["email"],
        "password": test_student["password"]
    })
    token = login_resp.json().get("token")
    headers = {"Authorization": f"Bearer {token}"}

    # --- STEP 3: Fetch Lessons ---
    print("[3/4] Fetching curriculum content...")
    lessons_resp = requests.get(f"{BASE_URL}/lessons/", headers=headers)
    lessons = lessons_resp.json()
    if not lessons:
        print("❌ No lessons found. Did you run seed_mongodb.py?")
        return
    
    lesson_id = lessons[0]['id']
    print(f"   -> Found Lesson: {lessons[0]['title']} (ID: {lesson_id})")

    # --- STEP 4: Submit Quiz (Simulating correct answers) ---
    print("[4/4] Submitting quiz for 'The CIA Triad'...")
    # Based on our seeder: Quiz 1, Q1: Integrity is index 0
    quiz_submission = {
        "quiz_id": lesson_id,
        "answers": [0] 
    }
    
    sub_resp = requests.post(
        f"{BASE_URL}/lessons/submit-quiz", 
        json=quiz_submission, 
        headers=headers
    )
    
    result = sub_resp.json()
    if result.get("passed"):
        print(f"✅ SUCCESS: Quiz Passed with {result['percentage']}%")
        print(f"📊 Progress saved to MongoDB for {test_student['name']}")
    else:
        print(f"⚠️ Quiz Failed: {result}")

    # --- STEP 5: Check Leaderboard ---
    print("\n🏆 Fetching Global Leaderboard...")
    leader_resp = requests.get(f"{BASE_URL}/lessons/leaderboard/top")
    print(json.dumps(leader_resp.json(), indent=2))

if __name__ == "__main__":
    run_curriculum_test()