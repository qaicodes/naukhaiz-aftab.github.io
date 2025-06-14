/**
 * =============================================================================
 * MAIN ENTRY POINT - NAUKHAIZ AFTAB LEGAL PORTFOLIO
 * =============================================================================
 * 
 * Modern TypeScript architecture with:
 * - Component-based structure
 * - Performance monitoring
 * - Accessibility features
 * - GSAP animations
 * - Analytics integration
 */

// Import styles
import '../styles/main.scss'

import { Navigation } from './components/navigation'
import { ScrollAnimations } from './components/animations'
import { ContactForm } from './components/contact-form'
import { Analytics } from './utils/analytics'
import { Performance } from './utils/performance'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

/**
 * Main Application Class
 * Orchestrates all components and handles global state
 */
class LegalPortfolioApp {
  private navigation: Navigation
  private scrollAnimations: ScrollAnimations
  private contactForm: ContactForm
  private analytics: Analytics
  private performance: Performance
  private isInitialized = false

  constructor() {
    this.navigation = new Navigation()
    this.scrollAnimations = new ScrollAnimations()
    this.contactForm = new ContactForm()
    this.analytics = new Analytics()
    this.performance = new Performance()
  }

  /**
   * Initialize the application
   */
  async init(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Show loading state
      this.showLoadingState()

      // Initialize performance monitoring
      await this.performance.init()

      // Initialize core components
      await Promise.all([
        this.navigation.init(),
        this.scrollAnimations.init(),
        this.contactForm.init(),
        this.analytics.init()
      ])

      // Set up global event listeners
      this.setupGlobalEventListeners()

      // Initialize GSAP master timeline
      this.initializeGSAPAnimations()

      // Hide loading state and show content
      this.hideLoadingState()

      // Mark as initialized
      this.isInitialized = true

      // Track successful initialization
      this.analytics.trackEvent('app_initialized', {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      })

      console.log('🎯 Naukhaiz Aftab Legal Portfolio initialized successfully')

    } catch (error) {
      console.error('❌ Failed to initialize Legal Portfolio:', error)
      this.handleInitializationError(error)
    }
  }

  /**
   * Show loading state
   */
  private showLoadingState(): void {
    document.body.style.opacity = '0'
    document.body.classList.add('loading')
  }

  /**
   * Hide loading state and reveal content
   */
  private hideLoadingState(): void {
    // Smooth fade-in of the entire page
    gsap.to(document.body, {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        document.body.classList.remove('loading')
        document.body.classList.add('loaded', 'legal-portfolio')
      }
    })
  }

  /**
   * Initialize GSAP master timeline for coordinated animations
   */
  private initializeGSAPAnimations(): void {
    // Create master timeline
    const masterTimeline = (gsap as any).timeline();

    // Hero section entrance animation
    masterTimeline
      .from('.hero-title', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      })
      .from('.hero-subtitle', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, '-=0.5')
      .from('.hero-description', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.3')
      .from('.hero-cta', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.2')

    // Enhanced card hover animations
    const cardElements = (gsap as any).utils.toArray('.card') as Element[];
    cardElements.forEach((card: Element) => {
      const icon = card.querySelector('.card-icon')
      
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -12,
          scale: 1.03,
          duration: 0.3,
          ease: 'power2.out'
        })
        
        if (icon) {
          gsap.to(icon, {
            scale: 1.1,
            rotation: 5,
            duration: 0.3,
            ease: 'back.out(1.7)'
          })
        }
      })

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        })
        
        if (icon) {
          gsap.to(icon, {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: 'power2.out'
          })
        }
      })
    })

    // Skills tag hover animations
    const skillTagElements = (gsap as any).utils.toArray('.skill-tag') as Element[];
    skillTagElements.forEach((tag: Element) => {
      tag.addEventListener('mouseenter', () => {
        gsap.to(tag, {
          scale: 1.05,
          y: -2,
          duration: 0.2,
          ease: 'power2.out'
        })
      })

      tag.addEventListener('mouseleave', () => {
        gsap.to(tag, {
          scale: 1,
          y: 0,
          duration: 0.2,
          ease: 'power2.out'
        })
      })
    })
  }

  /**
   * Set up global event listeners
   */
  private setupGlobalEventListeners(): void {
    // Handle visibility change for performance monitoring
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.performance.pauseMonitoring()
      } else {
        this.performance.resumeMonitoring()
      }
    })

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup()
    })

    // Handle resize events with debouncing
    let resizeTimeout: number
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = window.setTimeout(() => {
        this.handleResize()
      }, 250)
    })

    // Handle keyboard navigation
    document.addEventListener('keydown', (event) => {
      this.handleKeyboardNavigation(event)
    })

    // Handle print events
    window.addEventListener('beforeprint', () => {
      this.analytics.trackEvent('page_printed', {
        section: 'full_portfolio'
      })
    })
  }

  /**
   * Handle window resize events
   */
  private handleResize(): void {
    // Refresh ScrollTrigger on resize
    ScrollTrigger.refresh()
    
    // Track significant viewport changes
    const viewport = `${window.innerWidth}x${window.innerHeight}`
    this.analytics.trackEvent('viewport_changed', { viewport })
  }

  /**
   * Handle keyboard navigation for accessibility
   */
  private handleKeyboardNavigation(event: KeyboardEvent): void {
    // Skip to main content (accessibility)
    if (event.altKey && event.key === 'm') {
      event.preventDefault()
      const main = document.querySelector('main')
      if (main) {
        main.focus()
        main.scrollIntoView({ behavior: 'smooth' })
      }
    }

    // Focus management for modals/overlays
    if (event.key === 'Escape') {
      const modal = document.querySelector('.modal-overlay.active')
      if (modal) {
        const closeButton = modal.querySelector('[data-close]') as HTMLElement
        if (closeButton) {
          closeButton.click()
        }
      }
    }
  }

  /**
   * Handle initialization errors gracefully
   */
  private handleInitializationError(error: unknown): void {
    // Fallback to basic functionality
    document.body.style.opacity = '1'
    document.body.classList.add('loaded', 'fallback-mode')

    // Show user-friendly error message
    const errorDiv = document.createElement('div')
    errorDiv.className = 'error-message'
    errorDiv.innerHTML = `
      <div class="alert error">
        <strong>Notice:</strong> Some interactive features may not be available. 
        The portfolio content remains fully accessible.
      </div>
    `
    
    const main = document.querySelector('main')
    if (main) {
      main.insertBefore(errorDiv, main.firstChild)
    }

    // Track error for monitoring
    if (this.analytics && error instanceof Error) {
      this.analytics.trackEvent('initialization_error', {
        error: error.message,
        stack: error.stack
      })
    }
  }

  /**
   * Clean up resources before page unload
   */
  private cleanup(): void {
    // Clean up GSAP animations
    ScrollTrigger.killAll()
    gsap.killTweensOf('*')

    // Clean up components
    this.navigation?.destroy()
    this.scrollAnimations?.destroy()
    this.contactForm?.destroy()
    this.performance?.cleanup()

    console.log('🧹 Legal Portfolio cleaned up')
  }
}

/**
 * Initialize the application when DOM is ready
 */
function initializeApp() {
  const app = new LegalPortfolioApp()
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init())
  } else {
    app.init()
  }
}

// Start the application
initializeApp()

// Export for testing/debugging
export { LegalPortfolioApp } 