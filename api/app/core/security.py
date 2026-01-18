import jwt
import requests
from functools import lru_cache
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.core.config import get_settings, Settings

#oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
security_scheme = HTTPBearer()

class User(BaseModel):
    id: str
    email: str

@lru_cache()
def get_jwks_client(jwks_url: str):
    return jwt.PyJWKClient(jwks_url)

#def get_current_user(token: str = Depends(oauth2_scheme), settings: Settings = Depends(get_settings)) -> User:
def get_current_user(
    authorization: HTTPAuthorizationCredentials = Depends(security_scheme),
    settings: Settings = Depends(get_settings)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = authorization.credentials
    
    # Construct the JWKS URL for your Supabase project
    jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    jwks_client = get_jwks_client(jwks_url)

    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"], # Supabase ECC (P-256) uses the ES256 algorithm
            audience="authenticated",
            options={"verify_exp": True},
        )
        
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        if user_id is None or email is None:
            raise credentials_exception
    
    except jwt.PyJWTError as e:
        # Catch any JWT-related error (expired, invalid signature, etc.)
        raise credentials_exception from e
    
    return User(id=user_id, email=email)