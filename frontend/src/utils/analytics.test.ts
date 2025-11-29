import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analytics, perf } from './analytics'

describe('Analytics Utility', () => {
  beforeEach(() => {
    localStorage.clear()
    analytics.clear()
  })

  it('should track page views', () => {
    analytics.pageView('/test-page')
    const summary = analytics.getSummary()
    expect(summary.totalEvents).toBe(1)
  })

  it('should track calculations', () => {
    analytics.calculation('credit-card', 50000)
    const summary = analytics.getSummary()
    expect(summary.totalEvents).toBe(1)
  })

  it('should track AI predictions', () => {
    analytics.aiPrediction(5, 85.5)
    const summary = analytics.getSummary()
    expect(summary.totalEvents).toBe(1)
  })

  it('should track button clicks', () => {
    analytics.click('Calculate Button')
    const summary = analytics.getSummary()
    expect(summary.totalEvents).toBe(1)
  })

  it('should log errors', () => {
    const error = new Error('Test error')
    analytics.logError(error)
    const summary = analytics.getSummary()
    expect(summary.totalErrors).toBe(1)
  })

  it('should persist data to localStorage', () => {
    analytics.pageView('/test')
    analytics.calculation('student-loan', 100000)
    
    const eventsData = localStorage.getItem('analytics_events')
    expect(eventsData).toBeTruthy()
    
    const events = JSON.parse(eventsData!)
    expect(events.length).toBe(2)
  })

  it('should export analytics data', () => {
    analytics.pageView('/test')
    analytics.click('Test Button')
    
    const exported = analytics.exportData()
    expect(exported.events.length).toBe(2)
    expect(exported.exportedAt).toBeTruthy()
  })

  it('should clear analytics data', () => {
    analytics.pageView('/test')
    analytics.clear()
    
    const summary = analytics.getSummary()
    expect(summary.totalEvents).toBe(0)
  })

  it('should limit stored events', () => {
    // Add more than MAX_EVENTS
    for (let i = 0; i < 1100; i++) {
      analytics.pageView(`/page-${i}`)
    }
    
    const summary = analytics.getSummary()
    expect(summary.totalEvents).toBeLessThanOrEqual(1000)
  })
})

describe('Performance Monitor', () => {
  it('should measure performance', () => {
    perf.start('test-operation')
    
    // Simulate some work
    let sum = 0
    for (let i = 0; i < 1000; i++) {
      sum += i
    }
    
    const duration = perf.end('test-operation')
    expect(duration).toBeGreaterThan(0)
  })

  it('should return undefined for non-existent labels', () => {
    const duration = perf.end('non-existent')
    expect(duration).toBeUndefined()
  })
})
