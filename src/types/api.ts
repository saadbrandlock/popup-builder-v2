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

export interface TCBTemplate {
  id: string; // uuid-string
  name: string;
  description: string | null;
  device_type_id: number; // Legacy field for backward compatibility
  device_ids: number[]; // NEW: Multi-device support
  devices: Array<{
    id: number;
    device_type: string;
  }>; // NEW: Device details array
  builder_state_json: any | null;
  is_custom_coded: boolean;
  is_generic: boolean; // NEW: Generic template flag
  account_ids: number[];
  canvas_type: string;
  latest_published_version_id: string | null; // uuid-string
  ip_address: string | null;
  user_agent: string | null;
  remarks: string | null;
  created_at: string; // ISO date string
  updated_at: string | null; // ISO date string
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
  deleted_at: string | null; // ISO date string
  status: string | null;
  shopper_ids: number[]
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

export interface TemplateConfigForm {
  name: string;
  device_type_id: number;
  device_ids: number[];
  shopper_ids: number[];
  description: string;
  status?: string;
  is_generic?: boolean;
  account_ids?: number[];
}