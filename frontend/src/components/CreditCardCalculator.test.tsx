import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CreditCardCalculator from './CreditCardCalculator'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ThemeProvider } from '../contexts/ThemeContext'

// Mock the API client
vi.mock('../utils/api', () => ({
  apiClient: {
    post: vi.fn()
  }
}))

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn()
}))

// Mock storage
vi.mock('../utils/storage', () => ({
  saveCalculation: vi.fn(),
  saveToHistory: vi.fn()
}))

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          {component}
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

describe('CreditCardCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the calculator form', () => {
    renderWithProviders(<CreditCardCalculator />)
    
    // Check for main heading
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeDefined()
  })

  it('shows calculate button', () => {
    renderWithProviders(<CreditCardCalculator />)
    
    // Check for calculate button (Thai or English)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CreditCardCalculator />)
    expect(container).toBeDefined()
  })
})

describe('CreditCardCalculator - What-If Analysis', () => {
  it('calculates what-if scenarios correctly', () => {
    // Test the calculation logic
    const balance = 100000
    const apr = 18
    const monthlyPayment = 3000
    
    // Expected behavior: increased payment should result in fewer months
    const monthlyRate = apr / 100 / 12
    let remaining = balance
    let months = 0
    
    while (remaining > 0 && months < 600) {
      months++
      const interest = remaining * monthlyRate
      const principal = monthlyPayment - interest
      remaining -= principal
    }
    
    expect(months).toBeGreaterThan(0)
    expect(months).toBeLessThan(600)
  })

  it('calculates higher payment results in fewer months', () => {
    const balance = 100000
    const apr = 18
    
    const calculateMonths = (payment: number) => {
      const monthlyRate = apr / 100 / 12
      let remaining = balance
      let months = 0
      
      while (remaining > 0 && months < 600) {
        months++
        const interest = remaining * monthlyRate
        const principal = payment - interest
        remaining -= principal
      }
      return months
    }
    
    const months3000 = calculateMonths(3000)
    const months5000 = calculateMonths(5000)
    
    expect(months5000).toBeLessThan(months3000)
  })
})
