import React, { useEffect } from 'react';
import { Row, Col, Card } from 'antd';
import ContentForm from '../components/content-form';
import ShopperDetails from '../components/shopper-details';
import { PopupPreviewTabs, BrowserPreviewModal } from '../../../components/common';
import FeedbackForm from '../components/feedback-form';
import { useGenericStore } from '@/stores/generic.store';
import { useClientFlow } from '../hooks/use-client-flow';
import { useDevicesStore } from '@/stores/common/devices.store';
import { useClientFlowStore } from '@/stores/clientFlowStore';
import ShopperSegmentSelector from '../components/shopper-segment-selector';

/**
 * CopyReview Screen - Step 3 of the client flow
 * Allows clients to review and customize coupon copy for different scenarios
 * Redesigned with 2-column layout for better space utilization
 */
export const CopyReview: React.FC = () => {
  const { devices } = useDevicesStore();
  const { getDevices } = useClientFlow();
  const { clientData, activeContentShopper } = useClientFlowStore();
  const activeShopperId = activeContentShopper?.content?.id != null ? Number(activeContentShopper.content.id) : null;

  useEffect(() => {
    if (devices.length > 0) return;
    getDevices();
  }, []);

  return (
    <div className="copy-review-container">
      {/* Main 2-Column Layout - Responsive */}
      <Row gutter={[16, 16]}>
        {/* LEFT COLUMN - 35% on desktop */}
        <Col 
          xs={24}
          md={24}
          lg={9}
          xl={8}
          xxl={7}
        >
           <Card className="mb-4" title={'Select Shopper'}>
          <ShopperSegmentSelector compact />
          </Card>
          {/* Shopper Details - Collapsible, Open by Default */}
          <div className="mb-4">
            <ShopperDetails displayMode="full" />
          </div>
          
          {/* Content Configuration Form */}
          <Card>
            <ContentForm />
          </Card>
        </Col>

        {/* RIGHT COLUMN - 65% on desktop */}
        <Col 
          xs={24}
          md={24}
          lg={15}
          xl={16}
          xxl={17}
        >
          {/* Popup Preview with Desktop/Mobile Tabs - Takes full height */}
          <Card className="h-full">
            <PopupPreviewTabs clientData={clientData} activeShopperId={activeShopperId} />
          </Card>

          <Card className='mt-6'>
            <FeedbackForm type="copy-review" />
          </Card>
        </Col>
      </Row>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 991px) {
          .copy-review-container .ant-col {
            margin-bottom: 16px;
          }
        }
        
        @media (min-width: 992px) {
          .copy-review-container .ant-row {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};
