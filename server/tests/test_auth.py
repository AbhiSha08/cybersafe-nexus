import requests
import json
import time

# Standard port for your FastAPI server
BASE_URL = "http://127.0.0.1:8000/api/auth"

# This test user includes all the robust parameters we added
test_user = {
    "name": "Abhijeet Sharma",
    "email": "abhijeet_nexus_demo@example.com",
    "password": "SecurePassword123!",
    "role": "student",
    "user_type": "university",  # Captures academic level
    "organization": "Mumbai University",
    "experience_years": 0,
    "age_range": "18-25",
    "gender": "male",
    "tech_familiarity": "intermediate"
}

def run_security_suite():
    print("🚀 Starting Nexus Enhanced Identity & Recovery Suite...")

    # --- STEP 1: Registration ---
    print("\n[1/4] Testing Robust User Registration...")
    reg_resp = requests.post(f"{BASE_URL}/register", json=test_user)
    if reg_resp.status_code in [201, 400]:
        print(f"✅ Registration Phase Passed (Status: {reg_resp.status_code})")
    else:
        print(f"❌ Registration Failed: {reg_resp.text}")
        return

    # --- STEP 2: Forgot Password Request ---
    print("\n[2/4] Requesting Password Reset...")
    forgot_resp = requests.post(f"{BASE_URL}/forgot-password", json={"email": test_user["email"]})
    print(f"Response: {forgot_resp.json().get('message')}")
    
    # MANUAL ACTION REQUIRED FOR TEST:
    # Since we don't have a real SMTP server, copy the token from your terminal/console.
    print("\n⚠️ ACTION REQUIRED: Copy the Reset Token from your SERVER TERMINAL.")
    reset_token = input("Paste the Reset Token here: ").strip()

    # --- STEP 3: Reset Password (Updating to a new secure password) ---
    print("\n[3/4] Submitting New Password...")
    new_password = "UpdatedSecure789!"
    reset_payload = {
        "token": reset_token,
        "new_password": new_password
    }
    
    reset_resp = requests.post(f"{BASE_URL}/reset-password", json=reset_payload)
    if reset_resp.status_code == 200:
        print("✅ Password Reset Successful!")
    else:
        print(f"❌ Reset Failed: {reset_resp.json()}")
        return

    # --- STEP 4: Login with New Password ---
    print("\n[4/4] Verifying Login with UPDATED Credentials...")
    login_data = {
        "email": test_user["email"],
        "password": new_password # Testing the new one
    }
    login_resp = requests.post(f"{BASE_URL}/login", json=login_data)
    
    if login_resp.status_code == 200:
        print("✅ Final Verification Passed: System is secure and operational!")
        token = login_resp.json().get("token")
        print(f"New JWT Generated: {token[:20]}...")
    else:
        print(f"❌ Login Failed with new password: {login_resp.json()}")

if __name__ == "__main__":
    run_security_suite()