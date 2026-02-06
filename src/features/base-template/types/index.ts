export interface Category {
  id: number;
  name: string;
  description: string | null;
  display_order: number;
  icon_url?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
}

export interface BaseTemplate {
  id: string;
  // Template identifiers and metadata from API
  template_id: string;
  template_name?: string;
  template_description?: string | null;
  // Normalized fields used across the app
  name: string;
  description: string | null;
  category_id: number | null;
  category?: Category;
  thumbnail_url: string | null;
  builder_state_json: any;
  is_featured?: boolean;
  display_order?: number;
  // Status fields (API may provide both status and template_status)
  status: 'draft' | 'active' | 'archived';
  template_status?: string;
  // Storage / infra metadata
  s3_bucket?: string;
  s3_key?: string;
  s3_url?: string;
  ip_address?: string | null;
  user_agent?: string | null;
  // Audit metadata
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number | null;
  deleted_at?: string | null;
  // Additional template meta
  canvas_type?: string;
  is_custom_coded?: boolean;
  is_generic?: boolean;
  remarks?: string | null;
  child_templates?: BaseTemplate[] | null;
}

export interface BaseTemplateFilters {
  categoryId: number | null;
  status: string | null;
  nameSearch: string | null;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  display_order?: number;
  icon_url?: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: number;
}

export interface CreateBaseTemplateInput {
  name: string;
  description?: string;
  category_id?: number;
  design_json: any;
  thumbnail_url?: string;
}

export interface UpdateBaseTemplateInput extends Partial<CreateBaseTemplateInput> {
  id: string;
}
