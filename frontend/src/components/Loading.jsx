import React from 'react'

function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className={`spinner ${sizes[size]} ${className}`}></div>
  )
}

function LoadingOverlay({ message = 'Đang tải...', children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4 max-w-sm mx-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-700 font-medium">{message}</p>
        {children}
      </div>
    </div>
  )
}

function LoadingButton({ loading, children, className = '', ...props }) {
  return (
    <button 
      className={`btn ${className} ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
      disabled={loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  )
}

function LoadingPage({ message = 'Đang tải trang...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{message}</h3>
        <p className="text-gray-500">Vui lòng chờ trong giây lát...</p>
      </div>
    </div>
  )
}

function LoadingCard({ children, loading, message = 'Đang tải...' }) {
  if (loading) {
    return (
      <div className="card text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    )
  }

  return children
}

export {
  LoadingSpinner,
  LoadingOverlay,
  LoadingButton,
  LoadingPage,
  LoadingCard
}

export default LoadingSpinner