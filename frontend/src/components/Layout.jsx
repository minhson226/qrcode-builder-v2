import React from 'react'
import { Link } from 'react-router-dom'

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="navbar">
        <div className="nav-content">
          <Link to="/" className="nav-brand">
            🔲 QR Builder Pro
          </Link>
          <div className="nav-links">
            <Link to="/">Trang chủ</Link>
            <Link to="/create">Tạo QR</Link>
            <Link to="/qr">Quản lý QR</Link>
          </div>
        </div>
      </nav>
      
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
      
      <footer style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '2rem 0',
        marginTop: '4rem'
      }}>
        <div className="container">
          <p>&copy; 2025 QR Builder Pro. Tạo QR code chuyên nghiệp cho doanh nghiệp.</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout