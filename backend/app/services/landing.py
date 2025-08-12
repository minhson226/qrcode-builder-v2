import uuid
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import LandingPage, Lead
from app.schemas import LandingPageCreateRequest, LandingPageUpdateRequest, LeadCreateRequest
from app.config import settings
import hashlib

class LandingPageService:
    def __init__(self, db: Session):
        self.db = db
        
    def create_landing_page(self, data: LandingPageCreateRequest) -> LandingPage:
        """Create a new landing page"""
        landing_page = LandingPage(
            id=str(uuid.uuid4()),
            qr_id=data.qr_id,
            slug=data.slug,
            title=data.title,
            description=data.description,
            content=data.content,
            theme=data.theme,
            meta_title=data.meta_title,
            meta_description=data.meta_description,
            collect_leads=data.collect_leads,
            analytics_enabled=data.analytics_enabled
        )
        
        self.db.add(landing_page)
        self.db.commit()
        self.db.refresh(landing_page)
        return landing_page
    
    def get_landing_page_by_id(self, page_id: str) -> Optional[LandingPage]:
        """Get landing page by ID"""
        return self.db.query(LandingPage).filter(LandingPage.id == page_id).first()
    
    def get_landing_page_by_slug(self, slug: str) -> Optional[LandingPage]:
        """Get landing page by slug"""
        return self.db.query(LandingPage).filter(LandingPage.slug == slug).first()
    
    def update_landing_page(self, page_id: str, data: LandingPageUpdateRequest) -> Optional[LandingPage]:
        """Update landing page"""
        landing_page = self.get_landing_page_by_id(page_id)
        if not landing_page:
            return None
            
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(landing_page, field, value)
            
        self.db.commit()
        self.db.refresh(landing_page)
        return landing_page
    
    def delete_landing_page(self, page_id: str) -> bool:
        """Delete landing page"""
        landing_page = self.get_landing_page_by_id(page_id)
        if not landing_page:
            return False
            
        self.db.delete(landing_page)
        self.db.commit()
        return True
    
    def list_landing_pages(self, qr_id: Optional[str] = None) -> list[LandingPage]:
        """List landing pages, optionally filtered by QR ID"""
        query = self.db.query(LandingPage)
        if qr_id:
            query = query.filter(LandingPage.qr_id == qr_id)
        return query.order_by(LandingPage.created_at.desc()).all()
    
    def create_lead(self, data: LeadCreateRequest, ip_address: str, user_agent: str) -> Lead:
        """Create a new lead from landing page form submission"""
        lead = Lead(
            id=str(uuid.uuid4()),
            landing_page_id=data.landing_page_id,
            name=data.name,
            email=data.email,
            phone=data.phone,
            message=data.message,
            data=data.data,
            ip_hash=hashlib.sha256(ip_address.encode()).hexdigest(),
            user_agent=user_agent
        )
        
        self.db.add(lead)
        self.db.commit()
        self.db.refresh(lead)
        return lead
    
    def get_leads_for_page(self, page_id: str) -> list[Lead]:
        """Get all leads for a landing page"""
        return self.db.query(Lead).filter(Lead.landing_page_id == page_id).order_by(Lead.created_at.desc()).all()
    
    def render_landing_page(self, landing_page: LandingPage) -> str:
        """Render landing page HTML"""
        # Default theme template
        html_template = """
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{meta_title}</title>
    <meta name="description" content="{meta_description}">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }}
        
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }}
        
        .card {{
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            text-align: center;
        }}
        
        .logo {{
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            margin: 0 auto 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: white;
        }}
        
        h1 {{
            font-size: 2rem;
            margin-bottom: 1rem;
            color: #333;
        }}
        
        .description {{
            color: #666;
            margin-bottom: 2rem;
            font-size: 1.1rem;
        }}
        
        .buttons {{
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 2rem;
        }}
        
        .btn {{
            padding: 1rem 2rem;
            border: none;
            border-radius: 0.5rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
            font-size: 1rem;
        }}
        
        .btn-primary {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }}
        
        .btn-primary:hover {{
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }}
        
        .btn-outline {{
            background: transparent;
            border: 2px solid #667eea;
            color: #667eea;
        }}
        
        .btn-outline:hover {{
            background: #667eea;
            color: white;
        }}
        
        .contact-form {{
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 0.5rem;
            margin-top: 2rem;
        }}
        
        .form-group {{
            margin-bottom: 1rem;
            text-align: left;
        }}
        
        .form-group label {{
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #555;
        }}
        
        .form-group input,
        .form-group textarea {{
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e9ecef;
            border-radius: 0.5rem;
            font-size: 1rem;
        }}
        
        .form-group input:focus,
        .form-group textarea:focus {{
            outline: none;
            border-color: #667eea;
        }}
        
        .footer {{
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;
            color: #888;
            font-size: 0.9rem;
        }}
        
        {custom_css}
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="logo">🔲</div>
            <h1>{title}</h1>
            {description_html}
            
            {content_html}
            
            {form_html}
            
            <div class="footer">
                Được tạo bởi QR Builder Pro
            </div>
        </div>
    </div>
    
    {analytics_html}
</body>
</html>
"""
        
        # Prepare template variables
        meta_title = landing_page.meta_title or landing_page.title
        meta_description = landing_page.meta_description or landing_page.description or ""
        description_html = f'<p class="description">{landing_page.description}</p>' if landing_page.description else ""
        custom_css = landing_page.custom_css or ""
        
        # Render content blocks
        content_html = self._render_content_blocks(landing_page.content)
        
        # Render form if collect_leads is enabled
        form_html = self._render_contact_form(landing_page) if landing_page.collect_leads else ""
        
        # Analytics code
        analytics_html = self._render_analytics(landing_page) if landing_page.analytics_enabled else ""
        
        return html_template.format(
            meta_title=meta_title,
            meta_description=meta_description,
            title=landing_page.title,
            description_html=description_html,
            content_html=content_html,
            form_html=form_html,
            custom_css=custom_css,
            analytics_html=analytics_html
        )
    
    def _render_content_blocks(self, content: Dict[str, Any]) -> str:
        """Render content blocks"""
        if not content or "blocks" not in content:
            return ""
        
        blocks_html = []
        for block in content.get("blocks", []):
            block_type = block.get("type", "")
            block_content = block.get("content", {})
            
            if block_type == "button":
                url = block_content.get("url", "#")
                text = block_content.get("text", "Click here")
                style = block_content.get("style", "primary")
                blocks_html.append(f'<div class="buttons"><a href="{url}" class="btn btn-{style}">{text}</a></div>')
            
            elif block_type == "text":
                text = block_content.get("text", "")
                blocks_html.append(f'<p>{text}</p>')
            
            elif block_type == "image":
                url = block_content.get("url", "")
                alt = block_content.get("alt", "")
                if url:
                    blocks_html.append(f'<img src="{url}" alt="{alt}" style="max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0;">')
        
        return "\n".join(blocks_html)
    
    def _render_contact_form(self, landing_page: LandingPage) -> str:
        """Render contact form"""
        return f"""
        <div class="contact-form">
            <h3>Liên hệ với chúng tôi</h3>
            <form method="POST" action="/api/leads">
                <input type="hidden" name="landing_page_id" value="{landing_page.id}">
                
                <div class="form-group">
                    <label for="name">Họ tên:</label>
                    <input type="text" id="name" name="name" required>
                </div>
                
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="phone">Số điện thoại:</label>
                    <input type="tel" id="phone" name="phone">
                </div>
                
                <div class="form-group">
                    <label for="message">Tin nhắn:</label>
                    <textarea id="message" name="message" rows="4"></textarea>
                </div>
                
                <button type="submit" class="btn btn-primary">Gửi thông tin</button>
            </form>
        </div>
        """
    
    def _render_analytics(self, landing_page: LandingPage) -> str:
        """Render analytics tracking code"""
        if not landing_page.analytics_enabled:
            return ""
        
        return f"""
        <script>
            // Simple analytics tracking
            fetch('/api/analytics/page-view', {{
                method: 'POST',
                headers: {{ 'Content-Type': 'application/json' }},
                body: JSON.stringify({{
                    page_id: '{landing_page.id}',
                    slug: '{landing_page.slug}',
                    timestamp: new Date().toISOString()
                }})
            }}).catch(() => {{}});
        </script>
        """