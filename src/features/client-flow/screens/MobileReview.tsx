import React, { useEffect } from 'react';
import { Card, Button, Space, Alert, Divider, Switch } from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  RotateRightOutlined,
  MobileOutlined,
} from '@ant-design/icons';
import { BaseProps } from '../../../types/props';
import { BrowserPreview } from '../components/BrowserPreview';
import { ReviewCard } from '../components/ReviewCard';
import { NavigationStepper } from '../components/NavigationStepper';
import { useClientFlowStore } from '../../../stores/clientFlowStore';
import type { StepConfig } from '../types/clientFlow';

/**
 * MobileReview - Step 2 - Mobile review screen
 * Shows popup preview in mobile viewport with touch-friendly controls
 * Now extends BaseProps for consistency with project patterns
 */
interface MobileReviewProps {}

export const MobileReview: React.FC<MobileReviewProps> = ({}) => {
  const {
    selectedTemplate,
    websiteData,
    mobileReview,
    desktopReview,
    previewSettings,
    comments,
    currentStep,
    actions,
    error,
  } = useClientFlowStore();

  // Step configuration
  const steps: StepConfig[] = [
    { id: 'landing', title: 'Template Selection', status: 'completed' },
    {
      id: 'desktop',
      title: 'Desktop Review',
      status: desktopReview.status === 'approved' ? 'completed' : 'error',
    },
    { id: 'mobile', title: 'Mobile Review', status: 'current' },
    { id: 'final', title: 'Final Review', status: 'pending' },
  ];

  // Ensure we have required data and desktop is approved
  useEffect(() => {
    if (!selectedTemplate || !websiteData) {
      actions.setCurrentStep(0);
    } else if (desktopReview.status !== 'approved') {
      actions.setCurrentStep(1); // Back to desktop review
    }
  }, [selectedTemplate, websiteData, desktopReview.status, actions]);

  const handleApprove = () => {
    actions.updateReview('mobile', {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewerId: 'current-user',
    });
  };

  const handleReject = () => {
    actions.updateReview('mobile', {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewerId: 'current-user',
      feedback: 'Mobile version rejected',
    });
  };

  const handleRequestChanges = (feedback: string) => {
    actions.updateReview('mobile', {
      status: 'needs_changes',
      reviewedAt: new Date().toISOString(),
      reviewerId: 'current-user',
      feedback,
    });

    // Add comment
    actions.addComment({
      step: 'mobile',
      message: feedback,
      author: 'current-user',
      resolved: false,
    });
  };

  const handleNext = () => {
    if (mobileReview.status === 'approved') {
      actions.nextStep(); // Move to final review
    }
  };

  const handlePrevious = () => {
    actions.previousStep(); // Back to desktop review
  };

  if (!selectedTemplate || !websiteData) {
    return (
      <div className="mobile-review-screen min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert
            message="Missing Data"
            description="Template or website data is missing. Redirecting..."
            type="warning"
            showIcon
          />
        </div>
      </div>
    );
  }

  if (desktopReview.status !== 'approved') {
    return (
      <div className="mobile-review-screen min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert
            message="Desktop Review Required"
            description="Please complete and approve the desktop review before proceeding to mobile review."
            type="warning"
            showIcon
            action={
              <Button size="small" onClick={() => actions.setCurrentStep(1)}>
                Go to Desktop Review
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const mobileComments = comments.filter(
    (comment) => comment.step === 'mobile' || comment.step === 'general'
  );

  return (
    <div className="mobile-review-screen min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <NavigationStepper
            currentStep={currentStep}
            totalSteps={4}
            steps={steps}
            onStepClick={(step) => {
              // Allow navigation to completed steps only
              if (
                step < currentStep ||
                (step === 1 && desktopReview.status === 'approved')
              ) {
                actions.setCurrentStep(step);
              }
            }}
          />
        </div>

        {/* Error Alert */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preview Area */}
          <div className="lg:col-span-2">
            <Card
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MobileOutlined />
                    <span>Mobile Preview - {selectedTemplate.name}</span>
                  </div>
                  <Space>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Touch Mode</span>
                      <Switch
                        checked={previewSettings.interactive}
                        onChange={(checked) =>
                          actions.updatePreviewSettings({
                            interactive: checked,
                          })
                        }
                        size="small"
                      />
                    </div>
                  </Space>
                </div>
              }
              className="h-full"
            >
              <div className="flex justify-center">
                <BrowserPreview
                  viewport="mobile"
                  websiteBackground={websiteData}
                  popupTemplate={selectedTemplate}
                  showBrowserChrome={previewSettings.showBrowserChrome}
                  interactive={previewSettings.interactive}
                  scale={previewSettings.scale}
                  onPopupInteraction={(action) => {
                    console.log('Mobile popup interaction:', action);
                  }}
                />
              </div>

              {/* Mobile-specific Info */}
              <Divider />
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <strong>Viewport:</strong> Mobile (375 × 667)
                </div>
                <div>
                  <strong>Device:</strong> iPhone Simulation
                </div>
                <div>
                  <strong>Touch:</strong>{' '}
                  {previewSettings.interactive ? 'Enabled' : 'Disabled'}
                </div>
                <div>
                  <strong>Orientation:</strong> Portrait
                </div>
              </div>

              {/* Mobile Testing Tips */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Mobile Testing Tips
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Check if popup content is readable on small screens</li>
                  <li>
                    • Ensure buttons are large enough for touch interaction
                  </li>
                  <li>• Verify popup doesn't cover critical website content</li>
                  <li>• Test scrolling behavior if popup is tall</li>
                </ul>
              </div>
            </Card>
          </div>

          {/* Review Controls */}
          <div className="space-y-6">
            {/* Review Card */}
            <ReviewCard
              title="Mobile Review"
              status={mobileReview}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestChanges={handleRequestChanges}
              comments={mobileComments}
            />

            {/* Mobile-Specific Guidelines */}
            <Card title="Mobile Review Guidelines" size="small">
              <div className="text-sm space-y-2">
                <p>
                  <strong>Mobile-specific checks:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Touch target size (min 44px)</li>
                  <li>Text legibility on small screens</li>
                  <li>Popup positioning and scrolling</li>
                  <li>Content hierarchy and priority</li>
                  <li>Loading performance</li>
                  <li>Responsive behavior</li>
                </ul>
              </div>
            </Card>

            {/* Comparison with Desktop */}
            <Card title="Desktop vs Mobile" size="small">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Desktop Status:</span>
                  <span className="text-green-600 font-medium">
                    {desktopReview.status === 'approved'
                      ? '✓ Approved'
                      : desktopReview.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mobile Status:</span>
                  <span
                    className={`font-medium ${
                      mobileReview.status === 'approved'
                        ? 'text-green-600'
                        : mobileReview.status === 'rejected'
                          ? 'text-red-600'
                          : mobileReview.status === 'needs_changes'
                            ? 'text-orange-600'
                            : 'text-gray-600'
                    }`}
                  >
                    {mobileReview.status === 'approved'
                      ? '✓ Approved'
                      : mobileReview.status === 'rejected'
                        ? '✗ Rejected'
                        : mobileReview.status === 'needs_changes'
                          ? '⚠ Needs Changes'
                          : '⏳ Pending'}
                  </span>
                </div>

                {desktopReview.reviewedAt && (
                  <div className="text-xs text-gray-500 mt-2">
                    Desktop reviewed:{' '}
                    {new Date(desktopReview.reviewedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </Card>

            {/* Device Simulation */}
            <Card title="Device Options" size="small">
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span>Simulated Device:</span>
                    <span className="text-gray-600">iPhone</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Currently showing iPhone-sized viewport. Other device sizes
                    can be added in future updates.
                  </div>
                </div>

                <Button
                  icon={<RotateRightOutlined />}
                  size="small"
                  disabled
                  className="w-full"
                >
                  Rotate to Landscape (Coming Soon)
                </Button>
              </div>
            </Card>

            {/* Navigation */}
            <Card title="Navigation" size="small">
              <Space direction="vertical" className="w-full">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={handlePrevious}
                  className="w-full"
                >
                  Back to Desktop Review
                </Button>

                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  onClick={handleNext}
                  disabled={mobileReview.status !== 'approved'}
                  className="w-full"
                >
                  Continue to Final Review
                </Button>

                {mobileReview.status !== 'approved' && (
                  <p className="text-xs text-orange-600 text-center">
                    Please approve the mobile version to continue
                  </p>
                )}
              </Space>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
