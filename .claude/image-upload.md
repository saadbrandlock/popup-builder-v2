## Implementation Progress

### Core API Implementation ✅
- [x] Asset types/interfaces created (`Asset`, `AssetUploadRequest`, `AssetsByAccountQueryParams`, `AssetsByAccountResponse`)
- [x] AssetsAPI service class created extending BaseAPI
- [x] Assets service added to APIFactory with singleton pattern
- [x] uploadAsset method implemented with FormData support
- [x] getAssetsByTemplate method implemented  
- [x] getAssetsByAccount method implemented with pagination
- [x] deleteAsset method implemented

### Completed ✅ (Unlayer Integration)
- [x] Created useUnlayerImageUpload hook for Unlayer integration
- [x] Modified useUnlayerEditor to support custom image upload
- [x] Updated UnlayerMain component to use store values for templateId and accountId
- [x] Configured Unlayer registerCallback('image') for custom upload
- [x] Configured Unlayer registerCallback('selectImage') for image picker
- [x] Integration with existing store architecture (useBuilderStore, useGenericStore)

### Usage with Unlayer
```typescript
// UnlayerMain component now supports custom image upload
<UnlayerMain
  unlayerConfig={config}
  apiClient={axiosInstance}
  enableCustomImageUpload={true}
  onSave={handleSave}
  onError={handleError}
/>
```

The integration automatically:
- Gets `templateId` from `useBuilderStore().currentTemplateId`
- Gets `accountId` from `useGenericStore().authProvider.accountId` 
- Uses provided `apiClient` for API calls
- Registers custom upload handlers with Unlayer when editor is ready
- Handles file validation (type, size limits)
- Shows upload progress and user feedback via Ant Design messages
- Generates unique component IDs for each uploaded image

### How Unlayer Image Upload Works

When a user uploads an image in the Unlayer editor:

1. **File Selection**: User drags an image or clicks the image tool in Unlayer
2. **Custom Handler**: Our `registerCallback('image')` intercepts the upload
3. **Validation**: File type and size are validated before upload
4. **API Upload**: Image is uploaded via our AssetsAPI to your S3 storage
5. **URL Return**: The S3 URL is returned to Unlayer to display the image
6. **Database Storage**: Asset metadata is stored in your database

**Image Selection Process**:
1. User clicks "Select Image" in Unlayer
2. Our `registerCallback('selectImage')` opens a file picker
3. Selected file is uploaded via the same process
4. Image URL is provided to Unlayer for insertion

### Final Architecture

**What's Kept:**
- ✅ **AssetsAPI** - Core API service for backend integration
- ✅ **Asset Types** - TypeScript interfaces for type safety
- ✅ **useUnlayerImageUpload** - Hook for Unlayer callback integration

**What's Removed:**
- ❌ **ImageUpload Component** - Not needed with Unlayer callbacks
- ❌ **AssetGallery Component** - Not needed with Unlayer callbacks  
- ❌ **useAssetUpload Hook** - Replaced by useUnlayerImageUpload
- ❌ **useAssetsListing Hook** - Not needed for current workflow
- ❌ **Related CSS Styles** - Cleaned up unused styles

### Direct API Usage (for other integrations)
```typescript
// Direct API usage if needed outside of Unlayer
const api = createAPI(axiosInstance);

// Upload an asset
const uploadRequest: AssetUploadRequest = {
  file: selectedFile,
  image_component_id: "123",
  template_id: "uuid-string", 
  account_id: "456",
  remarks: "Profile image"
};
const uploadedAsset = await api.assets.uploadAsset(uploadRequest);

// Get assets by template
const templateAssets = await api.assets.getAssetsByTemplate("template-uuid");

// Get assets by account with pagination
const accountAssets = await api.assets.getAssetsByAccount(456, {
  limit: 20,
  page: 1,
  sortColumn: 'created_at',
  sortDirection: 'desc'
});

// Delete an asset
await api.assets.deleteAsset(assetId);
```

---

## API Endpoints Reference

### 1. Upload Asset

**Endpoint:** `POST /template-builder/assets/upload`

**Description:** Upload an image asset to S3 and store metadata in the database.

**Method:** `POST`

**Content-Type:** `multipart/form-data`

**Request Payload:**
```json
{
  "file": "<image_file>",           // Required: Image file (max 10MB)
  "image_component_id": "123",      // Required: ID of the image component
  "template_id": "uuid-string",     // Required: Template UUID
  "account_id": "456",              // Required: Account ID
  "remarks": "Optional description" // Optional: Additional notes
}
```

