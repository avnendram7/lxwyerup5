
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

def check_keys():
    # Load .env from backend directory
    backend_env = Path(__file__).parent / 'backend' / '.env'
    if backend_env.exists():
        print(f"Loading .env from {backend_env}")
        load_dotenv(backend_env)
    else:
        print(f"WARNING: .env file not found at {backend_env}")

    required_keys = [
        "MONGO_URL",
        "DB_NAME",
        "JWT_SECRET",
        "ADMIN_EMAIL",
        "ADMIN_PASSWORD"
    ]

    optional_keys = [
        "EMERGENT_LLM_KEY",
        "GOOGLE_CLIENT_ID",
        "OPENAI_API_KEY"
    ]

    missing_required = []
    
    print("\n--- Checking Required Keys ---")
    for key in required_keys:
        value = os.environ.get(key)
        if not value:
            print(f"❌ {key} is MISSING")
            missing_required.append(key)
        else:
            print(f"✅ {key} is set")

    print("\n--- Checking Optional/API Keys ---")
    for key in optional_keys:
        value = os.environ.get(key)
        if not value:
            print(f"⚠️  {key} is MISSING (Might be needed for AI/Auth features)")
        else:
            masked = value[:4] + "..." + value[-4:] if len(value) > 8 else "****"
            print(f"✅ {key} is set ({masked})")

    if missing_required:
        print("\n❌ CRITICAL: Missing required environment variables. Backend may not start correctly.")
        sys.exit(1)
    
    print("\n✅ All required keys are present.")
    return True

if __name__ == "__main__":
    check_keys()
