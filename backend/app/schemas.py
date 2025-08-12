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

# Landing Page Schemas
class LandingPageContentBlock(BaseModel):
    type: str  # text, image, button, form, video, etc.
    content: Dict[str, Any] = Field(default_factory=dict)
    style: Dict[str, Any] = Field(default_factory=dict)
    order: int = 0

class LandingPageCreateRequest(BaseModel):
    qr_id: Optional[str] = None
    slug: str
    title: str
    description: Optional[str] = None
    content: Dict[str, Any] = Field(default_factory=dict)
    theme: str = "default"
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    collect_leads: bool = False
    analytics_enabled: bool = True

class LandingPageUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    theme: Optional[str] = None
    custom_css: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    collect_leads: Optional[bool] = None
    analytics_enabled: Optional[bool] = None
    is_published: Optional[bool] = None

class LandingPageResponse(BaseModel):
    id: str
    qr_id: Optional[str] = None
    slug: str
    title: str
    description: Optional[str] = None
    content: Dict[str, Any] = Field(default_factory=dict)
    theme: str
    custom_css: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_published: bool
    collect_leads: bool
    analytics_enabled: bool
    created_at: datetime
    updated_at: datetime

class LeadCreateRequest(BaseModel):
    landing_page_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    message: Optional[str] = None
    data: Dict[str, Any] = Field(default_factory=dict)

class LeadResponse(BaseModel):
    id: str
    landing_page_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    message: Optional[str] = None
    data: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime