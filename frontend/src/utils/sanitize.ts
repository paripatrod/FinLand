// Input Sanitization Utilities for XSS Protection

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeString(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  // Remove HTML tags
  let sanitized = value.replace(/<[^>]*>/g, '');
  
  // Escape HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  // Remove javascript: and data: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  return sanitized.trim();
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(value: string | number, options?: {
  min?: number;
  max?: number;
  decimals?: number;
}): number | null {
  const { min = 0, max = 1e12, decimals = 2 } = options || {};
  
  // Convert to number
  let num: number;
  if (typeof value === 'string') {
    // Remove non-numeric characters except decimal point and minus
    const cleaned = value.replace(/[^\d.-]/g, '');
    num = parseFloat(cleaned);
  } else {
    num = value;
  }
  
  // Validate
  if (isNaN(num) || !isFinite(num)) return null;
  if (num < min || num > max) return null;
  
  // Round to specified decimals
  return Number(num.toFixed(decimals));
}

/**
 * Sanitize object - recursively sanitize all string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'number') {
      sanitized[key] = sanitizeNumber(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize for display in HTML
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Create safe innerHTML content
 */
export function createSafeHtml(text: string): { __html: string } {
  return { __html: escapeHtml(text) };
}
