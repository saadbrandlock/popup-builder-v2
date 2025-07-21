// Feature-specific types for template builder
import { BaseFilters, TemplateType } from '../../../types/common';

// Extended template interface specific to template builder - matching actual API response
export interface CouponTemplate {
  id: string;
  name: string;
  description?: string;
  status: string;
  devices: string[];
  type: TemplateType;
  lastUpdated: Date;
  createdAt: Date;
  createdBy: string;
  builder_state_json?: Record<string, any>;
  canvas_type?: string;
  is_generic?: boolean;
  is_custom_coded?: boolean;
  shopper_ids: number[];
}

// Template filters specific to template builder
export interface TemplateFilters extends BaseFilters {
  device: string | 'all';
}

// Re-export commonly used types for convenience
export type { TemplateAction, TemplateType } from '../../../types/common';

// Re-export API types for convenience
export type { TCBTemplate } from '../../../types/api';
