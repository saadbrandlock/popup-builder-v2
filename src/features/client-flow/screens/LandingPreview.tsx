import React, { useEffect } from 'react';
import { Card, Button, Alert, Row, Col } from 'antd';
import {
  HighlightOutlined,
  MobileOutlined,
  TeamOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { BaseProps } from '../../../types/props';
import {
  BrowserPreview,
  BrowserPreviewSkeleton,
} from '../components/BrowserPreview';
import { useClientFlowStore } from '../../../stores/clientFlowStore';
import { useClientData } from '../hooks/useClientData';
import { useTemplateData } from '../hooks/useTemplateData';
import { getFallbackWebsiteData } from '../hooks/useClientData';
import type { ViewportType } from '../types/clientFlow';

/**
 * LandingPreview - Initial screen showing template preview in browser context
 * Shows hero section with preview area and template selection
 * Now extends BaseProps for consistency with project patterns
 */
interface LandingPreviewProps extends BaseProps {}

export const LandingPreview: React.FC<LandingPreviewProps> = ({}) => {
  // TODO: Integrate BaseProps with API calls and navigation
  // For now, these props are available for future API integration
  const { actions, error } = useClientFlowStore();
  const {
    clientData,
    websiteData,
    loading: clientLoading,
    getRandomClientData,
  } = useClientData();
  const {
    templates,
    selectedTemplate,
    loading: templateLoading,
    selectTemplate,
    getRandomTemplate,
  } = useTemplateData();

  // Fixed desktop preview for landing page
  const viewport: ViewportType = 'desktop';

  // Auto-load demo data on mount
  useEffect(() => {
    if (!clientData) {
      getRandomClientData();
    }
    if (!selectedTemplate && templates.length === 0) {
      // Templates will be loaded by useTemplateData hook
    }
  }, [clientData, selectedTemplate, templates.length, getRandomClientData]);

  // Auto-select first template when available
  useEffect(() => {
    if (!selectedTemplate && templates.length > 0) {
      selectTemplate(templates[0].id);
    }
  }, [templates, selectedTemplate, selectTemplate]);

  const isLoading = clientLoading || templateLoading;
  const websiteDataToUse = websiteData || getFallbackWebsiteData();

  const handleStartReview = () => {
    if (selectedTemplate && websiteDataToUse) {
      actions.setSelectedTemplate(selectedTemplate);
      actions.setWebsiteData(websiteDataToUse);
      actions.nextStep(); // Move to desktop review
    }
  };

  return (
    <div className="landing-preview-screen min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            <span>Your Coupon Module</span>
            <br />
            <span className="text-blue-600">Is Ready for Review</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            We've created a customized coupon popup using your website’s colors
            and fonts. Review and approve the design to proceed with
            implementation across all shopper groups.
          </p>
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

        <Row gutter={[16, 16]}>
          {/* Left: Feature cards and steps */}
          <Col xs={24} md={6}>
            <div className="space-y-4">
              <Card className="shadow-sm">
                <div className="flex gap-4">
                  <div className="shrink-0 h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <HighlightOutlined />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Brand-Matched Design
                    </div>
                    <div className="text-sm text-gray-600">
                      Automatically styled with your website's colors, fonts,
                      and visual identity.
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="shadow-sm">
                <div className="flex gap-4">
                  <div className="shrink-0 h-10 w-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                    <MobileOutlined />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Responsive Design
                    </div>
                    <div className="text-sm text-gray-600">
                      Optimized for desktop, tablet, and mobile devices.
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="shadow-sm">
                <div className="flex gap-4">
                  <div className="shrink-0 h-10 w-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                    <TeamOutlined />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Multi-Shopper Support
                    </div>
                    <div className="text-sm text-gray-600">
                      Tailored messaging for different customer behaviors and
                      needs.
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Next Steps" className="shadow-sm">
                <ol className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold">
                      1
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">
                        Review Desktop Design
                      </div>
                      <div className="text-sm text-gray-600">
                        Confirm the desktop popup layout and styling.
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold">
                      2
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">
                        Review Mobile Design
                      </div>
                      <div className="text-sm text-gray-600">
                        Ensure mobile responsiveness meets your standards.
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold">
                      3
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">
                        Approve Shopper Content
                      </div>
                      <div className="text-sm text-gray-600">
                        Review messaging for all shopper segments.
                      </div>
                    </div>
                  </li>
                </ol>
              </Card>
            </div>
          </Col>

          {/* Right: Live Preview only */}
          <Col xs={24} md={18}>
            <div>
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-900">
                  Live Preview
                </div>
                <div className="text-xs text-gray-500">
                  See how your coupon popup looks on your website
                </div>
              </div>

              <Card className="shadow-sm">
                <div className="flex justify-center">
                  {isLoading ? (
                    <BrowserPreviewSkeleton viewport={viewport} />
                  ) : selectedTemplate && websiteDataToUse ? (
                    <BrowserPreview
                      viewport={viewport}
                      websiteBackground={websiteDataToUse}
                      popupTemplate={selectedTemplate}
                      showBrowserChrome={true}
                      interactive={false}
                      scale={0.9}
                      onPopupInteraction={(action) => {
                        console.log('Popup interaction:', action);
                      }}
                    />
                  ) : (
                    <BrowserPreviewSkeleton viewport={viewport} />
                  )}
                </div>
              </Card>
            </div>
          </Col>
        </Row>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <Button
            type="primary"
            size="large"
            onClick={handleStartReview}
            disabled={!selectedTemplate || !websiteDataToUse}
            icon={<RightOutlined />}
          >
            Let's Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};
