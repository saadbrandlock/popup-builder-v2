import React from 'react';
import { Card } from 'antd';
import {
  CheckCircleOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { ListOrdered } from 'lucide-react';
import type { NavigationStepperProps } from '../types/clientFlow';

/**
 * NavigationStepper - Custom step navigation component
 * Shows progress through the review flow with a custom design
 */
export const NavigationStepper: React.FC<NavigationStepperProps> = ({
  currentStep,
  totalSteps,
  steps,
  onStepClick,
  className = '',
}) => {
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          circle: 'bg-green-400 text-white border-green-400',
          title: 'text-gray-900 font-semibold',
          description: 'text-gray-600',
          container: 'opacity-100 border-l-4 border-green-400 bg-green-50',
        };
      case 'current':
        return {
          circle: 'bg-blue-600 text-white border-blue-600',
          title: 'text-blue-600 font-semibold',
          description: 'text-gray-600',
          container: 'opacity-100 border-l-4 border-blue-600 bg-blue-50',
        };
      case 'pending':
        return {
          circle: 'bg-gray-100 text-gray-400 border-gray-200',
          title: 'text-gray-400',
          description: 'text-gray-400',
          container: 'opacity-60 border-l-4 border-gray-400',
        };
      default:
        return {
          circle: 'bg-gray-100 text-gray-400 border-gray-200',
          title: 'text-gray-400',
          description: 'text-gray-400',
          container: 'opacity-60 border-l-4 border-gray-400 bg-gray-50',
        };
    }
  };

  return (
    <div className={`navigation-stepper ${className}`}>
      <Card className="shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-3">
          <ListOrdered className="w-5 h-5 text-blue-600" />
          <span className="text-base font-semibold text-gray-900">
            Review Steps
          </span>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const classes = getStepClasses(status);

            return (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-tr-md rounded-br-md ${classes.container} cursor-pointer hover:bg-gray-50 transition-colors`}
                onClick={() => onStepClick && onStepClick(index)}
              >
                {/* Step Number Circle */}
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${classes.circle}`}
                >
                  {status === 'completed' ? (
                    <CheckCircleOutlined className="w-3 h-3" />
                  ) : status === 'current' ? (
                    <span>{index + 1}</span>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${classes.title}`}>{step.title}</div>
                  {step.description && (
                    <div className={`text-xs mt-1 ${classes.description}`}>
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
