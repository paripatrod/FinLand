/**
 * Performance Monitoring Utility for FinLand
 * Tracks Core Web Vitals and custom metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface WebVitals {
  LCP?: PerformanceMetric; // Largest Contentful Paint
  FID?: PerformanceMetric; // First Input Delay
  CLS?: PerformanceMetric; // Cumulative Layout Shift
  FCP?: PerformanceMetric; // First Contentful Paint
  TTFB?: PerformanceMetric; // Time to First Byte
  INP?: PerformanceMetric; // Interaction to Next Paint
}

// Thresholds based on Core Web Vitals guidelines
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

function getRating(name: keyof typeof THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

class PerformanceMonitor {
  private metrics: WebVitals = {};
  private observers: PerformanceObserver[] = [];
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'PerformanceObserver' in window;
    if (this.isSupported) {
      this.initObservers();
    }
  }

  private initObservers(): void {
    // Largest Contentful Paint
    this.observeLCP();
    
    // First Input Delay
    this.observeFID();
    
    // Cumulative Layout Shift
    this.observeCLS();
    
    // First Contentful Paint
    this.observeFCP();
  }

  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        
        this.metrics.LCP = {
          name: 'LCP',
          value: lastEntry.startTime,
          rating: getRating('LCP', lastEntry.startTime),
          timestamp: Date.now(),
        };
        
        this.logMetric('LCP', lastEntry.startTime);
      });
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      // LCP not supported
    }
  }

  private observeFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0] as PerformanceEntry & { processingStart: number; startTime: number };
        const fid = firstEntry.processingStart - firstEntry.startTime;
        
        this.metrics.FID = {
          name: 'FID',
          value: fid,
          rating: getRating('FID', fid),
          timestamp: Date.now(),
        };
        
        this.logMetric('FID', fid);
      });
      
      observer.observe({ type: 'first-input', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      // FID not supported
    }
  }

  private observeCLS(): void {
    let clsValue = 0;
    
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value;
          }
        }
        
        this.metrics.CLS = {
          name: 'CLS',
          value: clsValue,
          rating: getRating('CLS', clsValue),
          timestamp: Date.now(),
        };
        
        this.logMetric('CLS', clsValue);
      });
      
      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      // CLS not supported
    }
  }

  private observeFCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
        
        if (fcpEntry) {
          this.metrics.FCP = {
            name: 'FCP',
            value: fcpEntry.startTime,
            rating: getRating('FCP', fcpEntry.startTime),
            timestamp: Date.now(),
          };
          
          this.logMetric('FCP', fcpEntry.startTime);
        }
      });
      
      observer.observe({ type: 'paint', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      // FCP not supported
    }
  }

  private logMetric(name: string, value: number): void {
    if (import.meta.env.DEV) {
      const rating = getRating(name as keyof typeof THRESHOLDS, value);
      const color = rating === 'good' ? '🟢' : rating === 'needs-improvement' ? '🟡' : '🔴';
      console.log(`${color} ${name}: ${value.toFixed(2)}ms (${rating})`);
    }
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): WebVitals {
    return { ...this.metrics };
  }

  /**
   * Get Time to First Byte
   */
  getTTFB(): number | null {
    if (!this.isSupported) return null;
    
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (nav) {
      const ttfb = nav.responseStart - nav.requestStart;
      this.metrics.TTFB = {
        name: 'TTFB',
        value: ttfb,
        rating: getRating('TTFB', ttfb),
        timestamp: Date.now(),
      };
      return ttfb;
    }
    return null;
  }

  /**
   * Measure custom operation timing
   */
  measureOperation<T>(name: string, operation: () => T): T {
    const start = performance.now();
    const result = operation();
    const duration = performance.now() - start;
    
    if (import.meta.env.DEV) {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }

  /**
   * Measure async operation timing
   */
  async measureAsyncOperation<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    
    if (import.meta.env.DEV) {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }

  /**
   * Report metrics to analytics
   */
  reportMetrics(reportFn: (metrics: WebVitals) => void): void {
    // Wait for metrics to be collected
    setTimeout(() => {
      this.getTTFB();
      reportFn(this.getMetrics());
    }, 3000);
  }

  /**
   * Cleanup observers
   */
  disconnect(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}

export { PerformanceMonitor, type WebVitals, type PerformanceMetric };
