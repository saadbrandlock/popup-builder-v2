import React, { useEffect } from 'react';
import { BaseTemplateBuilder } from './BaseTemplateBuilder';
import { useBaseTemplateStore } from '../stores';
import { useBaseTemplateActions } from '../hooks';
import { UnlayerOptions } from 'react-email-editor';
import { BaseProps } from '@/types/props';
import { message } from 'antd';
import { createAPI } from '@/api';
import { useBuilderStore } from '@/stores/builder.store';
import { useBuilderMain } from '@/features/builder/hooks/useBuilderMain';

interface BaseTemplateBuilderPageProps extends Partial<BaseProps> {
  unlayerConfig: UnlayerOptions;
  templateId?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export const BaseTemplateBuilderPage: React.FC<BaseTemplateBuilderPageProps> = ({
  unlayerConfig,
  apiClient,
  navigate,
  templateId: templateIdFromRoute,
  onCancel,
  onSuccess,
}) => {
  const { actions: templateActions } = useBaseTemplateStore();

  const { loadBaseTemplate } = useBuilderMain({ apiClient: apiClient! });
  const { loading, loadCategories, saveTemplate } = useBaseTemplateActions({
    apiClient,
  });

  const { templateId } = useBaseTemplateStore();

  useEffect(() => {
    loadCategories();
    templateActions.reset();

    const preload = async () => {
      if (!templateIdFromRoute) return;
      if (!apiClient) return;

      await loadBaseTemplate(templateIdFromRoute);
    };

    preload();
  }, []);

  const handleSubmitDetails = async (data: {
    name: string;
    description?: string;
    category_id: number;
    is_featured?: boolean;
    display_order?: number;
  }): Promise<string> => {
    if (!apiClient) {
      message.error('API client is required to create base template');
      throw new Error('API client is required');
    }

    const api = createAPI(apiClient);

    if (templateId) {
      await api.templates.updateBaseTemplate(templateId, {
        name: data.name,
        description: data.description,
        is_custom_coded: false,
        canvas_type: 'single-row',
        is_generic: false,
        status: 'draft',
        remarks: null,
        child_templates: null,
        is_featured: data.is_featured,
        display_order: data.display_order,
      });

      useBuilderStore.getState().actions.setCurrentTemplateId(templateId);
      return templateId;
    }

    const response = await api.templates.createBaseTemplate({
      name: data.name,
      category_id: data.category_id,
      description: data.description,
      is_custom_coded: false,
      canvas_type: 'single-row',
      is_generic: false,
      status: 'draft',
      remarks: null,
      child_templates: null,
      is_featured: data.is_featured,
      display_order: data.display_order,
    });

    const createdTemplateId = (response as any).template_id as string;
    const createdBaseTemplateId = (response as any).id as string | undefined;

    useBuilderStore.getState().actions.setCurrentTemplateId(createdTemplateId);

    if (navigate) {
      navigate(
        `/coupon-builder-v2/base-templates/${createdBaseTemplateId ?? createdTemplateId}/edit`
      );
    }

    return createdTemplateId;
  };

  const handleSave = async (data: {
    name: string;
    description?: string;
    category_id?: number;
    design_json: any;
    html_content: string;
  }) => {
    await saveTemplate(data);

    if (onSuccess) {
      onSuccess();
    } else if (navigate) {
      navigate('/coupon-builder-v2/base-templates');
    }
  };

  const handleCancel = () => {
    templateActions.reset();

    if (onCancel) {
      onCancel();
    } else if (navigate) {
      navigate('/coupon-builder-v2/base-templates');
    }
  };

  return (
    <BaseTemplateBuilder
      unlayerConfig={unlayerConfig}
      onSubmitDetails={handleSubmitDetails}
      onSave={handleSave}
      onCancel={handleCancel}
      loading={loading}
      apiClient={apiClient}
    />
  );
};
