import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { LoadingButton } from './Loading.jsx'

function LoginForm({ onSuccess }) {
  const { actions } = useApp()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }
    
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    const result = await actions.login(formData)
    setLoading(false)

    if (result.success) {
      onSuccess && onSuccess(result.user)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🔐 Đăng nhập
          </h2>
          <p className="text-gray-600">
            Đăng nhập để truy cập tài khoản của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'border-red-500' : ''}`}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'border-red-500' : ''}`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <LoadingButton
            type="submit"
            loading={loading}
            className="btn-primary w-full"
          >
            Đăng nhập
          </LoadingButton>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <a href="#" className="text-primary hover:underline">
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function UserMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClickOutside = (event) => {
    if (!event.target.closest('.user-menu')) {
      setIsOpen(false)
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="user-menu relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg px-3 py-2 transition-all"
      >
        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          👤
        </div>
        <span className="hidden md:block">{user.name}</span>
        <span className="text-sm transform transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl py-2 min-w-48 z-[9999] border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="font-semibold text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          
          <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
            👤 Hồ sơ cá nhân
          </a>
          <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
            ⚙️ Cài đặt
          </a>
          <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
            📊 Thống kê
          </a>
          
          <div className="border-t border-gray-100 mt-2">
            <button
              onClick={() => {
                setIsOpen(false)
                onLogout()
              }}
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
            >
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export { LoginForm, UserMenu }