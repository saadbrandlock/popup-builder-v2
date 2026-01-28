import React from 'react';
import { Steps, Tag } from 'antd';
import { Clock } from 'lucide-react';
import { useClientFlowStore } from '../../../stores/clientFlowStore';

interface OnboardingStepsProps {
  accountName?: string;
}

export const OnboardingSteps: React.FC<OnboardingStepsProps> = ({
  accountName = 'Your Business',
}) => {
  const { currentStep, desktopReview, mobileReview, finalReview, actions } = useClientFlowStore();

  const onStepsChange = (value: number) => {
    actions.setCurrentStep(value);
  };

  const manageStatus = (step: number): React.ReactNode => {
    if (step === 0) {
      if (desktopReview.status === 'approved') {
        return <Tag color="green">Completed</Tag>;
      }
      return currentStep >= 0 ? (
        <Tag color="orange">In Progress</Tag>
      ) : (
        <Tag color="yellow">Pending</Tag>
      );
    } else if (step === 1) {
      if (mobileReview.status === 'approved') {
        return <Tag color="green">Completed</Tag>;
      }
      return currentStep >= 1 ? (
        <Tag color="orange">In Progress</Tag>
      ) : (
        <Tag color="yellow">Pending</Tag>
      );
    } else if (step === 2) {
      return currentStep >= 2 ? (
        <Tag color="orange">In Progress</Tag>
      ) : (
        <Tag color="yellow">Pending</Tag>
      );
    } else if (step === 3) {
      if (finalReview.status === 'approved') {
        return <Tag color="green">Completed</Tag>;
      }
      return currentStep >= 3 ? (
        <Tag color="orange">In Progress</Tag>
      ) : (
        <Tag color="yellow">Pending</Tag>
      );
    }

    return <Tag color="yellow">Pending</Tag>;
  };

  const getStepStatus = (step: number): 'wait' | 'process' | 'finish' | 'error' => {
    if (step === 0) {
      return desktopReview.status === 'approved'
        ? 'finish'
        : currentStep === 0
          ? 'process'
          : currentStep > 0
            ? 'finish'
            : 'wait';
    } else if (step === 1) {
      return mobileReview.status === 'approved'
        ? 'finish'
        : currentStep === 1
          ? 'process'
          : currentStep > 1
            ? 'finish'
            : 'wait';
    } else if (step === 2) {
      return currentStep === 2 ? 'process' : currentStep > 2 ? 'finish' : 'wait';
    } else if (step === 3) {
      return finalReview.status === 'approved'
        ? 'finish'
        : currentStep === 3
          ? 'process'
          : 'wait';
    }

    return 'wait';
  };

  const couponOnboardingSteps = [
    {
      title: <div className="leading-normal mb-2">Review Desktop Design</div>,
      description: (
        <div className="-inline-flex items-center space-y-2">
          {manageStatus(0)}
          <Tag className="inline-flex items-center gap-1" icon={<Clock size={14} />} color="purple">
            2 Mins
          </Tag>
        </div>
      ),
      status: getStepStatus(0),
    },
    {
      title: <div className="leading-normal mb-2">Review Mobile Design</div>,
      description: (
        <div className="-inline-flex items-center space-y-2">
          {manageStatus(1)}
          <Tag className="inline-flex items-center gap-1" icon={<Clock size={14} />} color="purple">
            2 Mins
          </Tag>
        </div>
      ),
      status: getStepStatus(1),
    },
    {
      title: <div className="leading-normal mb-2">Manage Template Content</div>,
      description: (
        <div className="-inline-flex items-center space-y-2">
          {manageStatus(2)}
          <Tag className="inline-flex items-center gap-1" icon={<Clock size={14} />} color="purple">
            3 Mins
          </Tag>
        </div>
      ),
      status: getStepStatus(2),
    },
    {
      title: <div className="leading-normal mb-2">Final Review & Approval</div>,
      description: (
        <div className="-inline-flex items-center space-y-2">
          {manageStatus(3)}
          <Tag className="inline-flex items-center gap-1" icon={<Clock size={14} />} color="purple">
            2 Mins
          </Tag>
        </div>
      ),
      status: getStepStatus(3),
    },
  ];

  return (
    <Steps
      direction="vertical"
      onChange={onStepsChange}
      current={currentStep}
      items={couponOnboardingSteps.map((step) => ({
        title: step.title,
        description: step.description,
        status: step.status,
      }))}
    />
  );
};

export default OnboardingSteps;
