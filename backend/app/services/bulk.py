import csv
import io
import zipfile
from typing import List, Dict, Any
import uuid
import tempfile
import os
from app.schemas import QRCreateRequest, QRFormat
from app.repo import QRCodeRepository
from app.services.qrcode import QRCodeService

class BulkService:
    def __init__(self, repo: QRCodeRepository, qr_service: QRCodeService):
        self.repo = repo
        self.qr_service = qr_service
    
    def process_bulk_csv(self, csv_content: str) -> Dict[str, Any]:
        """Process bulk QR creation from CSV content"""
        # Parse CSV
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        results = []
        
        # Create temp directory for images
        temp_dir = tempfile.mkdtemp()
        
        try:
            for row in csv_reader:
                try:
                    # Create QR request from CSV row
                    qr_request = self._csv_row_to_qr_request(row)
                    
                    # Create QR code
                    qr = self.repo.create_qr(qr_request)
                    
                    # Generate PNG image
                    download_urls = self.qr_service.generate_qr_images(qr, ["png"])
                    
                    # Copy PNG to temp directory
                    png_filename = f"{qr.code}.png"
                    src_path = os.path.join(self.qr_service.upload_dir, png_filename)
                    dst_path = os.path.join(temp_dir, png_filename)
                    
                    if os.path.exists(src_path):
                        import shutil
                        shutil.copy2(src_path, dst_path)
                    
                    results.append({
                        "id": qr.id,
                        "code": qr.code,
                        "name": qr.name or "",
                        "download_url": download_urls.get("png", ""),
                        "status": "success",
                        "error": ""
                    })
                    
                except Exception as e:
                    results.append({
                        "id": "",
                        "code": "",
                        "name": row.get("name", ""),
                        "download_url": "",
                        "status": "error",
                        "error": str(e)
                    })
            
            # Create ZIP file
            zip_path = self._create_result_zip(temp_dir, results)
            
            return {
                "total_processed": len(results),
                "successful": len([r for r in results if r["status"] == "success"]),
                "failed": len([r for r in results if r["status"] == "error"]),
                "zip_path": zip_path,
                "results": results
            }
            
        finally:
            # Cleanup temp directory (except the zip file)
            self._cleanup_temp_files(temp_dir)
    
    def _csv_row_to_qr_request(self, row: Dict[str, str]) -> QRCreateRequest:
        """Convert CSV row to QR creation request"""
        qr_type = row.get("type", "static").lower()
        
        if qr_type not in ["static", "dynamic"]:
            qr_type = "static"
        
        content = row.get("content", "")
        target = row.get("target", content) if qr_type == "dynamic" else None
        
        return QRCreateRequest(
            type=qr_type,
            content=content if qr_type == "static" else None,
            target=target if qr_type == "dynamic" else None,
            name=row.get("name", ""),
            folder=row.get("folder", ""),
            formats=[QRFormat.png]
        )
    
    def _create_result_zip(self, temp_dir: str, results: List[Dict[str, Any]]) -> str:
        """Create ZIP file containing PNG files and results CSV"""
        zip_filename = f"bulk_qr_{uuid.uuid4().hex[:8]}.zip"
        zip_path = os.path.join(self.qr_service.upload_dir, zip_filename)
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add PNG files
            for filename in os.listdir(temp_dir):
                if filename.endswith('.png'):
                    file_path = os.path.join(temp_dir, filename)
                    zipf.write(file_path, filename)
            
            # Add results CSV
            csv_content = self._create_results_csv(results)
            zipf.writestr("results.csv", csv_content)
        
        return zip_path
    
    def _create_results_csv(self, results: List[Dict[str, Any]]) -> str:
        """Create CSV content from results"""
        output = io.StringIO()
        fieldnames = ["id", "code", "name", "download_url", "status", "error"]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        
        writer.writeheader()
        for result in results:
            writer.writerow(result)
        
        return output.getvalue()
    
    def _cleanup_temp_files(self, temp_dir: str):
        """Clean up temporary files"""
        try:
            import shutil
            # Remove PNG files but keep the directory structure
            for filename in os.listdir(temp_dir):
                if filename.endswith('.png'):
                    os.remove(os.path.join(temp_dir, filename))
        except Exception:
            pass  # Ignore cleanup errors