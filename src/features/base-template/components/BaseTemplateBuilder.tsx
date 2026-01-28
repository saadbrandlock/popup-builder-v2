import React, { useEffect } from 'react';
import {
  Steps,
  Card,
  Button,
  Space,
  Form,
  Input,
  Select,
  message,
  Switch,
  InputNumber,
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { UnlayerMain } from '@/features/builder';
import { useBaseTemplateStore, useCategoryStore } from '../stores';
import { UnlayerOptions } from 'react-email-editor';
import { BaseProps } from '@/types/props';
import BaseTemplateConfig from './BaseTemplateConfig';

const { TextArea } = Input;

interface BaseTemplateBuilderProps extends Partial<BaseProps> {
  unlayerConfig: UnlayerOptions;
  onSubmitDetails: (data: {
    name: string;
    description?: string;
    category_id: number;
    is_featured?: boolean;
    display_order?: number;
  }) => Promise<string>;
  onSave: (data: {
    name: string;
    description?: string;
    category_id?: number;
    design_json: any;
    html_content: string;
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const BaseTemplateBuilder: React.FC<BaseTemplateBuilderProps> = ({
  unlayerConfig,
  onSubmitDetails,
  onSave,
  onCancel,
  loading = false,
  apiClient,
}) => {
  const [form] = Form.useForm();
  const { currentStep, templateId, designJson, htmlContent, actions, selectedTemplate } =
    useBaseTemplateStore();

  const steps = [
    {
      title: 'Template Details',
      description: 'Add name, category, and description',
    },
    {
      title: 'Design Template',
      description: 'Create your template design',
    },
  ];

  const handleDesignSave = async (design: any) => {
    actions.setDesignJson(design);
  };

  const handleNextStep = async () => {
    if (currentStep === 0) {
      try {
        const values = await form.validateFields();
        const createdTemplateId = await onSubmitDetails({
          name: values.name,
          description: values.description,
          category_id: values.category_id,
          is_featured: values.is_featured,
          display_order: values.display_order,
        });

        actions.setTemplateId(createdTemplateId);
        actions.setCurrentStep(1);
      } catch (error) {
        return;
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 1) {
      actions.setCurrentStep(0);
    }
  };

  const handleFinish = async () => {
    let values: any;
    try {
      values = await form.validateFields();
    } catch (error) {
      return;
    }

    if (!designJson) {
      message.error('No design data available');
      return;
    }

    try {
      await onSave({
        name: values.name,
        description: values.description,
        category_id: values.category_id,
        design_json: designJson,
        html_content: htmlContent || '<div></div>',
      });

      actions.reset();
      form.resetFields();
    } catch (error) {
      console.error('Failed to save template:', error);
      message.error('Failed to save template');
    }
  };

  useEffect(() => {
    if (!selectedTemplate) return;

    form.setFieldsValue({
      name: (selectedTemplate as any).template_name ?? selectedTemplate.name,
      description: (selectedTemplate as any).template_description ?? selectedTemplate.description,
      category_id:
        (selectedTemplate as any).category_id ?? selectedTemplate.category_id ?? undefined,
      is_featured: (selectedTemplate as any).is_featured ?? false,
      display_order: (selectedTemplate as any).display_order ?? undefined,
    });
  }, [selectedTemplate, form]);

  return (
    <div className="space-y-6">
      <Card>
        <Steps current={currentStep} items={steps} />
      </Card>

      {currentStep === 0 && (
        <BaseTemplateConfig onCancel={handlePreviousStep} handleNextStep={handleNextStep} />
      )}

      {currentStep === 1 && (
        <div>
          <UnlayerMain
            unlayerConfig={unlayerConfig}
            onSave={handleDesignSave}
            apiClient={apiClient}
            enableCustomImageUpload={true}
            clientTemplateId={templateId || ''}
            saveMode="base"
          />
          <Card style={{ marginTop: 16 }}>
            <Space>
              <Button onClick={handlePreviousStep}>Previous</Button>
              <Button onClick={onCancel}>Cancel</Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={loading}
                onClick={handleFinish}
              >
                Save Template
              </Button>
            </Space>
          </Card>
        </div>
      )}
    </div>
  );
};
