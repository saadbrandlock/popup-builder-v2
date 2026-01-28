import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Space,
  Divider,
  Switch,
  Tag,
  Row,
  Col,
  Popover,
  Alert,
  Spin,
  Tooltip,
} from 'antd';

import { PopupOnlyView } from '../components/PopupOnlyView';
import { BrowserPreviewModal } from '../components/BrowserPreviewModal';
import { useClientFlowStore } from '../../../stores/clientFlowStore';
import { Clock, Smartphone, Info } from 'lucide-react';
import FeedbackForm from '../components/feedback-form';
import { useGenericStore } from '@/stores/generic.store';
import ReviewActions from '../components/review-actions';
import { ClientFlowData } from '@/types';
import { cn } from '@/lib/utils';

/**
 * MobileReview - Step 2 - Mobile review screen
 * Shows popup preview in mobile viewport with touch-friendly controls
 * Now extends BaseProps for consistency with project patterns
 */
interface MobileReviewProps { }

export const MobileReview: React.FC<MobileReviewProps> = ({ }) => {
  const { accountDetails, navigate, browserPreviewModalOpen, actions: genericActions } = useGenericStore();
  const { clientData, actions } = useClientFlowStore();

  const [template, setTemplate] = useState<ClientFlowData | null>(null);

  const getPreviewTemplate = () => {
    if (clientData && clientData.length) {
      return clientData.filter(
        (template) =>
          template.devices.find((device) => device.device_type === 'mobile') &&
          template.staging_status === 'client-review'
      );
    } else {
      return [];
    }
  };

  const onEditTemplate = () => {
    if (template) {
      navigate(
        `/coupon-builder-v2/user-template-editor/${template.template_id}`
      );
    }
  };

  useEffect(() => {
    if (clientData && clientData.length) {
      const _template = getPreviewTemplate()[0];
      setTemplate(_template);
      actions.setSelectedTemplate(_template);
    }
  }, [clientData]);

  return (
    <>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Card>
            <FeedbackForm type="mobile" />
            </Card>
          </Col>
          <Col xs={24} md={18}>
            <Row gutter={[16, 16]} className="relative" align={'middle'}>
              <Col 
                xs={24} 
                md={15} 
                lg={15} 
                className={cn(
                  'transition-all duration-300 ease-in-out'
                )}
              >
                  <Alert
                    message="This coupon module design will be used across your shopper groups. You can edit the design as per your preferences or edit the content per shopper group in third step."
                    type="info"
                    showIcon
                    className="transition-all duration-300 ease-in-out"
                  />
                
              </Col>
              {template && (
                <Col 
                  xs={24} 
                  md={9} 
                  lg={9} 
                  className="flex items-end"
                >
                  <ReviewActions 
                    type="mobile" 
                    goToEditTemplate={onEditTemplate}
                  />
                </Col>
              )}
              
              <Col xs={24}>
              
                {/* Popup Only View */}
                <div className="w-full">
                  {accountDetails && template ? (
                    <PopupOnlyView
                      viewport="mobile"
                      popupTemplate={[template]}
                      className="shadow-md"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-96"><Spin size='large' /></div>
                  )}
                </div>
              </Col>
            </Row>
          </Col>

        </Row>

        {accountDetails && template && (
        <BrowserPreviewModal
          open={browserPreviewModalOpen}
          onClose={() => genericActions.setBrowserPreviewModalOpen(false)}
          viewport="mobile"
          websiteBackground={{
            backgroundImage: {
              desktop: '',
              mobile: 'https://i.ibb.co/QvbTbdPT/Screenshot-2026-01-12-162559.png',
            },
            websiteUrl: accountDetails.domain,
            companyName: accountDetails.name,
            category: accountDetails.category,
            clientId: accountDetails.id.toString(),
            id: accountDetails.id.toString(),
          }}
          popupTemplate={[template]}
        />
      )}
    </>
  );
};
