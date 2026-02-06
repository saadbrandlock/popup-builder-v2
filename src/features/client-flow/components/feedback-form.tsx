import { Button, Divider, Form, Input, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { Divide, MessageCircle, Phone, SendHorizontal } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useClientFlowStore } from '@/stores/clientFlowStore';
import { useGenericStore } from '@/stores/generic.store';

const { Text } = Typography;

interface FeedbackFormProps {
  type: 'desktop' | 'mobile' | 'copy-review';
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ type }) => {
  const [form] = Form.useForm();
  const { feedbackData, actions } = useClientFlowStore();
  const { actions: genericActions } = useGenericStore();
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const maxChars = 500;
  const minWords = 5;

  const currentFeedback = feedbackData[type] || '';
  const countWords = (text: string) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };
  const isSubmitDisabled = wordCount < minWords;

  useEffect(() => {
    setCharCount(currentFeedback.length);
    setWordCount(countWords(currentFeedback));
    form.setFieldsValue({ [`${type}_feedback`]: currentFeedback });
  }, [currentFeedback, form, type]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      actions.updateFeedbackData(type, value);
      setCharCount(value.length);
      setWordCount(countWords(value));
    }
  };

  const handleSubmit = (values: any) => {
    // Handle form submission logic here
  };

  return (
    <>
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        className="!pb-9"
      >
        <Form.Item
          name={`${type}_feedback`}
          label={
            <span className="flex items-center gap-2">
              <MessageCircle size={16} className="text-blue-500" /> Feedback for
              Brandlock Team
            </span>
          }
        >
          <Input.TextArea
            rows={4}
            placeholder="Share your thoughts, suggestions or required changes..."
            value={currentFeedback}
            onChange={handleTextChange}
            maxLength={maxChars}
          />
          <div className="flex justify-between items-center mt-1">
            <Text
              type={wordCount < minWords ? 'danger' : 'secondary'}
              className="text-xs"
            >
              Minimum {minWords} words required ({wordCount}/{minWords})
            </Text>
            <Text
              type={charCount > maxChars * 0.9 ? 'warning' : 'secondary'}
              className="text-xs"
            >
              {charCount}/{maxChars}
            </Text>
          </div>
        </Form.Item>

        <Button
          iconPosition="end"
          icon={<SendHorizontal size={14} />}
          type="primary"
          className="float-right"
          htmlType="submit"
          disabled={isSubmitDisabled}
        >
          Submit Feedback
        </Button>
      </Form>

      <Divider>OR</Divider>
      <Button
        href="https://brandlock.io"
        target="_blank"
        icon={<Phone size={16} />}
        className='w-full'
      >
        Schedule a call
      </Button>

    </>
  );
};

export default FeedbackForm;
