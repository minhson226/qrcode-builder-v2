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
    
    expect(screen.getByText('Welcome to the powerful QRCode SaaS platform for creating and managing QR codes')).toBeInTheDocument()
  })
  
  it('renders main heading', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    
    expect(screen.getByText('QRCode Builder')).toBeInTheDocument()
  })
  
  it('renders features list', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Create static and dynamic QR codes')).toBeInTheDocument()
    expect(screen.getByText('Analytics and tracking')).toBeInTheDocument()
    expect(screen.getByText('Bulk QR code generation')).toBeInTheDocument()
  })
  
  it('renders action buttons', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Create QR Code')).toBeInTheDocument()
    expect(screen.getByText('View QR Codes')).toBeInTheDocument()
  })
})