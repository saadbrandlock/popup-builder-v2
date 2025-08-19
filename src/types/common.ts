// Common types extracted from legacy codebase C:\brandlock\codebase\coupon-builder

export type ViewMode = 'grid' | 'list';

export type SortOrder = 'asc' | 'desc';

// Template status from legacy constants
export type TemplateStatus = 'draft' | 'active' | 'inactive';

export type TemplateType = 'generic' | 'specific';

export type TemplateAction = 'edit' | 'preview' | 'publish' | 'unpublish' | 'archive' | 'unarchive' | 'delete' | 'duplicate' | 'client-review';

// Canvas types - only single row now
export const CANVAS_TYPES = {
  SINGLE_ROW: 'single_row',
} as const;

export const TEMPLATE_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const DEVICE_TYPES = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  TABLET: 'tablet',
} as const;

export const API_STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

// Template config from legacy codebase - single row only
// export interface TemplateConfig {
//   templateId?: string;
//   device?: number; // Legacy field for backward compatibility
//   device_ids: number[]; // Multi-device support
//   shopperId: number;
//   canvas_type: 'single_row'; // Only single row canvas
//   templateBuilderState?: any; // Builder state for template rendering
// }

// Generic filter interface that can be extended
export interface BaseFilters {
  search: string;
  status: 'all' | TemplateStatus;
  sortBy: string;
  sortOrder: SortOrder;
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}

export interface ShopperType {
  id: number;
  updated_at: Date;
  created_by: null;
  updated_by: number;
  remarks: string;
  name: string;
  status: boolean;
  action: null;
  short_code: string;
  industry_std_lift: number;
  icon: string;
  event_action: string;
  event_label: string;
  created_at: Date;
  deleted_by: null;
  deleted_at: null;
  legacy_shopper_id: number;
  is_default: boolean;
  apply_bot_protection: null;
}

export interface AccountDetails {
  sessions: string;
  name: string;
  domain: string;
  status: string;
  phase: string;
  phase_id: number;
  company_id: number;
  legacy_account_id: number;
  legacy_company_id: number;
  script_id: number;
  category: string;
  ecommerce_platform_id: boolean;
  phase_label: string;
  dashboard_ready: boolean;
  script: string | null;
  cloudfront_distribution_domain: string | null;
  industry: string;
  id: number;
}

// Audit base fields used across API entities (without status)
export interface AuditMetadata {
  ip_address: string | null;
  user_agent: string | null;
  remarks: string | null;
  created_at: string | Date;
  updated_at: string | null | Date;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
  deleted_at: string | null | Date;
  status: string | null
}