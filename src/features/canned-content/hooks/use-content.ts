import { createAPI } from '@/api';
import { useLoadingStore } from '@/stores/common/loading.store';
import { useContentListingStore } from '@/stores/list/contentListing';
import { message } from 'antd';
import { useGenericStore } from '@/stores/generic.store';

export const useContent = () => {
  const apiClient = useGenericStore((s) => s.apiClient);
  const api = apiClient ? createAPI(apiClient) : null;

  const { actions: loadingActions } = useLoadingStore();
  const { actions } = useContentListingStore();

  const getContent = async () => {
    if (!api) return;
    loadingActions.setContentListingLoading(true);
    try {
      const response = await api.content.getContent();
      actions.setContents(response.results);
      actions.setPagination({
        current: response.page,
        pageSize: response.limit,
        total: response.count,
      });
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      loadingActions.setContentListingLoading(false);
    }
  };

  const getContentById = async (id: number) => {
    if (!api) return;
    loadingActions.setContentListingLoading(true);
    try {
      const response = await api.content.getContentById(id);
      actions.setContent(response);
    } catch (error) {
      console.error('Error loading content details:', error);
    } finally {
      loadingActions.setContentListingLoading(false);
    }
  }

  const createContent = async (data: {
    industry: string;
    field: string;
    content: string;
    remarks?: string;
    shopper_id: number;
  }) => {
    if (!api) return;
    loadingActions.setContentActionLoading(true);
    try {
      const response = await api.content.createContent(data);
      actions.setContent(response);
    } catch (error) {
      console.error('Error creating content:', error);
    } finally {
      loadingActions.setContentActionLoading(false);
    }
  };

  const updateContent = async (id: number, data: {
    industry?: string;
    field?: string;
    content?: string;
    remarks?: string;
    shopper_id?: number;
  }) => {
    if (!api) return;
    loadingActions.setContentActionLoading(true);
    try {
      const response = await api.content.updateContent(id, data);
      actions.setContent(response);
    } catch (error) {
      console.error('Error updating content:', error);
    } finally {
      loadingActions.setContentActionLoading(false);
    }
  };

  const deleteContent = async (id: number) => {
    if (!api) return;
    loadingActions.setContentActionLoading(true);
    try {
      await api.content.deleteContent(id);
      actions.setContent(null);
    } catch (error) {
      console.error('Error deleting content:', error);
    } finally {
      loadingActions.setContentActionLoading(false);
    }
  };

  const getIndustries = async () => {
    if (!api) return;
    loadingActions.setContentSubDataLoading(true);
    try {
      const response = await api.content.getIndustries();
      actions.setIndustries(response);
    } catch (error) {
      console.error('Error getting industries:', error);
    } finally {
      loadingActions.setContentSubDataLoading(false);
    }
  };

  const getFields = async () => {
    if (!api) return;
    loadingActions.setContentSubDataLoading(true);
    try {
      const response = await api.templateFields.getTemplateFields();
      actions.setFields(response.map((field) => ({key: field.field, value: +field.id})));
    } catch (error) {
      console.error('Error getting fields:', error);
    } finally {
      loadingActions.setContentSubDataLoading(false);
    }
  };

  return {
    getContent,
    getContentById,
    createContent,
    updateContent,
    deleteContent,
    getIndustries,
    getFields,
  };
};
