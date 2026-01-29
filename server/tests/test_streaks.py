import asyncio
import motor.motor_asyncio
from datetime import datetime, timezone, timedelta
from core.database import db
import requests

# This test requires the server (main.py) to be running
BASE_URL = "http://127.0.0.1:8000/api"

async def simulate_streak_progression():
    print("🔥 Starting CyberSafe Nexus Streak Simulator...")
    
    # 1. Setup: Use a dedicated test account
    test_email = "streak_tester@nexus.com"
    test_pass = "SecurePass123!"
    
    # Cleanup old test data
    await db.users.delete_one({"email": test_email})
    
    # Register the user
    print("\n[Step 1] Registering test user (Initial Streak: 1)...")
    reg_data = {
        "name": "Streak Tester",
        "email": test_email,
        "password": test_pass,
        "role": "student",
        "user_type": "college"
    }
    requests.post(f"{BASE_URL}/auth/register", json=reg_data)

    # Login to get Token
    login_resp = requests.post(f"{BASE_URL}/auth/login", json={"email": test_email, "password": test_pass})
    token = login_resp.json().get("token")
    headers = {"Authorization": f"Bearer {token}"}

    # --- SIMULATION 1: DAY 2 (INCREASE) ---
    print("\n[Step 2] Simulating Day 2 Login (Rewinding database timestamp by 24 hours)...")
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    await db.users.update_one({"email": test_email}, {"$set": {"last_login": yesterday.isoformat()}})
    
    # Trigger the profile route (which calculates streaks)
    prof_resp = requests.get(f"{BASE_URL}/profile/me", headers=headers)
    new_streak = prof_resp.json().get("daily_streak")
    print(f"   -> Current Streak: {new_streak} (Expected: 2)")

    # --- SIMULATION 2: DAY 4 (RESET) ---
    print("\n[Step 3] Simulating Missed Days (Rewinding database timestamp by 72 hours)...")
    three_days_ago = datetime.now(timezone.utc) - timedelta(days=3)
    await db.users.update_one({"email": test_email}, {"$set": {"last_login": three_days_ago.isoformat()}})
    
    prof_resp = requests.get(f"{BASE_URL}/profile/me", headers=headers)
    reset_streak = prof_resp.json().get("daily_streak")
    print(f"   -> Current Streak: {reset_streak} (Expected: 1 - Reset due to inactivity)")

    if new_streak == 2 and reset_streak == 1:
        print("\n✅ VERIFIED: Streak logic is 100% accurate and database-synchronized.")
    else:
        print("\n❌ ERROR: Streak calculation mismatch.")

if __name__ == "__main__":
    # We use asyncio.run to interact with the database directly for the "rewind"
    asyncio.run(simulate_streak_progression())