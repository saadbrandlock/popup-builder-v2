# Template Builder API - Comprehensive Documentation

This document provides comprehensive information about all Template Builder API endpoints including template management, designer tools, custom templates, canned content, and asset management.

## Base URLs
- Template Builder: `/template-builder`
- Template Designer: `/template-designer`

## Authentication
All endpoints require authentication. Include the authentication token in the request headers.

---

## 1. Template Builder API (`/template-builder`)

### 1.1 Component Definitions

#### Get Component Definitions
**Endpoint:** `GET /template-builder/components`

**Description:** Retrieve all available component definitions for template building.

**Method:** `GET`

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Component definitions retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Text Component",
      "type": "text",
      "properties": {
        "content": "string",
        "fontSize": "number",
        "color": "string"
      }
    }
  ]
}
```

### 1.2 Template Management

#### Get All Templates
**Endpoint:** `GET /template-builder/templates`

**Description:** Retrieve templates with optional filtering by shopper and device.

**Method:** `GET`

**Query Parameters:**
- `shopperId` (number, optional): Filter by shopper ID
- `deviceId` (number, optional): Filter by device ID
- `limit` (number, optional): Number of items per page (default: 10)
- `page` (number, optional): Page number (default: 1)
- `sortColumn` (string, optional): Column to sort by
- `sortDirection` (string, optional): Sort direction ('ascend' or 'descend')

**Example Request:**
```
GET /template-builder/templates?shopperId=123&deviceId=456&limit=20&page=1
```

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Templates retrieved successfully",
  "data": {
    "templates": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Holiday Sale Template",
        "description": "Template for holiday promotions",
        "status": "draft",
        "canvas_type": "three_row",
        "is_custom_coded": false,
        "is_generic": false,
        "created_at": "2024-01-01T00:00:00.000Z",
        "device_ids": [1, 2],
        "devices": [
          {"id": 1, "device_type": "desktop"},
          {"id": 2, "device_type": "mobile"}
        ]
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

#### Get Config Templates
**Endpoint:** `GET /template-builder/config/templates`

**Description:** Get configuration templates with advanced filtering options.

**Method:** `GET`

**Query Parameters:**
- `deviceId` (number, optional): Filter by device ID
- `status` (string, optional): Filter by status
- `nameSearch` (string, optional): Search by template name
- `shopperId` (number, optional): Filter by shopper ID
- `limit` (number, optional): Number of items per page
- `page` (number, optional): Page number
- `sortColumn` (string, optional): Column to sort by
- `sortDirection` (string, optional): Sort direction

#### Get Template by ID
**Endpoint:** `GET /template-builder/config/templates/:templateId`

**Description:** Retrieve a specific template by its ID with all related data.

**Method:** `GET`

**URL Parameters:**
- `templateId` (string, required): Template UUID

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Template retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Holiday Sale Template",
    "description": "Template for holiday promotions",
    "builder_state_json": {
      "zones": {
        "header": {"components": []},
        "content": {"components": []},
        "footer": {"components": []}
      }
    },
    "canvas_type": "three_row",
    "status": "draft",
    "is_custom_coded": false,
    "is_generic": false,
    "latest_published_version_id": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": null,
    "created_by": 123,
    "device_ids": [1, 2],
    "devices": [
      {"id": 1, "device_type": "desktop"},
      {"id": 2, "device_type": "mobile"}
    ],
    "shopper_ids": [456, 789],
    "account_ids": [101, 102]
  }
}
```

#### Create Template
**Endpoint:** `POST /template-builder/config/templates`

**Description:** Create a new template with specified configuration.

**Method:** `POST`

**Request Payload:**
```json
{
  "name": "New Template",
  "description": "Template description",
  "device_ids": [1, 2],
  "account_ids": [101, 102],
  "builder_state_json": {
    "zones": {
      "header": {"components": []},
      "content": {"components": []},
      "footer": {"components": []}
    }
  },
  "is_custom_coded": false,
  "is_generic": false,
  "status": "draft",
  "canvas_type": "three_row"
}
```

**Response (Success - 201):**
```json
{
  "type": "Success",
  "statusCode": 201,
  "message": "Template created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "New Template",
    "description": "Template description",
    "status": "draft",
    "created_at": "2024-01-01T00:00:00.000Z",
    "created_by": 123,
    "device_ids": [1, 2],
    "account_ids": [101, 102]
  }
}
```

