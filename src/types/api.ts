// API types extracted from legacy codebase C:\brandlock\codebase\coupon-builder

export interface ApiResponse<T> {
  statuscode?: number;
  data: T;
  code?: string;
  name?: string;
  Details?: string;
}

export interface ErrorResponse {
  statuscode?: number;
  message: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  count: number;
  results: T[];
  columns?: any[];
}

export interface ApiClient {
  get: (url: string, options?: any) => Promise<any>;
  post: (url: string, data?: any, options?: any) => Promise<any>;
  put: (url: string, data?: any, options?: any) => Promise<any>;
  delete: (url: string, options?: any) => Promise<any>;
}

export interface AuthProvider {
  userId: number;
  accountId: number;
}

export interface Device {
  id: number;
  ip_address: string | null;
  user_agent: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string | null;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
  deleted_at: string | null;
  device_type: string;
}

export interface PublishedTemplatesCouponDesigner {
  template_id: string;
  template_name: string;
  template_description: string;
  canvas_type: string;
  published_template_id: string;
  s3_url: string;
  s3_bucket: string;
  s3_key: string;
  version: number;
  builder_state_snapshot_json: any;
  published_at: string;
  published_status: string;
  device_type_ids: number[];
  device_types: string[];
  is_custom_coded: boolean;
  is_generic: boolean;
}

// API method parameter types
export interface TemplateListParams {
  shopperId?: number;
  deviceId?: number;
  limit?: number;
  page?: number;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc' | 'ascend' | 'descend';
  nameSearch?: string;
  status?: string;
}

export interface TemplateConfig {
  name: string;
  device_type_id: number;
  device_ids: number[];
  shopper_ids: number[];
  description: string;
  status?: string;
  is_generic?: boolean;
  account_ids?: number[];
}

// Component Category Types
export interface ComponentCategory {
  id: number;
  category_code: string;
  category_name: string;
  display_name: string;
  description?: string;
  icon_name?: string;
  display_order: number;
  is_active: boolean;
  parent_category_id?: number;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  remarks?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number;
  deleted_at?: string;
  status: string;
}

// Component Definition Types - Updated to match API response exactly
export interface ComponentDefinition {
  id: number;
  type: string;
  name: string;
  icon_name: string;
  default_config_json: Record<string, any>;
  allowed_in_zones: string[];
  client_customizable_props: Record<string, any>; // Can be nested object structure
  can_contain_children: boolean;
  allowed_children_types: string[] | null; // Can be null
  min_instances: number;
  max_instances: number | null; // Can be null for unlimited
  properties: Record<string, any>;
  preview_thumbnail: string | null; // Can be null
  category_code: string;
  category_name: string;
  category_display_name: string;
  category_icon: string;
  category_color: string;
  component_order: number;
  category_order: number;
}

// Components API Response
export interface ComponentsApiResponse {
  code: number;
  message: string;
  data: ComponentDefinition[];
}

// Client Customization Types
export interface ComponentClientCustomization {
  id: number;
  type: string;
  name: string;
  client_customizable_props: Record<string, boolean>;
}

// Query Parameters
export interface ComponentsQueryParams {
  search?: string;
  categoryCode?: string;
  componentType?: string;
}

// Asset Types
export interface Asset {
  id: number;
  image_component_id: number;
  template_id: string;
  account_id: number;
  s3_bucket: string;
  s3_key: string;
  s3_url: string;
  ip_address: string | null;
  user_agent: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string | null;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
  deleted_at: string | null;
  status: string;
  template_name?: string; // Only available in account assets endpoint
}

export interface AssetUploadRequest {
  file: File;
  image_component_id: string;
  template_id: string;
  account_id: string;
  remarks?: string;
}

export interface AssetsByAccountQueryParams {
  limit?: number;
  page?: number;
  sortColumn?:
    | 'id'
    | 'template_id'
    | 'account_id'
    | 'image_component_id'
    | 'created_at'
    | 'updated_at';
  sortDirection?: 'asc' | 'desc';
}

export interface AssetsByAccountResponse extends PaginatedResponse<Asset> {
  // Inherits page, limit, count, results from PaginatedResponse
  // results will be Asset[] with template_name included
}

export interface TCBCannedContent {
  industry: string | null;
  field: string | null;
  id: number;
  content: string | null;
  ip_address: string | null;
  user_agent: string | null;
  remarks: string | null;
  created_at: string;
  created_by: number | null;
  updated_at: string | null;
  deleted_by: number | null;
  deleted_at: string | null;
  status: string;
}



export type TCBCannedContentWithShoppers = TCBCannedContent & {
  shopper_ids: number[];
};
