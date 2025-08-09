import { AxiosInstance } from 'axios';
import { BaseAPI } from './BaseAPI';
import type {
  PopupTemplate,
  PopupTemplatePayload,
  PopupTemplateResponse,
  ComponentConfig,
  ComponentLibraryResponse,
} from '../../features/popup-builder/types';
import type { TemplateStatus } from '../../types/common';

/**
 * PopupBuilderAPI - Handles all popup builder related API operations
 * Extends BaseAPI following the established pattern
 */
export class PopupBuilderAPI extends BaseAPI {
  constructor(apiClient: AxiosInstance) {
    super(apiClient);
  }

  /**
   * Save popup template using PUT endpoint as specified in development rules
   * @param templateId - The template ID to save
   * @param template - The popup template data
   * @returns Promise<PopupTemplate>
   */
  async saveTemplate(
    templateId: string,
    template: PopupTemplate
  ): Promise<PopupTemplate> {
    try {
      const payload = this.transformTemplateToPayload(template);
      const response = await this.put<PopupTemplateResponse>(
        `/admin/templates/${templateId}`,
        payload
      );
      return this.transformResponseToTemplate(response);
    } catch (error) {
      this.handleError(error, `save popup template ${templateId}`);
    }
  }

  /**
   * Create new popup template
   * @param template - The popup template data
   * @returns Promise<PopupTemplate>
   */
  async createTemplate(template: PopupTemplate): Promise<PopupTemplate> {
    try {
      const payload = this.transformTemplateToPayload(template);
      const response = await this.post<PopupTemplateResponse>(
        `/admin/templates`,
        payload
      );
      return this.transformResponseToTemplate(response);
    } catch (error) {
      this.handleError(error, 'create popup template');
    }
  }

  /**
   * Delete popup template
   * @param templateId - The template ID to delete
   * @returns Promise<void>
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await this.delete(`/${templateId}`);
    } catch (error) {
      this.handleError(error, `delete popup template ${templateId}`);
    }
  }

  /**
   * Update template status
   * @param templateId - The template ID
   * @param status - New status
   * @returns Promise<PopupTemplate>
   */
  async updateTemplateStatus(
    templateId: string,
    status: TemplateStatus
  ): Promise<PopupTemplate> {
    try {
      const response = await this.patch<PopupTemplateResponse>(
        `/${templateId}/status`,
        {
          status,
        }
      );
      return this.transformResponseToTemplate(response);
    } catch (error) {
      this.handleError(error, `update popup template status ${templateId}`);
    }
  }

  /**
   * Get available components for popup builder
   * @returns Promise<ComponentConfig[]>
   */
  async getAvailableComponents(): Promise<ComponentConfig[]> {
    try {
      const response = await this.get<ComponentLibraryResponse>(
        // this.COMPONENTS_ENDPOINT
        '/components'
      );
      return response.components;
    } catch (error) {
      this.handleError(error, 'get available components');
    }
  }

  /**
   * Validate popup template
   * @param template - The template to validate
   * @returns Promise<{ isValid: boolean; errors: string[] }>
   */
  async validateTemplate(
    template: PopupTemplate
  ): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const payload = this.transformTemplateToPayload(template);
      const response = await this.post<{ isValid: boolean; errors: string[] }>(
        `/validate`,
        payload
      );
      return response;
    } catch (error) {
      this.handleError(error, 'validate popup template');
    }
  }

  /**
   * Preview popup template (generate HTML)
   * @param template - The template to preview
   * @returns Promise<{ html: string; css: string }>
   */
  async previewTemplate(
    template: PopupTemplate
  ): Promise<{ html: string; css: string }> {
    try {
      const payload = this.transformTemplateToPayload(template);
      const response = await this.post<{ html: string; css: string }>(
        `/preview`,
        payload
      );
      return response;
    } catch (error) {
      this.handleError(error, 'preview popup template');
    }
  }

  /**
   * Transform API response to PopupTemplate format
   * @private
   */
  private transformResponseToTemplate(
    response: PopupTemplateResponse
  ): PopupTemplate {
    // PopupTemplate is now TCBTemplate, so we return the response directly
    // with proper type casting after ensuring all required fields are present
    return {
      ...response,
      // Ensure these fields exist with defaults if missing from API
      device_ids: response.device_ids || [],
      devices: response.devices || [],
      account_ids: response.account_ids || [],
      shopper_ids: response.shopper_ids || [],
      is_custom_coded: response.is_custom_coded || false,
      is_generic: response.is_generic || false,
      canvas_type: response.canvas_type || 'single_row',
      created_by: response.created_by || 0,
      latest_published_version_id: response.latest_published_version_id || null,
      ip_address: response.ip_address || null,
      user_agent: response.user_agent || null,
      remarks: response.remarks || null,
    } as PopupTemplate;
  }

  /**
   * Transform PopupTemplate to API payload format
   * @private
   */
  private transformTemplateToPayload(
    template: PopupTemplate
  ): PopupTemplatePayload {
    return {
      name: template.name,
      description: template.description,
      builder_state_json: template.builder_state_json,
      status: template.status as TemplateStatus,
    };
  }

  /**
   * Batch operations for multiple templates
   */
  async batchUpdateStatus(
    templateIds: string[],
    status: TemplateStatus
  ): Promise<void> {
    try {
      await this.patch(`/batch/status`, {
        template_ids: templateIds,
        status,
      });
    } catch (error) {
      this.handleError(error, 'batch update template status');
    }
  }

  async batchDeleteTemplates(templateIds: string[]): Promise<void> {
    try {
      await this.delete(`/batch?ids=${templateIds.join(',')}`);
    } catch (error) {
      this.handleError(error, 'batch delete templates');
    }
  }

  /**
   * Get template analytics/usage data
   */
  async getTemplateAnalytics(templateId: string): Promise<{
    views: number;
    conversions: number;
    conversionRate: number;
    lastUsed: string;
  }> {
    try {
      const response = await this.get<{
        views: number;
        conversions: number;
        conversionRate: number;
        lastUsed: string;
      }>(`/${templateId}/analytics`);
      return response;
    } catch (error) {
      this.handleError(error, `get template analytics ${templateId}`);
    }
  }
}
