import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from './Dashboard'

// Mock contexts
const mockLanguageContext = {
  language: 'th' as const,
  setLanguage: () => {},
  t: (key: string) => key
}

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => mockLanguageContext
}))

describe('Dashboard Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should render empty state when no calculations', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    
    expect(screen.getByText('dashboard.empty')).toBeInTheDocument()
  })

  it('should render stat cards', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    
    expect(screen.getByText('dashboard.totalCalculations')).toBeInTheDocument()
    expect(screen.getByText('dashboard.creditCards')).toBeInTheDocument()
    expect(screen.getByText('dashboard.studentLoans')).toBeInTheDocument()
  })
})
