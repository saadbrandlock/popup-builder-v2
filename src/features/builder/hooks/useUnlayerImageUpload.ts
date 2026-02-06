import { useCallback, useRef } from 'react';
import type { AxiosInstance } from 'axios';
import { message } from 'antd';
import { createAPI } from '@/api';
import type { AssetUploadRequest } from '@/api';

export interface UseUnlayerImageUploadOptions {
  apiClient: AxiosInstance;
  templateId?: string;
  accountId?: string;
  onUploadSuccess?: (asset: any) => void;
  onUploadError?: (error: Error) => void;
}

export interface UseUnlayerImageUploadReturn {
  setupImageUpload: (unlayer: any) => void;
  uploadImage: (file: File, componentId?: string, remarks?: string) => Promise<string>;
}

/**
 * Hook for integrating custom image upload with Unlayer editor
 * Replaces Unlayer's default image upload with our custom asset management
 */
export const useUnlayerImageUpload = (
  options: UseUnlayerImageUploadOptions
): UseUnlayerImageUploadReturn => {
  const { apiClient, templateId, accountId, onUploadSuccess, onUploadError } = options;
  
  const api = createAPI(apiClient);
  const unlayerInstanceRef = useRef<any>(null);

  /**
   * Upload image using our custom assets API
   */
  const uploadImage = useCallback(async (
    file: File, 
    componentId: string = 'unlayer-image', 
    remarks?: string
  ): Promise<string> => {
    if (!templateId || !accountId) {
      throw new Error('Template ID and Account ID are required for image upload');
    }

    try {
      // Validate file
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      
      if (!supportedTypes.includes(file.type)) {
        throw new Error(`Unsupported file type: ${file.type}`);
      }
      
      if (file.size > maxFileSize) {
        throw new Error(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (10MB)`);
      }

      // Create upload request
      const uploadRequest: AssetUploadRequest = {
        file,
        image_component_id: componentId,
        template_id: templateId,
        account_id: accountId,
        remarks: remarks || `Uploaded via Unlayer on ${new Date().toISOString()}`,
      };

      // Upload asset
      const uploadedAsset = await api.assets.uploadAsset(uploadRequest);
      
      // Call success callback
      onUploadSuccess?.(uploadedAsset);
      
      return uploadedAsset.s3_url;
      
    } catch (error) {
      const err = error as Error;
      onUploadError?.(err);
      throw err;
    }
  }, [api.assets, templateId, accountId, onUploadSuccess, onUploadError]);

  /**
   * Setup custom image upload handler for Unlayer
   */
  const setupImageUpload = useCallback((unlayer: any) => {
    if (!unlayer) {
      console.warn('Unlayer instance not available for image upload setup');
      return;
    }

    unlayerInstanceRef.current = unlayer;

    // Method 1: Override image upload callback
    unlayer.registerCallback('image', async (file: any, done: any) => {
      try {
        
        // Get the actual file from Unlayer's file object
        // According to Unlayer docs, file has attachments array
        const actualFile = file.attachments?.[0] || file;
        
        if (!actualFile) {
          console.error('❌ No file found in attachments');
          throw new Error('No file provided for upload');
        }

        // Show progress to user
        done({ progress: 10 });
        message.loading('Uploading image...', 0);

        // Generate component ID for this upload
        const componentId = `unlayer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Upload using our custom API
        const imageUrl = await uploadImage(actualFile, componentId, 'Uploaded from Unlayer editor');
        
        // Update progress
        done({ progress: 90 });
        
        // Complete the upload
        done({ 
          progress: 100, 
          url: imageUrl 
        });

        message.destroy();
        message.success('Image uploaded successfully');
        
      } catch (error) {
        console.error('❌ Image upload failed:', error);
        message.destroy();
        message.error(`Upload failed: ${(error as Error).message}`);
        
        // Signal error to Unlayer
        done({ 
          progress: 0, 
          error: 'Upload failed. Please try again.' 
        });
      }
    });

    // Method 2: Override select image callback (for image gallery)
    unlayer.registerCallback('selectImage', async (data: any, done: any) => {
      try {
        
        // For now, we'll just open a simple file picker
        // This can be enhanced later with a custom image gallery modal
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = false;
        
        input.onchange = async (event: any) => {
          const file = event.target?.files?.[0];
          if (file) {
            try {
              message.loading('Uploading selected image...', 0);
              
              const componentId = `unlayer-select-${Date.now()}`;
              const imageUrl = await uploadImage(file, componentId, 'Selected from image picker');
              
              done({ url: imageUrl });
              
              message.destroy();
              message.success('Image selected and uploaded');
              
            } catch (error) {
              message.destroy();
              message.error(`Upload failed: ${(error as Error).message}`);
              done({ error: 'Upload failed' });
            }
          }
        };
        
        input.click();
        
      } catch (error) {
        console.error('❌ Image selection failed:', error);
        message.error('Image selection failed');
        done({ error: 'Selection failed' });
      }
    });

  }, [uploadImage]);

  return {
    setupImageUpload,
    uploadImage,
  };
};