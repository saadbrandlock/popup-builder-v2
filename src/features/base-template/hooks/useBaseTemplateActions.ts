import { useState } from 'react';
import { message } from 'antd';
import { AxiosInstance } from 'axios';
import { createAPI } from '@/api';
import { BaseTemplate, Category, CreateCategoryInput, UpdateCategoryInput } from '../types';
import { useBaseTemplateStore, useCategoryStore } from '../stores';

interface UseBaseTemplateActionsProps {
  apiClient?: AxiosInstance;
}

export const useBaseTemplateActions = ({ apiClient }: UseBaseTemplateActionsProps = {}) => {
  const [loading, setLoading] = useState(false);
  const { actions: templateActions } = useBaseTemplateStore();
  const { actions: categoryActions } = useCategoryStore();

  const loadCategories = async () => {
    setLoading(true);
    try {
      if (!apiClient) {
        categoryActions.setCategories([]);
        message.error('API client is required to load base template categories');
        return;
      }

      const api = createAPI(apiClient);
      const response = await api.baseTemplateCategories.getCategories({
        limit: 200,
        page: 1,
        sortColumn: 'display_order',
        sortDirection: 'ascend',
      });
      categoryActions.setCategories(response.results || []);
    } catch (error) {
      message.error('Failed to load categories');
      console.error('Load categories error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = async (id: number): Promise<Category | null> => {
    setLoading(true);
    try {
      if (!apiClient) {
        message.error('API client is required to load base template category');
        return null;
      }

      const api = createAPI(apiClient);
      const category = await api.baseTemplateCategories.getCategoryById(id);
      return category;
    } catch (error) {
      message.error('Failed to load category');
      console.error('Get category by id error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    setLoading(true);
    try {
      if (!apiClient) {
        message.error('API client is required to delete base template category');
        return;
      }

      const api = createAPI(apiClient);
      await api.baseTemplateCategories.deleteCategory(id);
      message.success('Category deleted successfully');
      await loadCategories();
    } catch (error: any) {
      if (error?.statusCode === 409) {
        message.error(error.message);
      } else {
        message.error('Failed to delete category');
      }
      console.error('Delete category error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const dummyTemplates: BaseTemplate[] = [
        {
          id: '1',
          name: 'Christmas Sale Template',
          description: 'Beautiful Christmas themed template',
          category_id: 1,
          category: {
            id: 1,
            name: 'Holiday Specials',
            description: 'Templates for holiday promotions',
            display_order: 0,
          },
          thumbnail_url: null,
          design_json: {},
          html_content: '<div>Sample HTML</div>',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Black Friday Banner',
          description: 'Eye-catching Black Friday design',
          category_id: 2,
          category: {
            id: 2,
            name: 'Flash Sales',
            description: 'Quick sale templates',
            display_order: 1,
          },
          thumbnail_url: null,
          design_json: {},
          html_content: '<div>Sample HTML</div>',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Welcome Email Template',
          description: 'Warm welcome message for new customers',
          category_id: 3,
          category: {
            id: 3,
            name: 'Welcome Series',
            description: 'New customer welcome templates',
            display_order: 2,
          },
          thumbnail_url: null,
          design_json: {},
          html_content: '<div>Sample HTML</div>',
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Summer Sale Popup',
          description: 'Vibrant summer themed popup',
          category_id: 4,
          category: {
            id: 4,
            name: 'Seasonal',
            description: 'Seasonal promotion templates',
            display_order: 3,
          },
          thumbnail_url: null,
          design_json: {},
          html_content: '<div>Sample HTML</div>',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      templateActions.setTemplates(dummyTemplates);
    } catch (error) {
      message.error('Failed to load templates');
      console.error('Load templates error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data: CreateCategoryInput | UpdateCategoryInput) => {
    setLoading(true);
    try {
      if (!apiClient) {
        message.error('API client is required to create/update base template category');
        return;
      }

      const api = createAPI(apiClient);
      if ('id' in data) {
        await api.baseTemplateCategories.updateCategory(data.id, data);
        message.success('Category updated successfully');
      } else {
        await api.baseTemplateCategories.createCategory(data);
        message.success('Category created successfully');
      }

      await loadCategories();
    } catch (error: any) {
      if (error?.statusCode === 409) {
        message.error(error.message);
      } else {
        message.error('Failed to save category');
      }
      console.error('Create category error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (template: BaseTemplate) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      message.success('Template deleted successfully');
      await loadTemplates();
    } catch (error) {
      message.error('Failed to delete template');
      console.error('Delete template error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const editTemplate = (template: BaseTemplate, navigate?: (path: string) => void) => {
    if (navigate) {
      navigate(`/coupon-builder-v2/base-templates/${template.id}/edit`);
    } else {
      message.info(`Edit template: ${template.name}`);
    }
  };

  const previewTemplate = (template: BaseTemplate) => {
    message.info(`Preview template: ${template.name}`);
  };

  const saveTemplate = async (data: {
    name: string;
    description?: string;
    category_id?: number;
    design_json: any;
    html_content: string;
  }) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log('Saving base template:', data);
      message.success('Base template created successfully!');
      
      await loadTemplates();
      return true;
    } catch (error) {
      message.error('Failed to create base template');
      console.error('Save template error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    loadCategories,
    loadTemplates,
    createCategory,
    getCategoryById,
    deleteCategory,
    deleteTemplate,
    editTemplate,
    previewTemplate,
    saveTemplate,
  };
};
