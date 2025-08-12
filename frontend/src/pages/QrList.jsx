import React, { useState, useEffect } from 'react'

function QrList() {
  const [qrCodes, setQrCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchQrCodes()
  }, [])

  const fetchQrCodes = async () => {
    try {
      const response = await fetch('/qr')
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
    if (!confirm('Are you sure you want to delete this QR code?')) {
      return
    }

    try {
      const response = await fetch(`/qr/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Remove from local state
        setQrCodes(qrCodes.filter(qr => qr.id !== id))
      } else {
        alert('Failed to delete QR code')
      }
    } catch (err) {
      alert('Error deleting QR code: ' + err.message)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>QR Codes</h1>
      
      {qrCodes.length === 0 ? (
        <p>No QR codes found. <a href="/create">Create your first QR code</a></p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {qrCodes.map(qr => (
            <div key={qr.id} style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              borderRadius: '5px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3>{qr.name || 'Unnamed QR Code'}</h3>
              <p><strong>Type:</strong> {qr.type}</p>
              <p><strong>Code:</strong> {qr.code}</p>
              {qr.content && <p><strong>Content:</strong> {qr.content}</p>}
              {qr.target && <p><strong>Target:</strong> {qr.target}</p>}
              {qr.folder && <p><strong>Folder:</strong> {qr.folder}</p>}
              
              <div style={{ marginTop: '10px' }}>
                {qr.download_urls?.png && (
                  <a 
                    href={qr.download_urls.png} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      marginRight: '10px', 
                      padding: '5px 10px', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      textDecoration: 'none', 
                      borderRadius: '3px',
                      fontSize: '12px'
                    }}
                  >
                    Download PNG
                  </a>
                )}
                
                {qr.download_urls?.svg && (
                  <a 
                    href={qr.download_urls.svg} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      marginRight: '10px', 
                      padding: '5px 10px', 
                      backgroundColor: '#28a745', 
                      color: 'white', 
                      textDecoration: 'none', 
                      borderRadius: '3px',
                      fontSize: '12px'
                    }}
                  >
                    Download SVG
                  </a>
                )}
                
                <button 
                  onClick={() => deleteQrCode(qr.id)}
                  style={{ 
                    padding: '5px 10px', 
                    backgroundColor: '#dc3545', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '3px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
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