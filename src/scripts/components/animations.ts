/**
 * Scroll Animations Component
 * Handles reveal animations using GSAP and Intersection Observer
 */

export class ScrollAnimations {
  private observer: IntersectionObserver | null = null
  private animatedElements: Set<Element> = new Set()

  constructor() {
    // No initialization required
  }

  /**
   * Initialize scroll animations
   */
  async init(): Promise<void> {
    this.setupIntersectionObserver()
    this.observeElements()
    console.log('✅ Scroll animations initialized')
  }

  /**
   * Set up intersection observer for scroll-triggered animations
   */
  private setupIntersectionObserver(): void {
    const options: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
          this.animateElement(entry.target)
          this.animatedElements.add(entry.target)
        }
      })
    }, options)
  }

  /**
   * Observe all fade-in elements
   */
  private observeElements(): void {
    const elementsToObserve = document.querySelectorAll('.fade-in, .section')
    
    elementsToObserve.forEach(element => {
      this.observer?.observe(element)
    })
  }

  /**
   * Animate element when it comes into view
   */
  private animateElement(element: Element): void {
    element.classList.add('visible')
  }

  /**
   * Destroy scroll animations
   */
  destroy(): void {
    this.observer?.disconnect()
    this.observer = null
    this.animatedElements.clear()
    console.log('Scroll animations destroyed')
  }
} 