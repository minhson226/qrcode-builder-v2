from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from datetime import datetime
from enum import Enum

class QRType(str, Enum):
    static = "static"
    dynamic = "dynamic"

class QRFormat(str, Enum):
    png = "png"
    svg = "svg"
    pdf = "pdf"

class QRCreateRequest(BaseModel):
    type: QRType
    content: Optional[str] = None  # for static
    target: Optional[str] = None   # for dynamic
    name: Optional[str] = None
    folder: Optional[str] = None
    design: Optional[Dict[str, Any]] = Field(default_factory=dict)
    formats: List[QRFormat] = Field(default=[QRFormat.png])

class QRUpdateRequest(BaseModel):
    name: Optional[str] = None
    folder: Optional[str] = None
    design: Optional[Dict[str, Any]] = None

class QRTargetUpdate(BaseModel):
    target: Optional[str] = None
    password: Optional[str] = None
    expiry_at: Optional[datetime] = None

class QRCodeResponse(BaseModel):
    id: str
    code: str
    type: str
    content: Optional[str] = None
    target: Optional[str] = None
    password_protected: bool = False
    expiry_at: Optional[datetime] = None
    download_urls: Dict[str, str] = Field(default_factory=dict)
    name: Optional[str] = None
    folder: Optional[str] = None
    design: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

class JobStatus(BaseModel):
    id: str
    status: str  # queued, running, done, failed
    result_url: Optional[str] = None
    error: Optional[str] = None

class AnalyticsSummary(BaseModel):
    total_scans: int
    unique_scans: int
    by_day: List[Dict[str, Any]] = Field(default_factory=list)
    top_countries: List[Dict[str, Any]] = Field(default_factory=list)

class ScanEvent(BaseModel):
    qr_id: str
    ip_hash: str
    country: Optional[str] = None
    user_agent: Optional[str] = None
    device: Optional[str] = None