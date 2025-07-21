import { message } from 'antd';
import { TemplatesAPI } from '@/api';
import { DevicesAPI } from '@/api/services/DevicesAPI';
import { useTemplateListingStore } from '@/stores/list/templateListing.store';
import { useDevicesStore } from '@/stores/common/devices.store';
import { useLoadingStore } from '@/stores/common/loading.store';
import { TemplateAction } from '../types';
import { useGenericStore } from '@/stores/generic.store';
import { AxiosInstance } from 'axios';

export const useTemplateListing = ({
  apiClient,
}: {
  apiClient: AxiosInstance;
}) => {
  const { navigate } = useGenericStore();

  const templateApi = new TemplatesAPI(apiClient);
  const deviceApi = new DevicesAPI(apiClient);

  const { devices, actions: deviceActions } = useDevicesStore();
  const { actions: loadingActions } = useLoadingStore();
  const { actions } = useTemplateListingStore();

  const handleAction = async (action: TemplateAction, templateId: string) => {
    try {
      switch (action) {
        case 'edit':
          navigate(`/coupon-builder-v2/templates/${templateId}/edit`);
          break;
        case 'preview':
          navigate(`/coupon-builder-v2/templates/${templateId}/preview`);
          break;
        case 'publish':
          await publishTemplate(templateId);
          break;
        case 'archive':
          await templateApi.archiveTemplate(templateId);
          message.success('Template archived successfully');
          break;
        case 'delete':
          await templateApi.deleteTemplate(templateId);
          message.success('Template deleted successfully');
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      message.error(`Failed to ${action} template`);
    }
  };

  const getTemplates = async () => {
    loadingActions.setTemplateListingLoading(true);
    try {
      const response = await templateApi.getTemplatesForUI();
      actions.setTemplates(response.templates);
      actions.setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error) {
      console.error('Error loading templates:', error);
      message.error('Failed to load templates');
    } finally {
      loadingActions.setTemplateListingLoading(false);
    }
  };

  const publishTemplate = async (templateId: string) => {
    loadingActions.setTemplateListActionLoading(true);
    try {
      await templateApi.publishTemplate(templateId);
      message.success('Template published successfully');
    } catch (error) {
      console.error('Error publishing template:', error);
      message.error('Failed to publish template');
    } finally {
      loadingActions.setTemplateListActionLoading(false);
    }
  };

  const getDevices = async () => {
    if (devices.length > 0) return;

    loadingActions.setDevicesLoading(true);
    try {
      const response = await deviceApi.getDevices();
      deviceActions.setDevices(response);
    } catch (error) {
      console.error('Error loading devices:', error);
      message.error('Failed to load devices');
    } finally {
      loadingActions.setDevicesLoading(false);
    }
  };

  return { handleAction, getTemplates, getDevices, publishTemplate };
};
