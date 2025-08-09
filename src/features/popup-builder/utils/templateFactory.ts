/**
 * Template Factory Utilities
 * 
 * Provides standardized template creation functions for all initialization scenarios
 * Based on Smart Template Loading Plan Phase 2
 */

import type { PopupTemplate, PopupElement } from '../types';

// Base template structure for all scenarios
interface BaseTemplateStructure extends PopupTemplate {}

/**
 * SCENARIO 1: Create Empty Template (no templateId)
 * Use Case: User creating a new popup from scratch
 * Priority: HIGH - Fixes current drag/drop failure
 */
export const createEmptyTemplate = (customId?: string): BaseTemplateStructure => {
  const templateId = customId || `new_template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log('📝 Creating empty template:', templateId);
  
  return {
    id: templateId,
    name: 'New Popup Template',
    description: 'A new popup template ready for building',
    
    // CRITICAL: Builder state with empty zones for drag/drop functionality
    builder_state_json: {
      zones: {
        header: { components: [] },
        content: { components: [] },
        footer: { components: [] },
      },
    },
    
    // Device compatibility
    device_type_id: 1,
    device_ids: [1, 2],
    devices: [
      { id: 1, device_type: 'desktop' },
      { id: 2, device_type: 'mobile' },
    ],
    
    // Template metadata
    canvas_type: 'single_row',
    status: 'draft',
    is_custom_coded: false,
    is_generic: false,
    
    // Tracking fields
    created_at: new Date().toISOString(),
    created_by: 1,
    account_ids: [],
    shopper_ids: [],
    
    // Optional fields
    latest_published_version_id: null,
    ip_address: null,
    user_agent: null,
    remarks: null,
  };
};

/**
 * SCENARIO 2: Create Template Stub (templateId provided, no apiClient)
 * Use Case: Offline editing, development mode, or API unavailable
 * Priority: MEDIUM - Potential future use case
 */
export const createTemplateStub = (templateId: string): BaseTemplateStructure => {
  console.log('📄 Creating template stub:', templateId);
  
  return {
    ...createEmptyTemplate(templateId),
    id: templateId,
    name: `Template ${templateId}`,
    description: `Template stub for editing: ${templateId}`,
  };
};

/**
 * SCENARIO 4: Create Error Recovery Template
 * Use Case: API failures, corrupt data, error states
 * Priority: MEDIUM - Important for robustness
 */
export const createErrorRecoveryTemplate = (originalId?: string): BaseTemplateStructure => {
  const recoveryId = originalId || `error_recovery_${Date.now()}`;
  
  console.log('🛠️ Creating error recovery template:', recoveryId);
  
  return {
    ...createEmptyTemplate(recoveryId),
    id: recoveryId,
    name: 'Recovered Template',
    description: 'Template recovered from error state - ready for editing',
    remarks: `Recovery template created at ${new Date().toISOString()}`,
  };
};

/**
 * SCENARIO 5: Create Emergency Template
 * Use Case: Critical failures where all other methods fail
 * Priority: HIGH - Last resort to prevent complete failure
 */
export const createEmergencyTemplate = (originalId?: string): BaseTemplateStructure => {
  const emergencyId = originalId || `emergency_${Date.now()}`;
  
  console.log('🚑 Creating emergency template:', emergencyId);
  
  return {
    id: emergencyId,
    name: 'Emergency Template',
    description: 'Emergency template created due to critical initialization failure',
    
    // CRITICAL: Ensure drag/drop functionality works
    builder_state_json: {
      zones: {
        header: { components: [] },
        content: { components: [] },
        footer: { components: [] },
      },
    },
    
    // Minimal required fields
    device_type_id: 1,
    device_ids: [1, 2],
    devices: [
      { id: 1, device_type: 'desktop' },
      { id: 2, device_type: 'mobile' },
    ],
    canvas_type: 'single_row',
    status: 'draft',
    is_custom_coded: false,
    is_generic: false,
    created_at: new Date().toISOString(),
    created_by: 1,
    account_ids: [],
    shopper_ids: [],
    latest_published_version_id: null,
    ip_address: null,
    user_agent: null,
    remarks: 'Emergency template - check logs for initialization failure details',
  };
};

/**
 * SCENARIO 3: Parse Template from API Response
 * Use Case: Loading existing template from backend
 * Priority: LOW - Currently working with mock data
 */
export const parseTemplateFromApi = (apiResponse: any): BaseTemplateStructure => {
  console.log('🌐 Parsing template from API response');
  
  // Validate that we have the required structure
  if (!apiResponse || typeof apiResponse !== 'object') {
    console.warn('⚠️ Invalid API response, creating fallback template');
    return createErrorRecoveryTemplate('api-parse-error');
  }
  
  // Ensure builder_state_json has proper structure
  let builderState = apiResponse.builder_state_json;
  if (!builderState?.zones?.header || !builderState?.zones?.content || !builderState?.zones?.footer) {
    console.warn('⚠️ Invalid builder state in API response, creating empty zones');
    builderState = {
      zones: {
        header: { components: builderState?.zones?.header?.components || [] },
        content: { components: builderState?.zones?.content?.components || [] },
        footer: { components: builderState?.zones?.footer?.components || [] },
      },
    };
  }
  
  return {
    ...apiResponse,
    builder_state_json: builderState,
  } as BaseTemplateStructure;
};

/**
 * Template Validation
 * Ensures template meets requirements for drag/drop functionality
 */
export const validateTemplate = (template: any): boolean => {
  const isValid = !!(
    template?.id &&
    template?.name &&
    template?.builder_state_json?.zones?.header &&
    template?.builder_state_json?.zones?.content &&
    template?.builder_state_json?.zones?.footer &&
    Array.isArray(template.builder_state_json.zones.header.components) &&
    Array.isArray(template.builder_state_json.zones.content.components) &&
    Array.isArray(template.builder_state_json.zones.footer.components)
  );
  
  if (!isValid) {
    console.error('❌ Template validation failed:', {
      hasId: !!template?.id,
      hasName: !!template?.name,
      hasBuilderState: !!template?.builder_state_json,
      hasZones: !!template?.builder_state_json?.zones,
      hasHeaderZone: !!template?.builder_state_json?.zones?.header,
      hasContentZone: !!template?.builder_state_json?.zones?.content,
      hasFooterZone: !!template?.builder_state_json?.zones?.footer,
    });
  }
  
  return isValid;
};

/**
 * Template Repair
 * Attempts to fix common template issues
 */
export const repairTemplate = (template: any): BaseTemplateStructure => {
  console.log('🔧 Attempting to repair template:', template?.id);
  
  if (!template || typeof template !== 'object') {
    return createEmptyTemplate();
  }
  
  // Start with base template and overlay provided data
  const baseTemplate = createEmptyTemplate(template.id);
  
  const repairedTemplate = {
    ...baseTemplate,
    ...template,
    // Ensure builder state is valid
    builder_state_json: {
      zones: {
        header: { 
          components: template?.builder_state_json?.zones?.header?.components || [] 
        },
        content: { 
          components: template?.builder_state_json?.zones?.content?.components || [] 
        },
        footer: { 
          components: template?.builder_state_json?.zones?.footer?.components || [] 
        },
      },
    },
  };
  
  console.log('✅ Template repaired successfully');
  return repairedTemplate;
};

/**
 * Debug Helper: Log Template Structure
 */
export const logTemplateStructure = (template: BaseTemplateStructure, context: string): void => {
  console.log(`🔍 Template structure (${context}):`, {
    id: template.id,
    name: template.name,
    hasBuilderState: !!template.builder_state_json,
    zones: template.builder_state_json ? Object.keys(template.builder_state_json.zones) : [],
    componentCounts: template.builder_state_json ? {
      header: template.builder_state_json.zones.header.components.length,
      content: template.builder_state_json.zones.content.components.length,
      footer: template.builder_state_json.zones.footer.components.length,
    } : null,
  });
};