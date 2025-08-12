import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function QrList() {
  const [qrCodes, setQrCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState({ folder: '', type: '' })

  useEffect(() => {
    fetchQrCodes()
  }, [])

  const fetchQrCodes = async () => {
    try {
      const queryParams = new URLSearchParams()
      if (filter.folder) queryParams.append('folder', filter.folder)
      if (filter.type) queryParams.append('type', filter.type)
      
      const response = await fetch(`/api/qr?${queryParams}`)
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      const data = await response.json()
      setQrCodes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteQrCode = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa QR code này?')) {
      return
    }

    try {
      const response = await fetch(`/api/qr/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setQrCodes(qrCodes.filter(qr => qr.id !== id))
      } else {
        alert('Không thể xóa QR code')
      }
    } catch (err) {
      alert('Lỗi khi xóa QR code: ' + err.message)
    }
  }

  const getContentTypeIcon = (content) => {
    if (!content) return '🔗'
    
    if (content.startsWith('BEGIN:VCARD')) return '👤'
    if (content.startsWith('WIFI:')) return '📶'
    if (content.startsWith('mailto:')) return '📧'
    if (content.startsWith('sms:')) return '💬'
    if (content.startsWith('http')) return '🔗'
    return '📝'
  }

  const formatContent = (content, target) => {
    if (target) return target
    if (!content) return ''
    
    if (content.startsWith('BEGIN:VCARD')) return 'Danh thiếp vCard'
    if (content.startsWith('WIFI:')) return 'Cấu hình WiFi'
    if (content.startsWith('mailto:')) return 'Soạn email'
    if (content.startsWith('sms:')) return 'Gửi SMS'
    
    return content.length > 50 ? content.substring(0, 50) + '...' : content
  }

  const uniqueFolders = [...new Set(qrCodes.map(qr => qr.folder).filter(Boolean))]

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách QR code...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <h3>❌ Lỗi tải dữ liệu</h3>
        <p>{error}</p>
        <button onClick={fetchQrCodes} className="btn btn-primary mt-2">
          🔄 Thử lại
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📊 Quản lý QR Code</h1>
        <Link to="/create" className="btn btn-primary">
          ➕ Tạo QR mới
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <h3 className="mb-3">🔍 Bộ lọc</h3>
        <div className="grid grid-3 gap-3">
          <div className="form-group">
            <label className="form-label">Thư mục:</label>
            <select 
              value={filter.folder} 
              onChange={(e) => setFilter({...filter, folder: e.target.value})}
              className="form-select"
            >
              <option value="">Tất cả thư mục</option>
              {uniqueFolders.map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Loại:</label>
            <select 
              value={filter.type} 
              onChange={(e) => setFilter({...filter, type: e.target.value})}
              className="form-select"
            >
              <option value="">Tất cả loại</option>
              <option value="static">Tĩnh</option>
              <option value="dynamic">Động</option>
            </select>
          </div>
          
          <div className="form-group flex items-end">
            <button 
              onClick={fetchQrCodes} 
              className="btn btn-outline w-full"
            >
              🔍 Áp dụng bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-3 mb-4">
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-blue-600">{qrCodes.length}</h3>
          <p>Tổng QR Code</p>
        </div>
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-green-600">
            {qrCodes.filter(qr => qr.type === 'dynamic').length}
          </h3>
          <p>QR Động</p>
        </div>
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-purple-600">{uniqueFolders.length}</h3>
          <p>Thư mục</p>
        </div>
      </div>

      {/* QR Code List */}
      {qrCodes.length === 0 ? (
        <div className="card text-center">
          <div className="feature-icon">📭</div>
          <h3>Chưa có QR Code nào</h3>
          <p className="mb-3">Tạo QR code đầu tiên để bắt đầu</p>
          <Link to="/create" className="btn btn-primary">
            🚀 Tạo QR Code đầu tiên
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {qrCodes.map(qr => (
            <div key={qr.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {getContentTypeIcon(qr.content)}
                  </span>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {qr.name || 'QR Code không tên'}
                    </h3>
                    <div className="flex gap-2 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded ${
                        qr.type === 'dynamic' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {qr.type === 'dynamic' ? '🔄 Động' : '📌 Tĩnh'}
                      </span>
                      {qr.folder && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                          📁 {qr.folder}
                        </span>
                      )}
                      {qr.password_protected && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                          🔒 Có mật khẩu
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-500">
                  <p>Mã: <code className="bg-gray-100 px-1 rounded">{qr.code}</code></p>
                  <p>{new Date(qr.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-gray-700">
                  <strong>Nội dung:</strong> {formatContent(qr.content, qr.target)}
                </p>
                {qr.expiry_at && (
                  <p className="text-orange-600">
                    <strong>⏰ Hết hạn:</strong> {new Date(qr.expiry_at).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {qr.download_urls?.png && (
                  <a 
                    href={qr.download_urls.png} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    📥 PNG
                  </a>
                )}
                
                {qr.download_urls?.svg && (
                  <a 
                    href={qr.download_urls.svg} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-success"
                  >
                    📥 SVG
                  </a>
                )}
                
                {qr.type === 'dynamic' && (
                  <button className="btn btn-outline">
                    📊 Thống kê
                  </button>
                )}
                
                <button className="btn btn-outline">
                  ✏️ Sửa
                </button>
                
                <button 
                  onClick={() => deleteQrCode(qr.id)}
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

export default QrList