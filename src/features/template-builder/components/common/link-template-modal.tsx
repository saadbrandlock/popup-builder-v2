import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Button, message, Typography, Tag, Space, Divider, Empty } from 'antd';
import { LinkOutlined, UserOutlined, MobileOutlined } from '@ant-design/icons';
import { createAPI } from '@/api';
import { useGenericStore } from '@/stores/generic.store';

const { Text, Title } = Typography;
const { Option } = Select;

interface PotentialChildTemplate {
  id: string;
  name: string;
  description: string;
  shoppers: { id: number; name: string }[];
  devices: { id: number; device_type: string }[];
}

interface LinkTemplateModalProps {
  visible: boolean;
  onCancel: () => void;
  parentTemplateId: string;
  parentTemplateName?: string;
  accountId: number;
  onSuccess?: () => void;
}

export const LinkTemplateModal: React.FC<LinkTemplateModalProps> = ({
  visible,
  onCancel,
  parentTemplateId,
  parentTemplateName,
  accountId,
  onSuccess,
}) => {
  const apiClient = useGenericStore((s) => s.apiClient);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [potentialTemplates, setPotentialTemplates] = useState<PotentialChildTemplate[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  const api = apiClient ? createAPI(apiClient) : null;
  const templatesAPI = api?.templates;

  useEffect(() => {
    if (visible && accountId) {
      fetchPotentialChildTemplates();
    }
  }, [visible, accountId]);

  const fetchPotentialChildTemplates = async () => {
    if (!templatesAPI) return;
    setLoading(true);
    try {
      const response = await templatesAPI.getPotentitalChildTemplateDetails(accountId);
      if (response) {
        setPotentialTemplates(response);
      }
    } catch (error) {
      console.error('Error fetching potential child templates:', error);
      message.error('Failed to load potential child templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!templatesAPI) {
      message.error('API client is required');
      return;
    }
    if (selectedTemplates.length === 0) {
      message.warning('Please select at least one template to link');
      return;
    }

    setSubmitting(true);
    try {
      await templatesAPI.linkChildTemplates(parentTemplateId, selectedTemplates);
      message.success('Templates linked successfully');
      form.resetFields();
      setSelectedTemplates([]);
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('Error linking templates:', error);
      message.error('Failed to link templates');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedTemplates([]);
    onCancel();
  };

  const getDeviceTypeColor = (deviceType: string) => {
    const colors: Record<string, string> = {
      desktop: 'blue',
      mobile: 'green',
      tablet: 'orange',
    };
    return colors[deviceType.toLowerCase()] || 'default';
  };

  const renderTemplateOption = (template: PotentialChildTemplate) => (
    <div className="py-2">
      <div className="flex justify-between items-start">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Text strong>{template.name}</Text>
            {template.description && (
              <div className="mt-1">
                <Text type="secondary" className="text-xs">
                  {template.description}
                </Text>
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {template.devices.map((device) => (
            <Tag
              className="capitalize"
              key={device.id}
              color={getDeviceTypeColor(device.device_type)}
              icon={device.device_type.toLowerCase() === 'mobile' ? <MobileOutlined /> : undefined}
            >
              {device.device_type}
            </Tag>
          ))}
        </div>
      </div>

      {template.shoppers.length > 0 && (
        <div className="mt-1.5">
          <Space size={4}>
            {template.shoppers.map((s) => (
              <Tag key={s.id}>{s.name}</Tag>
            ))}
          </Space>
        </div>
      )}
    </div>
  );

  // Filter templates to ensure only one device type per parent
  const getFilteredTemplates = () => {
    if (selectedTemplates.length === 0) return potentialTemplates;

    // Get device types of already selected templates
    const selectedDeviceTypes = new Set<string>();
    selectedTemplates.forEach((templateId) => {
      const template = potentialTemplates.find((t) => t.id === templateId);
      if (template) {
        template.devices.forEach((device) => {
          selectedDeviceTypes.add(device.device_type.toLowerCase());
        });
      }
    });

    // Filter out templates that have conflicting device types
    return potentialTemplates.filter((template) => {
      if (selectedTemplates.includes(template.id)) return true;

      return !template.devices.some((device) =>
        selectedDeviceTypes.has(device.device_type.toLowerCase())
      );
    });
  };
  

  return (
    <Modal
      title={
        <Space>
          <LinkOutlined />
          <span>Link Child Templates</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleSubmit}
          disabled={selectedTemplates.length === 0}
        >
          Link Templates
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Parent Template">
          <div className="p-3 bg-gray-50 rounded-md border border-gray-300">
            <Text strong>ID: {parentTemplateId}</Text>
            {parentTemplateName && (
              <div className="mt-1">
                <Text>Name: {parentTemplateName}</Text>
              </div>
            )}
          </div>
        </Form.Item>

        <Divider />

        {potentialTemplates.length ? (
          <Form.Item
            label="Select Child Templates to Link"
            help="Note: Only one device type can be selected per parent template"
          >
            <Select
              mode="multiple"
              placeholder="Select templates to link"
              loading={loading}
              value={selectedTemplates}
              onChange={setSelectedTemplates}
              className="w-full"
              optionLabelProp="label"
              maxTagCount="responsive"
            >
              {getFilteredTemplates().map((template) => (
                <Option
                  key={template.id}
                  value={template.id}
                  label={template.name}
                  disabled={
                    selectedTemplates.length > 0 &&
                    !selectedTemplates.includes(template.id) &&
                    template.devices.some((device) => {
                      const selectedDeviceTypes = new Set<string>();
                      selectedTemplates.forEach((selectedId) => {
                        const selectedTemplate = potentialTemplates.find(
                          (t) => t.id === selectedId
                        );
                        if (selectedTemplate) {
                          selectedTemplate.devices.forEach((d) => {
                            selectedDeviceTypes.add(d.device_type.toLowerCase());
                          });
                        }
                      });
                      return selectedDeviceTypes.has(device.device_type.toLowerCase());
                    })
                  }
                >
                  {renderTemplateOption(template)}
                </Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <Empty description="No templates available to link!" />
        )}

        {selectedTemplates.length > 0 && (
          <div className="mt-4">
            <Text type="secondary" className="text-xs">
              Selected {selectedTemplates.length} template(s) for linking
            </Text>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default LinkTemplateModal;
