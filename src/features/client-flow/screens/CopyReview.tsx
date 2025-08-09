import React, { useState } from 'react';
import { Card, Button, Alert, Select, Input, Divider, Row, Col } from 'antd';
import {
  EditOutlined,
  DesktopOutlined,
  MobileOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { BaseProps } from '../../../types/props';
import { useClientFlowStore } from '../../../stores/clientFlowStore';

const { TextArea } = Input;
const { Option } = Select;

/**
 * CopyReview Screen - Step 3 of the client flow
 * Allows clients to review and customize coupon copy for different scenarios
 */
interface CopyReviewProps {
  // Additional props specific to copy review can be added here
}

export const CopyReview: React.FC<CopyReviewProps> = () => {
  const { actions, error } = useClientFlowStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>(
    'desktop'
  );
  const [feedback, setFeedback] = useState('');

  // Copy configuration state
  const [copyConfig, setCopyConfig] = useState({
    headerText: "Don't miss out on your savings!",
    subHeaderText: 'Here are the best available coupons for you',
    couponReminderTab: '5% Coupon',
    declineText: 'No, Thank you',
    copySuccessMessage:
      'Coupon has been successfully copied! Please remember to apply it',
    applySuccessMessage: 'Coupon has been successfully applied!',
  });

  // Available copy options (these would typically come from API)
  const copyOptions = {
    headerText: [
      "Don't miss out on your savings!",
      'Special offer just for you!',
      'Limited time coupon available!',
      'Save big with these exclusive deals!',
    ],
    subHeaderText: [
      'Here are the best available coupons for you',
      'Choose from our top coupon offers',
      'Get instant savings with these coupons',
      'Exclusive deals tailored for you',
    ],
    couponReminderTab: [
      '5% Coupon',
      '10% Off',
      'Free Shipping',
      'Buy One Get One',
    ],
    declineText: [
      'No, Thank you',
      'Maybe later',
      'Not interested',
      'Skip this offer',
    ],
    copySuccessMessage: [
      'Coupon has been successfully copied! Please remember to apply it',
      "Code copied! Don't forget to paste it at checkout",
      'Success! Your coupon code is ready to use',
      'Copied to clipboard! Apply at checkout for savings',
    ],
    applySuccessMessage: [
      'Coupon has been successfully applied!',
      'Great! Your discount has been applied',
      'Success! Savings applied to your order',
      'Discount activated! Enjoy your savings',
    ],
  };

  const handleNext = async () => {
    try {
      setIsSubmitting(true);

      // Save copy configuration (extend store to include copy config if needed)
      // For now, we'll just proceed to next step
      actions.setCurrentStep(3); // Move to ReviewScreen (final step)
    } catch (error) {
      console.error('Copy review failed:', error);
      actions.setError('Failed to save copy configuration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    actions.setCurrentStep(1); // Go back to MobileReview
  };

  const handleCopyChange = (field: string, value: string) => {
    setCopyConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWrongCouponBehavior = () => {
    // This would typically open a modal or navigate to behavior configuration
    console.log('Configure wrong coupon behavior');
  };

  return (
    <div className="copy-review-container">
      <Row gutter={24}>
        {/* Left Column - Review Steps & Configuration */}
        <Col xs={24} lg={14}>
          <Card className="mb-6">
            <div className="flex items-center mb-6">
              <EditOutlined className="text-2xl text-blue-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  Coupon Module Review
                </h2>
                <p className="text-gray-600">
                  Review and customize coupon copy for different scenarios
                </p>
              </div>
            </div>

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

            {/* Review Steps Progress */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Review Steps
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircleOutlined className="text-green-500 mr-2" />
                  <span className="text-gray-600">
                    Confirm Desktop Module Design
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircleOutlined className="text-green-500 mr-2" />
                  <span className="text-gray-600">
                    Confirm Mobile Module Design
                  </span>
                </div>
                <div className="flex items-center text-sm font-medium">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-2 flex items-center justify-center">
                    <span className="text-white text-xs">3</span>
                  </div>
                  <span className="text-blue-600">
                    Confirm copy for: Wrong Coupon Shopper
                  </span>
                </div>
              </div>
            </div>

            {/* Wrong Coupon Shopper Copy Section */}
            <Card
              size="small"
              className="mb-6"
              title="3a. Wrong Coupon Shopper Copy"
            >
              <div className="mb-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
                <strong>Context:</strong> User is ready to purchase but has had
                a frustrating experience as the coupon they had is invalid.
                Users at this point at half as likely to convert due to
                frustration. We need to give them a coupon that works and assure
                they they have the best coupon here.
              </div>

              <div className="mb-4">
                <Button
                  type="primary"
                  onClick={handleWrongCouponBehavior}
                  className="mb-4"
                >
                  Wrong Coupon Behavior
                </Button>
                <Button type="link" size="small" className="ml-2">
                  View Solution
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Text
                  </label>
                  <Select
                    value={copyConfig.headerText}
                    onChange={(value) => handleCopyChange('headerText', value)}
                    className="w-full"
                  >
                    {copyOptions.headerText.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub-Header Text
                  </label>
                  <Select
                    value={copyConfig.subHeaderText}
                    onChange={(value) =>
                      handleCopyChange('subHeaderText', value)
                    }
                    className="w-full"
                  >
                    {copyOptions.subHeaderText.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Reminder Tab
                  </label>
                  <Select
                    value={copyConfig.couponReminderTab}
                    onChange={(value) =>
                      handleCopyChange('couponReminderTab', value)
                    }
                    className="w-full"
                  >
                    {copyOptions.couponReminderTab.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Decline Text
                  </label>
                  <Select
                    value={copyConfig.declineText}
                    onChange={(value) => handleCopyChange('declineText', value)}
                    className="w-full"
                  >
                    {copyOptions.declineText.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Copy Success Message
                  </label>
                  <Select
                    value={copyConfig.copySuccessMessage}
                    onChange={(value) =>
                      handleCopyChange('copySuccessMessage', value)
                    }
                    className="w-full"
                  >
                    {copyOptions.copySuccessMessage.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apply Success Message
                  </label>
                  <Select
                    value={copyConfig.applySuccessMessage}
                    onChange={(value) =>
                      handleCopyChange('applySuccessMessage', value)
                    }
                    className="w-full"
                  >
                    {copyOptions.applySuccessMessage.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provide any feedback for the Brandlock team
                </label>
                <TextArea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts, suggestions, or concerns..."
                  rows={4}
                  className="w-full"
                />
              </div>
            </Card>

            <Divider />

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <Button size="large" onClick={handleBack} disabled={isSubmitting}>
                Back to Mobile Review
              </Button>

              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">Step 3 of 4</span>
                <Button
                  type="primary"
                  size="large"
                  loading={isSubmitting}
                  onClick={handleNext}
                  className="bg-green-600 hover:bg-green-700 border-green-600"
                >
                  Save and Next
                </Button>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right Column - Preview */}
        <Col xs={24} lg={10}>
          <Card className="sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Preview</h3>
              <div className="flex items-center space-x-2">
                <Button
                  size="small"
                  type={previewDevice === 'desktop' ? 'primary' : 'default'}
                  icon={<DesktopOutlined />}
                  onClick={() => setPreviewDevice('desktop')}
                >
                  Desktop
                </Button>
                <Button
                  size="small"
                  type={previewDevice === 'mobile' ? 'primary' : 'default'}
                  icon={<MobileOutlined />}
                  onClick={() => setPreviewDevice('mobile')}
                >
                  Mobile
                </Button>
              </div>
            </div>

            {/* Popup Preview */}
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-100 px-3 py-2 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-white rounded px-2 py-1 text-xs text-gray-600">
                  https://your-website.com
                </div>
              </div>

              <div className="bg-gray-50 p-4" style={{ minHeight: '400px' }}>
                {/* Use existing PopupPreview component */}
                <div className="h-full">
                  {/* For now showing a placeholder - will integrate with actual PopupPreview */}
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">
                      Preview will show here
                    </div>
                    <div className="text-sm text-gray-400">
                      Popup with copy: "{copyConfig.headerText}"
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
