import React from 'react'

function Home() {
  return (
    <div>
      <h1>QRCode Builder</h1>
      <p>Welcome to the powerful QRCode SaaS platform for creating and managing QR codes</p>
      
      <div style={{ margin: '20px 0' }}>
        <h2>Features</h2>
        <ul>
          <li>Create static and dynamic QR codes</li>
          <li>Analytics and tracking</li>
          <li>Bulk QR code generation</li>
          <li>Password protection and expiry</li>
          <li>Custom designs and branding</li>
        </ul>
      </div>
      
      <div style={{ margin: '20px 0' }}>
        <a 
          href="/create" 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px',
            marginRight: '10px'
          }}
        >
          Create QR Code
        </a>
        
        <a 
          href="/qr" 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px'
          }}
        >
          View QR Codes
        </a>
      </div>
    </div>
  )
}

export default Home