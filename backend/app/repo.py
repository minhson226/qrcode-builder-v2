from sqlalchemy.orm import Session
from app.models import QRCode, Scan, RateLimit
from app.schemas import QRCreateRequest, QRUpdateRequest, QRTargetUpdate, ScanEvent
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
import hashlib

class QRCodeRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def create_qr(self, qr_data: QRCreateRequest) -> QRCode:
        qr_id = str(uuid.uuid4())
        qr_code = str(uuid.uuid4())[:8]  # Short code for URLs
        
        qr = QRCode(
            id=qr_id,
            code=qr_code,
            type=qr_data.type.value,
            name=qr_data.name,
            folder=qr_data.folder,
            content=qr_data.content,
            target=qr_data.target,
            design=qr_data.design or {}
        )
        self.db.add(qr)
        self.db.commit()
        self.db.refresh(qr)
        return qr
    
    def get_qr_by_id(self, qr_id: str) -> Optional[QRCode]:
        return self.db.query(QRCode).filter(QRCode.id == qr_id, QRCode.is_active == True).first()
    
    def get_qr_by_code(self, code: str) -> Optional[QRCode]:
        return self.db.query(QRCode).filter(QRCode.code == code).first()
    
    def list_qrs(self, folder: Optional[str] = None, qr_type: Optional[str] = None, user_id: Optional[str] = None) -> List[QRCode]:
        query = self.db.query(QRCode).filter(QRCode.is_active == True)
        if folder:
            query = query.filter(QRCode.folder == folder)
        if qr_type:
            query = query.filter(QRCode.type == qr_type)
        # Note: user_id filtering would be added here when user system is fully implemented
        # For now, we're using a demo implementation
        return query.all()
    
    def update_qr(self, qr_id: str, qr_data: QRUpdateRequest) -> Optional[QRCode]:
        qr = self.get_qr_by_id(qr_id)
        if not qr:
            return None
        
        if qr_data.name is not None:
            qr.name = qr_data.name
        if qr_data.folder is not None:
            qr.folder = qr_data.folder
        if qr_data.design is not None:
            qr.design = qr_data.design
        
        self.db.commit()
        self.db.refresh(qr)
        return qr
    
    def update_qr_target(self, qr_id: str, target_data: QRTargetUpdate) -> Optional[QRCode]:
        qr = self.get_qr_by_id(qr_id)
        if not qr or qr.type != "dynamic":
            return None
        
        if target_data.target is not None:
            qr.target = target_data.target
        if target_data.password is not None:
            qr.password_hash = self._hash_password(target_data.password) if target_data.password else None
        if target_data.expiry_at is not None:
            qr.expiry_at = target_data.expiry_at
        
        self.db.commit()
        self.db.refresh(qr)
        return qr
    
    def delete_qr(self, qr_id: str) -> bool:
        qr = self.get_qr_by_id(qr_id)
        if not qr:
            return False
        
        qr.is_active = False
        self.db.commit()
        return True
    
    def record_scan(self, scan_event: ScanEvent) -> Scan:
        scan_id = str(uuid.uuid4())
        scan = Scan(
            id=scan_id,
            qr_id=scan_event.qr_id,
            ip_hash=scan_event.ip_hash,
            country=scan_event.country,
            user_agent=scan_event.user_agent,
            device=scan_event.device
        )
        self.db.add(scan)
        self.db.commit()
        self.db.refresh(scan)
        return scan
    
    def get_scan_analytics(self, qr_id: str, days: int = 30) -> dict:
        since_date = datetime.utcnow() - timedelta(days=days)
        scans = self.db.query(Scan).filter(
            Scan.qr_id == qr_id,
            Scan.happened_at >= since_date
        ).all()
        
        total_scans = len(scans)
        unique_scans = len(set(scan.ip_hash for scan in scans))
        
        # Group by day
        by_day = {}
        for scan in scans:
            day = scan.happened_at.date().isoformat()
            by_day[day] = by_day.get(day, 0) + 1
        
        # Group by country
        by_country = {}
        for scan in scans:
            if scan.country:
                by_country[scan.country] = by_country.get(scan.country, 0) + 1
        
        return {
            "total_scans": total_scans,
            "unique_scans": unique_scans,
            "by_day": [{"date": k, "scans": v} for k, v in by_day.items()],
            "top_countries": [{"country": k, "scans": v} for k, v in 
                             sorted(by_country.items(), key=lambda x: x[1], reverse=True)[:10]]
        }
    
    def check_rate_limit(self, ip_hash: str, qr_code: str, max_attempts: int = 5, window_minutes: int = 1) -> bool:
        """Check if IP has exceeded rate limit for wrong password attempts"""
        window_start = datetime.utcnow() - timedelta(minutes=window_minutes)
        
        # Clean old entries
        self.db.query(RateLimit).filter(RateLimit.window_start < window_start).delete()
        
        # Check current attempts
        rate_limit = self.db.query(RateLimit).filter(
            RateLimit.ip_hash == ip_hash,
            RateLimit.qr_code == qr_code,
            RateLimit.window_start >= window_start
        ).first()
        
        if not rate_limit:
            # First attempt in window
            rate_limit = RateLimit(
                id=str(uuid.uuid4()),
                ip_hash=ip_hash,
                qr_code=qr_code,
                attempts=1
            )
            self.db.add(rate_limit)
            self.db.commit()
            return True
        
        if rate_limit.attempts >= max_attempts:
            return False
        
        rate_limit.attempts += 1
        self.db.commit()
        return True
    
    def _hash_password(self, password: str) -> str:
        return hashlib.sha256(password.encode()).hexdigest()
    
    def verify_password(self, password: str, password_hash: str) -> bool:
        return self._hash_password(password) == password_hash