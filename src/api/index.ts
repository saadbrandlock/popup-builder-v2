import { AxiosInstance } from 'axios';
import { TemplatesAPI } from './services/TemplatesAPI';

/**
 * API Factory - Creates API service instances with the provided apiClient
 * This is the main entry point for all API services
 */
export class APIFactory {
  private apiClient: AxiosInstance;
  private templatesAPI: TemplatesAPI | null = null;

  constructor(apiClient: AxiosInstance) {
    this.apiClient = apiClient;
  }

  /**
   * Get Templates API service instance (singleton pattern)
   */
  get templates(): TemplatesAPI {
    if (!this.templatesAPI) {
      this.templatesAPI = new TemplatesAPI(this.apiClient);
    }
    return this.templatesAPI;
  }

  // Add more API services here as needed
  // get users(): UsersAPI { ... }
  // get assets(): AssetsAPI { ... }
  // get content(): ContentAPI { ... }
}

/**
 * Create API factory instance
 */
export const createAPI = (apiClient: AxiosInstance): APIFactory => {
  return new APIFactory(apiClient);
};

// Re-export API classes for direct usage if needed
export { BaseAPI } from './services/BaseAPI';
export { TemplatesAPI } from './services/TemplatesAPI';

// Re-export types for convenience
export type { 
  TCBTemplate, 
  PaginatedResponse, 
  ApiResponse, 
  TemplateListParams 
} from '../types/api';