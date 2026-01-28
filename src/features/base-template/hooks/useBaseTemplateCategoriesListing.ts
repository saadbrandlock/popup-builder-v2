import { useState } from 'react';
import { AxiosInstance } from 'axios';
import { message } from 'antd';
import type { TablePaginationConfig } from 'antd';

import { createAPI } from '@/api';
import { useBaseTemplateCategoriesListingStore } from '@/stores/list/baseTemplateCategoriesListing.store';
import { useCategoryStore } from '../stores';

export const useBaseTemplateCategoriesListing = ({
  apiClient,
}: {
  apiClient?: AxiosInstance;
}) => {
  const [loading, setLoading] = useState(false);

  const { actions: categoryActions } = useCategoryStore();

  const { pagination, filters, sorter, actions } =
    useBaseTemplateCategoriesListingStore();

  const getCategories = async () => {
    if (!apiClient) {
      actions.setCategories([]);
      actions.setError('API client is required');
      return;
    }

    setLoading(true);
    actions.setError(undefined);

    try {
      const api = createAPI(apiClient);
      const response = await api.baseTemplateCategories.getCategories({
        page: pagination.current,
        limit: pagination.pageSize,
        sortColumn: sorter.sortColumn,
        sortDirection: sorter.sortDirection,
        search: filters.search,
      });

      const categories = response.results || [];
      actions.setCategories(categories);
      categoryActions.setCategories(categories);
      actions.setPagination({
        ...pagination,
        current: response.page,
        pageSize: response.limit,
        total: response.count,
      } as TablePaginationConfig);
    } catch (error) {
      console.error('Error loading base template categories:', error);
      message.error('Failed to load categories');
      actions.setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    if (!apiClient) {
      message.error('API client is required');
      return;
    }

    setLoading(true);
    try {
      const api = createAPI(apiClient);
      await api.baseTemplateCategories.deleteCategory(id);
      message.success('Category deleted successfully');
      await getCategories();
    } catch (error: any) {
      if (error?.statusCode === 409) {
        message.error(error.message);
      } else {
        message.error('Failed to delete category');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getCategories,
    deleteCategory,
  };
};
