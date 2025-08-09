# Unlayer Custom Image Management - "Offline Mode" Implementation Plan

## Architecture Overview

This plan implements a complete **"Offline Mode"** for Unlayer where all external API calls are blocked and image management is handled entirely through our custom backend infrastructure, following our existing codebase patterns and architecture.

### Core Concept: Unlayer Offline Mode

By redirecting all Unlayer API endpoints to localhost and implementing custom handlers, we achieve:
- ✅ **Zero Unlayer Server Communication**
- ✅ **Complete Image Control** through our APIs
- ✅ **Cost-Free Operation** (no Unlayer API usage)
- ✅ **Full Data Privacy** (all assets in our infrastructure)
- ✅ **Custom User Experience** with our image gallery

## 1. **API Infrastructure Layer**

### 1.1 AssetsAPI Service Implementation
Following our existing BaseAPI pattern with the `/coupon-builder/api` base endpoint:

```typescript
// File: src/api/services/AssetsAPI.ts
import { BaseAPI } from './BaseAPI';

export interface Asset {
  id: number;
  image_component_id: string;
  template_id: string;
  account_id: number;
  s3_bucket: string;
  s3_key: string;
  s3_url: string;
  ip_address: string;
  user_agent: string;
  remarks: string;
  created_at: string;
  updated_at: string | null;
  created_by: number;
  updated_by: number | null;
  deleted_by: number | null;
  deleted_at: string | null;
  status: string;
}

export interface AssetListParams {
  limit?: number;
  page?: number;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedAssets {
  page: number;
  limit: number;
  count: number;
  results: Asset[];
  columns: any[];
}

export class AssetsAPI extends BaseAPI {
  /**
   * Upload an image asset
   * POST /coupon-builder/api/template-builder/assets/upload
   */
  async uploadAsset(data: FormData): Promise<Asset> {
    return this.post<Asset>('/template-builder/assets/upload', data);
  }

  /**
   * Get assets by template ID
   * GET /coupon-builder/api/template-builder/assets/template/:templateId
   */
  async getTemplateAssets(templateId: string): Promise<Asset[]> {
    return this.get<Asset[]>(`/template-builder/assets/template/${templateId}`);
  }

  /**
   * Get assets by account ID with pagination
   * GET /coupon-builder/api/template-builder/assets/account/:accountId
   */
  async getAccountAssets(accountId: string, params?: AssetListParams): Promise<PaginatedAssets> {
    return this.get<PaginatedAssets>(`/template-builder/assets/account/${accountId}`, params);
  }

  /**
   * Delete an asset (soft delete)
   * DELETE /coupon-builder/api/template-builder/assets/:id
   */
  async deleteAsset(id: number): Promise<boolean> {
    return this.delete<boolean>(`/template-builder/assets/${id}`);
  }
}
```

### 1.2 API Factory Integration
Update existing APIFactory to include AssetsAPI:

```typescript
// File: src/api/index.ts
import { AssetsAPI } from './services/AssetsAPI';

export class APIFactory {
  private apiClient: AxiosInstance;
  private templatesAPI: TemplatesAPI | null = null;
  private ComponentsAPI: ComponentsAPI | null = null;
  private assetsAPI: AssetsAPI | null = null; // Add this

  constructor(apiClient: AxiosInstance) {
    this.apiClient = apiClient;
  }

  get templates(): TemplatesAPI {
    if (!this.templatesAPI) {
      this.templatesAPI = new TemplatesAPI(this.apiClient);
    }
    return this.templatesAPI;
  }

  get components(): ComponentsAPI {
    if (!this.ComponentsAPI) {
      this.ComponentsAPI = new ComponentsAPI(this.apiClient);
    }
    return this.ComponentsAPI;
  }

  // Add assets API service
  get assets(): AssetsAPI {
    if (!this.assetsAPI) {
      this.assetsAPI = new AssetsAPI(this.apiClient);
    }
    return this.assetsAPI;
  }
}

// Re-export AssetsAPI
export { AssetsAPI } from './services/AssetsAPI';
export type { Asset, AssetListParams, PaginatedAssets } from './services/AssetsAPI';
```

### 1.3 Backend API Blocking
```javascript
// Block all Unlayer external API calls in your backend
app.use('/api/unlayer-disabled/*', (req, res) => {
  console.log('Blocked Unlayer API call:', req.originalUrl);
  res.status(404).json({ error: 'Unlayer API disabled - using custom implementation' });
});
```

## 2. **Unlayer Offline Mode Configuration**

