import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, message } from 'antd';
import { useCategoryStore } from '../stores';
import { CreateCategoryInput, UpdateCategoryInput } from '../types';

interface CategoryModalProps {
  onSubmit: (data: CreateCategoryInput | UpdateCategoryInput) => Promise<void>;
  loading?: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const { isModalOpen, editingCategory, actions } = useCategoryStore();

  useEffect(() => {
    if (isModalOpen && editingCategory) {
      form.setFieldsValue({
        name: editingCategory.name,
        description: editingCategory.description || '',
        display_order: editingCategory.display_order,
        icon_url: editingCategory.icon_url || '',
      });
    } else if (isModalOpen) {
      form.resetFields();
    }
  }, [isModalOpen, editingCategory, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingCategory) {
        await onSubmit({
          id: editingCategory.id,
          ...values,
        });
      } else {
        await onSubmit(values);
      }
      
      actions.closeModal();
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleCancel = () => {
    actions.closeModal();
    form.resetFields();
  };

  return (
    <Modal
      title={editingCategory ? 'Edit Category' : 'Create Category'}
      open={isModalOpen}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={editingCategory ? 'Update' : 'Create'}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          display_order: 0,
        }}
      >
        <Form.Item
          name="name"
          label="Category Name"
          rules={[
            { required: true, message: 'Please enter category name' },
            { max: 100, message: 'Name must be less than 100 characters' },
          ]}
        >
          <Input placeholder="e.g., Holiday Specials" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ max: 500, message: 'Description must be less than 500 characters' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Brief description of this category"
          />
        </Form.Item>

        <Form.Item
          name="icon_url"
          label="Icon URL"
          rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
        >
          <Input placeholder="https://..." />
        </Form.Item>

        <Form.Item
          name="display_order"
          label="Display Order"
          rules={[{ required: true, message: 'Please enter display order' }]}
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            placeholder="0"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
