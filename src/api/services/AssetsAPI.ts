import { AxiosInstance } from 'axios';
import { BaseAPI } from './BaseAPI';
import type { 
  Asset, 
  AssetUploadRequest, 
  AssetsByAccountQueryParams, 
  AssetsByAccountResponse
} from '../../types/api';

export class AssetsAPI extends BaseAPI {
  constructor(apiClient: AxiosInstance) {
    super(apiClient);
  }

  /**
   * Upload an image asset to S3 and store metadata in the database
   * @param uploadRequest - The asset upload data including file and metadata
   * @returns Promise<Asset>
   */
  async uploadAsset(uploadRequest: AssetUploadRequest): Promise<Asset> {
    try {
      const formData = new FormData();
      formData.append('file', uploadRequest.file);
      formData.append('image_component_id', uploadRequest.image_component_id);
      formData.append('template_id', uploadRequest.template_id);
      formData.append('account_id', uploadRequest.account_id);
      
      if (uploadRequest.remarks) {
        formData.append('remarks', uploadRequest.remarks);
      }

      // Use direct axios call for FormData to ensure proper headers
      const response = await this.apiClient.post(
        `${this.BASE_ENDPOINT}/assets/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return this.extractResponseData<Asset>(response);
    } catch (error) {
      this.handleError(error, 'upload asset');
    }
  }

  /**
   * Get all assets for a specific template
   * @param templateId - Template UUID
   * @returns Promise<Asset[]>
   */
  async getAssetsByTemplate(templateId: string): Promise<Asset[]> {
    try {
      return this.get<Asset[]>(`/template-builder/assets/template/${templateId}`);
    } catch (error) {
      this.handleError(error, `get assets for template ${templateId}`);
    }
  }

  /**
   * Get assets for a specific account with pagination and sorting
   * @param accountId - Account ID
   * @param params - Query parameters for pagination and sorting
   * @returns Promise<AssetsByAccountResponse>
   */
  async getAssetsByAccount(
    accountId: number,
    params?: AssetsByAccountQueryParams
  ): Promise<AssetsByAccountResponse> {
    try {
      const queryParams = {
        limit: params?.limit || 10,
        page: params?.page || 1,
        sortColumn: params?.sortColumn,
        sortDirection: params?.sortDirection,
      };

      return this.get<AssetsByAccountResponse>(
        `/template-builder/assets/account/${accountId}`,
        queryParams
      );
    } catch (error) {
      this.handleError(error, `get assets for account ${accountId}`);
    }
  }

  /**
   * Soft delete an asset (marks as deleted but doesn't remove from database)
   * @param assetId - Asset ID
   * @returns Promise<boolean>
   */
  async deleteAsset(assetId: number): Promise<boolean> {
    try {
      const response = await this.delete<boolean>(`/template-builder/assets/${assetId}`);
      return response;
    } catch (error) {
      this.handleError(error, `delete asset ${assetId}`);
    }
  }
}