import { AxiosInstance, AxiosResponse } from 'axios';

/**
 * Base API class that provides common functionality for all API services
 * All specific API services should extend this class
 */
export abstract class BaseAPI {
  protected apiClient: AxiosInstance;
  protected BASE_ENDPOINT: string;

  constructor(
    apiClient: AxiosInstance,
  ) {
    if (!apiClient) {
      throw new Error('API client is required');
    }
    this.apiClient = apiClient;
    this.BASE_ENDPOINT = '/coupon-builder/api';
  }

  /**
   * Handle API errors consistently across all services
   */
  protected handleError(error: any, operation: string): never {
    console.error(`Error in ${operation}:`, error);

    // Extract error message from various possible error structures
    let errorMessage = `Failed to ${operation}`;

    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.response?.data?.Details) {
      errorMessage = error.response.data.Details;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    // Create a standardized error object
    const apiError = new Error(errorMessage);
    (apiError as any).originalError = error;
    (apiError as any).statusCode = error?.response?.status;

    throw apiError;
  }

  /**
   * Extract data from API response following legacy patterns
   */
  protected extractResponseData<T>(response: AxiosResponse): T {
    // Handle nested data structure (legacy pattern)
    if (response?.data?.data) {
      return response.data.data;
    }

    // Handle direct data structure
    return response.data;
  }

  /**
   * Build query parameters from object
   */
  protected buildQueryParams(params: Record<string, any>): URLSearchParams {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    return queryParams;
  }

  protected buildUrl({endpoint, override_base_endpoint = false, params}: {endpoint: string, override_base_endpoint?: boolean, params?: Record<string, any>}): string {
    const url = override_base_endpoint
      ? endpoint
      : `${this.BASE_ENDPOINT}${endpoint}`;
    if (params && Object.keys(params).length > 0) {
      return `${url}?${this.buildQueryParams(params)}`;
    }
    return url;
  }

  /**
   * Generic GET request
   */
  protected async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    override_base_endpoint: boolean = false
  ): Promise<T> {
    try {
      const url = this.buildUrl({endpoint, params, override_base_endpoint});
      const response = await this.apiClient.get(url);
      return this.extractResponseData<T>(response);
    } catch (error) {
      this.handleError(error, `GET ${endpoint}`);
    }
  }

  /**
   * Generic POST request
   */
  protected async post<T>(endpoint: string, data?: any, override_base_endpoint: boolean = false): Promise<T> {
    try {
      const response = await this.apiClient.post(this.buildUrl({endpoint, override_base_endpoint}), data);
      return this.extractResponseData<T>(response);
    } catch (error) {
      this.handleError(error, `POST ${endpoint}`);
    }
  }

  /**
   * Generic PUT request
   */
  protected async put<T>(endpoint: string, data?: any, override_base_endpoint: boolean = false): Promise<T> {
    try {
      const response = await this.apiClient.put(this.buildUrl({endpoint, override_base_endpoint}), data);
      return this.extractResponseData<T>(response);
    } catch (error) {
      this.handleError(error, `PUT ${endpoint}`);
    }
  }

  /**
   * Generic DELETE request
   */
  protected async delete<T>(endpoint: string, override_base_endpoint: boolean = false): Promise<T> {
    try {
      const response = await this.apiClient.delete(this.buildUrl({endpoint, override_base_endpoint}));
      return this.extractResponseData<T>(response);
    } catch (error) {
      this.handleError(error, `DELETE ${endpoint}`);
    }
  }

  /**
   * Generic PATCH request
   */
  protected async patch<T>(endpoint: string, data?: any, override_base_endpoint: boolean = false): Promise<T> {
    try {
      const response = await this.apiClient.patch(
        this.buildUrl({endpoint, override_base_endpoint}),
        data
      );
      return this.extractResponseData<T>(response);
    } catch (error) {
      this.handleError(error, `PATCH ${endpoint}`);
    }
  }
}
