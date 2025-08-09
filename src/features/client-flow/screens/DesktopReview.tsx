import React, { useEffect } from 'react';
import { Card, Button, Space, Alert, Divider } from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { BaseProps } from '../../../types/props';
import { BrowserPreview } from '../components/BrowserPreview';
import { ReviewCard } from '../components/ReviewCard';
import { NavigationStepper } from '../components/NavigationStepper';
import { useClientFlowStore } from '../../../stores/clientFlowStore';
import type { StepConfig } from '../types/clientFlow';

/**
 * DesktopReview - Step 1 - Desktop review screen
 * Shows popup preview in desktop viewport with review controls
 * Now extends BaseProps for consistency with project patterns
 */
interface DesktopReviewProps {}

export const DesktopReview: React.FC<DesktopReviewProps> = ({}) => {
  // TODO: Integrate BaseProps with API calls and navigation
  // For now, these props are available for future API integration
  const {
    selectedTemplate,
    websiteData,
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
    { id: 'desktop', title: 'Desktop Review', status: 'current' },
    { id: 'mobile', title: 'Mobile Review', status: 'pending' },
    { id: 'final', title: 'Final Review', status: 'pending' },
  ];

  // Ensure we have required data
  useEffect(() => {
    if (!selectedTemplate || !websiteData) {
      // Redirect back to landing if missing data
      actions.setCurrentStep(0);
    }
  }, [selectedTemplate, websiteData, actions]);

  const handleApprove = () => {
    actions.updateReview('desktop', {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewerId: 'current-user', // TODO: Get from auth context
    });
  };

  const handleReject = () => {
    actions.updateReview('desktop', {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewerId: 'current-user',
      feedback: 'Desktop version rejected',
    });
  };

  const handleRequestChanges = (feedback: string) => {
    actions.updateReview('desktop', {
      status: 'needs_changes',
      reviewedAt: new Date().toISOString(),
      reviewerId: 'current-user',
      feedback,
    });

    // Add comment
    actions.addComment({
      step: 'desktop',
      message: feedback,
      author: 'current-user',
      resolved: false,
    });
  };

  const handleNext = () => {
    if (desktopReview.status === 'approved') {
      actions.nextStep(); // Move to mobile review
    }
  };

  const handlePrevious = () => {
    actions.previousStep(); // Back to landing
  };

  const handleZoomIn = () => {
    const newScale = Math.min(previewSettings.scale + 0.1, 1);
    actions.updatePreviewSettings({ scale: newScale });
  };

  const handleZoomOut = () => {
    const newScale = Math.max(previewSettings.scale - 0.1, 0.3);
    actions.updatePreviewSettings({ scale: newScale });
  };

  if (!selectedTemplate || !websiteData) {
    return (
      <div className="desktop-review-screen min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert
            message="Missing Data"
            description="Template or website data is missing. Redirecting to template selection..."
            type="warning"
            showIcon
          />
        </div>
      </div>
    );
  }

  const desktopComments = comments.filter(
    (comment) => comment.step === 'desktop' || comment.step === 'general'
  );

  return (
    <div className="desktop-review-screen min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <NavigationStepper
            currentStep={currentStep}
            totalSteps={4}
            steps={steps}
            onStepClick={(step) => {
              // Allow navigation to completed steps only
              if (step < currentStep) {
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
                  <span>Desktop Preview - {selectedTemplate.name}</span>
                  <Space>
                    <Button
                      icon={<ZoomOutOutlined />}
                      onClick={handleZoomOut}
                      disabled={previewSettings.scale <= 0.3}
                      size="small"
                    />
                    <span className="text-sm text-gray-600">
                      {Math.round(previewSettings.scale * 100)}%
                    </span>
                    <Button
                      icon={<ZoomInOutlined />}
                      onClick={handleZoomIn}
                      disabled={previewSettings.scale >= 1}
                      size="small"
                    />
                  </Space>
                </div>
              }
              className="h-full"
            >
              <div className="flex justify-center">
                <BrowserPreview
                  viewport="desktop"
                  websiteBackground={websiteData}
                  popupTemplate={selectedTemplate}
                  showBrowserChrome={previewSettings.showBrowserChrome}
                  interactive={true}
                  scale={previewSettings.scale}
                  onPopupInteraction={(action) => {
                    console.log('Desktop popup interaction:', action);
                  }}
                />
              </div>

              {/* Preview Info */}
              <Divider />
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <strong>Viewport:</strong> Desktop (1200 × 800)
                </div>
                <div>
                  <strong>Template:</strong> {selectedTemplate.name}
                </div>
                <div>
                  <strong>Website:</strong> {websiteData.websiteUrl}
                </div>
                <div>
                  <strong>Company:</strong> {websiteData.companyName}
                </div>
              </div>
            </Card>
          </div>

          {/* Review Controls */}
          <div className="space-y-6">
            {/* Review Card */}
            <ReviewCard
              title="Desktop Review"
              status={desktopReview}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestChanges={handleRequestChanges}
              comments={desktopComments}
            />

            {/* Review Guidelines */}
            <Card title="Review Guidelines" size="small">
              <div className="text-sm space-y-2">
                <p>
                  <strong>Check for:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Popup positioning and visibility</li>
                  <li>Text readability and contrast</li>
                  <li>Button accessibility and size</li>
                  <li>Overall design consistency</li>
                  <li>Brand color alignment</li>
                  <li>Content accuracy</li>
                </ul>
              </div>
            </Card>

            {/* Template Details */}
            <Card title="Template Details" size="small">
              <div className="text-sm space-y-2">
                <div>
                  <strong>Name:</strong> {selectedTemplate.name}
                </div>
                <div>
                  <strong>Description:</strong> {selectedTemplate.description}
                </div>
                <div>
                  <strong>Status:</strong> {selectedTemplate.status}
                </div>
                <div>
                  <strong>Created:</strong>{' '}
                  {new Date(selectedTemplate.created_at).toLocaleDateString()}
                </div>
                {selectedTemplate.updated_at && (
                  <div>
                    <strong>Updated:</strong>{' '}
                    {new Date(selectedTemplate.updated_at).toLocaleDateString()}
                  </div>
                )}
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
                  Back to Template Selection
                </Button>

                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  onClick={handleNext}
                  disabled={desktopReview.status !== 'approved'}
                  className="w-full"
                >
                  Continue to Mobile Review
                </Button>

                {desktopReview.status !== 'approved' && (
                  <p className="text-xs text-orange-600 text-center">
                    Please approve the desktop version to continue
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
