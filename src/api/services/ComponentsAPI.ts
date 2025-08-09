import { AxiosInstance } from 'axios';
import { BaseAPI } from './BaseAPI';
import {
  ComponentCategory,
  ComponentsQueryParams,
  ComponentDefinition,
  ComponentClientCustomization,
} from '@/types';

export class ComponentsAPI extends BaseAPI {
  constructor(apiClient: AxiosInstance) {
    super(apiClient);
  }

  /**
   * Get all component categories
   * Endpoint: GET /categories
   */
  async getCategories(): Promise<ComponentCategory[]> {
    try {
      return this.get<ComponentCategory[]>(`${this.BASE_ENDPOINT}/categories`);
    } catch (error) {
      this.handleError(error, 'get component categories');
    }
  }

  /**
   * Get all component definitions with optional filtering
   * Endpoint: GET /components
   * Returns API response with code, message, and data array
   */
  async getComponents(
    params?: ComponentsQueryParams
  ): Promise<ComponentDefinition[]> {
    try {
      const queryParams: Record<string, any> = {};

      if (params?.search) {
        queryParams.search = params.search;
      }
      if (params?.categoryCode) {
        queryParams.categoryCode = params.categoryCode;
      }
      if (params?.componentType) {
        queryParams.componentType = params.componentType;
      }

      // Remove undefined values
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await this.get<ComponentDefinition[]>(
        `${this.BASE_ENDPOINT}/components`,
        queryParams
      );
      return response || [];
    } catch (error) {
      this.handleError(error, 'get components');
    }
  }

  /**
   * Get component definitions with only client customizable properties
   * Endpoint: GET /components/client-customizations
   */
  async getComponentsClientCustomizations(): Promise<
    ComponentClientCustomization[]
  > {
    try {
      return this.get<ComponentClientCustomization[]>(
        `${this.BASE_ENDPOINT}/components/client-customizations`
      );
    } catch (error) {
      this.handleError(error, 'get component client customizations');
    }
  }

  /**
   * Get components by category code
   * Endpoint: GET /components/category/:categoryCode
   */
  async getComponentsByCategory(
    categoryCode: string
  ): Promise<ComponentDefinition[]> {
    try {
      if (!categoryCode) {
        throw new Error('Category code is required');
      }

      return this.get<ComponentDefinition[]>(
        `${this.BASE_ENDPOINT}/components/category/${categoryCode}`
      );
    } catch (error) {
      this.handleError(error, `get components by category ${categoryCode}`);
    }
  }

  /**
   * Get component by ID
   * Endpoint: GET /components/:id
   */
  async getComponentById(id: number): Promise<ComponentDefinition> {
    try {
      if (!id) {
        throw new Error('Component ID is required');
      }

      return this.get<ComponentDefinition>(
        `${this.BASE_ENDPOINT}/components/${id}`
      );
    } catch (error) {
      this.handleError(error, `get component by ID ${id}`);
    }
  }

  /**
   * Get category by ID
   * Endpoint: GET /categories/:id
   */
  async getCategoryById(id: number): Promise<ComponentCategory> {
    try {
      if (!id) {
        throw new Error('Category ID is required');
      }

      return this.get<ComponentCategory>(
        `${this.BASE_ENDPOINT}/categories/${id}`
      );
    } catch (error) {
      this.handleError(error, `get category by ID ${id}`);
    }
  }
}
