import React from 'react';
import { Card, Button, Steps, Alert, Row, Col } from 'antd';
import {
  ClockCircleOutlined,
  ToolOutlined,
  RocketOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Highlighter } from '@/components/magicui/highlighter';
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';
import { Safari } from '@/components/magicui/safari';

const { Step } = Steps;

interface CouponModuleNotReadyProps {
  accountName?: string;
  domain?: string;
  onRefresh?: () => void;
  loading?: boolean;
}

/**
 * CouponModuleNotReady - Placeholder component shown when coupon templates are not ready
 * Displays a beautiful loading/preparation state with progress indicators
 */
export const CouponModuleNotReady: React.FC<CouponModuleNotReadyProps> = ({
  accountName = 'Your Business',
  domain = 'yourwebsite.com',
  onRefresh,
  loading = false,
}) => {
  return (
    <div className="coupon-module-not-ready min-h-screen px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <ClockCircleOutlined className="text-6xl text-blue-500 mb-4" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            <span>
              Your{' '}
              <Highlighter action="highlight" color="#3eb0f7">
                <span className="text-white">Coupon Module</span>
              </Highlighter>
            </span>
            <br />
            <span>Is Being Prepared</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            We're creating a customized coupon popup using {accountName}'s brand
            colors and fonts. This process usually takes few days.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <Card className="shadow-lg border-0">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Preparation Progress
              </h2>
              <p className="text-gray-600">
                We are analyzing your website and creating the perfect coupon
                design
              </p>
            </div>

            <Steps
              current={1}
              size="small"
              className="max-w-4xl mx-auto"
              items={[
                {
                  title: 'Website Analysis',
                  description: 'Analyzing brand colors and fonts',
                  icon: <ToolOutlined />,
                  status: 'finish',
                },
                {
                  title: 'Template Creation',
                  description: 'Generating coupon designs',
                  icon: <RocketOutlined />,
                  status: 'process',
                },
                {
                  title: 'Quality Review',
                  description: 'Ensuring perfect integration',
                  icon: <CheckCircleOutlined />,
                  status: 'wait',
                },
              ]}
            />
          </Card>
        </div>

        {/* Preview Placeholder */}
        <Row gutter={[16, 16]}>
          {/* Left: What's Coming */}
          <Col xs={24} md={8}>
            <Card className="h-full shadow-lg border-0">
              <div className="text-center p-6">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RocketOutlined className="text-2xl text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    What's Coming Next
                  </h3>
                </div>

                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <CheckCircleOutlined className="text-green-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-800">
                        Personalized Design
                      </p>
                      <p className="text-sm text-gray-600">
                        Coupon popup matching your brand identity
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircleOutlined className="text-green-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-800">
                        Mobile Optimized
                      </p>
                      <p className="text-sm text-gray-600">
                        Perfect display on all device types
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircleOutlined className="text-green-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-800">Live Preview</p>
                      <p className="text-sm text-gray-600">
                        See exactly how it looks on your website
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircleOutlined className="text-green-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-800">Easy Approval</p>
                      <p className="text-sm text-gray-600">
                        Simple review and approval process
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Right: Browser Preview Placeholder */}
          <Col xs={24} md={16}>
            <div className="mb-3">
              <div className="text-xl font-medium text-gray-900">
                Preview Coming Soonnn
              </div>
              <div className="text-md text-gray-500">
                Your coupon popup will appear here once ready
              </div>
            </div>

            <div className="relative">
              <Safari
                url={domain}
                imageSrc="https://debuficgraftb.cloudfront.net/dev-staging/KP_1739628284.604344.png"
                fit="contain"
                align="top"
                className="w-full opacity-75"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                  <div className="text-center p-8">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-white mb-2">
                      Preparing Your Preview
                    </p>
                    <p className="text-sm text-white">
                      This will show your actual website with the coupon popup
                    </p>
                  </div>
                </div>
              </Safari>
            </div>
          </Col>
        </Row>

        {/* Action Section */}
        <div className="text-center">
          <div className="space-x-4 mt-6">
            <Button type="default" size="large" className="px-8 py-3 h-auto">
              Contact Support
            </Button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Having issues? Our team is here to help 24/7
          </p>
        </div>
      </div>
    </div>
  );
};

export default CouponModuleNotReady;
