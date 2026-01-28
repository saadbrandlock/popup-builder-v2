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
  name: string;
  description: string | null;
  category_id: number | null;
  category?: Category;
  thumbnail_url: string | null;
  design_json: any;
  html_content: string | null;
  is_featured?: boolean;
  display_order?: number;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
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
  html_content?: string;
  thumbnail_url?: string;
}

export interface UpdateBaseTemplateInput extends Partial<CreateBaseTemplateInput> {
  id: string;
}
