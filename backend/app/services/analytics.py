from app.repo import QRCodeRepository
from app.schemas import AnalyticsSummary
from typing import Optional

class AnalyticsService:
    def __init__(self, repo: QRCodeRepository):
        self.repo = repo
    
    def get_qr_analytics(self, qr_id: str, range_param: Optional[str] = None) -> AnalyticsSummary:
        """Get analytics summary for a specific QR code"""
        
        # Parse range parameter to determine days
        days = self._parse_range_to_days(range_param)
        
        # Get analytics data from repository
        analytics_data = self.repo.get_scan_analytics(qr_id, days)
        
        return AnalyticsSummary(
            total_scans=analytics_data["total_scans"],
            unique_scans=analytics_data["unique_scans"],
            by_day=analytics_data["by_day"],
            top_countries=analytics_data["top_countries"]
        )
    
    def get_overall_analytics(self, qr_ids: Optional[list] = None) -> dict:
        """Get overall analytics across multiple QR codes"""
        # This would aggregate data across multiple QR codes
        # For now, return a simple summary
        return {
            "total_qr_codes": len(qr_ids) if qr_ids else 0,
            "total_scans": 0,
            "unique_scans": 0
        }
    
    def _parse_range_to_days(self, range_param: Optional[str]) -> int:
        """Parse range parameter to number of days"""
        if not range_param:
            return 30  # Default to last 30 days
        
        range_mapping = {
            "last_7d": 7,
            "last_30d": 30,
            "last_90d": 90,
            "last_year": 365
        }
        
        return range_mapping.get(range_param, 30)