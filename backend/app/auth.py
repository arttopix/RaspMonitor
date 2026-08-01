import os
import time
import jwt
from dotenv import load_dotenv

# Load environment variables from .env file if available
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "raspmonitor_secret_key_rpi4_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS = 86400 * 7  # 7 days

DEFAULT_USERNAME = os.getenv("ADMIN_USER", "admin")
DEFAULT_PASSWORD = os.getenv("ADMIN_PASS", "admin")

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = time.time() + ACCESS_TOKEN_EXPIRE_SECONDS
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> bool:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return False
        return True
    except jwt.PyJWTError:
        return False
