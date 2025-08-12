import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import QrList from './pages/QrList.jsx'
import QrCreate from './pages/QrCreate.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <nav style={{ marginBottom: '20px', padding: '10px', borderBottom: '1px solid #ccc' }}>
          <a href="/" style={{ marginRight: '20px', textDecoration: 'none', color: '#007bff' }}>Home</a>
          <a href="/qr" style={{ marginRight: '20px', textDecoration: 'none', color: '#007bff' }}>QR Codes</a>
          <a href="/create" style={{ textDecoration: 'none', color: '#007bff' }}>Create QR</a>
        </nav>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/qr" element={<QrList />} />
          <Route path="/create" element={<QrCreate />} />
        </Routes>
      </div>
    </BrowserRouter>
  </React.StrictMode>,
)