import { AxiosInstance } from 'axios';
import { BaseAPI } from './BaseAPI';
import type {
  TCBTemplate,
  PaginatedResponse,
  ApiResponse,
} from '../../types/api';
import type { CouponTemplate } from '../../features/template-builder/types';
import { useTemplateListingStore } from '@/stores/list/templateListing.store';
import { FetchParams } from '../types/main.types';
import { TablePaginationConfig } from 'antd';

export class TemplatesAPI extends BaseAPI {
  private readonly BASE_ENDPOINT = '/template-builder/config/templates';

  constructor(apiClient: AxiosInstance) {
    super(apiClient);
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

    console.log(queryParams);

    Object.keys(queryParams).forEach((key) => {
      const k = key as keyof FetchParams;
      if (queryParams[k] === undefined) {
        delete queryParams[k];
      }
    });

    return this.get<PaginatedResponse<TCBTemplate>>(
      this.BASE_ENDPOINT,
      queryParams
    );
  }

  /**
   * Transform TCBTemplate to CouponTemplate for UI consumption
   */
  transformTemplate(template: TCBTemplate): CouponTemplate {
    return {
      id: template.id,
      name: template.name,
      description: template.description || undefined,
      status: template.status || 'draft',
      devices: template.devices?.map((d) => d.device_type) || [],
      shopper_ids: template.shopper_ids || [],
      type: template.is_generic ? 'generic' : 'specific',
      lastUpdated: new Date(template.updated_at || template.created_at),
      createdAt: new Date(template.created_at),
      createdBy: template.created_by?.toString() || 'Unknown',
      builder_state_json: template.builder_state_json,
      canvas_type: template.canvas_type,
      is_generic: template.is_generic,
      is_custom_coded: template.is_custom_coded,
    };
  }

  /**
   * Get templates transformed for UI consumption
   */
  async getTemplatesForUI(): Promise<{
    templates: CouponTemplate[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }> {
    const { filters, pagination, sorter } = useTemplateListingStore.getState();
    const response = await this.getTemplates(
      pagination,
      filters,
      sorter
    );
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
   * Publish a template
   */
  async publishTemplate(
    templateId: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.post<ApiResponse<{ message: string }>>(
      `${this.BASE_ENDPOINT}/${templateId}/publish`
    );
  }

  /**
   * Archive a template
   */
  async archiveTemplate(
    templateId: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.post<ApiResponse<{ message: string }>>(
      `${this.BASE_ENDPOINT}/${templateId}/archive`
    );
  }

  /**
   * Delete a template
   */
  async deleteTemplate(
    templateId: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.delete<ApiResponse<{ message: string }>>(
      `${this.BASE_ENDPOINT}/${templateId}`
    );
  }

  /**
   * Get a single template by ID
   */
  async getTemplate(templateId: string): Promise<TCBTemplate> {
    return this.get<TCBTemplate>(`${this.BASE_ENDPOINT}/${templateId}`);
  }

  /**
   * Create a new template
   */
  async createTemplate(
    templateData: any
  ): Promise<ApiResponse<{ template: TCBTemplate }>> {
    return this.post<ApiResponse<{ template: TCBTemplate }>>(
      this.BASE_ENDPOINT,
      templateData
    );
  }

  /**
   * Update a template
   */
  async updateTemplate(
    templateId: string,
    templateData: any
  ): Promise<ApiResponse<{ template: TCBTemplate }>> {
    return this.put<ApiResponse<{ template: TCBTemplate }>>(
      `${this.BASE_ENDPOINT}/${templateId}`,
      templateData
    );
  }
}
