from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import secrets

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    """Create a JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str, token_type: str = "access") -> Optional[dict]:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != token_type:
            return None
        return payload
    except JWTError:
        return None

def generate_user_id() -> str:
    """Generate a unique user ID"""
    return secrets.token_urlsafe(16)

# Demo user for testing - in production this would be in database
DEMO_USERS = {
    "demo@example.com": {
        "id": "demo-user-123",
        "email": "demo@example.com",
        "name": "Demo User",
        "password_hash": hash_password("demo123"),
        "is_active": True,
        "created_at": datetime.utcnow()
    }
}

class AuthService:
    def __init__(self):
        pass
    
    def authenticate_user(self, email: str, password: str) -> Optional[dict]:
        """Authenticate a user with email and password"""
        user = DEMO_USERS.get(email)
        if not user:
            return None
        
        if not verify_password(password, user["password_hash"]):
            return None
        
        # Return user without password hash
        return {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "is_active": user["is_active"],
            "created_at": user["created_at"]
        }
    
    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Get user by ID"""
        for user in DEMO_USERS.values():
            if user["id"] == user_id:
                return {
                    "id": user["id"],
                    "email": user["email"],
                    "name": user["name"],
                    "is_active": user["is_active"],
                    "created_at": user["created_at"]
                }
        return None
    
    def create_user(self, email: str, password: str, name: str) -> dict:
        """Create a new user (demo implementation)"""
        if email in DEMO_USERS:
            raise ValueError("User already exists")
        
        user_id = generate_user_id()
        user_data = {
            "id": user_id,
            "email": email,
            "name": name,
            "password_hash": hash_password(password),
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        
        DEMO_USERS[email] = user_data
        
        # Return user without password hash
        return {
            "id": user_data["id"],
            "email": user_data["email"],
            "name": user_data["name"],
            "is_active": user_data["is_active"],
            "created_at": user_data["created_at"]
        }