import { AxiosInstance } from 'axios';
import { TemplatesAPI } from './services/TemplatesAPI';
import { ComponentsAPI } from './services/ComponentsAPI';
import { AssetsAPI } from './services/AssetsAPI';
import { DevicesAPI } from './services/DevicesAPI';
import { ContentAPI } from './services/ContentAPI';

/**
 * API Factory - Creates API service instances with the provided apiClient
 * This is the main entry point for all API services
 */
export class APIFactory {
  private apiClient: AxiosInstance;
  private templatesAPI: TemplatesAPI | null = null;
  private devicesAPI: DevicesAPI | null = null;
  private ComponentsAPI: ComponentsAPI | null = null;
  private assetsAPI: AssetsAPI | null = null;
  private contentAPI: ContentAPI | null = null;

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

  /**
   * Get Devices API service instance (singleton pattern)
   */
  get devices(): DevicesAPI {
    if (!this.devicesAPI) {
      this.devicesAPI = new DevicesAPI(this.apiClient);
    }
    return this.devicesAPI;
  }

  get components(): ComponentsAPI {
    if (!this.ComponentsAPI) {
      this.ComponentsAPI = new ComponentsAPI(this.apiClient);
    }
    return this.ComponentsAPI;
  }

  get assets(): AssetsAPI {
    if (!this.assetsAPI) {
      this.assetsAPI = new AssetsAPI(this.apiClient);
    }
    return this.assetsAPI;
  }

  get content(): ContentAPI {
    if (!this.contentAPI) {
      this.contentAPI = new ContentAPI(this.apiClient);
    }
    return this.contentAPI;
  }

  // Add more API services here as needed
  // get users(): UsersAPI { ... }
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
export { ComponentsAPI } from './services/ComponentsAPI';
export { AssetsAPI } from './services/AssetsAPI';
export { DevicesAPI } from './services/DevicesAPI';
export { ContentAPI } from './services/ContentAPI';

// Re-export types for convenience
export type {
  PaginatedResponse, 
  ApiResponse, 
  TemplateListParams,
  Asset,
  AssetUploadRequest,
  AssetsByAccountQueryParams,
  AssetsByAccountResponse,
  TCBCannedContentWithShoppers
} from '../types/api';