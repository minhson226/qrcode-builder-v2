import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { LoadingButton } from '../components/Loading.jsx'

function QrCreate() {
  const { actions } = useApp()
  const [formData, setFormData] = useState({
    type: 'static',
    contentType: 'url', // url, text, vcard, wifi, email, sms
    content: '',
    target: '',
    name: '',
    folder: '',
    formats: ['png'],
    // VCard fields
    vcardData: {
      firstName: '',
      lastName: '',
      organization: '',
      phone: '',
      email: '',
      website: '',
      address: ''
    },
    // WiFi fields
    wifiData: {
      ssid: '',
      password: '',
      security: 'WPA', // WPA, WEP, nopass
      hidden: false
    },
    // Email fields
    emailData: {
      to: '',
      subject: '',
      body: ''
    },
    // SMS fields
    smsData: {
      phone: '',
      message: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [errors, setErrors] = useState({})

  const generateContent = () => {
    switch (formData.contentType) {
      case 'vcard':
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${formData.vcardData.firstName} ${formData.vcardData.lastName}
ORG:${formData.vcardData.organization}
TEL:${formData.vcardData.phone}
EMAIL:${formData.vcardData.email}
URL:${formData.vcardData.website}
ADR:;;;;${formData.vcardData.address};;;
END:VCARD`
        return vcard
      
      case 'wifi':
        return `WIFI:T:${formData.wifiData.security};S:${formData.wifiData.ssid};P:${formData.wifiData.password};H:${formData.wifiData.hidden ? 'true' : 'false'};;`
      
      case 'email':
        return `mailto:${formData.emailData.to}?subject=${encodeURIComponent(formData.emailData.subject)}&body=${encodeURIComponent(formData.emailData.body)}`
      
      case 'sms':
        return `sms:${formData.smsData.phone}?body=${encodeURIComponent(formData.smsData.message)}`
      
      default:
        return formData.content
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên QR code là bắt buộc'
    }
    
    if (formData.type === 'static') {
      if (formData.contentType === 'url' && !formData.content.trim()) {
        newErrors.content = 'URL là bắt buộc'
      } else if (formData.contentType === 'text' && !formData.content.trim()) {
        newErrors.content = 'Nội dung văn bản là bắt buộc'
      } else if (formData.contentType === 'vcard') {
        if (!formData.vcardData.firstName.trim() && !formData.vcardData.lastName.trim()) {
          newErrors.vcard = 'Họ hoặc tên là bắt buộc'
        }
      } else if (formData.contentType === 'wifi' && !formData.wifiData.ssid.trim()) {
        newErrors.wifi = 'Tên WiFi (SSID) là bắt buộc'
      } else if (formData.contentType === 'email' && !formData.emailData.to.trim()) {
        newErrors.email = 'Email người nhận là bắt buộc'
      } else if (formData.contentType === 'sms' && !formData.smsData.phone.trim()) {
        newErrors.sms = 'Số điện thoại là bắt buộc'
      }
    } else if (formData.type === 'dynamic' && !formData.target.trim()) {
      newErrors.target = 'Target URL là bắt buộc'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      actions.addNotification({
        type: 'error',
        title: 'Lỗi validation',
        message: 'Vui lòng kiểm tra và điền đầy đủ thông tin'
      })
      return
    }

    setLoading(true)

    try {
      const payload = {
        type: formData.type,
        name: formData.name,
        folder: formData.folder || null,
        formats: formData.formats
      }

      if (formData.type === 'static') {
        payload.content = generateContent()
      } else {
        payload.target = formData.target
      }

      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Lỗi server: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
      
      // Add to context
      actions.addQrCode(data)
      
      // Show success notification
      actions.addNotification({
        type: 'success',
        title: 'QR Code tạo thành công!',
        message: `QR code "${data.name}" đã được tạo với mã ${data.code}`
      })
      
      // Reset form
      setFormData({
        type: 'static',
        contentType: 'url',
        content: '',
        target: '',
        name: '',
        folder: '',
        formats: ['png'],
        vcardData: {
          firstName: '',
          lastName: '',
          organization: '',
          phone: '',
          email: '',
          website: '',
          address: ''
        },
        wifiData: {
          ssid: '',
          password: '',
          security: 'WPA',
          hidden: false
        },
        emailData: {
          to: '',
          subject: '',
          body: ''
        },
        smsData: {
          phone: '',
          message: ''
        }
      })
      setErrors({})
      
    } catch (err) {
      actions.addNotification({
        type: 'error',
        title: 'Lỗi tạo QR code',
        message: err.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
    
    // Clear errors when user types
    if (errors[name] || errors.content || errors.target) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        content: '',
        target: ''
      }))
    }
  }

  const handleFormatChange = (format) => {
    setFormData(prev => {
      const formats = prev.formats.includes(format)
        ? prev.formats.filter(f => f !== format)
        : [...prev.formats, format]
      
      return {
        ...prev,
        formats: formats.length > 0 ? formats : ['png']
      }
    })
  }

  const renderContentFields = () => {
    if (formData.type === 'dynamic') {
      return (
        <div className="form-group">
          <label className="form-label">Target URL:</label>
          <input
            type="url"
            name="target"
            value={formData.target}
            onChange={handleChange}
            placeholder="https://example.com"
            required
            className={`form-input ${errors.target ? 'border-red-500' : ''}`}
          />
          {errors.target && (
            <p className="text-red-500 text-sm mt-1">{errors.target}</p>
          )}
        </div>
      )
    }

    switch (formData.contentType) {
      case 'url':
        return (
          <div className="form-group">
            <label className="form-label">URL:</label>
            <input
              type="url"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="https://example.com"
              required
              className={`form-input ${errors.content ? 'border-red-500' : ''}`}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>
        )
      
      case 'text':
        return (
          <div className="form-group">
            <label className="form-label">Nội dung văn bản:</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Nhập nội dung văn bản"
              required
              className={`form-textarea ${errors.content ? 'border-red-500' : ''}`}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>
        )
      
      case 'vcard':
        return (
          <div>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Họ:</label>
                <input
                  type="text"
                  name="vcardData.firstName"
                  value={formData.vcardData.firstName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tên:</label>
                <input
                  type="text"
                  name="vcardData.lastName"
                  value={formData.vcardData.lastName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Công ty:</label>
                <input
                  type="text"
                  name="vcardData.organization"
                  value={formData.vcardData.organization}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Điện thoại:</label>
                <input
                  type="tel"
                  name="vcardData.phone"
                  value={formData.vcardData.phone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  name="vcardData.email"
                  value={formData.vcardData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Website:</label>
                <input
                  type="url"
                  name="vcardData.website"
                  value={formData.vcardData.website}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Địa chỉ:</label>
                <input
                  type="text"
                  name="vcardData.address"
                  value={formData.vcardData.address}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
            {errors.vcard && (
              <p className="text-red-500 text-sm mt-1">{errors.vcard}</p>
            )}
          </div>
        )
      
      case 'wifi':
        return (
          <div>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Tên WiFi (SSID):</label>
                <input
                  type="text"
                  name="wifiData.ssid"
                  value={formData.wifiData.ssid}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu:</label>
                <input
                  type="password"
                  name="wifiData.password"
                  value={formData.wifiData.password}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bảo mật:</label>
                <select
                  name="wifiData.security"
                  value={formData.wifiData.security}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Không mật khẩu</option>
                </select>
              </div>
              <div className="form-group flex items-center">
                <input
                  type="checkbox"
                  name="wifiData.hidden"
                  checked={formData.wifiData.hidden}
                  onChange={handleChange}
                  id="hidden-wifi"
                />
                <label htmlFor="hidden-wifi" className="ml-2">WiFi ẩn</label>
              </div>
            </div>
            {errors.wifi && (
              <p className="text-red-500 text-sm mt-1">{errors.wifi}</p>
            )}
          </div>
        )
      
      case 'email':
        return (
          <div>
            <div className="form-group">
              <label className="form-label">Email người nhận:</label>
              <input
                type="email"
                name="emailData.to"
                value={formData.emailData.to}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tiêu đề:</label>
              <input
                type="text"
                name="emailData.subject"
                value={formData.emailData.subject}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nội dung:</label>
              <textarea
                name="emailData.body"
                value={formData.emailData.body}
                onChange={handleChange}
                className="form-textarea"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
        )
      
      case 'sms':
        return (
          <div>
            <div className="form-group">
              <label className="form-label">Số điện thoại:</label>
              <input
                type="tel"
                name="smsData.phone"
                value={formData.smsData.phone}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tin nhắn:</label>
              <textarea
                name="smsData.message"
                value={formData.smsData.message}
                onChange={handleChange}
                className="form-textarea"
              />
            </div>
            {errors.sms && (
              <p className="text-red-500 text-sm mt-1">{errors.sms}</p>
            )}
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🚀 Tạo QR Code mới</h1>
            <p className="text-gray-600">Tạo QR code chuyên nghiệp với nhiều định dạng và tùy chọn</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Bước 1/1</p>
            <div className="w-24 h-2 bg-gray-200 rounded-full">
              <div className="w-full h-2 bg-primary rounded-full"></div>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2 gap-6">
            {/* Left Column - Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">⚙️ Cấu hình cơ bản</h3>
              
              <div className="form-group">
                <label className="form-label">Tên QR Code:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="VD: QR Menu nhà hàng"
                  required
                  className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Loại QR:</label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="static">🔒 QR Tĩnh (Nội dung cố định)</option>
                  <option value="dynamic">🔄 QR Động (Có thể thay đổi)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.type === 'static' 
                    ? 'Nội dung được mã hóa trực tiếp trong QR, không thể thay đổi' 
                    : 'Có thể thay đổi nội dung sau khi tạo QR, có thống kê'}
                </p>
              </div>

              {formData.type === 'static' && (
                <div className="form-group">
                  <label className="form-label">Loại nội dung:</label>
                  <select 
                    name="contentType" 
                    value={formData.contentType} 
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="url">🔗 Website URL</option>
                    <option value="text">📝 Văn bản</option>
                    <option value="vcard">👤 Danh thiếp (vCard)</option>
                    <option value="wifi">📶 WiFi</option>
                    <option value="email">📧 Email</option>
                    <option value="sms">💬 SMS</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Thư mục (tùy chọn):</label>
                <input
                  type="text"
                  name="folder"
                  value={formData.folder}
                  onChange={handleChange}
                  placeholder="VD: Marketing, Sự kiện"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Định dạng xuất:</label>
                <div className="checkbox-group">
                  {[
                    { value: 'png', label: 'PNG (Hình ảnh)', icon: '🖼️' },
                    { value: 'svg', label: 'SVG (Vector)', icon: '📐' },
                    { value: 'pdf', label: 'PDF (In ấn)', icon: '📄' }
                  ].map(format => (
                    <div key={format.value} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.formats.includes(format.value)}
                        onChange={() => handleFormatChange(format.value)}
                        id={format.value}
                      />
                      <label htmlFor={format.value} className="text-sm">
                        {format.icon} {format.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Nội dung QR Code</h3>
              {renderContentFields()}
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t">
            <LoadingButton
              type="submit" 
              loading={loading}
              className="btn-primary"
            >
              {loading ? 'Đang tạo QR...' : '🎯 Tạo QR Code'}
            </LoadingButton>
            
            <button 
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-outline"
              disabled={loading}
            >
              🔄 Làm mới
            </button>
            
            <a 
              href="/qr" 
              className="btn btn-outline"
            >
              📋 Xem danh sách
            </a>
          </div>
        </form>

        {result && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              ✅ QR Code tạo thành công!
            </h3>
            
            <div className="grid md:grid-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Thông tin QR:</p>
                <div className="space-y-1 text-sm">
                  <p><strong>Mã:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.code}</code></p>
                  <p><strong>Tên:</strong> {result.name}</p>
                  <p><strong>Loại:</strong> {result.type === 'dynamic' ? '🔄 Động' : '🔒 Tĩnh'}</p>
                  {result.folder && <p><strong>Thư mục:</strong> {result.folder}</p>}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Tải xuống:</p>
                <div className="flex flex-wrap gap-2">
                  {result.download_urls?.png && (
                    <a 
                      href={result.download_urls.png} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      📥 PNG
                    </a>
                  )}
                  
                  {result.download_urls?.svg && (
                    <a 
                      href={result.download_urls.svg} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-success btn-sm"
                    >
                      📥 SVG
                    </a>
                  )}
                  
                  {result.download_urls?.pdf && (
                    <a 
                      href={result.download_urls.pdf} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-danger btn-sm"
                    >
                      📄 PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <a href="/qr" className="btn btn-outline">
                📋 Xem tất cả QR
              </a>
              <button 
                onClick={() => setResult(null)}
                className="btn btn-outline"
              >
                ➕ Tạo QR khác
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QrCreate