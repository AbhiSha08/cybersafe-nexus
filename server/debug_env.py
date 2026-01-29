import os
import sys

# 1. Try to load dotenv
try:
    from dotenv import load_dotenv
    print("✅ Library 'python-dotenv' is installed.")
except ImportError:
    print("❌ CRITICAL: 'python-dotenv' is NOT installed.")
    sys.exit(1)

# 2. Load .env
load_dotenv()
key = os.getenv("GEMINI_API_KEY")

# 3. Check Key
if not key:
    print("❌ CRITICAL: GEMINI_API_KEY not found in .env")
    sys.exit(1)

print(f"✅ Loaded Key: {key[:5]}...{key[-3:]}")
print(f"   Key Length: {len(key)} characters")

# 4. Test Connection
print("\n📡 Testing Google Gemini Connection...")
try:
    import google.generativeai as genai
    genai.configure(api_key=key)
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Reply with the word 'Success'")
    print(f"🎉 RESPONSE RECEIVED: {response.text}")
except Exception as e:
    print(f"❌ CONNECTION FAILED: {e}")