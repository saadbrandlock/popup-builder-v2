import { useState, useEffect } from 'react';
import { createAPI } from '@/api';
import { BaseTemplate } from '@/features/base-template/types';
import { useGenericStore } from '@/stores/generic.store';

interface UseBaseTemplatesForConfigReturn {
  templates: BaseTemplate[];
  loading: boolean;
  loadTemplates: () => Promise<void>;
}

/**
 * Hook to load base templates for selection in ConfigStep
 * Returns active base templates sorted by display order
 */
export const useBaseTemplatesForConfig = (): UseBaseTemplatesForConfigReturn => {
  const apiClient = useGenericStore((s) => s.apiClient);
  const [templates, setTemplates] = useState<BaseTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTemplates = async () => {
    if (!apiClient) return;
    setLoading(true);
    try {
      const api = createAPI(apiClient);
      const response = await api.templates.getBaseTemplates({
        limit: 100,
        page: 1,
        status: 'active',
        sortColumn: 'bt.display_order',
        sortDirection: 'ascend',
      });
      const results = response.results || [];

      // Normalize API response shape into BaseTemplate model
      const mapped: BaseTemplate[] = results.map((item: any) => ({
        id: item.id,
        template_id: item.template_id,
        name: item.template_name,
        description: item.template_description || null,
        category_id: item.category_id || null,
        category: item.category_id
          ? {
              id: item.category_id,
              name: item.category_name,
              description: null,
              display_order: item.display_order ?? 0,
            }
          : undefined,
        thumbnail_url: item.thumbnail_url || null,
        builder_state_json: item.builder_state_json || {},
        is_featured: item.is_featured || false,
        display_order: item.display_order || 0,
        status: item.status || 'active',
        created_at: item.created_at || item.template_created_at,
        updated_at: item.updated_at || item.template_updated_at || item.created_at,
      }));

      setTemplates(mapped);
    } catch (error) {
      console.error('Failed to load base templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  return { templates, loading, loadTemplates };
};
