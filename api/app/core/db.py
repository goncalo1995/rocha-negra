from supabase import create_client, Client
from app.core.config import get_settings

settings = get_settings()

# We use the service_role key here for server-side operations
# RLS policies will still protect the data
supabase_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def get_db_client() -> Client:
    return supabase_client