**Supported File Types:**
- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`
- `image/svg+xml`

**Response (Success - 201):**
```json
{
  "type": "Success",
  "statusCode": 201,
  "message": "Asset uploaded successfully",
  "data": {
    "id": 1,
    "image_component_id": 123,
    "template_id": "550e8400-e29b-41d4-a716-446655440000",
    "account_id": 456,
    "s3_bucket": "your-bucket-name",
    "s3_key": "template-builder/uuid/assets/123/1704067200000.jpg",
    "s3_url": "https://your-bucket.s3.region.amazonaws.com/template-builder/uuid/assets/123/1704067200000.jpg",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "remarks": "Profile image",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": null,
    "created_by": 789,
    "updated_by": null,
    "deleted_by": null,
    "deleted_at": null,
    "status": "active"
  }
}
```

**Response (Error - 400):**
```json
{
  "type": "Error",
  "statusCode": 400,
  "message": "No file uploaded"
}
```

**Response (Error - 404):**
```json
{
  "type": "Error",
  "statusCode": 404,
  "message": "Template not found"
}
```

---

### 2. Get Assets by Template ID

**Endpoint:** `GET /template-builder/assets/template/:templateId`

**Description:** Retrieve all assets for a specific template (no pagination).

**Method:** `GET`

**URL Parameters:**
- `templateId` (string, required): Template UUID

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Assets retrieved successfully",
  "data": [
    {
      "id": 1,
      "image_component_id": 123,
      "template_id": "550e8400-e29b-41d4-a716-446655440000",
      "account_id": 456,
      "s3_bucket": "your-bucket-name",
      "s3_key": "template-builder/uuid/assets/123/1704067200000.jpg",
      "s3_url": "https://your-bucket.s3.region.amazonaws.com/template-builder/uuid/assets/123/1704067200000.jpg",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "remarks": "Profile image",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": null,
      "created_by": 789,
      "updated_by": null,
      "deleted_by": null,
      "deleted_at": null,
      "status": "active"
    }
  ]
}
```

**Response (Error - 500):**
```json
{
  "type": "Error",
  "statusCode": 500,
  "message": "Failed to retrieve assets"
}
```

---

### 3. Get Assets by Account ID

**Endpoint:** `GET /template-builder/assets/account/:accountId`

**Description:** Retrieve assets for a specific account with pagination and sorting.

**Method:** `GET`

**URL Parameters:**
- `accountId` (number, required): Account ID

**Query Parameters:**
- `limit` (number, optional): Number of items per page (default: 10)
- `page` (number, optional): Page number (default: 1)
- `sortColumn` (string, optional): Column to sort by
- `sortDirection` (string, optional): Sort direction ('asc' or 'desc')

**Allowed Sort Columns:**
- `id`
- `template_id`
- `account_id`
- `image_component_id`
- `created_at`
- `updated_at`

**Example Request:**
```
GET /template-builder/assets/account/456?limit=20&page=1&sortColumn=created_at&sortDirection=desc
```

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Assets retrieved successfully",
  "data": {
    "page": 1,
    "limit": 20,
    "count": 45,
    "results": [
      {
        "id": 1,
        "image_component_id": 123,
        "template_id": "550e8400-e29b-41d4-a716-446655440000",
        "account_id": 456,
        "s3_bucket": "your-bucket-name",
        "s3_key": "template-builder/uuid/assets/123/1704067200000.jpg",
        "s3_url": "https://your-bucket.s3.region.amazonaws.com/template-builder/uuid/assets/123/1704067200000.jpg",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "remarks": "Profile image",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": null,
        "created_by": 789,
        "updated_by": null,
        "deleted_by": null,
        "deleted_at": null,
        "status": "active",
        "template_name": "My Template"
      }
    ],
    "columns": []
  }
}
```
### 7. Delete Asset

**Endpoint:** `DELETE /template-builder/assets/:id`

**Description:** Soft delete an asset (marks as deleted but doesn't remove from database).

**Method:** `DELETE`

**URL Parameters:**
- `id` (number, required): Asset ID

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Asset deleted successfully",
  "data": true
}
```

**Response (Error - 404):**
```json
{
  "type": "Error",
  "statusCode": 404,
  "message": "Asset not found"
}
```

---