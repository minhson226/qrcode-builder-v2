from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Integer, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from app.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class QRCode(Base):
    __tablename__ = "qr_codes"
    
    id = Column(String, primary_key=True)
    code = Column(String, unique=True, index=True)
    type = Column(String)  # "static" or "dynamic"
    name = Column(String)
    folder = Column(String)
    content = Column(Text, nullable=True)  # For static QR
    target = Column(String, nullable=True)  # For dynamic QR
    password_hash = Column(String, nullable=True)
    expiry_at = Column(DateTime, nullable=True)
    design = Column(JSON, default={})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class LandingPage(Base):
    __tablename__ = "landing_pages"
    
    id = Column(String, primary_key=True)
    qr_id = Column(String, index=True)  # Associated QR code
    slug = Column(String, unique=True, index=True)  # URL-friendly identifier
    title = Column(String)
    description = Column(Text, nullable=True)
    
    # Page content as JSON
    content = Column(JSON, default={})  # Structured content
    
    # Design settings
    theme = Column(String, default="default")  # Theme name
    custom_css = Column(Text, nullable=True)
    
    # SEO settings
    meta_title = Column(String, nullable=True)
    meta_description = Column(String, nullable=True)
    
    # Settings
    is_published = Column(Boolean, default=True)
    collect_leads = Column(Boolean, default=False)
    analytics_enabled = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(String, primary_key=True)
    landing_page_id = Column(String, index=True)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    message = Column(Text, nullable=True)
    data = Column(JSON, default={})  # Additional form data
    ip_hash = Column(String)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Scan(Base):
    __tablename__ = "scans"
    
    id = Column(String, primary_key=True)
    qr_id = Column(String, index=True)
    happened_at = Column(DateTime, default=datetime.utcnow)
    ip_hash = Column(String)
    country = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    device = Column(String, nullable=True)

class RateLimit(Base):
    __tablename__ = "rate_limits"
    
    id = Column(String, primary_key=True)
    ip_hash = Column(String, index=True)
    qr_code = Column(String, index=True)
    attempts = Column(Integer, default=1)
    window_start = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)