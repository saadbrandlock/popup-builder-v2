import { AxiosInstance } from 'axios';
import { BaseAPI } from './BaseAPI';
import type {
  ClientFlowData,
  PaginatedResponse,
  TCBTemplateStaging,
} from '../../types/api';
import { useTemplateListingStore } from '@/stores/list/templateListing.store';
import { FetchParams } from '../types/main.types';
import { TablePaginationConfig } from 'antd';
import { CleanTemplateResponse, TCBTemplate } from '@/types';
import { useClientFlowStore } from '@/features';
import { removeNullUndefinedKeys } from '@/lib/utils/helper';

export class TemplatesAPI extends BaseAPI {
  constructor(apiClient: AxiosInstance) {
    super(apiClient);
  }

  async createBaseTemplate(template: {
    name: string;
    category_id: number;
    description?: string;
    is_custom_coded: boolean;
    canvas_type: string;
    is_generic: boolean;
    status: string;
    remarks?: string | null;
    child_templates?: any;
    is_featured?: boolean;
    display_order?: number;
  }): Promise<{ template_id: string }> {
    try {
      const payload = removeNullUndefinedKeys(template);
      const data = await this.post<{ template_id: string }>(
        `/base-templates/create`,
        payload
      );
      return data;
    } catch (error) {
      this.handleError(error, 'create basic template');
    }
  }

  async updateBaseTemplate(
    templateId: string,
    template: {
      name?: string;
      description?: string;
      is_custom_coded?: boolean;
      canvas_type?: string;
      is_generic?: boolean;
      status?: string;
      remarks?: string | null;
      child_templates?: any;
      is_featured?: boolean;
      display_order?: number;
      builder_state_json?: any;
    }
  ): Promise<TCBTemplate> {
    try {
      const payload = removeNullUndefinedKeys(template);
      console.log(payload);
      
      const response = await this.put<TCBTemplate>(
        `/base-templates/${templateId}`,
        payload
      );
      return response;
    } catch (error) {
      this.handleError(error, 'update basic template');
    }
  }

  async getBaseTemplateById(id: string): Promise<any> {
    try {
      return this.get<any>(`/base-templates/${id}`);
    } catch (error) {
      this.handleError(error, 'get base template by id');
    }
  }

  async getTemplates(
    currentPagination: TablePaginationConfig,
    currentFilters: Pick<FetchParams, 'deviceId' | 'status' | 'nameSearch'>,
    currentSorter: Pick<FetchParams, 'sortColumn' | 'sortDirection'>
  ): Promise<PaginatedResponse<TCBTemplate>> {
    const queryParams = {
      page: currentPagination.current,
      limit: currentPagination.pageSize,
      deviceId: currentFilters.deviceId,
      status: currentFilters.status,
      nameSearch: currentFilters.nameSearch,
      sortColumn: currentSorter.sortColumn,
      sortDirection: currentSorter.sortDirection,
    };

    Object.keys(queryParams).forEach((key) => {
      const k = key as keyof FetchParams;
      if (queryParams[k] === undefined) {
        delete queryParams[k];
      }
    });

    return this.get<PaginatedResponse<TCBTemplate>>(
      `/admin/templates`,
      queryParams
    );
  }

  /**
   * Get templates transformed for UI consumption
   */
  async getTemplatesForUI(): Promise<{
    templates: CleanTemplateResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }> {
    const { filters, pagination, sorter } = useTemplateListingStore.getState();
    const response = await this.getTemplates(pagination, filters, sorter);
    return {
      templates: response.results.map((template) =>
        this.transformTemplate(template)
      ),
      pagination: {
        page: response.page,
        limit: response.limit,
        total: response.count,
      },
    };
  }

  /**
   * Get popup template by ID
   * @param templateId - The template ID to fetch
   * @returns Promise<CleanTemplateResponse>
   */
  async getTemplateById(templateId: string): Promise<CleanTemplateResponse> {
    try {
      const response = await this.get<TCBTemplate>(
        `/admin/templates/${templateId}`
      );
      return this.transformTemplate(response);
    } catch (error) {
      this.handleError(error, `get popup template ${templateId}`);
    }
  }

  /**
   * Publish a template
   */
  async publishTemplate(
    templateId: string,
    htmlContent?: string
  ): Promise<{ message: string }> {
    const payload: { action: string; html_content?: string } = {
      action: 'publish',
    };

    // Only include html_content if provided
    if (htmlContent) {
      payload.html_content = htmlContent;
    }

    return this.post<{ message: string }>(
      `/admin/templates/${templateId}/actions`,
      payload
    );
  }

  /**
   * Archive a template
   */
  async archiveTemplate(templateId: string): Promise<{ message: string }> {
    return this.post<{ message: string }>(
      `/admin/templates/${templateId}/actions`,
      {
        action: 'archive',
      }
    );
  }

