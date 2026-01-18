from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import get_settings
from app.core.security import get_current_user, User
from app.modules.finance import router as finance_router
from app.modules.vehicles import router as vehicles_router

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)
settings = get_settings()

app = FastAPI(title="Rocha Negra API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(',')]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include module routers
app.include_router(finance_router.router, prefix="/api/v1/finance", tags=["Finance"])
app.include_router(vehicles_router.router, prefix="/api/v1/vehicles", tags=["Vehicles"])

@app.get("/", tags=["Health Check"])
@limiter.limit("10/minute")
def read_root(request: Request):
    return {"status": "ok", "app_name": "Rocha Negra API"}

@app.get("/me", response_model=User, tags=["Users"])
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Fetch the profile of the currently authenticated user.
    This is a test endpoint for authentication.
    """
    return current_user