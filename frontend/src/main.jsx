import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import QrList from './pages/QrList.jsx'
import QrCreate from './pages/QrCreate.jsx'
import LandingPageList from './pages/LandingPageList.jsx'
import LandingPageCreate from './pages/LandingPageCreate.jsx'
import Dashboard from './components/Dashboard.jsx'
import Login from './pages/Login.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/qr" element={<QrList />} />
            <Route path="/create" element={<QrCreate />} />
            <Route path="/landing-pages" element={<LandingPageList />} />
            <Route path="/landing-pages/create" element={<LandingPageCreate />} />
          </Routes>
        </Layout>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)