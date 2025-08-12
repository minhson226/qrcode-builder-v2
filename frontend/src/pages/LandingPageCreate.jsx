import React, { useState, useEffect } from 'react'

function LandingPageCreate() {
  const [qrCodes, setQrCodes] = useState([])
  const [formData, setFormData] = useState({
    qr_id: '',
    slug: '',
    title: '',
    description: '',
    theme: 'default',
    meta_title: '',
    meta_description: '',
    collect_leads: false,
    analytics_enabled: true,
    content: {
      blocks: []
    }
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchQrCodes()
  }, [])

  const fetchQrCodes = async () => {
    try {
      const response = await fetch('/api/qr')
      if (response.ok) {
        const data = await response.json()
        setQrCodes(data.filter(qr => qr.type === 'dynamic'))
      }
    } catch (err) {
      console.error('Error fetching QR codes:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/landing-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
      
      // Reset form
      setFormData({
        qr_id: '',
        slug: '',
        title: '',
        description: '',
        theme: 'default',
        meta_title: '',
        meta_description: '',
        collect_leads: false,
        analytics_enabled: true,
        content: {
          blocks: []
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const addContentBlock = (blockType) => {
    const newBlock = {
      type: blockType,
      content: getDefaultBlockContent(blockType),
      order: formData.content.blocks.length
    }
    
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        blocks: [...prev.content.blocks, newBlock]
      }
    }))
  }

  const updateContentBlock = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        blocks: prev.content.blocks.map((block, i) => 
          i === index 
            ? { ...block, content: { ...block.content, [field]: value } }
            : block
        )
      }
    }))
  }

  const removeContentBlock = (index) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        blocks: prev.content.blocks.filter((_, i) => i !== index)
      }
    }))
  }

  const getDefaultBlockContent = (blockType) => {
    switch (blockType) {
      case 'text':
        return { text: 'Nhập nội dung văn bản tại đây' }
      case 'button':
        return { text: 'Nút bấm', url: 'https://example.com', style: 'primary' }
      case 'image':
        return { url: '', alt: 'Hình ảnh' }
      default:
        return {}
    }
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleChange = (e) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      meta_title: prev.meta_title || title
    }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">🌐 Tạo Landing Page</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2 gap-4">
            {/* Left Column - Basic Info */}
            <div>
              <div className="form-group">
                <label className="form-label">QR Code (tùy chọn):</label>
                <select 
                  name="qr_id" 
                  value={formData.qr_id} 
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Không liên kết QR Code</option>
                  {qrCodes.map(qr => (
                    <option key={qr.id} value={qr.id}>
                      {qr.name || qr.code} - {qr.target}
                    </option>
                  ))}
                </select>
                <small className="text-gray-600">Chỉ QR động mới có thể liên kết với Landing Page</small>
              </div>

              <div className="form-group">
                <label className="form-label">Tiêu đề trang:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Nhập tiêu đề cho landing page"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Đường dẫn (slug):</label>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-1">/l/</span>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="duong-dan-url"
                    required
                    className="form-input"
                  />
                </div>
                <small className="text-gray-600">URL thân thiện, chỉ chứa chữ thường, số và dấu gạch ngang</small>
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Mô tả ngắn về landing page"
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Giao diện:</label>
                <select 
                  name="theme" 
                  value={formData.theme} 
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="default">Mặc định</option>
                  <option value="business">Doanh nghiệp</option>
                  <option value="creative">Sáng tạo</option>
                  <option value="minimal">Tối giản</option>
                </select>
              </div>

              <div className="checkbox-group">
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    name="collect_leads"
                    checked={formData.collect_leads}
                    onChange={handleChange}
                    id="collect_leads"
                  />
                  <label htmlFor="collect_leads">Thu thập thông tin khách hàng</label>
                </div>
                
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    name="analytics_enabled"
                    checked={formData.analytics_enabled}
                    onChange={handleChange}
                    id="analytics_enabled"
                  />
                  <label htmlFor="analytics_enabled">Bật thống kê truy cập</label>
                </div>
              </div>
            </div>

            {/* Right Column - SEO & Content */}
            <div>
              <h3 className="font-semibold mb-3">🔍 SEO & Meta Tags</h3>
              
              <div className="form-group">
                <label className="form-label">Meta Title:</label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  placeholder="Tiêu đề SEO (60 ký tự)"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Meta Description:</label>
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  placeholder="Mô tả SEO (160 ký tự)"
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <h3 className="font-semibold mb-3">📝 Nội dung trang</h3>
              
              <div className="content-blocks">
                {formData.content.blocks.map((block, index) => (
                  <div key={index} className="content-block border rounded p-3 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">
                        {block.type === 'text' && '📝 Văn bản'}
                        {block.type === 'button' && '🔘 Nút bấm'}
                        {block.type === 'image' && '🖼️ Hình ảnh'}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeContentBlock(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {block.type === 'text' && (
                      <textarea
                        value={block.content.text}
                        onChange={(e) => updateContentBlock(index, 'text', e.target.value)}
                        placeholder="Nhập nội dung văn bản"
                        className="form-textarea"
                        rows="2"
                      />
                    )}
                    
                    {block.type === 'button' && (
                      <div className="grid grid-2 gap-2">
                        <input
                          type="text"
                          value={block.content.text}
                          onChange={(e) => updateContentBlock(index, 'text', e.target.value)}
                          placeholder="Tên nút"
                          className="form-input"
                        />
                        <input
                          type="url"
                          value={block.content.url}
                          onChange={(e) => updateContentBlock(index, 'url', e.target.value)}
                          placeholder="Đường dẫn"
                          className="form-input"
                        />
                      </div>
                    )}
                    
                    {block.type === 'image' && (
                      <div className="grid grid-2 gap-2">
                        <input
                          type="url"
                          value={block.content.url}
                          onChange={(e) => updateContentBlock(index, 'url', e.target.value)}
                          placeholder="URL hình ảnh"
                          className="form-input"
                        />
                        <input
                          type="text"
                          value={block.content.alt}
                          onChange={(e) => updateContentBlock(index, 'alt', e.target.value)}
                          placeholder="Mô tả hình ảnh"
                          className="form-input"
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="add-content-buttons">
                  <h4 className="font-semibold mb-2">Thêm nội dung:</h4>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => addContentBlock('text')}
                      className="btn btn-outline"
                    >
                      📝 Văn bản
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentBlock('button')}
                      className="btn btn-outline"
                    >
                      🔘 Nút bấm
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentBlock('image')}
                      className="btn btn-outline"
                    >
                      🖼️ Hình ảnh
                    </button>
                  </div>
                </div>
              </div>
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
                '🚀 Tạo Landing Page'
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
            <h3>✅ Landing Page tạo thành công!</h3>
            <p><strong>Tiêu đề:</strong> {result.title}</p>
            <p><strong>Đường dẫn:</strong> <a href={`/l/${result.slug}`} target="_blank" rel="noopener noreferrer">/l/{result.slug}</a></p>
            
            <div className="flex gap-2 mt-3">
              <a 
                href={`/l/${result.slug}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                👀 Xem trang
              </a>
              
              <a 
                href="/landing-pages" 
                className="btn btn-success"
              >
                📋 Quản lý Landing Pages
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LandingPageCreate