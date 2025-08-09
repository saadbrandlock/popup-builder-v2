import { useState, useEffect, useCallback } from 'react';
import { AxiosInstance } from 'axios';
import type { ComponentConfig } from '../types';
import type { ComponentsQueryParams } from '../../../types/api';
import { useBuilderActions } from '../stores';
import { ComponentsAPI } from '../../../api/services/ComponentsAPI';

/**
 * Custom hook for managing component library data
 * Handles loading, filtering, and searching of available components
 */
export const useComponentLibrary = (apiClient: AxiosInstance) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [components, setComponents] = useState<ComponentConfig[]>([]);
  const [searchParams, setSearchParams] = useState<ComponentsQueryParams>({});
  const { loadAvailableComponents } = useBuilderActions();
  
  // Create API instance
  const componentsAPI = useCallback(() => new ComponentsAPI(apiClient), [apiClient]);

  /**
   * Load components from API
   */
  const loadComponents = useCallback(async (params?: ComponentsQueryParams) => {
    if (!apiClient) return;

    setLoading(true);
    setError(null);

    try {
      // Load components from the API
      const api = componentsAPI();
      const fetchedComponents = await api.getComponents(params);
      
      // Update search params if provided
      if (params) {
        setSearchParams(params);
      }
      
      setComponents(fetchedComponents);
      loadAvailableComponents(fetchedComponents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load components';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiClient, loadAvailableComponents]);

  /**
   * Reload components with current search params
   */
  const reload = useCallback(() => {
    loadComponents(searchParams);
  }, [loadComponents, searchParams]);

  /**
   * Search components using API
   */
  const searchComponents = useCallback(async (searchTerm: string) => {
    const params: ComponentsQueryParams = {
      ...searchParams,
      search: searchTerm.trim() || undefined,
    };
    await loadComponents(params);
  }, [loadComponents, searchParams]);

  /**
   * Filter components by category using API
   */
  const filterByCategory = useCallback(async (categoryCode: string) => {
    const params: ComponentsQueryParams = {
      ...searchParams,
      categoryCode: categoryCode === 'all' ? undefined : categoryCode,
    };
    await loadComponents(params);
  }, [loadComponents, searchParams]);

  /**
   * Get components by category (local filter from current components)
   */
  const getComponentsByCategory = useCallback((category: string) => {
    if (category === 'all') return components;
    return components.filter(component => component.category_code === category);
  }, [components]);

  /**
   * Get component by type
   */
  const getComponentByType = useCallback((type: string) => {
    return components.find(component => component.type === type);
  }, [components]);

  /**
   * Get available categories
   */
  const getCategories = useCallback(() => {
    const categories = [...new Set(components.map(c => c.category_code))];
    return categories.sort();
  }, [components]);

  // Load components on mount
  useEffect(() => {
    loadComponents();
  }, []);

  return {
    components,
    loading,
    error,
    searchParams,
    reload,
    loadComponents,
    searchComponents,
    filterByCategory,
    getComponentsByCategory,
    getComponentByType,
    getCategories,
  };
};
