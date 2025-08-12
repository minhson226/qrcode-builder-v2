import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <h1>QR Code Builder Pro</h1>
        <p>Nền tảng tạo và quản lý QR code chuyên nghiệp cho doanh nghiệp</p>
        <div className="flex gap-4 justify-center">
          <Link to="/create" className="btn btn-primary">
            🚀 Tạo QR ngay
          </Link>
          <Link to="/qr" className="btn btn-outline">
            📊 Xem thống kê
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">🔄</div>
          <h3>QR Code Động</h3>
          <p>Chỉnh sửa nội dung sau khi tạo mã QR, không cần in lại</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📈</div>
          <h3>Thống kê chi tiết</h3>
          <p>Theo dõi lượt quét, vị trí địa lý, thiết bị của người dùng</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🎨</div>
          <h3>Tùy biến thiết kế</h3>
          <p>Thêm logo, màu sắc, khung viền để tăng nhận diện thương hiệu</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📦</div>
          <h3>Tạo hàng loạt</h3>
          <p>Import từ Excel/CSV để tạo hàng nghìn QR code chỉ trong vài phút</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🔐</div>
          <h3>Bảo mật nâng cao</h3>
          <p>Mật khẩu bảo vệ, hạn sử dụng, whitelist domain</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🌐</div>
          <h3>Landing Page</h3>
          <p>Chuyển QR thành trang web mini với form, survey, thông tin</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="card text-center mt-4">
        <h2>Sẵn sàng nâng tầm marketing của bạn?</h2>
        <p className="mb-3">Tham gia hàng nghìn doanh nghiệp đã tin tưởng QR Builder Pro</p>
        <div className="flex gap-3 justify-center">
          <Link to="/create" className="btn btn-primary">
            Bắt đầu miễn phí
          </Link>
          <a href="#features" className="btn btn-outline">
            Tìm hiểu thêm
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-3 mt-4">
        <div className="card text-center">
          <h3 className="text-3xl font-bold text-primary">10,000+</h3>
          <p>QR Code đã tạo</p>
        </div>
        <div className="card text-center">
          <h3 className="text-3xl font-bold text-primary">500+</h3>
          <p>Doanh nghiệp tin tưởng</p>
        </div>
        <div className="card text-center">
          <h3 className="text-3xl font-bold text-primary">99.9%</h3>
          <p>Thời gian hoạt động</p>
        </div>
      </section>
    </div>
  )
}

export default Home