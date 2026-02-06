import React, { useEffect, useState } from 'react';
import {
  Select,
  Input,
  Form,
  Spin,
  Alert,
  Card,
  Space,
  Typography,
  Checkbox,
  Row,
  Col,
} from 'antd';

import { CleanTemplateResponse, Device, TCBTemplate, TemplateConfig } from '@/types';
import { useDevicesStore } from '@/stores/common/devices.store';
import { useGenericStore } from '@/stores/generic.store';
import { DeviceSelector, ShopperSelector } from '@/components/common';
import { useLoadingStore } from '@/stores/common/loading.store';
import StepNavigation, { createSubmitButton } from './common/StepNavigation';
import { useBaseTemplatesForConfig } from '../hooks/useBaseTemplatesForConfig';
import BaseTemplateSelect from './BaseTemplateSelect';
// MIGRATED: Use Zustand stores instead of contexts
// TODO: accounts and shoppers should come from API data, not builder context

const { Text } = Typography;

interface ConfigStepProps {
  disabled?: boolean;
  handleFinalSave: (data: TemplateConfig) => Promise<void>;
  onNext?: () => void;
  isEditMode: boolean;
  templateEditState?: CleanTemplateResponse | null;
}

const ConfigStep: React.FC<ConfigStepProps> = ({
  disabled,
  handleFinalSave,
  isEditMode,
  templateEditState,
}) => {
  const { devices } = useDevicesStore();
  const accounts = useGenericStore((s) => s.accounts);
  const { configSaving } = useLoadingStore();

  const [form] = Form.useForm<TemplateConfig>();

  const [isGeneric, setIsGeneric] = useState(false);

  // Load base templates for selection (apiClient from generic store)
  const { templates: baseTemplates, loading: baseTemplatesLoading, loadTemplates } = useBaseTemplatesForConfig();

  // Load base templates on mount (only for create mode)
  useEffect(() => {
    if (!isEditMode) {
      loadTemplates();
    }
  }, [isEditMode]);

  useEffect(() => {
    if (form.isFieldsTouched()) return;
    
    if (isEditMode && templateEditState) {
      const deviceIds =
        templateEditState.device_ids && templateEditState.device_ids.length > 0
          ? templateEditState.device_ids
          : [];

      const isGenericTemplate = (templateEditState as any)?.is_generic || false;
      setIsGeneric(isGenericTemplate);
      form.setFieldsValue({
        name: templateEditState.name,
        device_ids: deviceIds,
        shopper_ids: templateEditState.shopper_ids,
        description: templateEditState.description || '',
        is_generic: isGenericTemplate,
        account_ids: templateEditState.account_details
          ? [templateEditState.account_details.id]
          : [],
        // status: templateEditState.status || 'draft',
      });
    }
  }, [templateEditState, isEditMode]);

  const handleGenericChange = (checked: boolean) => {
    setIsGeneric(checked);
    if (checked) {
      // Clear shopper selection when switching to generic
      form.setFieldsValue({ shopper_ids: [] });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <Form
          form={form}
          onFinish={handleFinalSave}
          layout="vertical"
          disabled={disabled || configSaving}
        >
          <Row gutter={[16, 0]}>
          <Col xs={24}>
            <Form.Item<TemplateConfig>
              name="name"
              label="Template Name"
              rules={[
                { required: true, message: 'Please enter a template name' },
              ]}
            >
              <Input placeholder="Enter a name for this template" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item<TemplateConfig> name="description" label="Description">
              <Input.TextArea
                placeholder="Enter template description"
                autoSize={{ minRows: 2, maxRows: 5 }}
              />
            </Form.Item>
          </Col>
          {!isEditMode && (
            <Col xs={24}>
              <Form.Item<TemplateConfig>
                name="base_template_id"
                label="Base Template (Optional)"
                extra="Select a base template to start with a pre-designed layout, or leave empty to start from scratch"
              >
                <BaseTemplateSelect
                  disabled={disabled || configSaving || baseTemplatesLoading}
                  loading={baseTemplatesLoading}
                  baseTemplates={baseTemplates}
                />
              </Form.Item>
            </Col>
          )}
          <Col xs={24} md={12} lg={8}>
            <Form.Item<TemplateConfig>
              name="device_ids"
              label="Device Types"
              rules={[
                {
                  required: true,
                  message: 'Please select at least one device type',
                },
                {
                  type: 'array',
                  min: 1,
                  message: 'At least one device must be selected',
                },
              ]}
            >
              <DeviceSelector
                devices={devices}
                placeholder="Select supported device types"
                disabled={disabled || configSaving}
              />
            </Form.Item>
            <Form.Item<TemplateConfig> name="device_type_id" hidden>
              <Input type="hidden" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item<TemplateConfig>
              name="account_ids"
              label="Account"
              getValueProps={(v: number[] | undefined) => ({
                value: Array.isArray(v) && v.length > 0 ? v[0] : undefined,
              })}
              getValueFromEvent={(v: number | undefined) =>
                v != null && v !== undefined ? [v] : []
              }
            >
              <Select
                showSearch
                allowClear
                placeholder="Select account applicable for this template"
                options={accounts.map((acc) => ({
                  label: acc.domain,
                  value: acc.id,
                }))}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                disabled={disabled || configSaving}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item<TemplateConfig>
              name="shopper_ids"
              label="Shoppers"
              rules={[
                {
                  required: !isGeneric,
                  message: 'Please select at least one shopper',
                },
              ]}
            >
              <ShopperSelector
                mode="multiple"
                showSearch
                placeholder={
                  isGeneric
                    ? 'Not required for generic templates'
                    : 'Select shoppers'
                }
                disabled={isGeneric || disabled || configSaving}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item<TemplateConfig>
              name="is_generic"
              valuePropName="checked"
            >
              <Checkbox onChange={(e) => handleGenericChange(e.target.checked)}>
                <Space direction="vertical" size="small">
                  <Text strong>Generic Template</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Generic templates can be used by all shoppers without
                    specific assignment
                  </Text>
                </Space>
              </Checkbox>
            </Form.Item>
          </Col>
          </Row>

          <Form.Item>
            <StepNavigation
              rightButtons={[
                createSubmitButton(
                  () => {}, // Form submission is handled by onFinish
                  'Save and Next',
                  {
                    loading: configSaving,
                    disabled: disabled || configSaving,
                  }
                ),
              ]}
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default React.memo(ConfigStep);
