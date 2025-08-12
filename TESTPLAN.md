# QRCode SaaS — Test Plan & Test Cases

## 1) Chiến lược kiểm thử
- **Unit tests**: logic QR (payload, render params), validation, utils (hash, UTM).
- **Integration tests**: API endpoints (auth, /qr, /r/{code}, bulk), DB + storage + queue.
- **E2E (Playwright)**: tạo QR, đổi target, quét (mô phỏng), xem dashboard.
- **Performance**: redirect throughput/latency (k6/Locust), bulk job SLA.
- **Security**: auth flows, RBAC, rate limiting, password-protected QR, webhook signature.
- **Cross-browser**: Chrome/Firefox/Safari (UI chính).

## 2) Thiết lập CI
- GitHub Actions chạy: lint, validate OpenAPI, unit/integration, e2e (headless), build docker.
- Coverage tối thiểu: **80%** backend, **70%** frontend.
- Secrets cần: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (hoặc MinIO), `STRIPE_SECRET`, `POSTGRES_URL`, `REDIS_URL`.

## 3) Test Cases (mẫu)
### TC-QR-001 — Create Static QR (PNG/SVG)
- **Steps**: POST `/qr` body `{type:"static", content:"https://example.com", format:["png","svg"]}`
- **Expect**: 201 + object với `id`, `code`, `download_urls` hợp lệ; ảnh có quiet zone >= 4 modules.

### TC-QR-002 — Create Dynamic QR & Redirect
- **Steps**: POST `/qr` (type:"dynamic", target:"https://a.com"); GET `/r/{code}`
- **Expect**: 302 → https://a.com ; đổi target sang https://b.com → redirect cập nhật trong ≤ 2s.

### TC-QR-003 — Password-protected Redirect
- **Steps**: đặt `password:"secret"` cho QR; truy cập `/r/{code}`
- **Expect**: 401 yêu cầu nhập password; nhập sai 5 lần/10 phút → 429 (rate-limit).

### TC-QR-004 — Expiry
- **Steps**: đặt `expiry_at` = now-1m; GET `/r/{code}`
- **Expect**: 410 Gone (hoặc 302 đến trang expiry thông báo).

### TC-QR-005 — Bulk Import 400 Rows
- **Steps**: POST `/qr/bulk` file CSV (400 rows); poll `GET /jobs/{id}` đến khi `status:"done"`; tải ZIP
- **Expect**: ZIP chứa 400 PNG theo tên chỉ định; CSV kết quả (id, code, download_url). SLA ≤ 5m.

### TC-ANL-006 — Scan Analytics
- **Steps**: gọi `/r/{code}` từ user-agents khác nhau, geo IP mô phỏng
- **Expect**: `GET /analytics/qr/{id}/summary` hiển thị tổng số lượt, unique, top OS/Browser/Country.

### TC-API-007 — API Key Scopes
- **Steps**: tạo API key chỉ có scope `qr:read`; gọi `POST /qr`
- **Expect**: 403; gọi `GET /qr` → 200.

### TC-RBAC-008 — Tenant Roles
- **Steps**: user role Viewer truy cập `DELETE /qr/{id}`
- **Expect**: 403; Admin thì 204.

### TC-WHB-009 — Webhook Signature
- **Steps**: đăng ký webhook `scan.created`; giả lập gửi webhook sai HMAC
- **Expect**: 401; đúng HMAC → 200.

### TC-PERF-010 — Redirect p95
- **Steps**: k6 100 RPS trong 1 phút lên `/r/{code}` (cache warm)
- **Expect**: p95 latency < 150ms, error rate < 0.1%.

## 4) E2E Flows (Playwright)
- Đăng ký → tạo workspace → tạo QR động → tải PNG → đổi target → quét thử → xem dashboard.
- Bulk upload CSV → theo dõi job → tải ZIP → kiểm tra số file và QR readable.

## 5) Kiểm thử bảo mật
- SQLi/XSS trên input `content`, `target`, `landing`.
- Brute-force login/QR password → rate-limit/bot-detect.
- Kiểm tra CORS, CSRF (nếu cookie), secure headers.

---
