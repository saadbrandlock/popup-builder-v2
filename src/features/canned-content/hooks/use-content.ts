import { createAPI } from '@/api';
import { useLoadingStore } from '@/stores/common/loading.store';
import { useContentListingStore } from '@/stores/list/contentListing';
import { message } from 'antd';
import { AxiosInstance } from 'axios';

export const useContent = ({ apiClient }: { apiClient: AxiosInstance }) => {
  const api = createAPI(apiClient);

  const { actions: loadingActions } = useLoadingStore();
  const { actions } = useContentListingStore();

  const getContent = async () => {
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
      message.error('Failed to load content');
    } finally {
      loadingActions.setContentListingLoading(false);
    }
  };

  const getContentById = async (id: number) => {
    loadingActions.setContentListingLoading(true);
    try {
      const response = await api.content.getContentById(id);
      actions.setContent(response);
    } catch (error) {
      console.error('Error loading content details:', error);
      message.error('Failed to load content details');
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
    loadingActions.setContentActionLoading(true);
    try {
      const response = await api.content.createContent(data);
      actions.setContent(response);
    } catch (error) {
      console.error('Error creating content:', error);
      message.error('Failed to create content');
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
    loadingActions.setContentActionLoading(true);
    try {
      const response = await api.content.updateContent(id, data);
      actions.setContent(response);
    } catch (error) {
      console.error('Error updating content:', error);
      message.error('Failed to update content');
    } finally {
      loadingActions.setContentActionLoading(false);
    }
  };

  const deleteContent = async (id: number) => {
    loadingActions.setContentActionLoading(true);
    try {
      await api.content.deleteContent(id);
      actions.setContent(null);
    } catch (error) {
      console.error('Error deleting content:', error);
      message.error('Failed to delete content');
    } finally {
      loadingActions.setContentActionLoading(false);
    }
  };

  const getIndustries = async () => {
    loadingActions.setContentSubDataLoading(true);
    try {
      const response = await api.content.getIndustries();
      actions.setIndustries(response);
    } catch (error) {
      console.error('Error getting industries:', error);
      message.error('Failed to get industries');
    } finally {
      loadingActions.setContentSubDataLoading(false);
    }
  };

  const getFields = async () => {
    loadingActions.setContentSubDataLoading(true);
    try {
      const response = await api.content.getFields();
      actions.setFields(response);
    } catch (error) {
      console.error('Error getting fields:', error);
      message.error('Failed to get fields');
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
