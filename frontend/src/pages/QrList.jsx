import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

function QrEditModal({ qr, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: qr?.name || '',
    target: qr?.target || '',
    folder: qr?.folder || ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (qr) {
      setFormData({
        name: qr.name || '',
        target: qr.target || '',
        folder: qr.folder || ''
      })
    }
  }, [qr])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/qr/${qr.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('qr-builder-token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedQr = await response.json()
        onSave(updatedQr)
        onClose()
      } else {
        alert('Không thể cập nhật QR code')
      }
    } catch (error) {
      alert('Lỗi khi cập nhật QR code: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">✏️ Chỉnh sửa QR Code</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên QR Code:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="form-input"
              placeholder="Nhập tên cho QR code..."
            />
          </div>

          {qr?.type === 'dynamic' && (
            <div className="form-group">
              <label className="form-label">URL đích:</label>
              <input
                type="url"
                value={formData.target}
                onChange={(e) => setFormData({...formData, target: e.target.value})}
                className="form-input"
                placeholder="https://example.com"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Thư mục:</label>
            <input
              type="text"
              value={formData.folder}
              onChange={(e) => setFormData({...formData, folder: e.target.value})}
              className="form-input"
              placeholder="Tên thư mục..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              ❌ Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function QrStatsModal({ qr, isOpen, onClose }) {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && qr) {
      fetchAnalytics()
    }
  }, [isOpen, qr])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/qr/${qr.id}/summary`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('qr-builder-token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        setAnalytics({ total_scans: 0, recent_scans: [], error: 'Không thể tải thống kê' })
      }
    } catch (error) {
      setAnalytics({ total_scans: 0, recent_scans: [], error: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">📊 Thống kê QR Code</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800">{qr?.name || 'QR Code không tên'}</h4>
          <p className="text-sm text-gray-600">Mã: {qr?.code}</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="spinner mx-auto mb-2"></div>
            <p className="text-gray-500">Đang tải thống kê...</p>
          </div>
        ) : analytics ? (
          <div>
            <div className="grid grid-2 gap-4 mb-4">
              <div className="card text-center">
                <h3 className="text-2xl font-bold text-blue-600">{analytics.total_scans || 0}</h3>
                <p className="text-sm">Tổng lượt quét</p>
              </div>
              <div className="card text-center">
                <h3 className="text-2xl font-bold text-green-600">{analytics.today_scans || 0}</h3>
                <p className="text-sm">Hôm nay</p>
              </div>
            </div>

            {analytics.error && (
              <div className="alert alert-info">
                <p>{analytics.error}</p>
              </div>
            )}

            <div className="mb-4">
              <h5 className="font-semibold mb-2">📈 Quét gần đây</h5>
              {analytics.recent_scans && analytics.recent_scans.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {analytics.recent_scans.map((scan, index) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                      <div className="flex justify-between">
                        <span>{scan.location || 'Không xác định'}</span>
                        <span>{new Date(scan.timestamp).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Chưa có lượt quét nào</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Không thể tải thống kê</p>
          </div>
        )}

        <button onClick={onClose} className="btn btn-outline w-full">
          Đóng
        </button>
      </div>
    </div>
  )
}

function QrList() {
  const { actions } = useApp()
  const [qrCodes, setQrCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState({ folder: '', type: '' })
  const [editingQr, setEditingQr] = useState(null)
  const [viewingStatsQr, setViewingStatsQr] = useState(null)

  useEffect(() => {
    fetchQrCodes()
  }, [])

  const fetchQrCodes = async () => {
    try {
      const queryParams = new URLSearchParams()
      if (filter.folder) queryParams.append('folder', filter.folder)
      if (filter.type) queryParams.append('type', filter.type)
      
      const response = await fetch(`/api/qr?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('qr-builder-token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      const data = await response.json()
      setQrCodes(data)
      actions.setQrCodes(data)
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
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('qr-builder-token')}`
        }
      })
      
      if (response.ok) {
        const updatedQrCodes = qrCodes.filter(qr => qr.id !== id)
        setQrCodes(updatedQrCodes)
        actions.setQrCodes(updatedQrCodes)
        
        actions.addNotification({
          type: 'success',
          title: 'Thành công',
          message: 'QR code đã được xóa'
        })
      } else {
        actions.addNotification({
          type: 'error',
          title: 'Lỗi',
          message: 'Không thể xóa QR code'
        })
      }
    } catch (err) {
      actions.addNotification({
        type: 'error',
        title: 'Lỗi',
        message: 'Lỗi khi xóa QR code: ' + err.message
      })
    }
  }

  const handleEditSave = (updatedQr) => {
    const updatedQrCodes = qrCodes.map(qr => 
      qr.id === updatedQr.id ? updatedQr : qr
    )
    setQrCodes(updatedQrCodes)
    actions.setQrCodes(updatedQrCodes)
    
    actions.addNotification({
      type: 'success',
      title: 'Thành công',
      message: 'QR code đã được cập nhật'
    })
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
                
                {qr.download_urls?.pdf && (
                  <a 
                    href={qr.download_urls.pdf} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-danger"
                  >
                    📄 PDF
                  </a>
                )}
                
                <button 
                  onClick={() => setViewingStatsQr(qr)}
                  className="btn btn-outline"
                >
                  📊 Thống kê
                </button>
                
                <button 
                  onClick={() => setEditingQr(qr)}
                  className="btn btn-outline"
                >
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

      {/* Edit Modal */}
      <QrEditModal
        qr={editingQr}
        isOpen={!!editingQr}
        onClose={() => setEditingQr(null)}
        onSave={handleEditSave}
      />

      {/* Stats Modal */}
      <QrStatsModal
        qr={viewingStatsQr}
        isOpen={!!viewingStatsQr}
        onClose={() => setViewingStatsQr(null)}
      />
    </div>
  )
}

export default QrList