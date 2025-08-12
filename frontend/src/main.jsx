import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import QrList from './pages/QrList.jsx'
import QrCreate from './pages/QrCreate.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/qr" element={<QrList />} />
          <Route path="/create" element={<QrCreate />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </React.StrictMode>,
)