#### Update Template
**Endpoint:** `PUT /template-builder/config/templates/:templateId`

**Description:** Update an existing template.

**Method:** `PUT`

**URL Parameters:**
- `templateId` (string, required): Template UUID

**Request Payload:**
```json
{
  "name": "Updated Template Name",
  "description": "Updated description",
  "builder_state_json": {
    "zones": {
      "header": {"components": []},
      "content": {"components": []},
      "footer": {"components": []}
    }
  },
  "status": "active"
}
```

#### Publish Template
**Endpoint:** `POST /template-builder/config/templates/:templateId/publish`

**Description:** Publish a template to make it available for use.

**Method:** `POST`

**URL Parameters:**
- `templateId` (string, required): Template UUID

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Template published successfully",
  "data": {
    "id": "pub-550e8400-e29b-41d4-a716-446655440001",
    "template_id": "550e8400-e29b-41d4-a716-446655440000",
    "version": 1,
    "s3_url": "https://bucket.s3.region.amazonaws.com/template-builder/uuid/v1/index.html",
    "published_by": 123,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 1.3 Template-Shopper Assignments

#### Assign Template to Shopper
**Endpoint:** `POST /template-builder/assignments`

**Description:** Assign a template to one or more shoppers.

**Method:** `POST`

**Request Payload:**
```json
{
  "template_id": "550e8400-e29b-41d4-a716-446655440000",
  "shopper_ids": [456, 789, 101]
}
```

#### Remove Shopper Assignment
**Endpoint:** `PUT /template-builder/assignments/:templateId`

**Description:** Remove shopper assignments from a template.

**Method:** `PUT`

**URL Parameters:**
- `templateId` (string, required): Template UUID

**Request Payload:**
```json
{
  "shopper_ids": [456, 789]
}
```

#### Get Shoppers by Template ID
**Endpoint:** `GET /template-builder/templates/:templateId/shoppers`

**Description:** Get all shoppers assigned to a template.

**Method:** `GET`

**URL Parameters:**
- `templateId` (string, required): Template UUID

#### Get Templates by Shopper
**Endpoint:** `GET /template-builder/templates-by-shopper`

**Description:** Get templates assigned to a specific shopper and device.

**Method:** `GET`

**Query Parameters:**
- `shopperId` (number, required): Shopper ID
- `deviceTypeId` (number, required): Device type ID

#### Get Templates by Account
**Endpoint:** `GET /template-builder/templates-by-account`

**Description:** Get templates assigned to a specific account and device.

**Method:** `GET`

**Query Parameters:**
- `accountId` (number, required): Account ID
- `deviceTypeId` (number, required): Device type ID

### 1.4 Device Management

#### Get All Devices
**Endpoint:** `GET /template-builder/devices`

**Description:** Retrieve all available devices.

**Method:** `GET`

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Devices retrieved successfully",
  "data": [
    {
      "id": 1,
      "device_type": "desktop",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "device_type": "mobile",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Device by ID
**Endpoint:** `GET /template-builder/devices/:deviceId`

**Description:** Retrieve a specific device by its ID.

**Method:** `GET`

**URL Parameters:**
- `deviceId` (number, required): Device ID

#### Create Device
**Endpoint:** `POST /template-builder/devices`

**Description:** Create a new device type.

**Method:** `POST`

**Request Payload:**
```json
{
  "device_type": "tablet",
  "remarks": "New tablet device type"
}
```

#### Update Device
**Endpoint:** `PUT /template-builder/devices/:deviceId`

**Description:** Update an existing device.

**Method:** `PUT`

**URL Parameters:**
- `deviceId` (number, required): Device ID

**Request Payload:**
```json
{
  "device_type": "updated_device_name",
  "remarks": "Updated device information"
}
```

#### Delete Device
**Endpoint:** `DELETE /template-builder/devices/:deviceId`

**Description:** Delete a device type.

**Method:** `DELETE`

**URL Parameters:**
- `deviceId` (number, required): Device ID

---

## 2. Custom Templates API (`/template-builder/custom-templates`)

### 2.1 Custom Template Management

#### Create Custom Template
**Endpoint:** `POST /template-builder/custom-templates`

**Description:** Create a new custom coded template.

**Method:** `POST`

**Request Payload:**
```json
{
  "name": "Custom HTML Template",
  "description": "Custom coded template with HTML/CSS",
  "device_ids": [1, 2],
  "account_ids": [101],
  "is_generic": false,
  "status": "draft",
  "canvas_type": "custom",
  "raw_code": "<html><head><title>Custom Template</title></head><body><h1>Hello World</h1></body></html>",
  "code_type": "html"
}
```

**Response (Success - 201):**
```json
{
  "type": "Success",
  "statusCode": 201,
  "message": "Custom template created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Custom HTML Template",
    "is_custom_coded": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Custom Template
**Endpoint:** `PUT /template-builder/custom-templates/:templateId`

**Description:** Update an existing custom template.

**Method:** `PUT`

**URL Parameters:**
- `templateId` (string, required): Template UUID

**Request Payload:**
```json
{
  "name": "Updated Custom Template",
  "raw_code": "<html><head><title>Updated</title></head><body><h1>Updated Content</h1></body></html>"
}
```

#### Get Custom Template by ID
**Endpoint:** `GET /template-builder/custom-templates/:templateId`

**Description:** Retrieve a specific custom template with its code.

**Method:** `GET`

**URL Parameters:**
- `templateId` (string, required): Template UUID

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Custom template retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Custom HTML Template",
    "description": "Custom coded template",
    "is_custom_coded": true,
    "raw_code": "<html><head><title>Custom Template</title></head><body><h1>Hello World</h1></body></html>",
    "code_type": "html",
    "version": 2,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Publish Custom Template
**Endpoint:** `POST /template-builder/custom-templates/:templateId/publish`

**Description:** Publish a custom template.

**Method:** `POST`

**URL Parameters:**
- `templateId` (string, required): Template UUID

#### Get Custom Template Version History
**Endpoint:** `GET /template-builder/custom-templates/:templateId/versions`

**Description:** Get version history of a custom template.

**Method:** `GET`

**URL Parameters:**
- `templateId` (string, required): Template UUID

**Query Parameters:**
- `limit` (number, optional): Number of versions to retrieve
- `page` (number, optional): Page number

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Version history retrieved successfully",
  "data": [
    {
      "id": 1,
      "version": 2,
      "code_type": "html",
      "created_at": "2024-01-01T12:00:00.000Z",
      "created_by": 123
    },
    {
      "id": 2,
      "version": 1,
      "code_type": "html",
      "created_at": "2024-01-01T00:00:00.000Z",
      "created_by": 123
    }
  ]
}
```

#### Get Specific Code Version
**Endpoint:** `GET /template-builder/custom-templates/:templateId/versions/:version`

**Description:** Get code for a specific version of a custom template.

**Method:** `GET`

**URL Parameters:**
- `templateId` (string, required): Template UUID
- `version` (number, required): Version number

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Code version retrieved successfully",
  "data": {
    "id": 1,
    "template_id": "550e8400-e29b-41d4-a716-446655440000",
    "version": 2,
    "code_type": "html",
    "raw_code": "<html><head><title>Version 2</title></head><body><h1>Updated Content</h1></body></html>",
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

#### Validate Custom Code
**Endpoint:** `POST /template-builder/custom-templates/validate`

**Description:** Validate custom HTML/CSS code before saving.

**Method:** `POST`

**Request Payload:**
```json
{
  "raw_code": "<html><head><title>Test</title></head><body><h1>Test</h1></body></html>",
  "code_type": "html"
}
```

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Code validation successful",
  "data": {
    "valid": true,
    "errors": [],
    "warnings": []
  }
}
```

#### Delete Custom Template
**Endpoint:** `DELETE /template-builder/custom-templates/:templateId`

**Description:** Soft delete a custom template.

**Method:** `DELETE`

**URL Parameters:**
- `templateId` (string, required): Template UUID

---

## 3. Template Designer API (`/template-designer`)

### 3.1 Client Components

#### Get Component Definitions for Client Customizations
**Endpoint:** `GET /template-designer/components/client-customizations`

**Description:** Get component definitions available for client customizations.

**Method:** `GET`

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Client customization components retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Text Component",
      "type": "text",
      "customizable_properties": ["content", "fontSize", "color"],
      "client_accessible": true
    }
  ]
}
```

### 3.2 Published Templates

#### Get Published Templates by Shopper
**Endpoint:** `GET /template-designer/templates/:shopperId`

**Description:** Get published templates available to a specific shopper for a device.

**Method:** `GET`

**URL Parameters:**
- `shopperId` (number, required): Shopper ID

**Query Parameters:**
- `device` (number, required): Device ID
- `limit` (number, optional): Number of items per page
- `page` (number, optional): Page number
- `sortColumn` (string, optional): Column to sort by
- `sortDirection` (string, optional): Sort direction

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Published templates retrieved successfully",
  "data": {
    "page": 1,
    "limit": 10,
    "count": 25,
    "results": [
      {
        "id": "pub-550e8400-e29b-41d4-a716-446655440001",
        "template_id": "550e8400-e29b-41d4-a716-446655440000",
        "version": 1,
        "s3_url": "https://bucket.s3.region.amazonaws.com/template-builder/uuid/v1/index.html",
        "template_name": "Holiday Sale Template",
        "published_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "columns": []
  }
}
```

#### Get Available Templates for Client
**Endpoint:** `GET /template-designer/available-templates`

**Description:** Get templates available to a client account.

**Method:** `GET`

**Query Parameters:**
- `accountId` (number, required): Account ID
- `deviceTypeId` (number, required): Device type ID

### 3.3 Template Customizations

#### Get Customization
**Endpoint:** `GET /template-designer/customization`

**Description:** Get existing customization for an account and published template.

**Method:** `GET`

**Query Parameters:**
- `accountId` (number, required): Account ID
- `publishedTemplateId` (string, required): Published template UUID

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Customization retrieved successfully",
  "data": {
    "id": "cust-550e8400-e29b-41d4-a716-446655440000",
    "account_id": 456,
    "published_template_id": "pub-550e8400-e29b-41d4-a716-446655440001",
    "device_type_ids": [1, 2],
    "customization_config_json": {
      "components": {
        "comp-1": {
          "content": "Customized text content",
          "fontSize": 16,
          "color": "#ff0000"
        }
      }
    },
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Create Customization
**Endpoint:** `POST /template-designer/customization`

**Description:** Create a new template customization for an account.

**Method:** `POST`

**Request Payload:**
```json
{
  "account_id": 456,
  "published_template_id": "pub-550e8400-e29b-41d4-a716-446655440001",
  "device_type_ids": [1, 2],
  "customization_config_json": {
    "components": {
      "comp-1": {
        "content": "My custom text",
        "fontSize": 18,
        "color": "#0066cc"
      }
    }
  },
  "status": "active"
}
```

**Response (Success - 201):**
```json
{
  "type": "Success",
  "statusCode": 201,
  "message": "Customization created successfully",
  "data": {
    "id": "cust-550e8400-e29b-41d4-a716-446655440000",
    "account_id": 456,
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Customization
**Endpoint:** `PUT /template-designer/customization/:customizationId`

**Description:** Update an existing template customization.

**Method:** `PUT`

**URL Parameters:**
- `customizationId` (string, required): Customization UUID

**Request Payload:**
```json
{
  "customization_config_json": {
    "components": {
      "comp-1": {
        "content": "Updated custom text",
        "fontSize": 20,
        "color": "#ff6600"
      }
    }
  },
  "status": "active"
}
```

---

## 4. Canned Content API (`/template-builder/canned-content`)

### 4.1 Content Management

#### Get All Canned Contents
**Endpoint:** `GET /template-builder/canned-content`

**Description:** Retrieve canned contents with filtering options.

**Method:** `GET`

**Query Parameters:**
- `shopperIds` (array, optional): Filter by shopper IDs
- `industry` (string, optional): Filter by industry
- `field` (string, optional): Filter by content field
- `search` (string, optional): Search in content, field, or industry
- `limit` (number, optional): Items per page (default: 10)
- `page` (number, optional): Page number (default: 1)
- `sortColumn` (string, optional): Column to sort by
- `sortDirection` (string, optional): Sort direction

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Canned contents retrieved successfully",
  "data": {
    "page": 1,
    "limit": 10,
    "count": 50,
    "results": [
      {
        "id": 1,
        "field": "greeting",
        "industry": "retail",
        "content": "Welcome to our store! Discover amazing deals today.",
        "shopper_ids": [123, 456],
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "columns": []
  }
}
```

#### Get Canned Content by ID
**Endpoint:** `GET /template-builder/canned-content/:id`

**Description:** Retrieve a specific canned content by its ID.

**Method:** `GET`

**URL Parameters:**
- `id` (number, required): Canned content ID

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Canned content retrieved successfully",
  "data": {
    "id": 1,
    "field": "greeting",
    "industry": "retail",
    "content": "Welcome to our store! Discover amazing deals today.",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": null,
    "created_by": 123
  }
}
```

#### Create Canned Content
**Endpoint:** `POST /template-builder/canned-content`

**Description:** Create a new canned content entry.

**Method:** `POST`

**Request Payload:**
```json
{
  "field": "promotion",
  "industry": "fashion",
  "content": "Limited time offer - 50% off all summer collections!",
  "shopper_ids": [123, 456, 789]
}
```

**Response (Success - 201):**
```json
{
  "type": "Success",
  "statusCode": 201,
  "message": "Canned content created successfully",
  "data": {
    "id": 2,
    "field": "promotion",
    "industry": "fashion",
    "content": "Limited time offer - 50% off all summer collections!",
    "created_at": "2024-01-01T00:00:00.000Z",
    "created_by": 123
  }
}
```

#### Update Canned Content
**Endpoint:** `PUT /template-builder/canned-content/:id`

**Description:** Update an existing canned content entry.

**Method:** `PUT`

**URL Parameters:**
- `id` (number, required): Canned content ID

**Request Payload:**
```json
{
  "content": "Updated promotional message - 60% off all items!",
  "industry": "fashion"
}
```

#### Delete Canned Content
**Endpoint:** `DELETE /template-builder/canned-content/:id`

**Description:** Soft delete a canned content entry.

**Method:** `DELETE`

**URL Parameters:**
- `id` (number, required): Canned content ID

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Canned content deleted successfully",
  "data": true
}
```

### 4.2 Content Organization

#### Get Canned Content Grouped by Field
**Endpoint:** `GET /template-builder/canned-content/grouped-by-field`

**Description:** Get canned contents organized by field type.

**Method:** `GET`

**Query Parameters:**
- `shopperIds` (array, optional): Filter by shopper IDs
- `industry` (string, optional): Filter by industry

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Grouped canned content retrieved successfully",
  "data": {
    "greeting": [
      {
        "id": 1,
        "content": "Welcome to our store!",
        "industry": "retail"
      }
    ],
    "promotion": [
      {
        "id": 2,
        "content": "50% off today only!",
        "industry": "fashion"
      }
    ]
  }
}
```

#### Get Industries
**Endpoint:** `GET /template-builder/canned-content/industries`

**Description:** Get all available industries.

**Method:** `GET`

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Industries retrieved successfully",
  "data": [
    "retail",
    "fashion",
    "technology",
    "healthcare",
    "automotive"
  ]
}
```

#### Get Fields
**Endpoint:** `GET /template-builder/canned-content/fields`

**Description:** Get all available content fields.

**Method:** `GET`

**Response (Success - 200):**
```json
{
  "type": "Success",
  "statusCode": 200,
  "message": "Fields retrieved successfully",
  "data": [
    "greeting",
    "promotion",
    "description",
    "call_to_action",
    "disclaimer"
  ]
}
```

---

## 5. Template Assets API (`/template-builder/assets`)

### 5.1 Asset Management

#### Upload Asset
**Endpoint:** `POST /template-builder/assets/upload`

**Description:** Upload an image asset to S3 and store metadata.

**Method:** `POST`

**Content-Type:** `multipart/form-data`

**Request Payload:**
```
file: <image_file>
image_component_id: 123
template_id: "550e8400-e29b-41d4-a716-446655440000"
account_id: 456
remarks: "Hero image"
```

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
    "s3_url": "https://bucket.s3.region.amazonaws.com/template-builder/uuid/assets/123/1704067200000.jpg",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Assets by Template
**Endpoint:** `GET /template-builder/assets/template/:templateId`

**Description:** Get all assets for a specific template.

**Method:** `GET`

**URL Parameters:**
- `templateId` (string, required): Template UUID

#### Get Assets by Account
**Endpoint:** `GET /template-builder/assets/account/:accountId`

**Description:** Get assets for a specific account with pagination.

**Method:** `GET`

**URL Parameters:**
- `accountId` (number, required): Account ID

**Query Parameters:**
- `limit` (number, optional): Items per page
- `page` (number, optional): Page number
- `sortColumn` (string, optional): Sort column
- `sortDirection` (string, optional): Sort direction

#### Delete Asset
**Endpoint:** `DELETE /template-builder/assets/:id`

**Description:** Soft delete an asset.

**Method:** `DELETE`

**URL Parameters:**
- `id` (number, required): Asset ID

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "type": "Error",
  "statusCode": 400,
  "message": "Validation error or invalid request"
}
```

### 401 Unauthorized
```json
{
  "type": "Error",
  "statusCode": 401,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "type": "Error",
  "statusCode": 403,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "type": "Error",
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "type": "Error",
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Data Models

### Template Object
```typescript
interface Template {
  id: string;
  name: string;
  description: string | null;
  builder_state_json: object | null;
  is_custom_coded: boolean;
  canvas_type: string | null;
  latest_published_version_id: string | null;
  is_generic: boolean;
  status: string;
  created_at: string;
  updated_at: string | null;
  created_by: number | null;
  device_ids: number[];
  devices: Device[];
  shopper_ids: number[];
  account_ids: number[];
}
```

### Published Template Object
```typescript
interface PublishedTemplate {
  id: string;
  template_id: string;
  version: number;
  s3_bucket: string;
  s3_key: string;
  s3_url: string;
  builder_state_snapshot_json: object;
  published_by: number;
  created_at: string;
  status: string;
}
```

### Device Object
```typescript
interface Device {
  id: number;
  device_type: string;
  created_at: string;
  updated_at: string | null;
}
```

### Canned Content Object
```typescript
interface CannedContent {
  id: number;
  field: string;
  industry: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  created_by: number | null;
  shopper_ids: number[];
}
```

### Customization Object
```typescript
interface Customization {
  id: string;
  account_id: number;
  published_template_id: string;
  device_type_ids: number[];
  customization_config_json: object;
  status: string;
  created_at: string;
  updated_at: string | null;
}
```

---

## Frontend Integration Examples

### React Hook for Template Management
```typescript
import { useState, useEffect } from 'react';

const useTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTemplates = async (filters = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`/template-builder/templates?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.type === 'Success') {
        setTemplates(data.data.templates);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData) => {
    try {
      const response = await fetch('/template-builder/config/templates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });
      
      const data = await response.json();
      if (data.type === 'Success') {
        await fetchTemplates(); // Refresh list
        return data.data;
      }
      throw new Error(data.message);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const publishTemplate = async (templateId) => {
    try {
      const response = await fetch(`/template-builder/config/templates/${templateId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.type === 'Success') {
        await fetchTemplates(); // Refresh list
        return data.data;
      }
      throw new Error(data.message);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    publishTemplate
  };
};
```

### Template Designer Integration
```typescript
const useTemplateDesigner = (shopperId: number, deviceId: number) => {
  const [publishedTemplates, setPublishedTemplates] = useState([]);
  const [customizations, setCustomizations] = useState({});

  const fetchPublishedTemplates = async () => {
    const response = await fetch(
      `/template-designer/templates/${shopperId}?device=${deviceId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    const data = await response.json();
    if (data.type === 'Success') {
      setPublishedTemplates(data.data.results);
    }
  };

  const saveCustomization = async (accountId: number, templateId: string, config: object) => {
    const response = await fetch('/template-designer/customization', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        account_id: accountId,
        published_template_id: templateId,
        device_type_ids: [deviceId],
        customization_config_json: config,
        status: 'active'
      })
    });

    return response.json();
  };

  return {
    publishedTemplates,
    customizations,
    fetchPublishedTemplates,
    saveCustomization
  };
};
```

---

## Authentication & Permissions

All endpoints require specific permissions. Common permission patterns:

- `templateBuilder:*` - Template builder admin operations
- `templateDesigner:*` - Client-facing template customization
- `templateBuilder:getComponents` - View component definitions
- `templateBuilder:createTemplate` - Create new templates
- `templateBuilder:publishTemplate` - Publish templates
- `templateBuilder:assets` - Manage template assets

---

## Rate Limits & Best Practices

1. **File Uploads**: Maximum 10MB for image assets
2. **Pagination**: Use appropriate page sizes (default: 10, max recommended: 50)
3. **Caching**: Published templates are cached; consider cache invalidation
4. **Error Handling**: Always check response type before processing data
5. **Validation**: Validate custom code before submission
6. **Performance**: Use filtering and sorting parameters to optimize queries

---

## Changelog & Versioning

This API follows semantic versioning. Breaking changes will be communicated in advance and deprecated endpoints will be supported for at least 6 months before removal.





