import React, { useState } from 'react'

function QrCreate() {
  const [formData, setFormData] = useState({
    type: 'static',
    content: '',
    target: '',
    name: '',
    folder: '',
    formats: ['png']
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

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
        payload.content = formData.content
      } else {
        payload.target = formData.target
      }

      const response = await fetch('/qr', {
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
        content: '',
        target: '',
        name: '',
        folder: '',
        formats: ['png']
      })
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFormatChange = (format) => {
    setFormData(prev => {
      const formats = prev.formats.includes(format)
        ? prev.formats.filter(f => f !== format)
        : [...prev.formats, format]
      
      return {
        ...prev,
        formats: formats.length > 0 ? formats : ['png'] // Always keep at least one format
      }
    })
  }

  return (
    <div>
      <h1>Create QR Code</h1>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Type:
          </label>
          <select 
            name="type" 
            value={formData.type} 
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="static">Static</option>
            <option value="dynamic">Dynamic</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Name (optional):
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter QR code name"
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Folder (optional):
          </label>
          <input
            type="text"
            name="folder"
            value={formData.folder}
            onChange={handleChange}
            placeholder="Enter folder name"
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        {formData.type === 'static' ? (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Content:
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Enter the content to encode (URL, text, etc.)"
              required
              rows={3}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        ) : (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Target URL:
            </label>
            <input
              type="url"
              name="target"
              value={formData.target}
              onChange={handleChange}
              placeholder="Enter the target URL"
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Formats:
          </label>
          <div>
            {['png', 'svg'].map(format => (
              <label key={format} style={{ marginRight: '15px', display: 'inline-block' }}>
                <input
                  type="checkbox"
                  checked={formData.formats.includes(format)}
                  onChange={() => handleFormatChange(format)}
                  style={{ marginRight: '5px' }}
                />
                {format.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: loading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating...' : 'Create QR Code'}
        </button>
      </form>

      {error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '4px',
          color: '#721c24'
        }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb', 
          borderRadius: '4px'
        }}>
          <h3>QR Code Created Successfully!</h3>
          <p><strong>Code:</strong> {result.code}</p>
          <p><strong>Type:</strong> {result.type}</p>
          
          <div style={{ marginTop: '10px' }}>
            {result.download_urls?.png && (
              <a 
                href={result.download_urls.png} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  marginRight: '10px', 
                  padding: '5px 10px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  textDecoration: 'none', 
                  borderRadius: '3px'
                }}
              >
                Download PNG
              </a>
            )}
            
            {result.download_urls?.svg && (
              <a 
                href={result.download_urls.svg} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  padding: '5px 10px', 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  textDecoration: 'none', 
                  borderRadius: '3px'
                }}
              >
                Download SVG
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default QrCreate