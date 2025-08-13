from app.repo import QRCodeRepository
from app.schemas import AnalyticsSummary
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import random

class AnalyticsService:
    def __init__(self, repo: QRCodeRepository):
        self.repo = repo
    
    def get_qr_analytics(self, qr_id: str, range_param: Optional[str] = None) -> AnalyticsSummary:
        """Get analytics summary for a specific QR code"""
        
        # Parse range parameter to determine days
        days = self._parse_range_to_days(range_param)
        
        # For demo purposes, generate mock data
        # In a real implementation, this would query the database
        total_scans = random.randint(0, 500)
        unique_scans = int(total_scans * 0.7)  # Assume 70% unique
        
        # Generate daily scan data
        by_day = []
        for i in range(days):
            date = datetime.now() - timedelta(days=i)
            scans = random.randint(0, 20) if total_scans > 0 else 0
            by_day.append({
                "date": date.strftime("%Y-%m-%d"),
                "scans": scans
            })
        
        by_day.reverse()  # Chronological order
        
        # Generate top countries
        countries = ["Vietnam", "United States", "Japan", "South Korea", "Singapore"]
        top_countries = []
        for country in countries[:3]:
            top_countries.append({
                "country": country,
                "scans": random.randint(1, total_scans // 3) if total_scans > 0 else 0
            })
        
        return AnalyticsSummary(
            total_scans=total_scans,
            unique_scans=unique_scans,
            today_scans=random.randint(0, 10),
            by_day=by_day,
            top_countries=top_countries,
            recent_scans=[
                {
                    "timestamp": (datetime.now() - timedelta(hours=i)).isoformat(),
                    "location": random.choice(["Ho Chi Minh City", "Hanoi", "Da Nang", "Can Tho"]),
                    "device": random.choice(["iPhone", "Android", "Desktop"])
                }
                for i in range(min(5, total_scans))
            ]
        )
    
    def get_qr_scan_count(self, qr_id: str) -> int:
        """Get total scan count for a QR code"""
        # For demo purposes, return a random number
        return random.randint(0, 200)
    
    def get_monthly_scan_count(self, user_id: str) -> int:
        """Get monthly scan count for a user"""
        # For demo purposes, return a random number
        return random.randint(0, 500)
    
    def get_recent_scan_data(self, user_id: str, days: int = 7) -> List[Dict]:
        """Get recent scan data for charts"""
        data = []
        for i in range(days):
            date = datetime.now() - timedelta(days=days - 1 - i)
            scans = random.randint(0, 50)
            data.append({
                "date": date.strftime("%Y-%m-%d"),
                "scans": scans
            })
        return data
    
    def get_overall_analytics(self, qr_ids: Optional[list] = None) -> dict:
        """Get overall analytics across multiple QR codes"""
        # This would aggregate data across multiple QR codes
        # For now, return a simple summary
        return {
            "total_qr_codes": len(qr_ids) if qr_ids else 0,
            "total_scans": sum([self.get_qr_scan_count(qr_id) for qr_id in (qr_ids or [])]),
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