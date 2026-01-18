# get_token.py
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv() # Load variables from your .env file

# --- IMPORTANT: Change these to your test user's credentials ---
TEST_USER_EMAIL = "teste@user.com"
TEST_USER_PASSWORD = "password123"
# ----------------------------------------------------------------

def get_jwt():
    """Logs in a user and prints their JWT access token."""
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        print("Error: Make sure SUPABASE_URL and SUPABASE_KEY are in your .env file.")
        return

    try:
        supabase = create_client(supabase_url, supabase_key)
        response = supabase.auth.sign_in_with_password({
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        
        access_token = response.session.access_token
        print("\n--- COPY YOUR JWT TOKEN BELOW ---\n")
        print(access_token)
        print("\n---------------------------------\n")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    get_jwt()