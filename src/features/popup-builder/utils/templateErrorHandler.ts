/**
 * Template Error Handler Utilities
 * 
 * Provides robust error handling for template initialization scenarios
 * Based on Smart Template Loading Plan Phase 1.4
 */

import type { PopupTemplate } from '../types';
import { 
  createEmptyTemplate, 
  createTemplateStub, 
  createErrorRecoveryTemplate,
  repairTemplate 
} from './templateFactory';

// Error type definitions
export interface TemplateError {
  code: 'INIT_FAILED' | 'API_FAILED' | 'VALIDATION_FAILED' | 'STORE_CORRUPTED';
  message: string;
  originalError?: any;
  context: string;
  timestamp: string;
}

/**
 * Main error handler for template operations
 * Always returns a valid template to prevent drag/drop failures
 */
export const handleTemplateError = (
  error: any, 
  context: string, 
  templateId?: string
): PopupTemplate => {
  const templateError: TemplateError = {
    code: 'INIT_FAILED',
    message: error?.message || 'Unknown template error',
    originalError: error,
    context,
    timestamp: new Date().toISOString(),
  };
  
  console.error(`❌ Template error in ${context}:`, templateError);
  
  // Choose recovery strategy based on context
  switch (context) {
    case 'api_load':
      console.log('🔄 API load failed, creating template stub fallback');
      return createTemplateStub(templateId || 'api-error-recovery');
      
    case 'validation':
      console.log('🔄 Validation failed, attempting template repair');
      try {
        return repairTemplate(error.template);
      } catch (repairError) {
        console.log('🔄 Repair failed, creating empty template');
        return createEmptyTemplate();
      }
      
    case 'store_update':
      console.log('🔄 Store update failed, creating error recovery template');
      return createErrorRecoveryTemplate(templateId);
      
    case 'initialization':
      console.log('🔄 Initialization failed, creating empty template fallback');
      return createEmptyTemplate();
      
    default:
      console.log('🔄 Generic error, creating safe fallback template');
      return createEmptyTemplate();
  }
};

/**
 * Error boundary wrapper for async operations
 * Provides automatic fallback handling
 */
export const withErrorBoundary = async <T>(
  operation: () => Promise<T>,
  fallback: () => T,
  context: string
): Promise<T> => {
  try {
    console.log(`🚀 Executing operation: ${context}`);
    const result = await operation();
    console.log(`✅ Operation successful: ${context}`);
    return result;
  } catch (error) {
    console.warn(`⚠️ Operation failed in ${context}, using fallback:`, error);
    const fallbackResult = fallback();
    console.log(`🔄 Fallback applied for ${context}`);
    return fallbackResult;
  }
};

/**
 * Synchronous error boundary for immediate operations
 */
export const withSyncErrorBoundary = <T>(
  operation: () => T,
  fallback: () => T,
  context: string
): T => {
  try {
    console.log(`🚀 Executing sync operation: ${context}`);
    const result = operation();
    console.log(`✅ Sync operation successful: ${context}`);
    return result;
  } catch (error) {
    console.warn(`⚠️ Sync operation failed in ${context}, using fallback:`, error);
    const fallbackResult = fallback();
    console.log(`🔄 Sync fallback applied for ${context}`);
    return fallbackResult;
  }
};

/**
 * Template-specific error boundary
 * Always returns a valid template for drag/drop functionality
 */
export const withTemplateErrorBoundary = (
  operation: () => PopupTemplate,
  context: string,
  templateId?: string
): PopupTemplate => {
  try {
    const result = operation();
    
    // Extra validation to ensure template is usable
    if (!result?.builder_state_json?.zones) {
      throw new Error('Template missing required builder_state_json.zones');
    }
    
    return result;
  } catch (error) {
    return handleTemplateError(error, context, templateId);
  }
};

/**
 * Retry logic for transient failures
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context: string = 'operation'
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} for ${context}`);
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Attempt ${attempt} failed for ${context}:`, error);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Retrying ${context} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  
  throw lastError;
};

/**
 * User-friendly error messages
 */
export const getErrorMessage = (error: TemplateError): string => {
  switch (error.code) {
    case 'INIT_FAILED':
      return 'Failed to initialize template. Created a new template for you to start building.';
    case 'API_FAILED':
      return 'Could not load template from server. Working with a local copy.';
    case 'VALIDATION_FAILED':
      return 'Template data was corrupted. Restored to a working state.';
    case 'STORE_CORRUPTED':
      return 'Builder state was corrupted. Reset to a clean state.';
    default:
      return 'An unexpected error occurred. Created a fresh template for you.';
  }
};

/**
 * Error logging for monitoring and debugging
 */
export const logTemplateError = (error: TemplateError): void => {
  // Console logging for development
  console.group(`🚨 Template Error: ${error.code}`);
  console.error('Message:', error.message);
  console.error('Context:', error.context);
  console.error('Timestamp:', error.timestamp);
  if (error.originalError) {
    console.error('Original Error:', error.originalError);
  }
  console.groupEnd();
  
  // TODO: In production, send to monitoring service
  // analyticsService.logError('template_error', error);
  // sentryService.captureException(error.originalError, { context: error.context });
};