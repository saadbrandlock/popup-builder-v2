import React, { useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Alert,
  Divider,
  Switch,
  Tag,
  Row,
  Col,
} from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  RotateRightOutlined,
  MobileOutlined,
  MobileFilled,
} from '@ant-design/icons';
import { BaseProps } from '../../../types/props';
import {
  BrowserPreview,
  BrowserPreviewSkeleton,
} from '../components/BrowserPreview';
import { ReviewCard } from '../components/ReviewCard';
import { NavigationStepper } from '../components/NavigationStepper';
import { useClientFlowStore } from '../../../stores/clientFlowStore';
import type { StepConfig } from '../types/clientFlow';
import { Clock, Smartphone } from 'lucide-react';
import FeedbackForm from '../components/feedback-form';
import { useGenericStore } from '@/stores/generic.store';
import ReviewActions from '../components/review-actions';

/**
 * MobileReview - Step 2 - Mobile review screen
 * Shows popup preview in mobile viewport with touch-friendly controls
 * Now extends BaseProps for consistency with project patterns
 */
interface MobileReviewProps {}

export const MobileReview: React.FC<MobileReviewProps> = ({}) => {
  const { accountDetails } = useGenericStore();

  return (
    <>
      <Card
        styles={{
          header: {
            backgroundColor: '#EFF6FF',
          },
        }}
        title={
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl flex items-center gap-2">
                <Smartphone className="text-blue-500" />
                <span>Mobile Module Design</span>
              </h1>
              <p className="font-medium text-gray-500">
                Review and approve the mobile coupon module design
              </p>
            </div>
            <div>
              <Tag
                color="volcano"
                className="inline-flex items-center gap-1 text-base"
              >
                <Clock size={16} /> Pending Review
              </Tag>
            </div>
          </div>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Alert
              message="Design Information"
              description="This coupon module design will be used accross your shopper groups. you can edit the design as per your preferences in the next step or edit the content per shopper group."
              type="info"
              showIcon
            />

            <div className="mt-6">
              <FeedbackForm type="mobile" />
            </div>
          </Col>
          <Col xs={24} md={18}>
            <div className="w-full">
              {accountDetails ? (
                <BrowserPreview
                  className="shadow-md"
                  viewport={'mobile'}
                  websiteBackground={{
                    backgroundImage: {
                      desktop:
                        'https://debuficgraftb.cloudfront.net/dev-staging/KP_1739628284.604344.png',
                      mobile:
                        'https://i.ibb.co/dwfFJCCk/Screenshot-2025-08-13-180522.png',
                    },
                    websiteUrl: accountDetails.domain,
                    companyName: accountDetails.name,
                    category: accountDetails.category,
                    clientId: accountDetails.id.toString(),
                    id: accountDetails.id.toString(),
                  }}
                  popupTemplate={''}
                  showBrowserChrome={true}
                  interactive={false}
                  scale={0.9}
                  onPopupInteraction={(action) => {
                    console.log('Popup interaction:', action);
                  }}
                />
              ) : (
                <BrowserPreviewSkeleton viewport={'mobile'} />
              )}
            </div>

            <ReviewActions type="mobile" />
          </Col>
        </Row>
      </Card>
    </>
  );
};
