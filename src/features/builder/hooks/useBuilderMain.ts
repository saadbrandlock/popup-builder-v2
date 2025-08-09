import { message } from 'antd';
import { AxiosInstance } from 'axios';
import { TemplatesAPI } from '@/api';
import { TCBTemplate } from '@/types';

export const useBuilderMain = ({ apiClient }: { apiClient: AxiosInstance }) => {
  const templateApi = new TemplatesAPI(apiClient);

  const createTemplate = async (
    data: any
  ) => {
    try {
      const response = await templateApi.createTemplate(data);
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
      const response = await templateApi.updateTemplate(templateId, data);
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
      const response = await templateApi.assignTemplateToShoppers(templateId, shopperId);
      return response;
    } catch (error) {
      console.error('Error assigning template:', error);
      message.error('Failed to assign template');
      throw error;
    }
  };
  
  return { createTemplate, updateTemplate, assignTemplateToShoppers };
};
