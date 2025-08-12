from decouple import config
import os

class Settings:
    # Database
    DATABASE_URL: str = config("DATABASE_URL", default="sqlite:///./qrcode_saas.db")
    
    # Security
    SECRET_KEY: str = config("SECRET_KEY", default="your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # QR Code settings
    BASE_URL: str = config("BASE_URL", default="http://localhost:8000")
    QR_CODE_SIZE: int = 10
    QR_CODE_BORDER: int = 4
    
    # Rate limiting
    RATE_LIMIT_ATTEMPTS: int = 5
    RATE_LIMIT_WINDOW_MINUTES: int = 1
    
    # File storage
    UPLOAD_DIR: str = config("UPLOAD_DIR", default="./uploads")
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    def __init__(self):
        os.makedirs(self.UPLOAD_DIR, exist_ok=True)

settings = Settings()