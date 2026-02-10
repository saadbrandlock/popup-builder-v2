import { message } from 'antd';
import { createAPI } from '@/api';
import { TCBTemplate, TCBTemplateStaging } from '@/types';
import { useTemplateFieldsStore } from '@/stores/common/template-fields.store';
import { useBuilderStore } from '@/stores/builder.store';
import { DEFAULT_REMINDER_TAB_CONFIG } from '../utils/reminderTabConstants';
import { useLoadingStore } from '@/stores/common/loading.store';
import { useBaseTemplateStore } from '@/features/base-template';
import { useGenericStore } from '@/stores/generic.store';

export const useBuilderMain = () => {
  const apiClient = useGenericStore((s) => s.apiClient);
  const api = apiClient ? createAPI(apiClient) : null;

  const { actions: templateFieldsActions } = useTemplateFieldsStore();
  const { actions: builderActions } = useBuilderStore();
  const { actions: loadingActions } = useLoadingStore();

  const getTemplateFields = async () => {
    if (!api) {
      message.error('API client is required');
      throw new Error('API client is required');
    }
    try {
      const response = await api.templateFields.getTemplateFields();
      templateFieldsActions.setTemplateFields(response);
      return response;
    } catch (error) {
      console.error('Error getting template fields:', error);
      throw error;
    }
  };

  const createTemplate = async (data: any) => {
    if (!api) {
      throw new Error('API client is required');
    }
    try {
      const response = await api.templates.createTemplate(data);
      return response;
    } catch (error: any) {
      console.error('Error creating template:', error);
      throw error;
    }
  };

  const updateTemplate = async (templateId: string, data: Partial<TCBTemplate>) => {
    if (!api) {
      message.error('API client is required');
      throw new Error('API client is required');
    }
    try {
      const response = await api.templates.updateTemplate(templateId, data);
      return response;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  };

  const assignTemplateToShoppers = async (templateId: string, shopperId: number[]) => {
    if (!api) {
      message.error('API client is required');
      throw new Error('API client is required');
    }
    try {
      const response = await api.templates.assignTemplateToShoppers(templateId, shopperId);
      return response;
    } catch (error) {
      console.error('Error assigning template:', error);
      throw error;
    }
  };

  const loadTemplate = async (templateId: string) => {
    if (!api) {
      message.error('API client is required');
      throw new Error('API client is required');
    }
    try {
      loadingActions.setTemplateByIdLoading(true);

      // Get template data including staging data for reminder tab config
      const templateResponse = await api.templates.getTemplateById(templateId);

      // For reminder tab config, we need to check the staging template data
      let reminderTabConfig = DEFAULT_REMINDER_TAB_CONFIG;

      try {
        if (templateResponse.reminder_tab_state_json) {
          // Merge existing config with defaults to ensure all fields are present
          reminderTabConfig = {
            ...DEFAULT_REMINDER_TAB_CONFIG,
            ...templateResponse.reminder_tab_state_json,
          };
        }
      } catch (stagingError) {
      }

      // Update store with loaded data
      builderActions.setTemplateState(templateResponse);
      builderActions.setReminderTabConfig(reminderTabConfig);

      // Mark reminder tab as saved (no unsaved changes)
      builderActions.markReminderTabUnsaved(false);
      builderActions.setReminderTabLastSave(new Date());

      return {
        template: templateResponse,
        reminderTabConfig,
      };
    } catch (error) {
      console.error('Error loading template:', error);
      throw error;
    } finally {
      loadingActions.setTemplateByIdLoading(false);
    }
  };

  const loadBaseTemplate = async (templateId: string) => {
    if (!api) {
      message.error('API client is required');
      throw new Error('API client is required');
    }
    try {
      const templateActions = useBaseTemplateStore.getState().actions;
      const baseTemplate = await api.templates.getBaseTemplateById(templateId);

      templateActions.setSelectedTemplate(baseTemplate as any);
      templateActions.setTemplateId(baseTemplate.template_id);
      templateActions.setCurrentStep(1);
      templateActions.setSelectedCategoryId(baseTemplate.category_id ?? null);

      useBuilderStore.getState().actions.setCurrentTemplateId(baseTemplate.template_id);

      templateActions.setDesignJson(baseTemplate.builder_state_json ?? null);
    } catch (error) {
    }
  };

  return {
    createTemplate,
    updateTemplate,
    assignTemplateToShoppers,
    getTemplateFields,
    loadTemplate,
    loadBaseTemplate
  };
};
