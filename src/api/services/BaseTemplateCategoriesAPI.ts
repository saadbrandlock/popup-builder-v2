import { AxiosInstance } from 'axios';
import { BaseAPI } from './BaseAPI';
import type { PaginatedResponse } from '../../types/api';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/features/base-template/types';

export interface BaseTemplateCategoryListParams {
  limit?: number;
  page?: number;
  sortColumn?: string;
  sortDirection?: 'ascend' | 'descend';
  search?: string;
}

export class BaseTemplateCategoriesAPI extends BaseAPI {
  constructor(apiClient: AxiosInstance) {
    super(apiClient);
  }

  async getCategories(
    params?: BaseTemplateCategoryListParams
  ): Promise<PaginatedResponse<Category>> {
    try {
      const cleanedParams = Object.fromEntries(
        Object.entries(params ?? {}).filter(([, value]) => {
          if (value === undefined || value === null) return false;
          if (typeof value === 'string' && value.trim() === '') return false;
          return true;
        })
      );

      return this.get<PaginatedResponse<Category>>(
        `/base-templates/categories/all`,
        Object.keys(cleanedParams).length > 0 ? cleanedParams : undefined
      );
    } catch (error) {
      this.handleError(error, 'get base template categories');
    }
  }

  async getCategoryById(id: number): Promise<Category> {
    try {
      if (!id && id !== 0) {
        throw new Error('Category ID is required');
      }

      return this.get<Category>(`/base-templates/categories/single/${id}`);
    } catch (error) {
      this.handleError(error, `get base template category by ID ${id}`);
    }
  }

  async createCategory(payload: CreateCategoryInput): Promise<Category> {
    try {
      return this.post<Category>(`/base-templates/categories/single`, payload);
    } catch (error) {
      this.handleError(error, 'create base template category');
    }
  }

  async updateCategory(id: number, payload: UpdateCategoryInput): Promise<Category> {
    try {
      if (!id && id !== 0) {
        throw new Error('Category ID is required');
      }

      const { id: _ignored, ...body } = payload;
      return this.put<Category>(`/base-templates/categories/single/${id}`, body);
    } catch (error) {
      this.handleError(error, `update base template category ${id}`);
    }
  }

  async deleteCategory(id: number): Promise<{ success: boolean }> {
    try {
      if (!id && id !== 0) {
        throw new Error('Category ID is required');
      }

      return this.delete<{ success: boolean }>(`/base-templates/categories/single/${id}`);
    } catch (error) {
      this.handleError(error, `delete base template category ${id}`);
    }
  }
}
