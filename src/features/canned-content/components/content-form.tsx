import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { CBCannedContent } from '@/types';
import { useGenericStore } from '@/stores/generic.store';
import { splitByAndCapitalize } from '@/lib/utils/helper';

export interface CannedContentFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: Partial<CBCannedContent>) => void;
  initialValues: CBCannedContent | null;
  industries: string[];
  fields: {key: string, value: number}[];
}

const CannedContentForm: React.FC<CannedContentFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  industries,
  fields,
}) => {
  const [form] = Form.useForm();

  const {shoppers} = useGenericStore();

  React.useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        field: +initialValues.field!,
      });
    } else {
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Edit Content' : 'Add New Content'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="industry"
          label="Industry"
          rules={[{ required: true, message: 'Please select an industry' }]}
        >
          <Select
            placeholder="Select industry"
            options={industries.map((i) => ({ label: splitByAndCapitalize(i, '_'), value: i }))}
          />
        </Form.Item>

        <Form.Item
          name="field"
          label="Field"
          rules={[{ required: true, message: 'Please select a field' }]}
        >
          <Select
            placeholder="Select field"
            options={fields.map((f) => ({ label: splitByAndCapitalize(f.key, '_'), value: f.value }))}
          />
        </Form.Item>
        <Form.Item
          name="shopper_ids"
          label="Shopper Segments"
          rules={[{ required: true, message: 'Please select a Shopper Segment' }]}
        >
          <Select
            allowClear
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select Shopper Segments"
            options={shoppers.map((s) => ({ label: s.name, value: s.id }))}
          />
        </Form.Item>

        <Form.Item
          name="content"
          label="Content"
          rules={[{ required: true, message: 'Please enter content' }]}
        >
          <Input.TextArea rows={4} placeholder="Enter content" />
        </Form.Item>

        <Form.Item name="remarks" label="Remarks">
          <Input.TextArea rows={2} placeholder="Enter remarks (optional)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CannedContentForm;
