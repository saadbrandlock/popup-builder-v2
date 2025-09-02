import { ReminderTabConfig } from '@/features/builder/types';

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
  builder_state_json: Record<string, any> | null;
  is_custom_coded: boolean;
  is_generic: boolean; // NEW: Generic template flag
  account_ids: number[];
  canvas_type: string;
  latest_published_version_id: string | null; // uuid-string
  // AuditedEntity includes ip_address, user_agent, remarks, status
  created_at: string; // ISO date string
  updated_at?: string; // ISO date string
  created_by: number;
  updated_by?: number;
  deleted_by?: number;
  deleted_at?: string; // ISO date string
  shopper_ids: number[];
  status: string;
  reminder_tab_state_json: Record<string, any> | null;
  reminder_tab_html: string | null;
  reminder_tab_state_json_client: Record<string, any> | null;
  reminder_tab_html_client: string | null;
  child_templates?: (TCBTemplate & {linked_at: string, linked_by: number})[];
}

export interface CleanTemplateResponse {
  id: string;
  name: string;
  description?: string;
  status: string;
  devices: Array<{
    id: number;
    device_type: string;
  }>;
  type: string;
  lastUpdated: Date;
  createdAt: Date;
  createdBy: string;
  builder_state_json?: Record<string, any>;
  builder_state_json_client?: Record<string, any>;
  canvas_type?: string;
  is_generic?: boolean;
  is_custom_coded?: boolean;
  reminder_tab_state_json?: Record<string, any>;
  reminder_tab_state_json_client?: Record<string, any>;
  reminder_tab_html?: string;
  reminder_tab_html_client?: string;
  shopper_ids: number[];
  account_ids?: number[];
  device_ids?: number[];
  child_templates?: (TCBTemplate & {linked_at: string, linked_by: number})[];
}

// Types and Interfaces [template merger popup and reminder tab]
export interface MergeOptions {
  popupSelector?: string;
  triggerSelector?: string;
  closeSelectors?: string[];
  enableAnimations?: boolean;
  animationDuration?: string;
}

export interface TemplateData {
  reminder_tab_state_json?: ReminderTabConfig;
  reminder_tab_html?: string;
  template_html: string;
  template_html_client?: string;
}
