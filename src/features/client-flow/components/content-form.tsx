import React, { useEffect, useState, useMemo } from 'react';
import { Form, Input, Select, Row, Col, Typography, Button, Space, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useClientFlowStore } from '@/stores/clientFlowStore';
import { useDevicesStore } from '@/stores/common/devices.store';
import { CBTemplateFieldContentIdMappingWithContent } from '@/types';

const { Title, Text } = Typography;

interface ContentFormData {
  [key: string]: string;
}

const ContentForm = () => {
  const { contentFields, activeContentShopper, contentFormData, selectedDeviceId, actions } = useClientFlowStore();
  const { devices } = useDevicesStore();
  const [form] = Form.useForm<ContentFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [customInputs, setCustomInputs] = useState<{ [key: string]: boolean }>({});

  // Filter fields based on selected device
  const filteredFields = useMemo(() => {
    if (!selectedDeviceId || !devices.length) return contentFields;
    
    const selectedDevice = devices.find(d => d.id === selectedDeviceId);
    if (!selectedDevice) return contentFields;
    
    return contentFields.filter(field => {
      // Check if field supports the selected device
      const deviceSupport = field.supported_devices?.[selectedDevice.device_type];
      return deviceSupport !== undefined && deviceSupport > 0;
    });
  }, [contentFields, selectedDeviceId, devices]);

  // Initialize form with default values
  useEffect(() => {
    if (filteredFields && filteredFields.length > 0) {
      const initialValues: ContentFormData = {};
      
      filteredFields.forEach((field) => {
        // Use stored form data if available, otherwise check for shopper-specific content
        if (contentFormData[field.field_id]) {
          initialValues[field.field_id] = contentFormData[field.field_id];
        } else {
          const shopperContent = field.content.find(
            (content) => content.industry === activeContentShopper?.content?.name
          );
          initialValues[field.field_id] = shopperContent?.content || field.default_field_value;
        }
      });
      
      form.setFieldsValue(initialValues);
      // Update store with initial values
      actions.setContentFormData(initialValues);
    }
  }, [filteredFields, activeContentShopper, form, actions]);

  const handleSubmit = async (values: ContentFormData) => {
    setIsLoading(true);
    try {
      console.log('Form submitted with values:', values);
      message.success('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      message.error('Failed to save content');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle field focus for highlighting
  const handleFieldFocus = (fieldId: string, fieldName: string) => {
    actions.setHighlightedField(fieldId, fieldName);
  };

  // Handle field blur - clear immediately
  const handleFieldBlur = () => {
    actions.setHighlightedField(null);
  };

  // Handle input change - clear highlight when user starts typing
  const handleInputChange = () => {
    actions.setHighlightedField(null);
  };

  const renderFormField = (field: CBTemplateFieldContentIdMappingWithContent) => {
    const hasOptions = field.content && field.content.length > 0;
    
    if (hasOptions) {
      // Render Select dropdown when content options are available
      return (
        <Form.Item
          key={field.field_id}
          name={field.field_id}
          label={field.field}
          rules={[
            { required: true, message: `Please select or enter ${field.field.toLowerCase()}` }
          ]}
        >
          {customInputs[field.field_id] ? (
            <Input
              placeholder={`Enter custom ${field.field.toLowerCase()}`}
              size="large"
              onFocus={() => handleFieldFocus(field.field_id, field.field)}
              onBlur={handleFieldBlur}
              onChange={handleInputChange}
              suffix={
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    setCustomInputs(prev => ({ ...prev, [field.field_id]: false }));
                    form.setFieldValue(field.field_id, field.default_field_value);
                  }}
                >
                  Back to options
                </Button>
              }
            />
          ) : (
            <Select
              placeholder={`Select ${field.field.toLowerCase()}`}
              allowClear
              size="large"
              value={form.getFieldValue(field.field_id)}
              onFocus={() => handleFieldFocus(field.field_id, field.field)}
              onBlur={handleFieldBlur}
              onChange={(value) => {
                handleInputChange();
                if (value === '__CUSTOM__') {
                  setCustomInputs(prev => ({ ...prev, [field.field_id]: true }));
                  form.setFieldValue(field.field_id, '');
                } else {
                  form.setFieldValue(field.field_id, value);
                }
              }}
            >
              {/* Default option */}
              <Select.Option value={field.default_field_value}>
                {field.default_field_value} (Default)
              </Select.Option>
              
              {/* Content options */}
              {field.content.map((content) => (
                <Select.Option key={content.id} value={content.content}>
                  {content.content}
                </Select.Option>
              ))}
              
              {/* Custom input option */}
              <Select.Option value="__CUSTOM__" style={{ borderTop: '1px solid #f0f0f0' }}>
                <Text type="secondary">✏️ Enter custom content</Text>
              </Select.Option>
            </Select>
          )}
        </Form.Item>
      );
    } else {
      // Render Input when no content options are available
      return (
        <Form.Item
          key={field.field_id}
          name={field.field_id}
          label={field.field}
          rules={[
            { required: true, message: `Please enter ${field.field.toLowerCase()}` }
          ]}
        >
          <Input
            placeholder={field.default_field_value}
            size="large"
            onFocus={() => handleFieldFocus(field.field_id, field.field)}
            onBlur={handleFieldBlur}
            onChange={handleInputChange}
          />
        </Form.Item>
      );
    }
  };

  if (!filteredFields || filteredFields.length === 0) {
    const selectedDevice = devices.find(d => d.id === selectedDeviceId);
    const deviceName = selectedDevice?.device_type || 'this device';
    
    return (
      <Row justify="center">
        <Col span={24}>
          <div className="text-center py-8">
            <Text type="secondary">
              No content fields available for {deviceName}
            </Text>
          </div>
        </Col>
      </Row>
    );
  }

  return (
    <>
      <Row gutter={[0, 16]} className='mb-6'>
        <Col span={24}>
          <Title level={4} className="mb-1">
            Template Content Configuration
          </Title>
          <Text type="secondary">
            Customize the content for your popup template
          </Text>
        </Col>
      </Row>
      
      <Form
        form={form}
        onFinish={handleSubmit}
        onValuesChange={(changedValues, allValues) => {
          // Update store with all form values whenever any field changes
          actions.setContentFormData(allValues);
        }}
        layout="vertical"
        disabled={isLoading}
      >
        <Row gutter={[16, 16]}>
          {filteredFields.map((field) => (
            <Col xs={24} key={field.field_id}>
              {renderFormField(field)}
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} md={12}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                
                  className='w-full '
              >
                Save Content
              </Button>
              </Col>
              <Col xs={24} md={12}>
              <Button
                onClick={() => form.resetFields()}
                disabled={isLoading}
              
                className='w-full '
              >
                Reset to Defaults
              </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default ContentForm;