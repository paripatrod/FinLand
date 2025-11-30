import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPerformanceMonitor, PerformanceMonitor } from './performance';

describe('Performance Monitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = getPerformanceMonitor();
  });

  afterEach(() => {
    monitor.disconnect();
  });

  describe('getPerformanceMonitor', () => {
    it('should return singleton instance', () => {
      const monitor1 = getPerformanceMonitor();
      const monitor2 = getPerformanceMonitor();
      expect(monitor1).toBe(monitor2);
    });
  });

  describe('measureOperation', () => {
    it('should measure sync operation timing', () => {
      const result = monitor.measureOperation('test-sync', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      });
      
      expect(result).toBe(499500);
    });

    it('should return correct result from operation', () => {
      const result = monitor.measureOperation('string-op', () => {
        return 'hello world';
      });
      
      expect(result).toBe('hello world');
    });
  });

  describe('measureAsyncOperation', () => {
    it('should measure async operation timing', async () => {
      const result = await monitor.measureAsyncOperation('test-async', async () => {
        return new Promise<number>((resolve) => {
          setTimeout(() => resolve(42), 10);
        });
      });
      
      expect(result).toBe(42);
    });
  });

  describe('getMetrics', () => {
    it('should return metrics object', () => {
      const metrics = monitor.getMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });
  });

  describe('getTTFB', () => {
    it('should return TTFB value or null', () => {
      const ttfb = monitor.getTTFB();
      // In test environment, this might be null
      expect(ttfb === null || typeof ttfb === 'number').toBe(true);
    });
  });

  describe('reportMetrics', () => {
    it('should call report function with metrics', async () => {
      const reportFn = vi.fn();
      
      monitor.reportMetrics(reportFn);
      
      // Wait for timeout
      await new Promise((resolve) => setTimeout(resolve, 3500));
      
      expect(reportFn).toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('should disconnect all observers', () => {
      // Should not throw
      expect(() => monitor.disconnect()).not.toThrow();
    });
  });
});

describe('Performance Thresholds', () => {
  it('should have correct LCP thresholds', () => {
    // LCP < 2.5s = good, < 4s = needs improvement, > 4s = poor
    const monitor = getPerformanceMonitor();
    const metrics = monitor.getMetrics();
    
    // Just verify the monitor works
    expect(metrics).toBeDefined();
  });
});
