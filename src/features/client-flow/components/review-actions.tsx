import { Button } from 'antd';
import { Edit, SendHorizontal, ThumbsUp } from 'lucide-react';
import React from 'react';

interface ReviewActionsProps {
  type: 'desktop' | 'mobile';
}

const ReviewActions: React.FC<ReviewActionsProps> = ({ type }) => {
  return (
    <div className="flex items-center justify-end gap-4 mt-6">
      <Button size="large" iconPosition="start" icon={<Edit size={16} />}>
        Edit Design
      </Button>

      <Button
        size="large"
        iconPosition="start"
        icon={<SendHorizontal size={16} />}
        type="primary"
      >
        Submit Feedback
      </Button>

      <Button
        size="large"
        iconPosition="start"
        icon={<ThumbsUp size={16} />}
        className="bg-green-500 text-white border-green-500 hover:!bg-green-600"
        type="primary"
      >
        Approve Design
      </Button>
    </div>
  );
};

export default ReviewActions;
