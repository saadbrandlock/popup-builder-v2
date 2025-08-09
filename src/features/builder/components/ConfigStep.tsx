import React, { useEffect, useState } from 'react';
import {
  Select,
  Input,
  Form,
  Spin,
  Alert,
  Card,
  Button,
  Space,
  Typography,
  Checkbox,
  Row,
  Col,
} from 'antd';

import { Device, TemplateConfig } from '@/types';
import { useDevicesStore } from '@/stores/common/devices.store';
import { useGenericStore } from '@/stores/generic.store';
import { DeviceSelector } from '@/components/common';
import { useLoadingStore } from '@/stores/common/loading.store';
// MIGRATED: Use Zustand stores instead of contexts
// TODO: accounts and shoppers should come from API data, not builder context

const { Text } = Typography;

interface ConfigStepProps {
  disabled?: boolean;
  handleFinalSave: (data: TemplateConfig) => Promise<void>;
  onNext?: () => void;
  isEditMode: boolean;
  templateEditState?: {
    id: string;
    name: string;
    description: string | null;
    device_ids: number[];
    status: string | null;
    shopper_ids: number[];
    is_generic?: boolean;
    account_ids: number[];
  };
}

const ConfigStep: React.FC<ConfigStepProps> = ({
  disabled,
  handleFinalSave,
  isEditMode,
  templateEditState,
}) => {
  const { devices } = useDevicesStore();
  const { accounts, shoppers } = useGenericStore();
  const { configSaving } = useLoadingStore();

  const [form] = Form.useForm<TemplateConfig>();

  const [isGeneric, setIsGeneric] = useState(false);

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
        account_ids: templateEditState.account_ids,
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
    <Card>
      <Form
        form={form}
        onFinish={handleFinalSave}
        layout="vertical"
        disabled={disabled || configSaving}
      >
        <Row gutter={[16, 16]}>
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
            <Form.Item<TemplateConfig> name="account_ids" label="Accounts">
              <Select
                mode="multiple"
                showSearch
                placeholder={'Select accounts applicable for this template'}
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
              <Select
                mode="multiple"
                showSearch
                placeholder={
                  isGeneric
                    ? 'Not required for generic templates'
                    : 'Select shoppers'
                }
                options={shoppers.map((s) => ({ label: s.name, value: s.id }))}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
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

        <Form.Item className="flex justify-end gap-2">
          <Button type="primary" htmlType="submit" loading={configSaving}>
            Save and Next
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default React.memo(ConfigStep);
