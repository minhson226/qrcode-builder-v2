from fastapi import HTTPException, Request
from fastapi.responses import RedirectResponse
from app.repo import QRCodeRepository
from app.schemas import ScanEvent
from datetime import datetime
import hashlib
import user_agents

class RedirectService:
    def __init__(self, repo: QRCodeRepository):
        self.repo = repo
    
    def handle_redirect(self, code: str, request: Request, password: str = None) -> RedirectResponse:
        """Handle QR code redirect with password and expiry checks"""
        
        # Get QR code
        qr = self.repo.get_qr_by_code(code)
        if not qr or not qr.is_active:
            raise HTTPException(status_code=404, detail="QR code not found")
        
        # Check expiry
        if qr.expiry_at and qr.expiry_at < datetime.utcnow():
            raise HTTPException(status_code=410, detail="QR code has expired")
        
        # Get client IP
        client_ip = self._get_client_ip(request)
        ip_hash = self._hash_ip(client_ip)
        
        # Check password if required
        if qr.password_hash:
            if not password:
                raise HTTPException(status_code=401, detail="Password required")
            
            # Check rate limit for wrong password attempts
            if not self.repo.check_rate_limit(ip_hash, code):
                raise HTTPException(status_code=429, detail="Too many failed attempts")
            
            if not self.repo.verify_password(password, qr.password_hash):
                raise HTTPException(status_code=401, detail="Invalid password")
        
        # Determine target URL
        if qr.type == "static":
            target_url = qr.content
        else:  # dynamic
            target_url = qr.target
        
        if not target_url:
            raise HTTPException(status_code=404, detail="No target URL configured")
        
        # Record scan analytics
        self._record_scan(qr.id, request, ip_hash)
        
        # Redirect to target
        return RedirectResponse(url=target_url, status_code=302)
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address from request"""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    def _hash_ip(self, ip: str) -> str:
        """Hash IP address for privacy"""
        return hashlib.sha256(ip.encode()).hexdigest()[:16]
    
    def _record_scan(self, qr_id: str, request: Request, ip_hash: str):
        """Record scan event for analytics"""
        try:
            # Parse user agent
            ua_string = request.headers.get("User-Agent", "")
            ua = user_agents.parse(ua_string)
            
            device = f"{ua.device.family}"
            if ua.os.family != "Other":
                device += f" ({ua.os.family})"
            
            # For now, set country as None (would need GeoIP database)
            country = None
            
            scan_event = ScanEvent(
                qr_id=qr_id,
                ip_hash=ip_hash,
                country=country,
                user_agent=ua_string[:200],  # Limit length
                device=device[:100]
            )
            
            self.repo.record_scan(scan_event)
        except Exception:
            # Don't fail the redirect if analytics recording fails
            pass