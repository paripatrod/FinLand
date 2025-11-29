// Analytics & Error Tracking Utility (localStorage-based)

interface AnalyticsEvent {
  event: string
  category: string
  action: string
  label?: string
  value?: number
  timestamp: number
}

interface ErrorLog {
  message: string
  stack?: string
  componentStack?: string
  timestamp: number
  userAgent: string
  url: string
}

class Analytics {
  private events: AnalyticsEvent[] = []
  private errors: ErrorLog[] = []
  private readonly MAX_EVENTS = 1000
  private readonly MAX_ERRORS = 100

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    try {
      const events = localStorage.getItem('analytics_events')
      const errors = localStorage.getItem('analytics_errors')
      
      if (events) this.events = JSON.parse(events)
      if (errors) this.errors = JSON.parse(errors)
    } catch (error) {
      console.error('Failed to load analytics from storage:', error)
    }
  }

  private saveToStorage() {
    try {
      // Keep only recent events
      if (this.events.length > this.MAX_EVENTS) {
        this.events = this.events.slice(-this.MAX_EVENTS)
      }
      if (this.errors.length > this.MAX_ERRORS) {
        this.errors = this.errors.slice(-this.MAX_ERRORS)
      }

      localStorage.setItem('analytics_events', JSON.stringify(this.events))
      localStorage.setItem('analytics_errors', JSON.stringify(this.errors))
    } catch (error) {
      console.error('Failed to save analytics to storage:', error)
    }
  }

  // Track page view
  pageView(page: string) {
    this.track('page_view', 'Navigation', 'View', page)
  }

  // Track calculation
  calculation(type: 'credit-card' | 'student-loan', amount: number) {
    this.track('calculation', 'Calculator', type, 'Amount', amount)
  }

  // Track AI prediction
  aiPrediction(profileId: number, confidence?: number) {
    this.track('ai_prediction', 'AI', 'Predict', `Profile ${profileId}`, confidence)
  }

  // Track button click
  click(label: string, category = 'Button') {
    this.track('click', category, 'Click', label)
  }

  // Track feature usage
  feature(name: string) {
    this.track('feature_use', 'Feature', 'Use', name)
  }

  // Track language change
  languageChange(language: string) {
    this.track('language_change', 'Settings', 'Change Language', language)
  }

  // Track theme toggle
  themeToggle(theme: 'light' | 'dark') {
    this.track('theme_toggle', 'Settings', 'Change Theme', theme)
  }

  // Generic track method
  track(event: string, category: string, action: string, label?: string, value?: number) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      action,
      label,
      value,
      timestamp: Date.now()
    }

    this.events.push(analyticsEvent)
    this.saveToStorage()

    // Log to console in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('📊 Analytics:', analyticsEvent)
    }
  }

  // Log error
  logError(error: Error, componentStack?: string) {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      componentStack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    this.errors.push(errorLog)
    this.saveToStorage()

    // Log to console
    console.error('🔴 Error logged:', errorLog)
  }

  // Get analytics summary
  getSummary() {
    const now = Date.now()
    const last24h = this.events.filter(e => now - e.timestamp < 24 * 60 * 60 * 1000)
    const last7d = this.events.filter(e => now - e.timestamp < 7 * 24 * 60 * 60 * 1000)

    const eventsByCategory = this.events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalEvents: this.events.length,
      last24h: last24h.length,
      last7d: last7d.length,
      eventsByCategory,
      totalErrors: this.errors.length,
      recentErrors: this.errors.slice(-10)
    }
  }

  // Export analytics data
  exportData() {
    return {
      events: this.events,
      errors: this.errors,
      exportedAt: new Date().toISOString()
    }
  }

  // Clear analytics data
  clear() {
    this.events = []
    this.errors = []
    this.saveToStorage()
  }
}

export const analytics = new Analytics()

// Error boundary logger
export function logComponentError(error: Error, errorInfo: { componentStack: string }) {
  analytics.logError(error, errorInfo.componentStack)
}

// Performance monitoring
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()

  start(label: string) {
    this.marks.set(label, performance.now())
  }

  end(label: string) {
    const startTime = this.marks.get(label)
    if (!startTime) return

    const duration = performance.now() - startTime
    this.marks.delete(label)

    analytics.track('performance', 'Timing', label, undefined, Math.round(duration))

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }
}

export const perf = new PerformanceMonitor()
