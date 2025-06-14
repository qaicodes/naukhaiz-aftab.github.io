/**
 * Analytics Utility
 * Handles user interaction tracking and performance metrics
 */

interface AnalyticsEvent {
  event: string
  data?: Record<string, unknown>
  timestamp?: number
}

export class Analytics {
  private events: AnalyticsEvent[] = []
  private sessionId: string
  private isEnabled = true

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  /**
   * Initialize analytics
   */
  async init(): Promise<void> {
    // Check if user has opted out of analytics
    if (localStorage.getItem('analytics-opt-out') === 'true') {
      this.isEnabled = false
      console.log('Analytics disabled by user preference')
      return
    }

    this.setupTrackingEvents()
    console.log('✅ Analytics initialized')
  }

  /**
   * Track an event
   */
  trackEvent(event: string, data?: Record<string, unknown>): void {
    if (!this.isEnabled) return

    const eventData: AnalyticsEvent = {
      event,
      data,
      timestamp: Date.now()
    }

    this.events.push(eventData)
    console.log('📊 Event tracked:', eventData)

    // In a real implementation, this would send data to analytics service
    // this.sendToAnalyticsService(eventData)
  }

  /**
   * Set up automatic tracking for common interactions
   */
  private setupTrackingEvents(): void {
    // Track section views
    document.querySelectorAll('section[id]').forEach(section => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.trackEvent('section_viewed', {
              section: section.id,
              duration: Date.now()
            })
          }
        })
      }, { threshold: 0.5 })

      observer.observe(section)
    })

    // Track button clicks
    document.querySelectorAll('.btn').forEach(button => {
      button.addEventListener('click', () => {
        this.trackEvent('button_clicked', {
          button: button.textContent?.trim(),
          url: window.location.href
        })
      })
    })

    // Track external link clicks
    document.querySelectorAll('a[href^="http"], a[href^="mailto"], a[href^="tel"]').forEach(link => {
      link.addEventListener('click', () => {
        this.trackEvent('external_link_clicked', {
          url: (link as HTMLAnchorElement).href,
          text: link.textContent?.trim()
        })
      })
    })
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(): Record<string, unknown> {
    return {
      sessionId: this.sessionId,
      eventsCount: this.events.length,
      sessionDuration: Date.now() - (this.events[0]?.timestamp || Date.now()),
      enabled: this.isEnabled
    }
  }

  /**
   * Clear analytics data
   */
  clearData(): void {
    this.events = []
    console.log('Analytics data cleared')
  }
} 