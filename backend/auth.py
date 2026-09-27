from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import os
from dotenv import load_dotenv

# Configure bcrypt as the hashing algorithm for passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hashes a plain password so it can be stored safely in the database."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks whether a plain password matches a stored hash."""
    return pwd_context.verify(plain_password, hashed_password)

# Load environment variables from the .env file (e.g. SECRET_KEY)
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"  # algorithm used to sign the JWT tokens
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # how long a token stays valid before it expires

def create_access_token(data: dict):
    """
    Creates a new JWT token.
    Takes some data (e.g. {"sub": username}), adds an expiration time,
    and returns the encoded token.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    """
    Verifies a JWT token (checks it hasn't expired or been tampered with).
    Returns the username if valid, or None if invalid/expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        return None