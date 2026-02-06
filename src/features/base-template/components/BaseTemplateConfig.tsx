import { Button, Card, Form, Input, InputNumber, Select, Space, Switch, Row, Col, FormInstance } from 'antd';
import React, { useEffect } from 'react';
import { useBaseTemplateStore, useCategoryStore } from '../stores';
import { useLoadingStore } from '@/stores/common/loading.store';

const { TextArea } = Input;

interface BaseTemplateConfigProps {
  onCancel: () => void;
  handleNextStep: () => void;
  form: FormInstance<any>;
}

const BaseTemplateConfig: React.FC<BaseTemplateConfigProps> = ({ onCancel, handleNextStep, form }) => {
  const { categories } = useCategoryStore();
  const { selectedCategoryId } = useBaseTemplateStore();
  const { baseTemplateConfigCreation } = useLoadingStore();

  useEffect(() => {
    if (selectedCategoryId) {
      form.setFieldValue('category_id', selectedCategoryId);
    }
  }, [selectedCategoryId, form]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            category_id: selectedCategoryId,
          }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24}>
              <Form.Item
                name="name"
                label="Template Name"
                rules={[
                  { required: true, message: 'Please enter template name' },
                  { max: 200, message: 'Name must be less than 200 characters' },
                ]}
              >
                <Input placeholder="e.g., Summer Sale Template" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ max: 500, message: 'Description must be less than 500 characters' }]}
              >
                <TextArea rows={3} placeholder="Brief description of this template" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <Form.Item
                name="category_id"
                label="Category"
                rules={[{ required: true, message: 'Please select a category' }]}
              >
                <Select placeholder="Select a category">
                  {categories.map((category) => (
                    <Select.Option key={category.id} value={category.id}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item name="is_featured" label="Is Featured" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item name="display_order" label="Display Order">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item>
                <Space>
                  <Button onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button type="primary" onClick={handleNextStep} loading={baseTemplateConfigCreation}>
                    Next: Design Template
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default BaseTemplateConfig;
