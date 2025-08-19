import { Form, Input } from 'antd';
import { MessageCircle } from 'lucide-react';
import React from 'react';

interface FeedbackFormProps {
  type: 'desktop' | 'mobile';
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ type }) => {
  const [form] = Form.useForm();
  return (
    <>
      <Form layout="vertical" form={form}>
        <Form.Item
          name={`${type}_feedback`}
          label={
            <span className='flex items-center gap-2'>
              <MessageCircle size={16} className='text-blue-500' /> Feedback for Brandlock Team
            </span>
          }
        >
          <Input.TextArea
            rows={4}
            placeholder="Share your thoughts, suggestions or required changes..."
          />
        </Form.Item>
      </Form>
    </>
  );
};

export default FeedbackForm;
