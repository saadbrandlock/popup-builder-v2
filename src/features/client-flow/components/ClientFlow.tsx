import React, { useEffect } from 'react';
import { Steps, Card, Alert, Row, Col, Divider } from 'antd';
import {
  DesktopOutlined,
  MobileOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { BaseProps } from '../../../types/props';
import { useClientFlowStore } from '../../../stores/clientFlowStore';
import { DesktopReview } from '../screens/DesktopReview';
import { MobileReview } from '../screens/MobileReview';
import { CopyReview } from '../screens/CopyReview';
import { ReviewScreen } from '../screens/ReviewScreen';
import { NavigationStepper } from './NavigationStepper';
import { StepConfig } from '../types/clientFlow';
import { clientReviewSteps } from '../utils/helpers';
import { useSyncGenericContext } from '@/lib/hooks/use-sync-generic-context';

/**
 * Unified ClientFlow component - Combines all client flow screens into a single stepper-based interface
 * Follows the BaseProps pattern used throughout the project for consistency
 */
interface ClientFlowProps extends BaseProps {
  // Additional client-flow specific props can be added here
  className?: string;
  onComplete?: (reviewData: any) => void;
  initialStep?: number;
}

export const ClientFlow: React.FC<ClientFlowProps> = ({
  apiClient,
  navigate,
  shoppers,
  accountDetails,
  authProvider,
  className = '',
  onComplete,
  initialStep = 0,
  accounts,
}) => {
  const {
    currentStep,
    desktopReview,
    mobileReview,
    finalReview,
    actions,
    error,
  } = useClientFlowStore();

  // Sync generic context (account, auth, shoppers, navigate) into global store once
  useSyncGenericContext({ accountDetails, authProvider, shoppers, navigate, accounts });

  // Handle completion callback
  useEffect(() => {
    if (finalReview.status === 'approved' && onComplete) {
      const reviewData = {
        desktop: desktopReview,
        mobile: mobileReview,
        final: finalReview,
        completedAt: new Date().toISOString(),
      };
      onComplete(reviewData);
    }
  }, [
    finalReview.status,
    desktopReview,
    mobileReview,
    finalReview,
    onComplete,
  ]);

  // Step configuration with status indicators
  const steps = [
    {
      title: clientReviewSteps.stepOne.title,
      icon: <DesktopOutlined />,
      status: (desktopReview.status === 'approved'
        ? 'finish'
        : desktopReview.status === 'rejected'
          ? 'error'
          : currentStep === 0
            ? 'process'
            : currentStep > 0
              ? 'finish'
              : 'wait') as 'finish' | 'process' | 'wait' | 'error',
      description: clientReviewSteps.stepOne.description,
    },
    {
      title: clientReviewSteps.stepTwo.title,
      icon: <MobileOutlined />,
      status: (mobileReview.status === 'approved'
        ? 'finish'
        : mobileReview.status === 'rejected'
          ? 'error'
          : currentStep === 1
            ? 'process'
            : currentStep > 1
              ? 'finish'
              : 'wait') as 'finish' | 'process' | 'wait' | 'error',
      description: clientReviewSteps.stepTwo.description,
    },
    {
      title: clientReviewSteps.stepThree.title,
      icon: <EditOutlined />,
      status: (currentStep === 2
        ? 'process'
        : currentStep > 2
          ? 'finish'
          : 'wait') as 'finish' | 'process' | 'wait' | 'error',
      description: clientReviewSteps.stepThree.description,
    },
    {
      title: 'Final Review',
      icon: <CheckCircleOutlined />,
      status: (finalReview.status === 'approved'
        ? 'finish'
        : finalReview.status === 'rejected'
          ? 'error'
          : currentStep === 3
            ? 'process'
            : 'wait') as 'finish' | 'process' | 'wait' | 'error',
      description: 'Final approval and submission',
    },
  ];

  // Render current step content
  const renderStepContent = () => {
    const stepProps = {
      apiClient,
      navigate,
      shoppers,
      accountDetails,
      authProvider,
      accounts,
    };

    console.log('currentStep', currentStep);
    switch (currentStep) {
      case 0:
        return <DesktopReview {...stepProps} />;
      case 1:
        return <MobileReview {...stepProps} />;
      case 2:
        return <CopyReview {...stepProps} />;
      case 3:
        return <ReviewScreen {...stepProps} />;
      default:
        return (
          <div className="text-center py-12">
            <Alert
              message="Invalid Step"
              description="The current step is not recognized. Please restart the flow."
              type="error"
              showIcon
            />
          </div>
        );
    }
  };

  return (
    <Row className={`client-flow-container ${className}`} gutter={[16, 16]}>
      <Col xs={24} md={4}>
        {/* Header with Steps */}
        <div className="mb-6">
          <NavigationStepper
            currentStep={currentStep}
            totalSteps={4}
            //@ts-ignore
            steps={steps}
            onStepClick={(step) => {
              actions.setCurrentStep(step);
            }}
          />
        </div>
      </Col>
      <Col xs={24} md={20}>
        {/* Global Error Display */}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            closable
            onClose={() => actions.clearError()}
            className="mb-6"
          />
        )}

        {/* Step Content */}
        <div className="step-content">{renderStepContent()}</div>
      </Col>
    </Row>
  );
};

export default ClientFlow;
