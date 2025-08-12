import React, { useState } from 'react'

function QrCreate() {
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
  const [error, setError] = useState(null)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        type: formData.type,
        name: formData.name || null,
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
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
      
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
      
    } catch (err) {
      setError(err.message)
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
            className="form-input"
          />
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
              className="form-input"
            />
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
              className="form-textarea"
            />
          </div>
        )
      
      case 'vcard':
        return (
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
        )
      
      case 'wifi':
        return (
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
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">🚀 Tạo QR Code mới</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2 gap-4">
            {/* Left Column */}
            <div>
              <div className="form-group">
                <label className="form-label">Loại QR:</label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="static">QR Tĩnh (Static)</option>
                  <option value="dynamic">QR Động (Dynamic)</option>
                </select>
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
                <label className="form-label">Tên QR (tùy chọn):</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Đặt tên cho QR code"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Thư mục (tùy chọn):</label>
                <input
                  type="text"
                  name="folder"
                  value={formData.folder}
                  onChange={handleChange}
                  placeholder="Nhóm QR theo thư mục"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Định dạng xuất:</label>
                <div className="checkbox-group">
                  {['png', 'svg', 'pdf'].map(format => (
                    <div key={format} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.formats.includes(format)}
                        onChange={() => handleFormatChange(format)}
                        id={format}
                      />
                      <label htmlFor={format}>{format.toUpperCase()}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {renderContentFields()}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <div className="spinner mr-2" style={{ width: '16px', height: '16px' }}></div>
                  Đang tạo...
                </>
              ) : (
                '🎯 Tạo QR Code'
              )}
            </button>
            
            <button 
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-outline"
            >
              🔄 Làm mới
            </button>
          </div>
        </form>

        {error && (
          <div className="alert alert-error">
            ❌ Lỗi: {error}
          </div>
        )}

        {result && (
          <div className="alert alert-success">
            <h3>✅ QR Code tạo thành công!</h3>
            <p><strong>Mã:</strong> {result.code}</p>
            <p><strong>Loại:</strong> {result.type}</p>
            
            <div className="flex gap-2 mt-3">
              {result.download_urls?.png && (
                <a 
                  href={result.download_urls.png} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  📥 Tải PNG
                </a>
              )}
              
              {result.download_urls?.svg && (
                <a 
                  href={result.download_urls.svg} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-success"
                >
                  📥 Tải SVG
                </a>
              )}
              
              {result.download_urls?.pdf && (
                <a 
                  href={result.download_urls.pdf} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-danger"
                >
                  📄 Tải PDF
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QrCreate