import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { UserMenu } from './Auth.jsx'
import NotificationCenter from './NotificationCenter.jsx'
import { LoadingPage } from './Loading.jsx'

function Layout({ children }) {
  const { user, isAuthenticated, loading } = useApp()
  const location = useLocation()
  
  // Show loading page during app initialization
  if (loading && !user) {
    return <LoadingPage message="Đang khởi tạo ứng dụng..." />
  }

  // Don't show navigation on login page
  const isLoginPage = location.pathname === '/login'

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationCenter />
      
      {!isLoginPage && (
        <nav className="navbar">
          <div className="nav-content">
            <Link to="/" className="nav-brand">
              🔲 QR Builder Pro
            </Link>
            
            <div className="nav-links">
              <Link to="/">Trang chủ</Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/create">Tạo QR</Link>
                  <Link to="/qr">Quản lý QR</Link>
                  <Link to="/landing-pages">Landing Pages</Link>
                </>
              ) : (
                <>
                  <Link to="/create">Tạo QR</Link>
                  <Link to="/qr">Xem QR</Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <UserMenu 
                  user={user} 
                  onLogout={() => {
                    actions.logout()
                    window.location.href = '/'
                  }}
                />
              ) : (
                <Link to="/login" className="btn btn-outline text-white border-white hover:bg-white hover:text-primary">
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
      
      <main className={isLoginPage ? '' : 'main-content'}>
        <div className={isLoginPage ? '' : 'container'}>
          {children}
        </div>
      </main>
      
      {!isLoginPage && (
        <footer style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          padding: '2rem 0',
          marginTop: '4rem'
        }}>
          <div className="container">
            <div className="grid md:grid-3 gap-8 text-left mb-8">
              <div>
                <h3 className="font-semibold mb-4">🔲 QR Builder Pro</h3>
                <p className="text-sm opacity-90 mb-4">
                  Nền tảng tạo và quản lý QR code chuyên nghiệp cho doanh nghiệp.
                  Dễ sử dụng, bảo mật cao, thống kê chi tiết.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="text-white hover:opacity-75">📧</a>
                  <a href="#" className="text-white hover:opacity-75">📱</a>
                  <a href="#" className="text-white hover:opacity-75">🌐</a>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Tính năng</h4>
                <ul className="text-sm space-y-2 opacity-90">
                  <li>🔄 QR Code động</li>
                  <li>📊 Thống kê chi tiết</li>
                  <li>🎨 Tùy biến thiết kế</li>
                  <li>📦 Tạo hàng loạt</li>
                  <li>🔐 Bảo mật nâng cao</li>
                  <li>🌐 Landing Page</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Hỗ trợ</h4>
                <ul className="text-sm space-y-2 opacity-90">
                  <li><a href="#" className="hover:underline">📖 Hướng dẫn</a></li>
                  <li><a href="#" className="hover:underline">❓ FAQ</a></li>
                  <li><a href="#" className="hover:underline">💬 Liên hệ</a></li>
                  <li><a href="#" className="hover:underline">🆘 Hỗ trợ</a></li>
                  <li><a href="#" className="hover:underline">🔧 API Docs</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white border-opacity-20 pt-6">
              <p className="text-sm opacity-75">
                &copy; 2025 QR Builder Pro. Made with ❤️ in Vietnam.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export default Layout