import React, { useEffect } from 'react';
import { Steps, Card, Alert, Typography } from 'antd';
import {
  DesktopOutlined,
  MobileOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
import { BaseProps } from '../../../types/props';
import { useClientFlowStore } from '../../../stores/clientFlowStore';
import { DesktopReview } from './DesktopReview';
import { MobileReview } from './MobileReview';
import { CopyReview } from './CopyReview';
import { ReviewScreen } from './ReviewScreen';
import { clientReviewSteps } from '../utils/helpers';
import { useSyncGenericContext } from '@/lib/hooks/use-sync-generic-context';
import { useClientFlow } from '../hooks/use-client-flow';

/** URL tab param values for each step; use with ?tab= for persistent tabs on refresh */
export const CLIENT_FLOW_TAB_KEYS = ['desktop-design', 'mobile-design', 'copy-review', 'final-review'] as const;

/**
 * Unified ClientFlow component - Combines all client flow screens into a single stepper-based interface
 * Follows the BaseProps pattern used throughout the project for consistency
 */
interface ClientFlowProps extends BaseProps {
  className?: string;
  onComplete?: (reviewData: any) => void;
  initialStep?: number;
  /** Current tab from URL (e.g. from ?tab=desktop-design); step is synced from this on mount/change */
  tabFromUrl?: string;
  /** Called when user changes step; host can update URL (e.g. setSearchParams({ tab })) */
  onStepChange?: (step: number, tabKey: string) => void;
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
  tabFromUrl,
  onStepChange,
}) => {
  useSyncGenericContext({
    accountDetails,
    authProvider,
    shoppers,
    navigate,
    accounts,
    apiClient,
  });

  const {
    currentStep,
    desktopReview,
    mobileReview,
    finalReview,
    actions,
    error,
    clientData,
  } = useClientFlowStore();
  const { getCleintTemplatesData, getContentFieldsWithContent } = useClientFlow();
  const { contentFields } = useClientFlowStore();

  useEffect(() => {
    if (accountDetails && !clientData) {
      getCleintTemplatesData(accountDetails.id);
    }
    if (!contentFields.length && accountDetails) {
      getContentFieldsWithContent(accountDetails.id);
    }
  }, [accountDetails]);

  // Sync step from URL tab param so tabs persist on refresh
  useEffect(() => {
    if (tabFromUrl == null) return;
    const step = CLIENT_FLOW_TAB_KEYS.indexOf(tabFromUrl as (typeof CLIENT_FLOW_TAB_KEYS)[number]);
    if (step >= 0) actions.setCurrentStep(step);
  }, [tabFromUrl, actions]);

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

  // Render current step content (apiClient and other context from generic store)
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <DesktopReview />;
      case 1:
        return <MobileReview />;
      case 2:
        return <CopyReview />;
      case 3:
        return <ReviewScreen />;
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
    <div className={`client-flow-container ${className}`}>
      {/* Page Title */}
      <div className="mb-6">
        <Title level={2} className="mb-1">
          Popup Builder Review
        </Title>
        <p className="text-gray-500">
          Review and approve your coupon module design across all devices
        </p>
      </div>

      {/* Horizontal Steps at the top */}
      <Card className="mb-6 shadow-sm">
        <Steps
          current={currentStep}
          onChange={(step) => {
            actions.setCurrentStep(step);
            const tabKey = CLIENT_FLOW_TAB_KEYS[step];
            if (tabKey != null && onStepChange) onStepChange(step, tabKey);
          }}
          items={steps.map((step, index) => ({
            title: step.title,
            icon: step.icon,
            status: step.status,
          }))}
          responsive={false}
          className="px-4"
        />
      </Card>

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
    </div>
  );
};
