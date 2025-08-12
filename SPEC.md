# QRCode SaaS — Functional Spec (v1)

## 1) Tóm tắt & Mục tiêu
Xây dựng nền tảng SaaS cung cấp dịch vụ tạo và quản lý QR code cho cá nhân/doanh nghiệp, tập trung vào **QR động (dynamic)**, **thống kê**, **tạo hàng loạt**, **tuỳ biến thiết kế**, **bảo mật/expiry**, và **API tích hợp**. Mục tiêu là tạo sản phẩm đủ hấp dẫn để người dùng trả phí và dễ mở rộng quy mô.

### Mục tiêu chính
- Tạo QR tĩnh & động, chỉnh sửa nội dung sau khi in (dynamic redirect).
- Thống kê lượt quét theo thời gian, vị trí (approx geolocation), thiết bị/OS/trình duyệt.
- Tạo QR hàng loạt từ CSV/Excel; xuất PNG/SVG/PDF; templatize.
- Bảo mật (password), hạn dùng (expiry), whitelist domain, rate-limiting redirect.
- Giao diện builder “mini landing page” đơn giản gắn sau QR.
- API & Webhooks để tích hợp. Billing theo gói (Free/Pro/Business/Enterprise).
- Trải nghiệm mượt, p95 redirect < 150ms (nội địa), uptime mục tiêu ≥ 99.9% (SLA cao hơn ở Enterprise).

### Không nằm trong phạm vi (v1)
- AI logo designer nâng cao; editor WYSIWYG phức tạp.
- App mobile native (chỉ roadmap).

## 2) Persona & Use Cases
- **Marketer/SME**: Tạo QR chiến dịch, đo hiệu quả (scan analytics), đổi nội dung real-time.
- **Sự kiện/bán vé**: Sinh QR hàng loạt theo danh sách, đặt expiry hoặc password.
- **Doanh nghiệp**: Quản lý team, phân quyền, theo dõi theo thư mục/campaign, API tích hợp DMS/CRM.
- **Cá nhân**: VCard, Wi-Fi, Link-in-bio landing nhanh.

## 3) Gói dịch vụ & Ràng buộc
- **Free**: QR tĩnh, giới hạn số lượng/tải về, watermark (optional), không analytics.
- **Pro**: QR động, bulk import, tuỳ biến thiết kế, analytics cơ bản.
- **Business**: API, webhooks, team/roles, custom domain cho redirect, advanced analytics.
- **Enterprise**: SLA, data residency, SOC2-ready, audit logs nâng cao, IP allowlist.

## 4) Chức năng chi tiết (Functional Requirements)
### FR-1: Authentication & Tenancy
- Đăng ký/đăng nhập (email+password, OAuth Google), xác minh email.
- JWT (Access/Refresh), revoke/rotate; Optional SSO (SAML/OIDC) cho Business+.
- **Multi-tenant** (1 người dùng có thể thuộc nhiều workspace). RBAC: Owner/Admin/Editor/Viewer.

### FR-2: QR Types
- **Static QR**: encode trực tiếp nội dung (URL/Text/Email/SMS/Wi-Fi/VCard).
- **Dynamic QR**: ánh xạ `qr_code_id -> target` trong DB, có thể cập nhật target bất kỳ lúc nào.
- **File QR** (optional v1.1): trỏ tới file đã upload (MinIO/S3), có presigned URLs.

### FR-3: QR Creation & Customization
- Tuỳ biến màu, góc, mắt QR, chèn logo, chọn frame/template; xuất PNG/SVG/PDF.
- Presets (templates) theo chủ đề: sự kiện, wedding, retail, menu, paylink.
- Xác thực readability (contrast ratio, quiet zone) trước khi cho tải.

### FR-4: Bulk Generation (CSV/Excel)
- Upload CSV/XLSX với cột `content`, `name`, `folder`, `design_preset`, `password`, `expiry`.
- Hàng loạt: tạo N QR (static/dynamic), zip ảnh đầu ra, trả kết quả qua email/webhook hoặc UI download.
- Retry queue cho job lớn (worker).

### FR-5: Dynamic Target Management
- Thay đổi `target` QR động; hỗ trợ `utm` auto-append theo campaign.
- **Expiry** (date/time), **Password-protected** (hash+rate-limit attempts).
- AB test (optional v1.1): phân phối target A/B theo tỷ lệ.

### FR-6: Redirect Service
- Endpoint tốc độ cao `GET /r/{code}` trả 302 đến `target`.
- Anti-abuse: rate limit theo IP/QR, bot filtering cơ bản, denylist/allowlist domain.
- Latency mục tiêu p95 < 150ms, cache nóng ở edge (Cloudflare optional).

### FR-7: Analytics
- Ghi **scan event**: timestamp, qr_id, campaign_id, ip (anonymized), country/region (GeoIP), device/OS/UA.
- Dashboard: tổng scan, unique scans, top geo, trend theo ngày/tuần/tháng, by campaign/folder.
- Export CSV, webhook push, API query (aggregation).

### FR-8: Mini Landing Builder (Lite)
- Editor đơn giản: logo, headline, CTA buttons, social links, theme color.
- Host dưới domain hệ thống hoặc custom domain (Business+).

### FR-9: Organization & Collaboration
- Folder/Project/Campaign để nhóm QR.
- Share link view-only, mời thành viên, phân quyền RBAC.
- Audit log cơ bản: create/update/delete QR, change target, permissions.

