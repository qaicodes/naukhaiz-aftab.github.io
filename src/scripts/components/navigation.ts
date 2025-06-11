/**
 * Navigation Component
 * Handles smooth scrolling, active states, and mobile menu functionality
 */

export class Navigation {
  private nav: HTMLElement | null = null
  private navLinks: NodeListOf<HTMLAnchorElement> | null = null
  private sections: NodeListOf<HTMLElement> | null = null
  private currentSection: string = ''

  constructor() {
    this.nav = document.querySelector('.nav')
    this.navLinks = document.querySelectorAll('.nav-links a')
    this.sections = document.querySelectorAll('section[id]')
  }

  /**
   * Initialize navigation functionality
   */
  async init(): Promise<void> {
    if (!this.nav || !this.navLinks || !this.sections) {
      console.log('Navigation elements not found')
      return
    }

    this.setupSmoothScrolling()
    this.setupScrollSpy()
    this.setupMobileNavigation()
    console.log('✅ Navigation initialized')
  }

  /**
   * Set up smooth scrolling for navigation links
   */
  private setupSmoothScrolling(): void {
    this.navLinks?.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault()
        
        const targetId = link.getAttribute('href')?.substring(1)
        if (!targetId) return

        const targetSection = document.getElementById(targetId)
        if (!targetSection) return

        // Calculate offset to account for fixed header
        const headerHeight = this.nav?.offsetHeight || 0
        const targetPosition = targetSection.offsetTop - headerHeight - 20

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        })

        // Update active state immediately for better UX
        this.updateActiveLink(targetId)
      })
    })
  }

  /**
   * Set up scroll spy functionality
   */
  private setupScrollSpy(): void {
    // Throttled scroll handler for performance
    let ticking = false

    const updateActiveSection = () => {
      const scrollPosition = window.scrollY + (this.nav?.offsetHeight || 0) + 50

      // Find current section
      let currentSectionId = ''
      this.sections?.forEach(section => {
        const sectionTop = section.offsetTop
        const sectionHeight = section.offsetHeight

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSectionId = section.id
        }
      })

      // Update active state if section changed
      if (currentSectionId !== this.currentSection) {
        this.currentSection = currentSectionId
        this.updateActiveLink(currentSectionId)
      }

      // Update navigation style based on scroll position
      this.updateNavigationStyle()

      ticking = false
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateActiveSection)
        ticking = true
      }
    })

    // Initial update
    updateActiveSection()
  }

  /**
   * Update active navigation link
   */
  private updateActiveLink(sectionId: string): void {
    this.navLinks?.forEach(link => {
      const href = link.getAttribute('href')?.substring(1)
      
      if (href === sectionId) {
        link.classList.add('active')
        link.setAttribute('aria-current', 'page')
      } else {
        link.classList.remove('active')
        link.removeAttribute('aria-current')
      }
    })
  }

  /**
   * Update navigation style based on scroll position
   */
  private updateNavigationStyle(): void {
    if (!this.nav) return

    if (window.scrollY > 50) {
      this.nav.classList.add('scrolled')
    } else {
      this.nav.classList.remove('scrolled')
    }
  }

  /**
   * Set up mobile navigation (placeholder for future mobile menu)
   */
  private setupMobileNavigation(): void {
    // Mobile navigation can be implemented here when needed
    console.log('Mobile navigation setup (placeholder)')
  }

  /**
   * Destroy navigation component
   */
  destroy(): void {
    // Clear references
    this.nav = null
    this.navLinks = null
    this.sections = null
    this.currentSection = ''
    console.log('Navigation destroyed')
  }
} 