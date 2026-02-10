import { AxiosInstance } from 'axios';
import { BaseAPI } from './BaseAPI';
import { PaginatedResponse, CBCannedContentWithShoppers, ShopperDetails, GetShopperDetailsPayload } from '@/types';
import { useContentListingStore } from '@/stores/list/contentListing';

export class ContentAPI extends BaseAPI {
  constructor(apiClient: AxiosInstance) {
    super(apiClient);
  }

  async getIndustries(): Promise<string[]> {
    try {
      const response = await this.get<string[]>(`/content/industries`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getFields(): Promise<string[]> {
    try {
      const response = await this.get<string[]>(`/content/fields`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getContent(): Promise<PaginatedResponse<CBCannedContentWithShoppers>> {
    const { pagination, filters, sorter } = useContentListingStore.getState();
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        industry: filters.industry,
        field: filters.field,
        search: filters.search,
        shopperIds: filters.shopper_ids,
        sortColumn: sorter.sortColumn,
        sortDirection: sorter.sortDirection,
      };

      const response = await this.get<PaginatedResponse<CBCannedContentWithShoppers>>(
        `/content`,
        params
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getContentById(id: number): Promise<CBCannedContentWithShoppers> {
    try {
      const response = await this.get<CBCannedContentWithShoppers>(
        `/content/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async createContent(data: {
    shopper_id: number;
    industry: string;
    field: string;
    content: string;
    remarks?: string;
  }): Promise<CBCannedContentWithShoppers> {
    try {
      const response = await this.post<CBCannedContentWithShoppers>(
        `/content`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateContent(
    id: number,
    data: {
      industry?: string;
      field?: string;
      content?: string;
      remarks?: string;
    }
  ): Promise<CBCannedContentWithShoppers> {
    try {
      const response = await this.put<CBCannedContentWithShoppers>(
        `/content/${id}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteContent(id: number): Promise<void> {
    try {
      const response = await this.delete<void>(`/content/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getShopperDetails(payload: GetShopperDetailsPayload): Promise<ShopperDetails> {
    try {
      const response = await this.post<ShopperDetails[]>(`/shopper-group-details/description`, payload, true);
      return response[0];
    } catch (error) {
      throw error;
    }
  }
}