### FR-10: API & Webhooks
- REST API (OpenAPI 3.1). API Keys (scoped); rate limits theo gói.
- Webhooks: `scan.created`, `qr.updated`, `bulk.completed` (HMAC signature).

### FR-11: Billing
- Stripe: Plans, Subscription, Trial, Invoices, Webhooks (subscription updated).
- Hard-limits/soft-limits theo gói (số QR, dynamic/editable, scans/month, bulk size).

### FR-12: i18n & A11y
- Đa ngôn ngữ (vi/en), RTL-ready. A11y WCAG 2.1 AA cho UI chính.

### FR-13: Security & Privacy
- Hash password (Argon2/bcrypt), password policy. Encrypt secrets at rest.
- IP anonymization, GDPR-friendly data retention (configurable), DPA template.
- Backup daily + PITR cho Postgres; BCDR doc.

## 5) Phi chức năng (NFR)
- **Hiệu năng**: redirect p95 < 150ms; API p95 < 300ms; background job SLA < 15m cho bulk 10k.
- **Khả dụng**: 99.9% (Business), 99.95% (Enterprise) khu vực chính.
- **Khả mở rộng**: stateless API; queue-based background; CDN/edge cache cho redirect.
- **Quan sát**: centralized logs, metrics (Prometheus), tracing (OTel).

## 6) Kiến trúc & Công nghệ (đề xuất)
- **Frontend**: Next.js (React), Tailwind, i18n, Playwright tests.
- **Backend API**: FastAPI (Python, type hints), Uvicorn/Gunicorn.
- **Worker**: Celery/RQ + Redis (bulk zip, email, webhook).
- **DB**: PostgreSQL. **Storage**: S3/MinIO. **Cache/Queue**: Redis.
- **Redirect**: Nginx/Edge + lightweight FastAPI route `/r/{code}`.
- **Infra**: Docker Compose (dev), containerized deploy; optional k8s sau.
- **CI/CD**: GitHub Actions, test+lint+build, docker image, optional deploy.

## 7) Mô hình dữ liệu (chính)
- `users(id, email, password_hash, is_active, created_at, ...)`
- `tenants(id, name, plan, created_at, ...)`
- `members(user_id, tenant_id, role)`   // RBAC
- `qr_codes(id, tenant_id, type, code, name, folder, design_config(json), is_active, created_at, ...)`
- `qr_targets(qr_id, target_url, password_hash?, expiry_at?, utm_config? json, updated_at)` // dynamic
- `campaigns(id, tenant_id, name, utm_defaults json, ...)`
- `scans(id, qr_id, happened_at, country, region, ua, device, ip_hash)`
- `uploads(id, tenant_id, filename, storage_key, created_at)`
- `api_keys(id, tenant_id, key_hash, scopes json, created_at, revoked_at)`
- `webhooks(id, tenant_id, url, secret, events json, is_active)`
- `audit_logs(id, tenant_id, actor_id, action, target_type, target_id, created_at, metadata json)`
- `subscriptions(id, tenant_id, stripe_customer_id, stripe_sub_id, plan, status, renew_at)`

## 8) API Contract (tham chiếu chi tiết ở openapi.yaml)
- Auth: `/auth/signup`, `/auth/login`, `/auth/refresh`
- QR: `GET/POST /qr`, `GET /qr/{id}`, `PATCH /qr/{id}`, `DELETE /qr/{id}`
- Dynamic target: `PUT /qr/{id}/target`
- Bulk: `POST /qr/bulk` (multipart CSV/XLSX) → job id; `GET /jobs/{id}` ; download zip
- Analytics: `GET /analytics/scans` (filters: qr_id, range); `GET /analytics/qr/{id}/summary`
- Redirect: `GET /r/{code}` (public)
- Webhooks: `POST /webhooks/test` (verify), secret HMAC header
- Files: `POST /uploads` (S3 presign), `POST /landing` (builder save/publish)

## 9) Acceptance Criteria (mẫu)
- **AC-QR-Create-01**: Tạo QR động thành công, server trả `201` với `id`, `code`, `download_urls` cho PNG/SVG.
- **AC-QR-Target-02**: Cập nhật target chạy ngay, redirect dùng `/r/{code}` phải tới URL mới trong ≤ 2s.
- **AC-Bulk-03**: Upload CSV 400 hàng → job hoàn tất, trả ZIP chứa 400 ảnh PNG + CSV kết quả trong ≤ 5m.
- **AC-Analytics-04**: Lượt quét được ghi nhận với country, ua; dashboard hiển thị tổng/unique và biểu đồ ngày.
- **AC-Security-05**: QR có password → khi redirect, yêu cầu nhập password, sai 5 lần/10 phút → 429.

## 10) Roadmap đề xuất
- **MVP (Sprint 1-2)**: Auth/Tenancy, Static+Dynamic QR, Redirect, Basic UI, Download PNG/SVG, Minimal Analytics.
- **Pro (Sprint 3-4)**: Bulk import, Design presets, Password/Expiry, Campaigns, CSV export.
- **Business (Sprint 5-6)**: API keys, Webhooks, Team roles, Custom domain, Advanced analytics.
- **Enterprise (post)**: SSO, SLA, Audit & Compliance, Data residency.

---

© 2025 — Draft v1.0
