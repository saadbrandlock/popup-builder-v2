import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Alert, Divider, Tabs, Badge, Modal } from 'antd';
import { 
  CheckCircleOutlined, 
  DownloadOutlined, 
  SendOutlined, 
  EyeOutlined, 
  CommentOutlined,
} from '@ant-design/icons';
import { BaseProps } from '../../../types/props';
import { BrowserPreview } from '../components/BrowserPreview';
import { ReviewCard } from '../components/ReviewCard';
import { NavigationStepper } from '../components/NavigationStepper';
import { useClientFlowStore } from '../../../stores/clientFlowStore';
import type { StepConfig } from '../types/clientFlow';

/**
 * ReviewScreen - Final review screen showing side-by-side desktop and mobile previews
 * Allows final approval and submission of the complete review
 * Now extends BaseProps for consistency with project patterns
 */
interface ReviewScreenProps extends BaseProps {}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({}) => {
  const {
    selectedTemplate,
    websiteData,
    desktopReview,
    mobileReview,
    finalReview,
    previewSettings,
    comments,
    currentStep,
    actions,
    error,
  } = useClientFlowStore();

  const [activeTab, setActiveTab] = useState<
    'side-by-side' | 'desktop' | 'mobile'
  >('side-by-side');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Step configuration
  const steps: StepConfig[] = [
    { id: 'landing', title: 'Template Selection', status: 'completed' },
    {
      id: 'desktop',
      title: 'Desktop Review',
      status: desktopReview.status === 'approved' ? 'completed' : 'error',
    },
    {
      id: 'mobile',
      title: 'Mobile Review',
      status: mobileReview.status === 'approved' ? 'completed' : 'error',
    },
    { id: 'final', title: 'Final Review', status: 'current' },
  ];

  // Ensure we have required data and both reviews are approved
  useEffect(() => {
    if (!selectedTemplate || !websiteData) {
      actions.setCurrentStep(0);
    } else if (desktopReview.status !== 'approved') {
      actions.setCurrentStep(1);
    } else if (mobileReview.status !== 'approved') {
      actions.setCurrentStep(2);
    }
  }, [
    selectedTemplate,
    websiteData,
    desktopReview.status,
    mobileReview.status,
    actions,
  ]);

  const handleFinalApprove = () => {
    actions.updateReview('final', {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewerId: 'current-user',
    });
  };

  const handleFinalReject = () => {
    actions.updateReview('final', {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewerId: 'current-user',
      feedback: 'Final review rejected',
    });
  };

  const handleRequestChanges = (feedback: string) => {
    actions.updateReview('final', {
      status: 'needs_changes',
      reviewedAt: new Date().toISOString(),
      reviewerId: 'current-user',
      feedback,
    });

    actions.addComment({
      step: 'final',
      message: feedback,
      author: 'current-user',
      resolved: false,
    });
  };

  const handleSubmitReview = () => {
    if (finalReview.status === 'approved') {
      setShowSubmitModal(true);
    }
  };

