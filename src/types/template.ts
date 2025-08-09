export interface TCBTemplate {
  id: string; // uuid-string
  name: string;
  description?: string;
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
  updated_at?: string; // ISO date string
  created_by: number;
  updated_by?: number;
  deleted_by?: number;
  deleted_at?: string; // ISO date string
  status: string;
  shopper_ids: number[];
}

export interface CleanTemplateResponse {
  id: string;
  name: string;
  description?: string;
  status: string;
  devices: string[];
  type: string;
  lastUpdated: Date;
  createdAt: Date;
  createdBy: string;
  builder_state_json?: Record<string, any>;
  canvas_type?: string;
  is_generic?: boolean;
  is_custom_coded?: boolean;
  shopper_ids: number[];
  account_ids?: number[];
}
