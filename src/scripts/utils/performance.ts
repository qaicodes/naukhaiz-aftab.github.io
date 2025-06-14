/**
 * Performance Monitoring Utility
 * Tracks Core Web Vitals and performance metrics
 */

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
}

export class Performance {
  private metrics: PerformanceMetric[] = []
  private observer: PerformanceObserver | null = null
  private isMonitoring = false

  constructor() {
    // No initialization required
  }

  /**
   * Initialize performance monitoring
   */
  async init(): Promise<void> {
    this.setupPerformanceObserver()
    this.trackInitialMetrics()
    this.isMonitoring = true
    console.log('✅ Performance monitoring initialized')
  }

  /**
   * Set up performance observer for Core Web Vitals
   */
  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        this.observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const value = (entry as PerformanceEntry & { value?: number }).value || entry.duration || 0
            this.recordMetric(entry.name, value)
          })
        })

        // Observe different entry types
        this.observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] })
      } catch (error) {
        console.warn('Performance Observer not supported:', error)
      }
    }
  }

  /**
   * Track initial performance metrics
   */
  private trackInitialMetrics(): void {
    // Track when page becomes interactive
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      this.recordMetric('dom_interactive', performance.now())
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        this.recordMetric('dom_interactive', performance.now())
      })
    }

    // Track full page load
    window.addEventListener('load', () => {
      this.recordMetric('page_load', performance.now())
      this.trackNavigationTiming()
    })
  }

  /**
   * Track navigation timing metrics
   */
  private trackNavigationTiming(): void {
    if ('performance' in window && 'navigation' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        this.recordMetric('dns_lookup', navigation.domainLookupEnd - navigation.domainLookupStart)
        this.recordMetric('tcp_connect', navigation.connectEnd - navigation.connectStart)
        this.recordMetric('request_response', navigation.responseEnd - navigation.requestStart)
        this.recordMetric('dom_parsing', navigation.domInteractive - navigation.responseEnd)
      }
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(name: string, value: number): void {
    if (!this.isMonitoring) return

    const metric: PerformanceMetric = {
      name,
      value: Math.round(value),
      timestamp: Date.now()
    }

    this.metrics.push(metric)
    console.log(`📈 Performance metric: ${name} = ${metric.value}ms`)
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): Record<string, unknown> {
    const summary: Record<string, unknown> = {}
    
    this.metrics.forEach(metric => {
      summary[metric.name] = metric.value
    })

    return {
      metrics: summary,
      totalMetrics: this.metrics.length,
      isMonitoring: this.isMonitoring
    }
  }

  /**
   * Pause monitoring
   */
  pauseMonitoring(): void {
    this.isMonitoring = false
  }

  /**
   * Resume monitoring
   */
  resumeMonitoring(): void {
    this.isMonitoring = true
  }

  /**
   * Clean up performance monitoring
   */
  cleanup(): void {
    this.observer?.disconnect()
    this.observer = null
    this.isMonitoring = false
    console.log('Performance monitoring cleaned up')
  }
} 