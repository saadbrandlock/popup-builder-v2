import { ClientFlowData } from '@/types';
import { BaseTemplate } from '@/features/base-template/types';
import { CleanTemplateResponse } from '@/types/template';

/**
 * Converts BaseTemplate to ClientFlowData format
 * Used for base template previews without API calls.
 * html_content is not stored in DB; caller must pass htmlContent (e.g. from builder_state_json conversion).
 */
export function convertBaseTemplateToClientFlowData(
  template: BaseTemplate | CleanTemplateResponse,
  htmlContent?: string | null
): ClientFlowData | null {
  if (!('id' in template) || !('template_id' in template)) {
    return null;
  }

  const designJson = template.builder_state_json || {};
  const devices = designJson.devices || [];
  
  // Default to desktop if no devices specified
  const defaultDevices = devices.length > 0 
    ? devices 
    : [{ id: 1, device_type: 'desktop' }];

  return {
    template_id: 'template_id' in template ? template.template_id : (template as CleanTemplateResponse).id,
    template_name: template.name,
    template_description: template.description || '',
    canvas_type: designJson.body?.canvas_type || 'single-row',
    is_custom_coded: false,
    is_generic: false, // Base templates are not generic by default
    template_status: template.status,
    template_created_at: template.created_at,
    template_updated_at: template.updated_at,
    template_created_by: 0,
    template_updated_by: 0,
    template_remarks: null,
    staging_id: '',
    builder_state_json: designJson,
    template_html: htmlContent || '',
    builder_state_json_client: designJson,
    template_html_client: htmlContent || '',
    reminder_tab_html: '',
    reminder_tab_state_json: {},
    reminder_tab_html_client: '',
    reminder_tab_state_json_client: {},
    review_status: '',
    reviewed_by: null,
    review_notes: null,
    staging_status: '',
    staging_created_at: '',
    staging_updated_at: '',
    account_mapping_id: 0,
    account_id: 0,
    account_mapping_created_at: '',
    shoppers: [],
    device_type_ids: defaultDevices.map((d: any) => d.id || 1),
    devices: defaultDevices.map((d: any) => ({
      id: d.id || 1,
      device_type: d.device_type || 'desktop'
    })),
  };
}

/**
 * Converts CleanTemplateResponse (from API) to ClientFlowData format
 * Used when fetching template data via API
 */
export function convertCleanTemplateToClientFlowData(
  templateResponse: CleanTemplateResponse,
  htmlContent?: string | null
): ClientFlowData | null {
  if (!templateResponse.id) {
    return null;
  }

  return {
    template_id: templateResponse.id,
    template_name: templateResponse.name,
    template_description: templateResponse.description || '',
    canvas_type: templateResponse.builder_state_json?.body?.canvas_type || 
                  templateResponse.canvas_type || 
                  'single-row',
    is_custom_coded: templateResponse.is_custom_coded || false,
    is_generic: templateResponse.is_generic || templateResponse.type === 'generic',
    template_status: templateResponse.status,
    template_created_at: templateResponse.createdAt.toISOString(),
    template_updated_at: templateResponse.lastUpdated.toISOString(),
    template_created_by: 0,
    template_updated_by: 0,
    template_remarks: null,
    staging_id: '',
    builder_state_json: templateResponse.builder_state_json || {},
    template_html: htmlContent || '',
    builder_state_json_client: templateResponse.builder_state_json_client || 
                               templateResponse.builder_state_json || {},
    template_html_client: htmlContent || '',
    reminder_tab_html: templateResponse.reminder_tab_html || '',
    reminder_tab_state_json: templateResponse.reminder_tab_state_json || {},
    reminder_tab_html_client: templateResponse.reminder_tab_html_client || '',
    reminder_tab_state_json_client: templateResponse.reminder_tab_state_json_client || {},
    review_status: '',
    reviewed_by: null,
    review_notes: null,
    staging_status: '',
    staging_created_at: '',
    staging_updated_at: '',
    account_mapping_id: 0,
    account_id: templateResponse.account_details?.id || 0,
    account_mapping_created_at: '',
    shoppers: [],
    device_type_ids: templateResponse.device_ids || 
                     templateResponse.devices?.map((d) => d.id) || [],
    devices: templateResponse.devices?.map((d) => ({
      id: d.id,
      device_type: d.device_type || 'desktop'
    })) || [],
  };
}

/**
 * Union type for template input sources
 */
export type TemplateSource = BaseTemplate | CleanTemplateResponse;

/**
 * Type guard to check if input is BaseTemplate
 */
function isBaseTemplate(template: TemplateSource): template is BaseTemplate {
  return 'builder_state_json' in template && 'template_id' in template;
}

/**
 * Universal converter that handles both BaseTemplate and CleanTemplateResponse
 * Automatically detects the input type and converts accordingly
 */
export function convertTemplateToClientFlowData(
  template: TemplateSource,
  htmlContent?: string | null
): ClientFlowData | null {
  if (isBaseTemplate(template)) {
    return convertBaseTemplateToClientFlowData(template, htmlContent);
  } else {
    return convertCleanTemplateToClientFlowData(template, htmlContent);
  }
}
