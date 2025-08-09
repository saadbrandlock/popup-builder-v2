/**
 * Smart Template Loader
 * 
 * Main orchestrator for template initialization across all scenarios
 * Based on Smart Template Loading Plan Phase 3
 */

import type { PopupTemplate } from '../types';
import { 
  createEmptyTemplate, 
  createTemplateStub, 
  createEmergencyTemplate,
  parseTemplateFromApi,
  validateTemplate,
  logTemplateStructure 
} from './templateFactory';
import { 
  handleTemplateError, 
  withErrorBoundary,
  withTemplateErrorBoundary 
} from './templateErrorHandler';

/**
 * Main template initialization function
 * Handles all scenarios from the Smart Template Loading Plan
 */
export const initializeTemplate = async (
  templateId?: string,
  apiClient?: any
): Promise<PopupTemplate> => {
  console.log('🎯 Starting smart template initialization:', { templateId, hasApiClient: !!apiClient });
  
  const template = await withErrorBoundary(
    async () => {
      // SCENARIO 1: New Template Creation (HIGH PRIORITY - FIXES CURRENT ISSUE)
      if (!templateId) {
        console.log('📝 SCENARIO 1: Creating new template - no templateId provided');
        const newTemplate = createEmptyTemplate();
        logTemplateStructure(newTemplate, 'new template creation');
        return newTemplate;
      }

      // SCENARIO 2: Template Stub (MEDIUM PRIORITY)
      if (!apiClient) {
        console.log('📄 SCENARIO 2: Creating template stub - templateId without apiClient');
        const stubTemplate = createTemplateStub(templateId);
        logTemplateStructure(stubTemplate, 'template stub creation');
        return stubTemplate;
      }

      // SCENARIO 3: API Template Loading (LOW PRIORITY - ALREADY WORKING)
      console.log('🌐 SCENARIO 3: Loading template from API');
      return await loadTemplateFromApi(templateId, apiClient);
      
    },
    () => {
      // SCENARIO 4: Error Fallback - Emergency Template Creation
      console.log('❌ SCENARIO 4: Critical error fallback - creating emergency template');
      return createEmergencyTemplate(templateId);
    },
    'template_initialization'
  );

  // Final validation to ensure template is ready for drag/drop
  if (!validateTemplate(template)) {
    console.warn('⚠️ Template failed validation, applying repair');
    return handleTemplateError(
      new Error('Template validation failed'), 
      'validation', 
      templateId
    );
  }

  console.log('✅ Template initialization complete');
  logTemplateStructure(template, 'final template');
  
  return template;
};

/**
 * Load template from API with proper error handling
 * SCENARIO 3 implementation
 */
const loadTemplateFromApi = async (templateId: string, apiClient: any): Promise<PopupTemplate> => {
  return withTemplateErrorBoundary(
    () => {
      // For now, we'll use the existing mock template logic
      // TODO: Replace with actual API call when ready
      console.log('🔄 Using mock template for API scenario (development mode)');
      
      const mockTemplate = {
        id: templateId,
        name: 'Sample Popup',
        description: 'A sample popup template loaded from API',
        device_type_id: 1,
        device_ids: [1, 2],
        devices: [
          { id: 1, device_type: 'desktop' },
          { id: 2, device_type: 'mobile' },
        ],
        builder_state_json: {
          zones: {
            header: { components: [] },
            content: { components: [] },
            footer: { components: [] },
          },
        },
        is_custom_coded: false,
        is_generic: false,
        account_ids: [],
        canvas_type: 'single_row',
        latest_published_version_id: null,
        ip_address: null,
        user_agent: null,
        remarks: null,
        created_at: new Date().toISOString(),
        created_by: 1,
        status: 'draft' as const,
        shopper_ids: [],
      };

      return parseTemplateFromApi(mockTemplate);
    },
    'api_load',
    templateId
  );
};

/**
 * Quick template initialization for immediate use
 * Synchronous version for cases where async is not possible
 */
export const initializeTemplateSync = (templateId?: string): PopupTemplate => {
  console.log('⚡ Quick template initialization (sync):', templateId);
  
  return withTemplateErrorBoundary(
    () => {
      if (!templateId) {
        return createEmptyTemplate();
      }
      return createTemplateStub(templateId);
    },
    'sync_initialization',
    templateId
  );
};

/**
 * Template pre-check for UI rendering decisions
 * Helps determine if template is ready for drag/drop
 */
export const isTemplateReady = (template: PopupTemplate | null): boolean => {
  if (!template) {
    console.log('🔍 Template readiness check: template is null');
    return false;
  }
  
  const isReady = validateTemplate(template);
  console.log('🔍 Template readiness check:', { 
    templateId: template.id, 
    isReady,
    hasZones: !!template.builder_state_json?.zones 
  });
  
  return isReady;
};

/**
 * Template health check for debugging
 */
export const checkTemplateHealth = (template: PopupTemplate): {
  healthy: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  if (!template.id) {
    issues.push('Missing template ID');
    recommendations.push('Template needs a unique identifier');
  }
  
  if (!template.name) {
    issues.push('Missing template name');
    recommendations.push('Add a descriptive name for the template');
  }
  
  if (!template.builder_state_json) {
    issues.push('Missing builder state');
    recommendations.push('Template needs builder_state_json for drag/drop functionality');
  } else {
    const zones = template.builder_state_json.zones;
    if (!zones?.header || !zones?.content || !zones?.footer) {
      issues.push('Incomplete zone structure');
      recommendations.push('All three zones (header, content, footer) are required');
    }
  }
  
  const healthy = issues.length === 0;
  
  console.log('🏥 Template health check:', {
    templateId: template.id,
    healthy,
    issueCount: issues.length,
    issues,
  });
  
  return { healthy, issues, recommendations };
};