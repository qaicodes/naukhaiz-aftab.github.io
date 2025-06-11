/**
 * Contact Form Component
 * Handles form validation and user interactions
 */

import { Analytics } from '../utils/analytics.js';

interface FormValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
}

interface FormValidationRules {
  [key: string]: FormValidationRule;
}

export class ContactForm {
  private form: HTMLFormElement | null;
  private submitButton: HTMLButtonElement | null;
  private analytics: Analytics;

  private validationRules: FormValidationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s\-']+$/
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    subject: {
      required: true,
      minLength: 5,
      maxLength: 200
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 2000
    }
  };

  constructor() {
    this.form = document.querySelector('#contact-form') as HTMLFormElement;
    this.submitButton = document.querySelector('#contact-form button[type="submit"]') as HTMLButtonElement;
    this.analytics = new Analytics();
    this.initialize();
  }

  /**
   * Initialize the contact form functionality
   */
  async init(): Promise<void> {
    if (!this.form) {
      console.log('No contact forms found')
      return
    }

    console.log('Contact form initialized')
    this.setupFormHandlers()
  }

  /**
   * Set up form event handlers
   */
  private setupFormHandlers(): void {
    this.form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleFormSubmission();
    })
  }

  /**
   * Handle form submission
   */
  private async handleFormSubmission(): Promise<void> {
    if (!this.form) return;

    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData.entries());

    // Validate form data
    const validation = this.validateForm(data);
    if (!validation.isValid) {
      this.showValidationErrors(validation.errors);
      return;
    }

    // Show loading state
    this.setSubmissionState(true);

    try {
      // Simulate form submission (replace with actual endpoint)
      await this.simulateFormSubmission(data);
      
      // Track successful submission
      this.analytics.trackEvent('form_submitted', { status: 'Success', form: 'contact' });
      
      // Show success message
      this.showSuccessMessage();
      this.form.reset();
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.analytics.trackEvent('form_submitted', { status: 'Error', form: 'contact' });
      this.showErrorMessage();
    } finally {
      this.setSubmissionState(false);
    }
  }



  /**
   * Clean up event listeners and references
   */
  destroy(): void {
    // Clear references
    this.form = null;
    this.submitButton = null;
    console.log('Contact form destroyed')
  }

  private initialize(): void {
    if (!this.form) return;

    // Add real-time validation
    const inputs = this.form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input as HTMLInputElement));
      input.addEventListener('input', () => this.clearFieldError(input as HTMLInputElement));
    });

    // Track form interactions
    this.analytics.trackEvent('form_viewed', { form: 'contact' });
  }

  private validateForm(data: { [key: string]: FormDataEntryValue }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    Object.entries(this.validationRules).forEach(([field, rules]) => {
      const value = data[field] as string || '';
      const fieldErrors = this.validateFieldValue(field, value, rules);
      errors.push(...fieldErrors);
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateFieldValue(fieldName: string, value: string, rules: FormValidationRule): string[] {
    const errors: string[] = [];

    if (rules.required && !value.trim()) {
      errors.push(`${this.getFieldDisplayName(fieldName)} is required`);
      return errors;
    }

    if (value.trim()) {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${this.getFieldDisplayName(fieldName)} must be at least ${rules.minLength} characters`);
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${this.getFieldDisplayName(fieldName)} must not exceed ${rules.maxLength} characters`);
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${this.getFieldDisplayName(fieldName)} format is invalid`);
      }

      if (rules.custom && !rules.custom(value)) {
        errors.push(`${this.getFieldDisplayName(fieldName)} is invalid`);
      }
    }

    return errors;
  }

  private validateField(input: HTMLInputElement | HTMLTextAreaElement): void {
    const fieldName = input.name;
    const value = input.value;
    const rules = this.validationRules[fieldName];

    if (!rules) return;

    const errors = this.validateFieldValue(fieldName, value, rules);
    
    if (errors.length > 0) {
      this.showFieldError(input, errors[0]);
    } else {
      this.clearFieldError(input);
    }
  }

  private showFieldError(input: HTMLInputElement | HTMLTextAreaElement, message: string): void {
    const fieldGroup = input.closest('.form-group');
    if (!fieldGroup) return;

    // Remove existing error
    const existingError = fieldGroup.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    // Add error styling
    input.classList.add('error');

    // Add error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    fieldGroup.appendChild(errorElement);
  }

  private clearFieldError(input: HTMLInputElement | HTMLTextAreaElement): void {
    const fieldGroup = input.closest('.form-group');
    if (!fieldGroup) return;

    input.classList.remove('error');
    const errorElement = fieldGroup.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  private showValidationErrors(errors: string[]): void {
    // Create or update error summary
    let errorSummary = document.querySelector('.form-error-summary');
    
    if (!errorSummary) {
      errorSummary = document.createElement('div');
      errorSummary.className = 'form-error-summary';
      errorSummary.setAttribute('role', 'alert');
      this.form?.insertBefore(errorSummary, this.form.firstChild);
    }

    errorSummary.innerHTML = `
      <h3>Please correct the following errors:</h3>
      <ul>
        ${errors.map(error => `<li>${error}</li>`).join('')}
      </ul>
    `;

    // Focus on first error field
    const firstErrorField = this.form?.querySelector('.error') as HTMLElement;
    firstErrorField?.focus();
  }

  private showSuccessMessage(): void {
    this.clearFormMessages();
    
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success-message';
    successMessage.setAttribute('role', 'alert');
    successMessage.innerHTML = `
      <div class="success-icon">✓</div>
      <h3>Message Sent Successfully!</h3>
      <p>Thank you for your message. I'll get back to you as soon as possible.</p>
    `;
    
    this.form?.insertBefore(successMessage, this.form.firstChild);
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  private showErrorMessage(): void {
    this.clearFormMessages();
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'form-error-message';
    errorMessage.setAttribute('role', 'alert');
    errorMessage.innerHTML = `
      <div class="error-icon">⚠</div>
      <h3>Message Failed to Send</h3>
      <p>There was an error sending your message. Please try again or contact me directly.</p>
    `;
    
    this.form?.insertBefore(errorMessage, this.form.firstChild);
  }

  private clearFormMessages(): void {
    const messages = this.form?.querySelectorAll('.form-success-message, .form-error-message, .form-error-summary');
    messages?.forEach(message => message.remove());
  }

  private setSubmissionState(isSubmitting: boolean): void {
    if (!this.submitButton) return;

    if (isSubmitting) {
      this.submitButton.disabled = true;
      this.submitButton.innerHTML = `
        <span class="spinner"></span>
        Sending...
      `;
    } else {
      this.submitButton.disabled = false;
      this.submitButton.innerHTML = 'Send Message';
    }
  }

  private async simulateFormSubmission(data: { [key: string]: FormDataEntryValue }): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate occasional failures for testing
    if (Math.random() < 0.1) {
      throw new Error('Simulated submission failure');
    }
    
    console.log('Form submitted:', data);
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Message'
    };
    
    return displayNames[fieldName] || fieldName;
  }
} 