import { Button } from 'antd';
import { Edit, ThumbsUp, Eye } from 'lucide-react';
import React from 'react';
import { useClientFlowStore } from '@/stores/clientFlowStore';
import { useGenericStore } from '@/stores/generic.store';
import { cn } from '@/lib/utils';

interface ReviewActionsProps {
  type: 'desktop' | 'mobile';
  goToEditTemplate: () => void;
  /** When true, all actions render in one row (for use inside template card). */
  inline?: boolean;
}

const buttonBase = 'h-9 flex items-center transition-all duration-300 ease-in-out whitespace-nowrap';

const ReviewActions: React.FC<ReviewActionsProps> = ({ type, goToEditTemplate, inline }) => {
  const { feedbackData } = useClientFlowStore();
  const { actions: genericActions } = useGenericStore();

  const currentFeedback = feedbackData[type] || '';
  const countWords = (text: string) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };
  const wordCount = countWords(currentFeedback);
  const isFeedbackValid = wordCount >= 5;
  const isApproveDisabled = isFeedbackValid;

  const handlePreview = () => {
    genericActions.setBrowserPreviewModalOpen(true);
  };

  const approveClassName = cn(
    buttonBase,
    isApproveDisabled
      ? 'bg-gray-300 border-gray-300 cursor-not-allowed'
      : 'bg-green-500 border-green-500 hover:!bg-green-600 hover:!border-green-600'
  );

  if (inline) {
    return (
      <div
        className="inline-flex border border-gray-400 bg-gray-200 overflow-hidden shadow-sm p-1"
        role="group"
        aria-label="Template actions"
      >
        <button
          type="button"
          onClick={handlePreview}
          className={cn(
            buttonBase,
            'gap-1.5 px-4 border-0 border-r border-gray-200 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-inset'
          )}
        >
          <Eye size={16} className="shrink-0" />
          <span>Preview</span>
        </button>
        <button
          type="button"
          onClick={goToEditTemplate}
          className={cn(
            buttonBase,
            'gap-1.5 px-4 border-0 border-r border-gray-200 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-inset'
          )}
        >
          <Edit size={16} className="shrink-0" />
          <span>Edit</span>
        </button>
        <button
          type="button"
          disabled={isApproveDisabled}
          className={cn(
            buttonBase,
            'gap-1.5 px-4 border-0 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-inset disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-500',
            isApproveDisabled && '!bg-gray-300 !text-gray-500 hover:!bg-gray-300'
          )}
        >
          <ThumbsUp size={16} className="shrink-0" />
          <span>Approve</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Button
        type="primary"
        icon={<Eye size={16} />}
        onClick={handlePreview}
        size="middle"
        className={cn(buttonBase, 'w-full mb-4')}
      >
        Preview Template
      </Button>
      <div className="flex items-end gap-2 px-2">
        <Button
          type="default"
          icon={<Edit size={16} />}
          onClick={goToEditTemplate}
          size="middle"
          className={cn(buttonBase, 'w-full')}
        >
          Edit
        </Button>
        <Button
          type="primary"
          icon={<ThumbsUp size={16} />}
          disabled={isApproveDisabled}
          size="middle"
          className={cn(buttonBase, 'w-full', approveClassName)}
        >
          Approve
        </Button>
      </div>
    </div>
  );
};

export default ReviewActions;