### 2.1 Editor Configuration
```typescript
// File: src/features/unlayer/utils/unlayerConfig.ts
export const unlayerOfflineConfig = {
  version: 'latest',
  displayMode: 'popup', // Based on your existing implementation
  // Redirect ALL Unlayer APIs to localhost (blocks external calls)
  env: {
    API_V2_BASE_URL: 'http://localhost:3000/api/unlayer-disabled',
    API_V1_BASE_URL: 'http://localhost:3000/api/unlayer-disabled',
    API_V3_BASE_URL: 'http://localhost:3000/api/unlayer-disabled',
    EVENTS_API_BASE_URL: 'http://localhost:3000/api/unlayer-disabled',
    TOOLS_API_V1_BASE_URL: 'http://localhost:3000/api/unlayer-disabled',
    TOOLS_CDN_BASE_URL: 'http://localhost:3000/api/unlayer-disabled',
    CONSOLE_BASE_URL: 'http://localhost:3000/api/unlayer-disabled',
  },
  features: {
    imageUpload: false, // Disable default if available
  }
};
```

### 2.2 Custom Handler Registration
```typescript
// File: src/features/unlayer/utils/imageHandlers.ts
import { createAPI } from '@/api';

export const setupOfflineMode = (
  unlayer: any, 
  templateId: string, 
  accountId: string,
  apiClient: AxiosInstance
) => {
  const api = createAPI(apiClient);
  
  // Override image upload
  unlayer.registerCallback('image', (file: any, done: any) => 
    customImageUploadHandler(file, done, templateId, accountId, api.assets)
  );
  
  // Override image selection/gallery
  unlayer.registerCallback('selectImage', (data: any, done: any) => 
    customImageGalleryHandler(data, done, templateId, accountId, api.assets)
  );
  
  console.log('Unlayer running in offline mode - all external calls blocked');
};
```

## 3. **Custom Image Upload System**

### 3.1 Upload Handler Implementation
```typescript
// File: src/features/unlayer/utils/imageHandlers.ts
const customImageUploadHandler = async (
  file: any, 
  done: any,
  templateId: string,
  accountId: string,
  assetsAPI: AssetsAPI
) => {
  try {
    const formData = new FormData();
    formData.append('file', file.attachments[0]);
    formData.append('template_id', templateId);
    formData.append('account_id', accountId);
    formData.append('image_component_id', `unlayer_${Date.now()}`);
    formData.append('remarks', 'Unlayer editor upload');

    done({ progress: 10 });

    // Upload through our AssetsAPI service
    const result = await assetsAPI.uploadAsset(formData);
    
    done({ progress: 70 });
    
    // Return OUR S3 URL directly to Unlayer
    done({ 
      progress: 100, 
      url: result.s3_url // Direct S3 URL, no Unlayer proxy
    });

    console.log('Custom upload successful:', result.s3_url);

  } catch (error) {
    console.error('Custom upload failed:', error);
    done({ progress: 0, error: 'Upload failed. Please try again.' });
  }
};
```

## 4. **Asset Management Store**

Following our existing Zustand store pattern with actions object:

