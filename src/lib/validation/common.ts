/**
 * Common Validation Utilities
 * General-purpose validation functions used across the component library
 */

// Validation result interface for consistency
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  HTML_ID: /^[a-zA-Z][a-zA-Z0-9_-]*$/,
  CSS_CLASS: /^[a-zA-Z_-][a-zA-Z0-9_-]*$/,
  HEX_COLOR: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
  POSITIVE_INTEGER: /^\d+$/,
  DECIMAL: /^\d*\.?\d+$/,
} as const;

/**
 * Validates an email address
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return {
      isValid: false,
      error: 'Email is required',
    };
  }

  if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
    return {
      isValid: false,
      error: 'Invalid email format',
      suggestion: 'Please enter a valid email address (e.g., user@example.com)',
    };
  }

  return { isValid: true };
};

/**
 * Validates a URL
 */
export const validateURL = (url: string, options: { required?: boolean } = {}): ValidationResult => {
  if (!url.trim()) {
    return {
      isValid: !options.required,
      error: options.required ? 'URL is required' : undefined,
    };
  }

  if (!VALIDATION_PATTERNS.URL.test(url)) {
    return {
      isValid: false,
      error: 'Invalid URL format',
      suggestion: 'URL must start with http:// or https://',
    };
  }

  return { isValid: true };
};

/**
 * Validates a hex color value
 */
export const validateHexColor = (color: string, options: { required?: boolean } = {}): ValidationResult => {
  if (!color.trim()) {
    return {
      isValid: !options.required,
      error: options.required ? 'Color is required' : undefined,
    };
  }

  if (!VALIDATION_PATTERNS.HEX_COLOR.test(color)) {
    return {
      isValid: false,
      error: 'Invalid hex color format',
      suggestion: 'Use format #123 or #123456',
    };
  }

  return { isValid: true };
};

/**
 * Validates a positive integer
 */
export const validatePositiveInteger = (
  value: string | number,
  options: { min?: number; max?: number; required?: boolean } = {}
): ValidationResult => {
  const strValue = String(value).trim();
  
  if (!strValue) {
    return {
      isValid: !options.required,
      error: options.required ? 'Value is required' : undefined,
    };
  }

  if (!VALIDATION_PATTERNS.POSITIVE_INTEGER.test(strValue)) {
    return {
      isValid: false,
      error: 'Must be a positive integer',
      suggestion: 'Enter a whole number greater than 0',
    };
  }

  const numValue = parseInt(strValue, 10);

  if (options.min !== undefined && numValue < options.min) {
    return {
      isValid: false,
      error: `Must be at least ${options.min}`,
      suggestion: `Enter a value of ${options.min} or higher`,
    };
  }

  if (options.max !== undefined && numValue > options.max) {
    return {
      isValid: false,
      error: `Must be at most ${options.max}`,
      suggestion: `Enter a value of ${options.max} or lower`,
    };
  }

  return { isValid: true };
};

/**
 * Validates a decimal number
 */
export const validateDecimal = (
  value: string | number,
  options: { min?: number; max?: number; required?: boolean; decimals?: number } = {}
): ValidationResult => {
  const strValue = String(value).trim();
  
  if (!strValue) {
    return {
      isValid: !options.required,
      error: options.required ? 'Value is required' : undefined,
    };
  }

  if (!VALIDATION_PATTERNS.DECIMAL.test(strValue)) {
    return {
      isValid: false,
      error: 'Must be a valid number',
      suggestion: 'Enter a decimal number (e.g., 1.5)',
    };
  }

  const numValue = parseFloat(strValue);

  if (isNaN(numValue)) {
    return {
      isValid: false,
      error: 'Must be a valid number',
    };
  }

  if (options.min !== undefined && numValue < options.min) {
    return {
      isValid: false,
      error: `Must be at least ${options.min}`,
      suggestion: `Enter a value of ${options.min} or higher`,
    };
  }

  if (options.max !== undefined && numValue > options.max) {
    return {
      isValid: false,
      error: `Must be at most ${options.max}`,
      suggestion: `Enter a value of ${options.max} or lower`,
    };
  }

  if (options.decimals !== undefined) {
    const decimalPart = strValue.split('.')[1];
    if (decimalPart && decimalPart.length > options.decimals) {
      return {
        isValid: false,
        error: `Must have at most ${options.decimals} decimal places`,
        suggestion: `Round to ${options.decimals} decimal places`,
      };
    }
  }

  return { isValid: true };
};

/**
 * Validates string length
 */
export const validateLength = (
  value: string,
  options: { minLength?: number; maxLength?: number; required?: boolean } = {}
): ValidationResult => {
  const trimmedValue = value.trim();
  
  if (!trimmedValue) {
    return {
      isValid: !options.required,
      error: options.required ? 'Value is required' : undefined,
    };
  }

  if (options.minLength !== undefined && trimmedValue.length < options.minLength) {
    return {
      isValid: false,
      error: `Must be at least ${options.minLength} characters long`,
      suggestion: `Add ${options.minLength - trimmedValue.length} more characters`,
    };
  }

  if (options.maxLength !== undefined && trimmedValue.length > options.maxLength) {
    return {
      isValid: false,
      error: `Must be at most ${options.maxLength} characters long`,
      suggestion: `Remove ${trimmedValue.length - options.maxLength} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Validates that a value is one of the allowed options
 */
export const validateOptions = <T>(
  value: T,
  options: T[],
  required: boolean = false
): ValidationResult => {
  if (!value && !required) {
    return { isValid: true };
  }

  if (!value && required) {
    return {
      isValid: false,
      error: 'Selection is required',
    };
  }

  if (!options.includes(value)) {
    return {
      isValid: false,
      error: 'Invalid selection',
      suggestion: `Choose from: ${options.join(', ')}`,
    };
  }

  return { isValid: true };
};

/**
 * Validates multiple values and returns aggregated results
 */
export const validateMultiple = (
  validations: (() => ValidationResult)[]
): ValidationResult & { errors: string[] } => {
  const results = validations.map(validate => validate());
  const errors = results
    .filter(result => !result.isValid)
    .map(result => result.error)
    .filter((error): error is string => !!error);

  return {
    isValid: errors.length === 0,
    error: errors.length > 0 ? errors[0] : undefined,
    errors,
  };
};

/**
 * Creates a validator function with predefined options
 */
export const createValidator = <T>(
  validatorFn: (value: T, options?: any) => ValidationResult,
  defaultOptions: any = {}
) => {
  return (value: T, options: any = {}) => {
    return validatorFn(value, { ...defaultOptions, ...options });
  };
};