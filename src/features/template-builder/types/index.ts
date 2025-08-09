// Feature-specific types for template builder
import { BaseFilters } from '../../../types/common';

// Template filters specific to template builder
export interface TemplateFilters extends BaseFilters {
  device: string | 'all';
}