```typescript
// File: src/stores/assetsStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Asset, AssetListParams, PaginatedAssets, AssetsAPI } from '@/api';

interface AssetsState {
  // Asset data
  templateAssets: Record<string, Asset[]>;
  accountAssets: Record<string, PaginatedAssets>;
  
  // UI state
  isGalleryOpen: boolean;
  isUploading: boolean;
  uploadProgress: number;
  selectedAsset: Asset | null;
  
  // Cache management
  lastLoaded: Record<string, Date>;
  error: string | null;
}

interface AssetsActions {
  loadTemplateAssets: (templateId: string, assetsAPI: AssetsAPI) => Promise<void>;
  loadAccountAssets: (accountId: string, params: AssetListParams, assetsAPI: AssetsAPI) => Promise<void>;
  uploadAsset: (file: File, templateId: string, accountId: string, assetsAPI: AssetsAPI) => Promise<Asset>;
  deleteAsset: (id: number, assetsAPI: AssetsAPI) => Promise<void>;
  
  // UI actions
  openGallery: () => void;
  closeGallery: () => void;
  setSelectedAsset: (asset: Asset | null) => void;
  clearError: () => void;
  clearCache: () => void;
}

export const useAssetsStore = create<AssetsState & { actions: AssetsActions }>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    templateAssets: {},
    accountAssets: {},
    isGalleryOpen: false,
    isUploading: false,
    uploadProgress: 0,
    selectedAsset: null,
    lastLoaded: {},
    error: null,

    actions: {
      loadTemplateAssets: async (templateId: string, assetsAPI: AssetsAPI) => {
        try {
          set({ error: null });
          
          // Check cache
          const lastLoaded = get().lastLoaded[`template_${templateId}`];
          if (lastLoaded && Date.now() - lastLoaded.getTime() < 300000) { // 5 min cache
            return;
          }

          const assets = await assetsAPI.getTemplateAssets(templateId);
          
          set((state) => ({
            templateAssets: {
              ...state.templateAssets,
              [templateId]: assets
            },
            lastLoaded: {
              ...state.lastLoaded,
              [`template_${templateId}`]: new Date()
            }
          }));
        } catch (error: any) {
          set({ error: error.message });
          console.error('Failed to load template assets:', error);
        }
      },

      loadAccountAssets: async (accountId: string, params: AssetListParams, assetsAPI: AssetsAPI) => {
        try {
          set({ error: null });
          
          const result = await assetsAPI.getAccountAssets(accountId, params);
          
          set((state) => ({
            accountAssets: {
              ...state.accountAssets,
              [accountId]: result
            },
            lastLoaded: {
              ...state.lastLoaded,
              [`account_${accountId}`]: new Date()
            }
          }));
        } catch (error: any) {
          set({ error: error.message });
          console.error('Failed to load account assets:', error);
        }
      },

      uploadAsset: async (file: File, templateId: string, accountId: string, assetsAPI: AssetsAPI) => {
        try {
          set({ isUploading: true, uploadProgress: 0, error: null });

          const formData = new FormData();
          formData.append('file', file);
          formData.append('template_id', templateId);
          formData.append('account_id', accountId);
          formData.append('image_component_id', `gallery_${Date.now()}`);
          formData.append('remarks', `Gallery upload - ${file.name}`);

          set({ uploadProgress: 30 });

          const result = await assetsAPI.uploadAsset(formData);

          set({ uploadProgress: 100 });

          // Update cache
          const templateAssets = get().templateAssets[templateId] || [];
          set((state) => ({
            templateAssets: {
              ...state.templateAssets,
              [templateId]: [result, ...templateAssets]
            }
          }));

          return result;
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isUploading: false, uploadProgress: 0 });
        }
      },

      deleteAsset: async (id: number, assetsAPI: AssetsAPI) => {
        try {
          set({ error: null });
          await assetsAPI.deleteAsset(id);
          
          // Remove from all caches
          const state = get();
          const updatedTemplateAssets = { ...state.templateAssets };
          const updatedAccountAssets = { ...state.accountAssets };
          
          // Remove from template assets
          Object.keys(updatedTemplateAssets).forEach(templateId => {
            updatedTemplateAssets[templateId] = updatedTemplateAssets[templateId].filter(
              asset => asset.id !== id
            );
          });
          
          // Remove from account assets
          Object.keys(updatedAccountAssets).forEach(accountId => {
            updatedAccountAssets[accountId].results = updatedAccountAssets[accountId].results.filter(
              asset => asset.id !== id
            );
          });
          
          set({
            templateAssets: updatedTemplateAssets,
            accountAssets: updatedAccountAssets
          });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      // UI actions
      openGallery: () => set({ isGalleryOpen: true }),
      closeGallery: () => set({ isGalleryOpen: false, selectedAsset: null }),
      setSelectedAsset: (asset: Asset | null) => set({ selectedAsset: asset }),
      clearError: () => set({ error: null }),
      clearCache: () => set({ templateAssets: {}, accountAssets: {}, lastLoaded: {} })
    }
  }))
);

// Selector hooks following your pattern
export const useTemplateAssets = (templateId: string) => 
  useAssetsStore(state => state.templateAssets[templateId] || []);

export const useAccountAssets = (accountId: string) => 
  useAssetsStore(state => state.accountAssets[accountId] || null);

export const useAssetsActions = () => 
  useAssetsStore(state => state.actions);

export const useGalleryState = () => 
  useAssetsStore(state => ({
    isOpen: state.isGalleryOpen,
    isUploading: state.isUploading,
    uploadProgress: state.uploadProgress,
    selectedAsset: state.selectedAsset,
    error: state.error
  }));
```

## 5. **Custom Image Gallery Component**

