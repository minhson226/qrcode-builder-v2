import React from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { LoginForm } from '../components/Auth.jsx'

function Login() {
  const { isAuthenticated } = useApp()

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleLoginSuccess = () => {
    // Redirect will be handled by the Layout component
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-4xl">🔲</div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            QR Builder Pro
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Đăng nhập để quản lý QR code của bạn
          </p>
        </div>
        
        <LoginForm onSuccess={handleLoginSuccess} />
        
        <div className="text-center">
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              💡 Demo Account
            </h3>
            <p className="text-xs text-blue-600">
              Email: demo@example.com<br />
              Password: demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login