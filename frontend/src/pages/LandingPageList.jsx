import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function LandingPageList() {
  const [landingPages, setLandingPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLandingPages()
  }, [])

  const fetchLandingPages = async () => {
    try {
      const response = await fetch('/api/landing-pages')
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      const data = await response.json()
      setLandingPages(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteLandingPage = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa landing page này?')) {
      return
    }

    try {
      const response = await fetch(`/api/landing-pages/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setLandingPages(landingPages.filter(page => page.id !== id))
      } else {
        alert('Không thể xóa landing page')
      }
    } catch (err) {
      alert('Lỗi khi xóa landing page: ' + err.message)
    }
  }

  const togglePublished = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/landing-pages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_published: !currentStatus
        })
      })
      
      if (response.ok) {
        const updatedPage = await response.json()
        setLandingPages(landingPages.map(page => 
          page.id === id ? updatedPage : page
        ))
      } else {
        alert('Không thể cập nhật trạng thái')
      }
    } catch (err) {
      alert('Lỗi khi cập nhật: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách Landing Pages...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <h3>❌ Lỗi tải dữ liệu</h3>
        <p>{error}</p>
        <button onClick={fetchLandingPages} className="btn btn-primary mt-2">
          🔄 Thử lại
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🌐 Quản lý Landing Pages</h1>
        <Link to="/landing-pages/create" className="btn btn-primary">
          ➕ Tạo Landing Page mới
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-3 mb-4">
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-blue-600">{landingPages.length}</h3>
          <p>Tổng Landing Pages</p>
        </div>
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-green-600">
            {landingPages.filter(page => page.is_published).length}
          </h3>
          <p>Đang hoạt động</p>
        </div>
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-purple-600">
            {landingPages.filter(page => page.collect_leads).length}
          </h3>
          <p>Thu thập leads</p>
        </div>
      </div>

      {/* Landing Pages List */}
      {landingPages.length === 0 ? (
        <div className="card text-center">
          <div className="feature-icon">🌐</div>
          <h3>Chưa có Landing Page nào</h3>
          <p className="mb-3">Tạo landing page đầu tiên để bắt đầu</p>
          <Link to="/landing-pages/create" className="btn btn-primary">
            🚀 Tạo Landing Page đầu tiên
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {landingPages.map(page => (
            <div key={page.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <h3 className="font-semibold text-lg">{page.title}</h3>
                    <div className="flex gap-2 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded ${
                        page.is_published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {page.is_published ? '✅ Hoạt động' : '⏸️ Tạm dừng'}
                      </span>
                      
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        🎨 {page.theme}
                      </span>
                      
                      {page.collect_leads && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          📋 Thu thập leads
                        </span>
                      )}
                      
                      {page.analytics_enabled && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
                          📊 Analytics
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-500">
                  <p>Slug: <code className="bg-gray-100 px-1 rounded">/l/{page.slug}</code></p>
                  <p>{new Date(page.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <div className="mb-3">
                {page.description && (
                  <p className="text-gray-700 mb-2">{page.description}</p>
                )}
                
                <p className="text-sm text-gray-600">
                  <strong>URL:</strong> <a 
                    href={`/l/${page.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {window.location.origin}/l/{page.slug}
                  </a>
                </p>
                
                {page.qr_id && (
                  <p className="text-sm text-gray-600">
                    <strong>Liên kết QR:</strong> {page.qr_id}
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <a 
                  href={`/l/${page.slug}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  👀 Xem trang
                </a>
                
                <button 
                  onClick={() => togglePublished(page.id, page.is_published)}
                  className={`btn ${page.is_published ? 'btn-outline' : 'btn-success'}`}
                >
                  {page.is_published ? '⏸️ Tạm dừng' : '▶️ Kích hoạt'}
                </button>
                
                {page.collect_leads && (
                  <Link 
                    to={`/landing-pages/${page.id}/leads`}
                    className="btn btn-outline"
                  >
                    📋 Xem leads
                  </Link>
                )}
                
                <button className="btn btn-outline">
                  ✏️ Chỉnh sửa
                </button>
                
                <button 
                  onClick={() => deleteLandingPage(page.id)}
                  className="btn btn-danger"
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LandingPageList