  async pushTemplateToClientReview(
    templatesData: {
      template_id: string;
      html_content: string;
    }[]
  ): Promise<TCBTemplateStaging> {
    return this.patch<TCBTemplateStaging>(
      `/staging-template/push-client-review`,
      {
        templatesData,
      }
    );
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<{ message: string }> {
    return this.post<{ message: string }>(
      `/admin/templates/${templateId}/actions`,
      {
        action: 'delete',
      }
    );
  }

  /**
   * Unarchive a template
   */
  async unarchiveTemplate(templateId: string): Promise<{ message: string }> {
    return this.post<{ message: string }>(
      `/admin/templates/${templateId}/actions`,
      {
        action: 'unarchive',
      }
    );
  }

  /**
   * Get a single template by ID
   */
  async getTemplate(templateId: string): Promise<TCBTemplate> {
    return this.get<TCBTemplate>(`/admin/templates/${templateId}`);
  }

  /**
   * Create new popup template
   * @param template - The popup template data
   * @returns Promise<CleanTemplateResponse>
   */
  async createTemplate(
    template: Omit<
      TCBTemplate,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'created_by'
      | 'updated_by'
      | 'deleted_by'
      | 'deleted_at'
    >
  ): Promise<TCBTemplate> {
    try {
      const data = await this.post<TCBTemplate>(`/admin/templates`, template);
      return data;
    } catch (error) {
      this.handleError(error, 'create popup template');
    }
  }

  /**
   * Update a template
   */
  async updateTemplate(
    templateId: string,
    templateData: Partial<TCBTemplate>
  ): Promise<TCBTemplate> {
    try {
      const response = await this.put<TCBTemplate>(
        `/admin/templates/${templateId}`,
        templateData
      );
      return response;
    } catch (error) {
      this.handleError(error, 'update popup template');
    }
  }

  async upsertTemplate(
    templateId: string,
    templateData: Partial<TCBTemplateStaging> & { is_builder_state: boolean }
  ): Promise<TCBTemplateStaging> {
    try {
      const response = await this.put<TCBTemplateStaging>(
        `/staging-template/${templateId}`,
        templateData
      );
      return response;
    } catch (error) {
      this.handleError(error, 'upsert popup template');
    }
  }

  async assignTemplateToShoppers(templateId: string, shopperId: number[]) {
    try {
      const response = await this.post<{ data: { shopper_ids: number[] } }>(
        `/admin/templates/shopper-assignments`,
        {
          template_id: templateId,
          shopper_ids: shopperId,
        }
      );

      return response;
    } catch (error) {
      console.error('Error assigning template:', error);
      throw error;
    }
  }

  async getPotentitalChildTemplateDetails(account_id: number) {
    try {
      const response = await this.get<
        {
          id: string;
          name: string;
          description: string;
          shoppers: { id: number; name: string }[];
          devices: { id: number; device_type: string }[];
        }[]
      >(`/admin/potential-child-templates/account/${account_id}`);
      return response;
    } catch (error) {
      this.handleError(error, 'get potential child template details');
    }
  }

  async linkChildTemplates(parent_id: string, child_ids: string[]) {
    try {
      const response = await this.put<{ data: TCBTemplate }>(
        `/admin/templates/${parent_id}/link-child-templates`,
        {
          child_template_ids: child_ids,
        }
      );
      return response;
    } catch (error) {
      this.handleError(error, 'link child templates');
    }
  }

  getCleintTemplatesData(accountId: number) {
    try {
      const response = this.get<ClientFlowData[]>(
        `/client-review/account/${accountId}`
      );
      return response;
    } catch (error) {
      this.handleError(error, 'get client templates data');
    }
  }

  /**
   * Update client review template with new design data
   * Used when editing templates from client review flow
   */
  async updateClientReviewTemplate(
    templateId: string,
    templateData: Partial<ClientFlowData>
  ): Promise<ClientFlowData> {
    try {
      const response = await this.put<ClientFlowData>(
        `/client-review/template/${templateId}`,
        templateData
      );
      console.log('✅ Client review template updated successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to update client review template:', error);
      this.handleError(error, 'update client review template');
    }
  }

  /**
   * Transform TCBTemplate to CleanTemplateResponse for UI consumption
   */
  transformTemplate(template: TCBTemplate): CleanTemplateResponse {
    return {
      id: template.id,
      name: template.name,
      description: template.description || undefined,
      status: template.status || 'draft',
      devices: template.devices,
      shopper_ids: template.shopper_ids || [],
      type: template.is_generic ? 'generic' : 'specific',
      lastUpdated: new Date(template.updated_at || template.created_at),
      createdAt: new Date(template.created_at),
      createdBy: template.created_by?.toString() || 'Unknown',
      builder_state_json: template.builder_state_json || {},
      canvas_type: template.canvas_type,
      is_generic: template.is_generic,
      is_custom_coded: template.is_custom_coded,
      reminder_tab_state_json: template.reminder_tab_state_json || {},
      device_ids: template.device_ids,
      child_templates: template.child_templates,
      account_details: template.account_details,
    };
  }
}
