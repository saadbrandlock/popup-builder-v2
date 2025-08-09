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

  // Initialize step if provided
  useEffect(() => {
    if (initialStep !== currentStep) {
      actions.setCurrentStep(initialStep);
    }
  }, [initialStep, currentStep, actions]);

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
      title: 'Desktop Review',
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
      description: 'Review desktop version',
    },
    {
      title: 'Mobile Review',
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
      description: 'Review mobile version',
    },
    {
      title: 'Copy Review',
      icon: <EditOutlined />,
      status: (currentStep === 2
        ? 'process'
        : currentStep > 2
          ? 'finish'
          : 'wait') as 'finish' | 'process' | 'wait' | 'error',
      description: 'Review coupon copy',
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
      <Col xs={24} md={6}>
        {/* Header with Steps */}
        <Card className="mb-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Client Review Flow
            </h1>
            <p className="text-gray-600">
              Review and approve your popup template across different devices
            </p>
          </div>

          <Steps
            current={currentStep}
            items={steps}
            className="mb-4"
            responsive={true}
            direction="vertical"
          />

          {/* Progress indicator */}
          <div className="text-center text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
        </Card>
      </Col>
      <Col xs={24} md={18}>
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

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <Card
            title="Debug Info"
            size="small"
            className="mt-6 bg-gray-50"
            style={{ fontSize: '12px' }}
          >
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <strong>Current Step:</strong> {currentStep}
              </div>
              <div>
                <strong>Desktop Status:</strong> {desktopReview.status}
              </div>
              <div>
                <strong>Mobile Status:</strong> {mobileReview.status}
              </div>
              <div>
                <strong>Final Status:</strong> {finalReview.status}
              </div>
            </div>
          </Card>
        )}
      </Col>
    </Row>
  );
};

export default ClientFlow;
