import React from 'react';
import { Steps } from 'antd';
import { CheckCircleOutlined, LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { NavigationStepperProps } from '../types/clientFlow';

/**
 * NavigationStepper - Step navigation component
 * Shows progress through the review flow
 */
export const NavigationStepper: React.FC<NavigationStepperProps> = ({
  currentStep,
  totalSteps,
  steps,
  onStepClick,
  className = '',
}) => {
  const getStepIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return <CheckCircleOutlined />;
      case 'current':
        return <LoadingOutlined />;
      case 'error':
        return <ExclamationCircleOutlined />;
      default:
        return null;
    }
  };

  const getStepStatus = (stepIndex: number, stepConfig: any) => {
    if (stepConfig.status === 'error') return 'error';
    if (stepIndex < currentStep) return 'finish';
    if (stepIndex === currentStep) return 'process';
    return 'wait';
  };

  return (
    <div className={`navigation-stepper ${className}`}>
      <Steps
        current={currentStep}
        onChange={onStepClick}
        items={steps.map((step, index) => ({
          title: step.title,
          description: step.description,
          status: getStepStatus(index, step),
          icon: getStepIcon(step.status),
        }))}
        className="mb-6"
      />
      
      {/* Progress Info */}
      <div className="text-center text-sm text-gray-600">
        Step {currentStep + 1} of {totalSteps}
      </div>
    </div>
  );
};
