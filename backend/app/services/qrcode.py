import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import CircleModuleDrawer, SquareModuleDrawer, RoundedModuleDrawer
from PIL import Image, ImageDraw
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
import io
import base64
from typing import Dict, List
from app.config import settings
import os

class QRCodeService:
    def __init__(self):
        self.base_url = settings.BASE_URL
        self.upload_dir = settings.UPLOAD_DIR
    
    def generate_qr_images(self, qr_code_obj, formats: List[str] = ["png"]) -> Dict[str, str]:
        """Generate QR code images in specified formats"""
        download_urls = {}
        
        # Determine the content to encode
        if qr_code_obj.type == "static":
            qr_content = qr_code_obj.content
        else:  # dynamic
            qr_content = f"{self.base_url}/r/{qr_code_obj.code}"
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=settings.QR_CODE_SIZE,
            border=settings.QR_CODE_BORDER,
        )
        qr.add_data(qr_content)
        qr.make(fit=True)
        
        # Apply design customizations
        design = qr_code_obj.design or {}
        fill_color = design.get("color", "black")
        back_color = design.get("bgColor", "white")
        
        for format_type in formats:
            if format_type == "png":
                img = qr.make_image(fill_color=fill_color, back_color=back_color)
                
                # Add logo if specified
                logo_url = design.get("logoUrl")
                if logo_url:
                    img = self._add_logo_to_qr(img, logo_url)
                
                # Save PNG
                filename = f"{qr_code_obj.code}.png"
                filepath = os.path.join(self.upload_dir, filename)
                img.save(filepath)
                download_urls["png"] = f"{self.base_url}/uploads/{filename}"
            
            elif format_type == "svg":
                # Generate SVG
                from qrcode.image.svg import SvgPathImage
                img = qr.make_image(image_factory=SvgPathImage)
                
                filename = f"{qr_code_obj.code}.svg"
                filepath = os.path.join(self.upload_dir, filename)
                with open(filepath, 'wb') as f:
                    img.save(f)
                download_urls["svg"] = f"{self.base_url}/uploads/{filename}"
            
            elif format_type == "pdf":
                # Generate PDF
                img = qr.make_image(fill_color=fill_color, back_color=back_color)
                
                # Add logo if specified
                logo_url = design.get("logoUrl")
                if logo_url:
                    img = self._add_logo_to_qr(img, logo_url)
                
                # Save as PDF
                filename = f"{qr_code_obj.code}.pdf"
                filepath = os.path.join(self.upload_dir, filename)
                self._create_pdf_with_qr(img, filepath, qr_code_obj)
                download_urls["pdf"] = f"{self.base_url}/uploads/{filename}"
        
        return download_urls
    
    def _create_pdf_with_qr(self, qr_img, filepath: str, qr_code_obj):
        """Create a PDF document with QR code and additional information"""
        # Create a BytesIO buffer for the QR image
        img_buffer = io.BytesIO()
        qr_img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        # Create PDF
        c = canvas.Canvas(filepath, pagesize=A4)
        width, height = A4
        
        # Title
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(width/2, height - 50, "QR Code")
        
        # QR Code Name
        if qr_code_obj.name:
            c.setFont("Helvetica", 12)
            c.drawCentredString(width/2, height - 80, qr_code_obj.name)
        
        # Draw QR code (center it on page)
        qr_size = 200  # 200 points = about 2.8 inches
        qr_x = (width - qr_size) / 2
        qr_y = height - 350
        
        c.drawImage(ImageReader(img_buffer), qr_x, qr_y, qr_size, qr_size)
        
        # Add QR code information below
        info_y = qr_y - 50
        c.setFont("Helvetica", 10)
        
        if qr_code_obj.type == "static":
            content = qr_code_obj.content
            if len(content) > 80:
                content = content[:80] + "..."
            c.drawCentredString(width/2, info_y, f"Nội dung: {content}")
        else:
            c.drawCentredString(width/2, info_y, f"Link động: {self.base_url}/r/{qr_code_obj.code}")
        
        c.drawCentredString(width/2, info_y - 20, f"Mã QR: {qr_code_obj.code}")
        c.drawCentredString(width/2, info_y - 40, f"Loại: {'QR Tĩnh' if qr_code_obj.type == 'static' else 'QR Động'}")
        
        if qr_code_obj.folder:
            c.drawCentredString(width/2, info_y - 60, f"Thư mục: {qr_code_obj.folder}")
        
        # Footer
        c.setFont("Helvetica", 8)
        c.drawCentredString(width/2, 50, "Tạo bởi QR Builder Pro - qrbuilder.pro")
        
        c.save()
    
    def _add_logo_to_qr(self, qr_img, logo_url: str):
        """Add logo to center of QR code (simplified implementation)"""
        try:
            # For now, just return the original image
            # In a real implementation, you would download and resize the logo
            return qr_img
        except Exception:
            return qr_img
    
    def get_qr_content(self, qr_code_obj) -> str:
        """Get the content that should be encoded in the QR code"""
        if qr_code_obj.type == "static":
            return qr_code_obj.content
        else:  # dynamic
            return f"{self.base_url}/r/{qr_code_obj.code}"