  const handleConfirmSubmit = () => {
    // TODO: Implement actual submission logic
    console.log('Submitting review:', {
      template: selectedTemplate,
      website: websiteData,
      reviews: {
        desktop: desktopReview,
        mobile: mobileReview,
        final: finalReview,
      },
      comments: comments,
    });

    setShowSubmitModal(false);
    // Could redirect to success page or show success message
    Modal.success({
      title: 'Review Submitted Successfully',
      content:
        'Your template review has been submitted and will be processed shortly.',
    });
  };

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log('Exporting review report');
  };

  if (!selectedTemplate || !websiteData) {
    return (
      <div className="review-screen min-h-screen bg-gray-50 p-6">
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

  if (
    desktopReview.status !== 'approved' ||
    mobileReview.status !== 'approved'
  ) {
    return (
      <div className="review-screen min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert
            message="Previous Reviews Required"
            description="Please complete and approve both desktop and mobile reviews before proceeding to final review."
            type="warning"
            showIcon
            action={
              <Space>
                {desktopReview.status !== 'approved' && (
                  <Button
                    size="small"
                    onClick={() => actions.setCurrentStep(1)}
                  >
                    Desktop Review
                  </Button>
                )}
                {mobileReview.status !== 'approved' && (
                  <Button
                    size="small"
                    onClick={() => actions.setCurrentStep(2)}
                  >
                    Mobile Review
                  </Button>
                )}
              </Space>
            }
          />
        </div>
      </div>
    );
  }

  const allComments = comments.filter(
    (comment) => comment.step === 'final' || comment.step === 'general'
  );
  const totalComments = comments.length;
  const unresolvedComments = comments.filter((c) => !c.resolved).length;

  return (
    <div className="review-screen min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <NavigationStepper
            currentStep={currentStep}
            totalSteps={4}
            steps={steps}
            onStepClick={(step) => {
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Preview Area */}
          <div className="lg:col-span-3">
            <Card
              title={
                <div className="flex items-center justify-between">
                  <span>Final Review - {selectedTemplate.name}</span>
                  <Space>
                    <Badge count={unresolvedComments} size="small">
                      <Button icon={<CommentOutlined />} size="small">
                        Comments
                      </Button>
                    </Badge>
                    <Button icon={<EyeOutlined />} size="small">
                      Fullscreen
                    </Button>
                  </Space>
                </div>
              }
              className="h-full"
            >
              <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as any)}
                items={[
                  {
                    key: 'side-by-side',
                    label: 'Side by Side',
                    children: (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                          {/* Desktop Preview */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-lg font-medium">Desktop</h3>
                              <Badge
                                status="success"
                                text="Approved"
                                className="text-green-600"
                              />
                            </div>
                            <div className="border rounded-lg p-4 bg-white">
                              <BrowserPreview
                                viewport="desktop"
                                websiteBackground={websiteData}
                                popupTemplate={selectedTemplate}
                                showBrowserChrome={true}
                                interactive={false}
                                scale={0.6}
                                onPopupInteraction={(action) => {
                                  console.log('Desktop interaction:', action);
                                }}
                              />
                            </div>
                          </div>

                          {/* Mobile Preview */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-lg font-medium">Mobile</h3>
                              <Badge
                                status="success"
                                text="Approved"
                                className="text-green-600"
                              />
                            </div>
                            <div className="border rounded-lg p-4 bg-white flex justify-center">
                              <BrowserPreview
                                viewport="mobile"
                                websiteBackground={websiteData}
                                popupTemplate={selectedTemplate}
                                showBrowserChrome={true}
                                interactive={false}
                                scale={0.8}
                                onPopupInteraction={(action) => {
                                  console.log('Mobile interaction:', action);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'desktop',
                    label: 'Desktop Only',
                    children: (
                      <div className="flex justify-center">
                        <BrowserPreview
                          viewport="desktop"
                          websiteBackground={websiteData}
                          popupTemplate={selectedTemplate}
                          showBrowserChrome={previewSettings.showBrowserChrome}
                          interactive={previewSettings.interactive}
                          scale={previewSettings.scale}
                          onPopupInteraction={(action) => {
                            console.log('Desktop interaction:', action);
                          }}
                        />
                      </div>
                    ),
                  },
                  {
                    key: 'mobile',
                    label: 'Mobile Only',
                    children: (
                      <div className="flex justify-center">
                        <BrowserPreview
                          viewport="mobile"
                          websiteBackground={websiteData}
                          popupTemplate={selectedTemplate}
                          showBrowserChrome={previewSettings.showBrowserChrome}
                          interactive={previewSettings.interactive}
                          scale={previewSettings.scale}
                          onPopupInteraction={(action) => {
                            console.log('Mobile interaction:', action);
                          }}
                        />
                      </div>
                    ),
                  },
                ]}
              />

              {/* Review Summary */}
              <Divider />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <CheckCircleOutlined className="text-green-600 text-lg mb-1" />
                  <div className="font-medium">Desktop Approved</div>
                  <div className="text-gray-600 text-xs">
                    {desktopReview.reviewedAt &&
                      new Date(desktopReview.reviewedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <CheckCircleOutlined className="text-green-600 text-lg mb-1" />
                  <div className="font-medium">Mobile Approved</div>
                  <div className="text-gray-600 text-xs">
                    {mobileReview.reviewedAt &&
                      new Date(mobileReview.reviewedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <CommentOutlined className="text-blue-600 text-lg mb-1" />
                  <div className="font-medium">{totalComments} Comments</div>
                  <div className="text-gray-600 text-xs">
                    {unresolvedComments} unresolved
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Final Review Controls */}
          <div className="space-y-6">
            {/* Final Review Card */}
            <ReviewCard
              title="Final Review"
              status={finalReview}
              onApprove={handleFinalApprove}
              onReject={handleFinalReject}
              onRequestChanges={handleRequestChanges}
              comments={allComments}
            />

            {/* Review Summary */}
            <Card title="Review Summary" size="small">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>Template:</span>
                  <span className="font-medium">{selectedTemplate.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Client:</span>
                  <span className="font-medium">{websiteData.companyName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Desktop:</span>
                  <Badge status="success" text="Approved" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Mobile:</span>
                  <Badge status="success" text="Approved" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Comments:</span>
                  <span>
                    {totalComments} total, {unresolvedComments} unresolved
                  </span>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card title="Actions" size="small">
              <Space direction="vertical" className="w-full">
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExportReport}
                  className="w-full"
                >
                  Export Report
                </Button>

                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSubmitReview}
                  disabled={finalReview.status !== 'approved'}
                  className="w-full"
                  size="large"
                >
                  Submit Review
                </Button>

                {finalReview.status !== 'approved' && (
                  <p className="text-xs text-orange-600 text-center">
                    Please approve the final review to submit
                  </p>
                )}
              </Space>
            </Card>

            {/* Back Navigation */}
            <Card title="Navigation" size="small">
              <Space direction="vertical" className="w-full">
                <Button
                  onClick={() => actions.setCurrentStep(2)}
                  className="w-full"
                >
                  Back to Mobile Review
                </Button>
                <Button
                  onClick={() => actions.setCurrentStep(1)}
                  className="w-full"
                >
                  Back to Desktop Review
                </Button>
                <Button
                  onClick={() => actions.setCurrentStep(0)}
                  className="w-full"
                >
                  Back to Template Selection
                </Button>
              </Space>
            </Card>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        <Modal
          title="Submit Review"
          open={showSubmitModal}
          onOk={handleConfirmSubmit}
          onCancel={() => setShowSubmitModal(false)}
          okText="Submit"
          cancelText="Cancel"
        >
          <div className="space-y-4">
            <p>Are you sure you want to submit this review?</p>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <div>
                <strong>Template:</strong> {selectedTemplate.name}
              </div>
              <div>
                <strong>Client:</strong> {websiteData.companyName}
              </div>
              <div>
                <strong>Desktop Status:</strong>{' '}
                <span className="text-green-600">Approved</span>
              </div>
              <div>
                <strong>Mobile Status:</strong>{' '}
                <span className="text-green-600">Approved</span>
              </div>
              <div>
                <strong>Final Status:</strong>{' '}
                <span className="text-green-600">Approved</span>
              </div>
              <div>
                <strong>Total Comments:</strong> {totalComments}
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Once submitted, this review will be processed and the client will
              be notified.
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
};
