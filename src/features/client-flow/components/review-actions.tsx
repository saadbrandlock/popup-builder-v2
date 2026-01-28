import { Button, Space, Tooltip } from 'antd';
import { Edit, ThumbsUp, Eye } from 'lucide-react';
import React from 'react';
import { useClientFlowStore } from '@/stores/clientFlowStore';
import { useGenericStore } from '@/stores/generic.store';
import { cn } from '@/lib/utils';

interface ReviewActionsProps {
  type: 'desktop' | 'mobile';
  goToEditTemplate: () => void;
}

const ReviewActions: React.FC<ReviewActionsProps> = ({ type, goToEditTemplate }) => {
  const { feedbackData } = useClientFlowStore();
  const { actions: genericActions } = useGenericStore();

  const currentFeedback = feedbackData[type] || '';
  const countWords = (text: string) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };
  const wordCount = countWords(currentFeedback);
  const isFeedbackValid = wordCount >= 5;
  const isApproveDisabled = isFeedbackValid; // Disable approve when feedback is valid (user is providing feedback)

  const handlePreview = () => {
    genericActions.setBrowserPreviewModalOpen(true);
  };

  return (
    <div className='w-full'>
      <Button
            type="primary"
            icon={<Eye size={16} />}
            onClick={handlePreview}
            size="middle"
            className={cn(
              "h-9 w-full mb-4 flex items-center"
            )}
          >
            <span className={cn(
              "transition-all duration-300 ease-in-out whitespace-nowrap"
            )}>
              Preview Template
            </span>
          </Button>
      <div className={cn(
        "flex items-end gap-2 px-2 transition-all duration-300 ease-in-out"
      )}>
          <Button
            type="default"
            icon={<Edit size={16} />}
            onClick={goToEditTemplate}
            size="middle"
            className={cn(
              "h-9 w-full flex items-center ")}
          >
            <span className={cn(
              "transition-all duration-300 ease-in-out whitespace-nowrap"
            )}>
              Edit
            </span>
          </Button>
          <Button
            type="primary"
            icon={<ThumbsUp size={16} />}
            disabled={isApproveDisabled}
            size="middle"
            className={cn(
              "h-9 w-full flex items-center transition-all duration-300 ease-in-out",
              isApproveDisabled
                ? 'bg-gray-300 border-gray-300 cursor-not-allowed'
                : 'bg-green-500 border-green-500 hover:!bg-green-600 hover:!border-green-600'
            )}
          >
            <span className={cn(
              "transition-all duration-300 ease-in-out whitespace-nowrap"
            )}>
              Approve
            </span>
          </Button>
      </div>
    </div>
  );
};

export default ReviewActions;
