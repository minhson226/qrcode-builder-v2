import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Home from '../src/pages/Home.jsx'

describe('Home', () => {
  it('renders tagline', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Nền tảng tạo và quản lý QR code chuyên nghiệp cho doanh nghiệp')).toBeInTheDocument()
  })
  
  it('renders main heading', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    
    expect(screen.getByText('QR Code Builder Pro')).toBeInTheDocument()
  })
  
  it('renders features list', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    
    expect(screen.getByText('QR Code Động')).toBeInTheDocument()
    expect(screen.getByText('Thống kê chi tiết')).toBeInTheDocument()
    expect(screen.getByText('Tạo hàng loạt')).toBeInTheDocument()
  })
  
  it('renders action buttons', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    
    expect(screen.getByText('🚀 Tạo QR ngay')).toBeInTheDocument()
    expect(screen.getByText('📊 Xem thống kê')).toBeInTheDocument()
  })
})