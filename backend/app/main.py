from fastapi import FastAPI, Depends, HTTPException, Request, Form, UploadFile, File
from fastapi.responses import RedirectResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from app.deps import get_db
from app.repo import QRCodeRepository
from app.schemas import (
    QRCreateRequest, QRUpdateRequest, QRTargetUpdate, 
    QRCodeResponse, JobStatus, AnalyticsSummary,
    LandingPageCreateRequest, LandingPageUpdateRequest, LandingPageResponse,
    LeadCreateRequest, LeadResponse,
    UserSignUpRequest, UserLoginRequest, UserResponse, AuthResponse, TokenRefreshRequest
)
from app.services.qrcode import QRCodeService
from app.services.redirect import RedirectService
from app.services.bulk import BulkService
from app.services.analytics import AnalyticsService
from app.services.landing import LandingPageService
from app.services.auth import AuthService, verify_token, create_access_token, create_refresh_token
from app.config import settings

app = FastAPI(title="QRCode SaaS API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Security
security = HTTPBearer(auto_error=False)

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[dict]:
    """Get current authenticated user"""
    if not credentials:
        return None
    
    token_data = verify_token(credentials.credentials, "access")
    if not token_data:
        return None
    
    auth_service = AuthService()
    user = auth_service.get_user_by_id(token_data.get("sub"))
    return user

# Auth endpoints
@app.post("/api/auth/signup", response_model=AuthResponse, status_code=201)
async def signup(user_data: UserSignUpRequest):
    auth_service = AuthService()
    
    try:
        user = auth_service.create_user(user_data.email, user_data.password, user_data.name)
        
        # Create tokens
        access_token = create_access_token(data={"sub": user["id"], "email": user["email"]})
        refresh_token = create_refresh_token(data={"sub": user["id"], "email": user["email"]})
        
        return AuthResponse(
            user=UserResponse(**user),
            access_token=access_token,
            refresh_token=refresh_token
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login", response_model=AuthResponse)
async def login(user_data: UserLoginRequest):
    auth_service = AuthService()
    
    user = auth_service.authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create tokens
    access_token = create_access_token(data={"sub": user["id"], "email": user["email"]})
    refresh_token = create_refresh_token(data={"sub": user["id"], "email": user["email"]})
    
    return AuthResponse(
        user=UserResponse(**user),
        access_token=access_token,
        refresh_token=refresh_token
    )

@app.post("/api/auth/refresh", response_model=AuthResponse)
async def refresh_token(token_data: TokenRefreshRequest):
    payload = verify_token(token_data.refresh_token, "refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    auth_service = AuthService()
    user = auth_service.get_user_by_id(payload.get("sub"))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Create new tokens
    access_token = create_access_token(data={"sub": user["id"], "email": user["email"]})
    refresh_token = create_refresh_token(data={"sub": user["id"], "email": user["email"]})
    
    return AuthResponse(
        user=UserResponse(**user),
        access_token=access_token,
        refresh_token=refresh_token
    )

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return UserResponse(**current_user)

# QR Code endpoints
@app.get("/api/qr", response_model=List[QRCodeResponse])
async def list_qr_codes(
    folder: Optional[str] = None,
    type: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = QRCodeRepository(db)
    # Filter by user if authenticated
    user_id = current_user.get("id") if current_user else None
    qrs = repo.list_qrs(folder=folder, qr_type=type, user_id=user_id)
    
    qr_service = QRCodeService()
    results = []
    
    for qr in qrs:
        # Generate download URLs if they don't exist
        download_urls = qr_service.generate_qr_images(qr, ["png", "svg"])
        
        results.append(QRCodeResponse(
            id=qr.id,
            code=qr.code,
            type=qr.type,
            content=qr.content,
            target=qr.target,
            password_protected=bool(qr.password_hash),
            expiry_at=qr.expiry_at,
            download_urls=download_urls,
            name=qr.name,
            folder=qr.folder,
            design=qr.design,
            created_at=qr.created_at
        ))
    
    return results

@app.post("/api/qr", response_model=QRCodeResponse, status_code=201)
async def create_qr_code(
    qr_data: QRCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = QRCodeRepository(db)
    qr_service = QRCodeService()
    
    # Add user_id if authenticated
    if current_user:
        qr_data.user_id = current_user.get("id")
    
    # Create QR code
    qr = repo.create_qr(qr_data)
    
    # Generate images
    download_urls = qr_service.generate_qr_images(qr, [f.value for f in qr_data.formats])
    
    return QRCodeResponse(
        id=qr.id,
        code=qr.code,
        type=qr.type,
        content=qr.content,
        target=qr.target,
        password_protected=bool(qr.password_hash),
        expiry_at=qr.expiry_at,
        download_urls=download_urls,
        name=qr.name,
        folder=qr.folder,
        design=qr.design,
        created_at=qr.created_at
    )

@app.get("/api/qr/{id}", response_model=QRCodeResponse)
async def get_qr_code(
    id: str, 
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = QRCodeRepository(db)
    qr = repo.get_qr_by_id(id)
    
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    
    # Check if user owns this QR code (if authenticated)
    if current_user and qr.user_id != current_user.get("id"):
        raise HTTPException(status_code=403, detail="Access denied")
    
    qr_service = QRCodeService()
    download_urls = qr_service.generate_qr_images(qr, ["png", "svg"])
    
    return QRCodeResponse(
        id=qr.id,
        code=qr.code,
        type=qr.type,
        content=qr.content,
        target=qr.target,
        password_protected=bool(qr.password_hash),
        expiry_at=qr.expiry_at,
        download_urls=download_urls,
        name=qr.name,
        folder=qr.folder,
        design=qr.design,
        created_at=qr.created_at
    )

@app.patch("/api/qr/{id}", response_model=QRCodeResponse)
async def update_qr_code(
    id: str,
    qr_data: QRUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    repo = QRCodeRepository(db)
    
    # Check if QR exists and user owns it
    qr = repo.get_qr_by_id(id)
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    if qr.user_id != current_user.get("id"):
        raise HTTPException(status_code=403, detail="Access denied")
    
    qr = repo.update_qr(id, qr_data)
    
    qr_service = QRCodeService()
    download_urls = qr_service.generate_qr_images(qr, ["png", "svg"])
    
    return QRCodeResponse(
        id=qr.id,
        code=qr.code,
        type=qr.type,
        content=qr.content,
        target=qr.target,
        password_protected=bool(qr.password_hash),
        expiry_at=qr.expiry_at,
        download_urls=download_urls,
        name=qr.name,
        folder=qr.folder,
        design=qr.design,
        created_at=qr.created_at
    )

@app.delete("/api/qr/{id}", status_code=204)
async def delete_qr_code(
    id: str, 
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    repo = QRCodeRepository(db)
    
    # Check if QR exists and user owns it
    qr = repo.get_qr_by_id(id)
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    if qr.user_id != current_user.get("id"):
        raise HTTPException(status_code=403, detail="Access denied")
    
    success = repo.delete_qr(id)
    
    if not success:
        raise HTTPException(status_code=404, detail="QR code not found")

@app.put("/api/qr/{id}/target", response_model=QRCodeResponse)
async def update_qr_target(
    id: str,
    target_data: QRTargetUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    repo = QRCodeRepository(db)
    
    # Check if QR exists and user owns it
    qr = repo.get_qr_by_id(id)
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    if qr.user_id != current_user.get("id"):
        raise HTTPException(status_code=403, detail="Access denied")
    
    qr = repo.update_qr_target(id, target_data)
    
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found or not dynamic")
    
    qr_service = QRCodeService()
    download_urls = qr_service.generate_qr_images(qr, ["png", "svg"])
    
    return QRCodeResponse(
        id=qr.id,
        code=qr.code,
        type=qr.type,
        content=qr.content,
        target=qr.target,
        password_protected=bool(qr.password_hash),
        expiry_at=qr.expiry_at,
        download_urls=download_urls,
        name=qr.name,
        folder=qr.folder,
        design=qr.design,
        created_at=qr.created_at
    )

# Bulk operations
@app.post("/api/qr/bulk", response_model=JobStatus, status_code=202)
async def bulk_create_qr(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    # Read CSV content
    csv_content = await file.read()
    csv_text = csv_content.decode('utf-8')
    
    # Process bulk creation
    repo = QRCodeRepository(db)
    qr_service = QRCodeService()
    bulk_service = BulkService(repo, qr_service)
    
    result = bulk_service.process_bulk_csv(csv_text, user_id=current_user.get("id"))
    
    # For now, return immediate result (in real app, this would be async)
    zip_filename = os.path.basename(result["zip_path"])
    result_url = f"{settings.BASE_URL}/uploads/{zip_filename}"
    
    return JobStatus(
        id="immediate",
        status="done",
        result_url=result_url
    )

# Analytics
@app.get("/api/analytics/qr/{id}/summary", response_model=AnalyticsSummary)
async def get_qr_analytics(
    id: str,
    range: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    repo = QRCodeRepository(db)
    
    # Check if QR exists and user owns it
    qr = repo.get_qr_by_id(id)
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    if qr.user_id != current_user.get("id"):
        raise HTTPException(status_code=403, detail="Access denied")
        
    analytics_service = AnalyticsService(repo)
    
    return analytics_service.get_qr_analytics(id, range)

@app.get("/api/analytics/dashboard", response_model=dict)
async def get_dashboard_analytics(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    repo = QRCodeRepository(db)
    analytics_service = AnalyticsService(repo)
    
    user_id = current_user.get("id")
    
    # Get user's QR codes
    qrs = repo.list_qrs(user_id=user_id)
    
    # Calculate statistics
    total_qrs = len(qrs)
    dynamic_qrs = len([qr for qr in qrs if qr.type == 'dynamic'])
    static_qrs = total_qrs - dynamic_qrs
    
    # Get total scans (simulated for now)
    total_scans = sum([analytics_service.get_qr_scan_count(qr.id) for qr in qrs])
    
    # Get recent scan data for chart
    scan_data = analytics_service.get_recent_scan_data(user_id, days=7)
    
    return {
        "total_qrs": total_qrs,
        "dynamic_qrs": dynamic_qrs, 
        "static_qrs": static_qrs,
        "total_scans": total_scans,
        "monthly_scans": analytics_service.get_monthly_scan_count(user_id),
        "scan_data": scan_data
    }

# Redirect endpoint
@app.get("/r/{code}")
async def redirect_qr(
    code: str,
    request: Request,
    password: Optional[str] = None,
    db: Session = Depends(get_db)
):
    repo = QRCodeRepository(db)
    redirect_service = RedirectService(repo)
    
    return redirect_service.handle_redirect(code, request, password)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Landing Page endpoints
@app.post("/landing-pages", response_model=LandingPageResponse, status_code=201)
async def create_landing_page(
    data: LandingPageCreateRequest,
    db: Session = Depends(get_db)
):
    landing_service = LandingPageService(db)
    
    # Check if slug already exists
    existing = landing_service.get_landing_page_by_slug(data.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    landing_page = landing_service.create_landing_page(data)
    return LandingPageResponse.model_validate(landing_page.__dict__)

@app.get("/landing-pages", response_model=List[LandingPageResponse])
async def list_landing_pages(
    qr_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    landing_service = LandingPageService(db)
    pages = landing_service.list_landing_pages(qr_id=qr_id)
    return [LandingPageResponse.model_validate(page.__dict__) for page in pages]

@app.get("/landing-pages/{page_id}", response_model=LandingPageResponse)
async def get_landing_page(page_id: str, db: Session = Depends(get_db)):
    landing_service = LandingPageService(db)
    page = landing_service.get_landing_page_by_id(page_id)
    
    if not page:
        raise HTTPException(status_code=404, detail="Landing page not found")
    
    return LandingPageResponse.model_validate(page.__dict__)

@app.put("/landing-pages/{page_id}", response_model=LandingPageResponse)
async def update_landing_page(
    page_id: str,
    data: LandingPageUpdateRequest,
    db: Session = Depends(get_db)
):
    landing_service = LandingPageService(db)
    page = landing_service.update_landing_page(page_id, data)
    
    if not page:
        raise HTTPException(status_code=404, detail="Landing page not found")
    
    return LandingPageResponse.model_validate(page.__dict__)

@app.delete("/landing-pages/{page_id}", status_code=204)
async def delete_landing_page(page_id: str, db: Session = Depends(get_db)):
    landing_service = LandingPageService(db)
    success = landing_service.delete_landing_page(page_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Landing page not found")

@app.get("/l/{slug}", response_class=HTMLResponse)
async def view_landing_page(slug: str, db: Session = Depends(get_db)):
    """Serve the landing page by slug"""
    landing_service = LandingPageService(db)
    page = landing_service.get_landing_page_by_slug(slug)
    
    if not page or not page.is_published:
        raise HTTPException(status_code=404, detail="Landing page not found")
    
    html_content = landing_service.render_landing_page(page)
    return HTMLResponse(content=html_content)

@app.post("/leads", response_model=LeadResponse, status_code=201)
async def create_lead(
    data: LeadCreateRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    landing_service = LandingPageService(db)
    
    # Get client IP and user agent
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "")
    
    lead = landing_service.create_lead(data, client_ip, user_agent)
    return LeadResponse.model_validate(lead.__dict__)

@app.get("/landing-pages/{page_id}/leads", response_model=List[LeadResponse])
async def get_landing_page_leads(page_id: str, db: Session = Depends(get_db)):
    landing_service = LandingPageService(db)
    leads = landing_service.get_leads_for_page(page_id)
    return [LeadResponse.model_validate(lead.__dict__) for lead in leads]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)