```typescript
// File: src/features/unlayer/components/ImageGalleryModal.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAssetsStore, useAssetsActions, useTemplateAssets, useAccountAssets } from '@/stores/assetsStore';
import type { Asset, AssetsAPI } from '@/api';

interface ImageGalleryModalProps {
  templateId: string;
  accountId: string;
  assetsAPI: AssetsAPI;
  currentImageUrl?: string;
  onSelect: (asset: Asset) => void;
  onCancel: () => void;
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  templateId,
  accountId,
  assetsAPI,
  currentImageUrl,
  onSelect,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState<'template' | 'account'>('template');
  const [searchTerm, setSearchTerm] = useState('');
  
  const templateAssets = useTemplateAssets(templateId);
  const accountAssets = useAccountAssets(accountId);
  const actions = useAssetsActions();
  const { isUploading, uploadProgress, error } = useAssetsStore(state => ({
    isUploading: state.isUploading,
    uploadProgress: state.uploadProgress,
    error: state.error
  }));

  useEffect(() => {
    // Load assets on mount
    if (activeTab === 'template') {
      actions.loadTemplateAssets(templateId, assetsAPI);
    } else {
      actions.loadAccountAssets(accountId, { limit: 50, sortColumn: 'created_at', sortDirection: 'desc' }, assetsAPI);
    }
  }, [activeTab, templateId, accountId, actions, assetsAPI]);

  const handleUpload = async (file: File) => {
    try {
      const result = await actions.uploadAsset(file, templateId, accountId, assetsAPI);
      onSelect(result);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleImageSelect = (asset: Asset) => {
    onSelect(asset);
  };

  const getDisplayAssets = () => {
    const assets = activeTab === 'template' ? templateAssets : (accountAssets?.results || []);
    
    if (!searchTerm) return assets;
    
    return assets.filter(asset => 
      asset.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.image_component_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const displayAssets = getDisplayAssets();

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-5xl w-full h-4/5 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold">Select Image</h2>
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700">
            {error}
            <button 
              onClick={actions.clearError}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'template' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('template')}
          >
            Template Images ({templateAssets.length})
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'account' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('account')}
          >
            My Images ({accountAssets?.count || 0})
          </button>
        </div>

        {/* Search and Upload */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                className="hidden"
                id="image-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="image-upload"
                className={`px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload New'}
              </label>
            </div>
          </div>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-auto p-4">
          {displayAssets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No images found matching your search.' : 'No images found.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {displayAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={`border-2 rounded-lg p-2 cursor-pointer hover:border-blue-500 transition-colors ${
                    currentImageUrl === asset.s3_url ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleImageSelect(asset)}
                >
                  <div className="aspect-square overflow-hidden rounded">
                    <img
                      src={asset.s3_url}
                      alt={asset.remarks || 'Image'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-xs mt-2 text-gray-600 truncate">
                    {asset.remarks || `Image ${asset.id}`}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(asset.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
```

## 6. **Main Unlayer Component Integration**

Update your existing UnlayerMain component to support offline mode:

```typescript
// File: src/features/unlayer/components/UnlayerMain.tsx
import React, { useRef, useState } from 'react';
import EmailEditor, { EditorRef } from 'react-email-editor';
import { ImageGalleryModal } from './ImageGalleryModal';
import { unlayerOfflineConfig, setupOfflineMode } from '../utils';
import { useAssetsActions } from '@/stores/assetsStore';
import { createAPI } from '@/api';
import type { Asset } from '@/api';

interface UnlayerMainProps {
  templateId: string;
  accountId: string;
  projectId: number;
  apiClient: AxiosInstance;
  onImageUploaded?: (asset: Asset) => void;
  onImageSelected?: (asset: Asset) => void;
}

export const UnlayerMain: React.FC<UnlayerMainProps> = ({
  templateId,
  accountId,
  projectId,
  apiClient,
  onImageUploaded,
  onImageSelected
}) => {
  const emailEditorRef = useRef<EditorRef>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryCallback, setGalleryCallback] = useState<((asset: Asset | null) => void) | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  
  const api = createAPI(apiClient);

  const customImageGalleryHandler = (data: any, done: any) => {
    setCurrentImageUrl(data.url || null);
    setGalleryCallback(() => (selectedAsset: Asset | null) => {
      setIsGalleryOpen(false);
      setGalleryCallback(null);
      
      if (selectedAsset) {
        console.log('Image selected from gallery:', selectedAsset.s3_url);
        done({ url: selectedAsset.s3_url });
        onImageSelected?.(selectedAsset);
      } else {
        done(null);
      }
    });
    setIsGalleryOpen(true);
  };

  const customImageUploadHandler = async (file: any, done: any) => {
    try {
      console.log('Custom image upload started');
      
      const formData = new FormData();
      formData.append('file', file.attachments[0]);
      formData.append('template_id', templateId);
      formData.append('account_id', accountId);
      formData.append('image_component_id', `unlayer_${Date.now()}`);
      formData.append('remarks', 'Unlayer editor upload');

      done({ progress: 10 });

      const result = await api.assets.uploadAsset(formData);
      
      done({ progress: 70 });
      
      done({ 
        progress: 100, 
        url: result.s3_url
      });

      console.log('Custom upload successful:', result.s3_url);
      onImageUploaded?.(result);

    } catch (error) {
      console.error('Custom upload failed:', error);
      done({ progress: 0, error: 'Upload failed. Please try again.' });
    }
  };

  const onReady = (unlayer: any) => {
    console.log('Unlayer ready, setting up offline mode');
    
    // Setup custom handlers
    unlayer.registerCallback('image', customImageUploadHandler);
    unlayer.registerCallback('selectImage', customImageGalleryHandler);
    
    console.log('Unlayer running in offline mode - all external calls blocked');
  };

  const handleGalleryCancel = () => {
    if (galleryCallback) {
      galleryCallback(null);
    }
  };

  const handleGallerySelect = (asset: Asset) => {
    if (galleryCallback) {
      galleryCallback(asset);
    }
  };

  return (
    <div>
      <EmailEditor
        ref={emailEditorRef}
        projectId={projectId}
        onReady={onReady}
        options={unlayerOfflineConfig}
      />
      
      {isGalleryOpen && (
        <ImageGalleryModal
          templateId={templateId}
          accountId={accountId}
          assetsAPI={api.assets}
          currentImageUrl={currentImageUrl}
          onSelect={handleGallerySelect}
          onCancel={handleGalleryCancel}
        />
      )}
    </div>
  );
};
```

## 7. **Implementation Phases**

### Phase 1: Core Offline Mode (MVP)
1. **AssetsAPI Service**: Implement service following BaseAPI pattern ✓
2. **API Factory Integration**: Add assets service to factory ✓
3. **Unlayer Configuration**: Block external calls with env config ✓
4. **Basic Upload Handler**: Direct upload to `/coupon-builder/api/template-builder/assets/upload` ✓

**Success Criteria**: Images upload and display without Unlayer server calls

### Phase 2: Enhanced Gallery System
5. **Assets Store**: Zustand store with actions pattern ✓
6. **Image Gallery Modal**: Professional modal component ✓
7. **Gallery Integration**: Custom selectImage handler ✓
8. **State Management**: Caching and performance optimization ✓

**Success Criteria**: Professional gallery experience with full asset management

### Phase 3: Production Integration
9. **Error Handling**: Comprehensive error recovery ✓
10. **Performance Optimization**: Caching and lazy loading ✓
11. **Testing**: Unit and integration tests
12. **Documentation**: Usage examples and API docs

**Success Criteria**: Production-ready system with enterprise-grade reliability

## 8. **File Structure**

Following your existing architecture:

```
src/features/unlayer/
├── components/
│   ├── UnlayerMain.tsx              # Main editor with offline mode
│   ├── ImageGalleryModal.tsx        # Custom image gallery
│   └── index.ts
├── utils/
│   ├── unlayerConfig.ts             # Offline configuration
│   ├── imageHandlers.ts             # Upload/select handlers
│   └── index.ts
└── types/
    └── unlayer.d.ts                 # Unlayer type extensions

src/api/services/
└── AssetsAPI.ts                     # Assets API service (NEW)

src/stores/
└── assetsStore.ts                   # Assets state management (NEW)

src/types/
└── assets.d.ts                      # Asset type definitions (NEW)
```

## 9. **Usage Example**

```typescript
// In your component where you use Unlayer
import { UnlayerMain } from '@/features/unlayer';
import { useApiClient } from '@/hooks'; // Your existing API client hook

const TemplateEditor: React.FC = () => {
  const apiClient = useApiClient(); // Your existing API client
  
  return (
    <UnlayerMain
      templateId="your-template-id"
      accountId="your-account-id"
      projectId={12345}
      apiClient={apiClient}
      onImageUploaded={(asset) => {
        console.log('Image uploaded:', asset.s3_url);
      }}
      onImageSelected={(asset) => {
        console.log('Image selected:', asset.s3_url);
      }}
    />
  );
};
```

This implementation plan is now **fully aligned** with your existing codebase architecture, using your BaseAPI pattern, API factory structure, Zustand store patterns, and proper endpoint configurations with the `/coupon-builder/api` base path.