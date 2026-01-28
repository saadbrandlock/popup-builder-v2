import { Button, Card, Form, Input, InputNumber, Select, Space, Switch } from 'antd';
import React, { useEffect } from 'react';
import { useBaseTemplateStore, useCategoryStore } from '../stores';
import { ArrowLeftCircle } from 'lucide-react';

const { TextArea } = Input;

interface BaseTemplateConfigProps {
  onCancel: () => void;
  handleNextStep: () => void;
}

const BaseTemplateConfig: React.FC<BaseTemplateConfigProps> = ({ onCancel, handleNextStep }) => {
  const [form] = Form.useForm();
  const { categories } = useCategoryStore();
  const { selectedCategoryId } = useBaseTemplateStore();

  useEffect(() => {
    if (selectedCategoryId) {
      form.setFieldValue('category_id', selectedCategoryId);
    }
  }, [selectedCategoryId, form]);

  return (
    <>
      <Card>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            category_id: selectedCategoryId,
          }}
        >
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

          <Form.Item
            name="description"
            label="Description"
            rules={[{ max: 500, message: 'Description must be less than 500 characters' }]}
          >
            <TextArea rows={3} placeholder="Brief description of this template" />
          </Form.Item>

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

          <Form.Item name="is_featured" label="Is Featured" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="display_order" label="Display Order">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={onCancel} icon={<ArrowLeftCircle />}>
                Cancel
              </Button>
              <Button type="primary" onClick={handleNextStep}>
                Next: Design Template
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
};

export default BaseTemplateConfig;
