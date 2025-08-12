from fastapi import FastAPI, Depends, HTTPException, Request, Form, UploadFile, File
from fastapi.responses import RedirectResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from app.deps import get_db
from app.repo import QRCodeRepository
from app.schemas import (
    QRCreateRequest, QRUpdateRequest, QRTargetUpdate, 
    QRCodeResponse, JobStatus, AnalyticsSummary,
    LandingPageCreateRequest, LandingPageUpdateRequest, LandingPageResponse,
    LeadCreateRequest, LeadResponse
)
from app.services.qrcode import QRCodeService
from app.services.redirect import RedirectService
from app.services.bulk import BulkService
from app.services.analytics import AnalyticsService
from app.services.landing import LandingPageService
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

# QR Code endpoints
@app.get("/qr", response_model=List[QRCodeResponse])
async def list_qr_codes(
    folder: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    repo = QRCodeRepository(db)
    qrs = repo.list_qrs(folder=folder, qr_type=type)
    
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

@app.post("/qr", response_model=QRCodeResponse, status_code=201)
async def create_qr_code(
    qr_data: QRCreateRequest,
    db: Session = Depends(get_db)
):
    repo = QRCodeRepository(db)
    qr_service = QRCodeService()
    
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

@app.get("/qr/{id}", response_model=QRCodeResponse)
async def get_qr_code(id: str, db: Session = Depends(get_db)):
    repo = QRCodeRepository(db)
    qr = repo.get_qr_by_id(id)
    
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    
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

@app.patch("/qr/{id}", response_model=QRCodeResponse)
async def update_qr_code(
    id: str,
    qr_data: QRUpdateRequest,
    db: Session = Depends(get_db)
):
    repo = QRCodeRepository(db)
    qr = repo.update_qr(id, qr_data)
    
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    
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

@app.delete("/qr/{id}", status_code=204)
async def delete_qr_code(id: str, db: Session = Depends(get_db)):
    repo = QRCodeRepository(db)
    success = repo.delete_qr(id)
    
    if not success:
        raise HTTPException(status_code=404, detail="QR code not found")

@app.put("/qr/{id}/target", response_model=QRCodeResponse)
async def update_qr_target(
    id: str,
    target_data: QRTargetUpdate,
    db: Session = Depends(get_db)
):
    repo = QRCodeRepository(db)
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
@app.post("/qr/bulk", response_model=JobStatus, status_code=202)
async def bulk_create_qr(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    # Read CSV content
    csv_content = await file.read()
    csv_text = csv_content.decode('utf-8')
    
    # Process bulk creation
    repo = QRCodeRepository(db)
    qr_service = QRCodeService()
    bulk_service = BulkService(repo, qr_service)
    
    result = bulk_service.process_bulk_csv(csv_text)
    
    # For now, return immediate result (in real app, this would be async)
    zip_filename = os.path.basename(result["zip_path"])
    result_url = f"{settings.BASE_URL}/uploads/{zip_filename}"
    
    return JobStatus(
        id="immediate",
        status="done",
        result_url=result_url
    )

# Analytics
@app.get("/analytics/qr/{id}/summary", response_model=AnalyticsSummary)
async def get_qr_analytics(
    id: str,
    range: Optional[str] = None,
    db: Session = Depends(get_db)
):
    repo = QRCodeRepository(db)
    analytics_service = AnalyticsService(repo)
    
    return analytics_service.get_qr_analytics(id, range)

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