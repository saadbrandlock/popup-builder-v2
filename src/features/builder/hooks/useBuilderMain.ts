import { message } from 'antd';
import { AxiosInstance } from 'axios';
import { createAPI } from '@/api';
import { TCBTemplate, TCBTemplateStaging } from '@/types';
import { useTemplateFieldsStore } from '@/stores/common/template-fields.store';
import { useBuilderStore } from '@/stores/builder.store';
import { DEFAULT_REMINDER_TAB_CONFIG } from '../utils/reminderTabConstants';

export const useBuilderMain = ({ apiClient }: { apiClient: AxiosInstance }) => {
  const api = createAPI(apiClient);

  const { actions: templateFieldsActions } = useTemplateFieldsStore();
  const { actions: builderActions } = useBuilderStore();

  const getTemplateFields = async () => {
    try {
      const response = await api.templateFields.getTemplateFields();
      templateFieldsActions.setTemplateFields(response);
      return response;
    } catch (error) {
      console.error('Error getting template fields:', error);
      message.error('Failed to get template fields');
      throw error;
    }
  };

  const createTemplate = async (data: any) => {
    try {
      const response = await api.templates.createTemplate(data);
      return response;
    } catch (error) {
      console.error('Error creating template:', error);
      message.error('Failed to create template');
      throw error;
    }
  };

  const updateTemplate = async (
    templateId: string,
    data: Partial<TCBTemplate>
  ) => {
    try {
      const response = await api.templates.updateTemplate(templateId, data);
      return response;
    } catch (error) {
      console.error('Error updating template:', error);
      message.error('Failed to update template');
      throw error;
    }
  };

  const assignTemplateToShoppers = async (
    templateId: string,
    shopperId: number[]
  ) => {
    try {
      const response = await api.templates.assignTemplateToShoppers(
        templateId,
        shopperId
      );
      return response;
    } catch (error) {
      console.error('Error assigning template:', error);
      message.error('Failed to assign template');
      throw error;
    }
  };

  const loadTemplate = async (templateId: string) => {
    try {
      console.log('🔄 Loading template:', templateId);

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
          console.log(
            '✅ Loaded existing reminder tab config from staging template'
          );
        }
      } catch (stagingError) {
        console.log('ℹ️ No staging template data found, using defaults');
      }

      // Update store with loaded data
      builderActions.setTemplateState(templateResponse);
      builderActions.setReminderTabConfig(reminderTabConfig);

      // Mark reminder tab as saved (no unsaved changes)
      builderActions.markReminderTabUnsaved(false);
      builderActions.setReminderTabLastSave(new Date());

      console.log('✅ Template loaded successfully');
      return {
        template: templateResponse,
        reminderTabConfig,
      };
    } catch (error) {
      console.error('Error loading template:', error);
      message.error('Failed to load template');
      throw error;
    }
  };

  return {
    createTemplate,
    updateTemplate,
    assignTemplateToShoppers,
    getTemplateFields,
    loadTemplate,
  };
};
