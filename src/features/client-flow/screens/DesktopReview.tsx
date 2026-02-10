import React, { useEffect, useMemo } from 'react';
import { Card, Col, Row, Alert, Spin } from 'antd';
import FeedbackForm from '../components/feedback-form';
import { PopupOnlyView, BrowserPreviewModal } from '../../../components/common';
import { useGenericStore } from '@/stores/generic.store';
import ReviewActions from '../components/review-actions';
import { useClientFlowStore } from '@/stores/clientFlowStore';
import { ClientFlowData } from '@/types';
import { cn } from '@/lib/utils';
import { getTemplatesForDevice, getTemplateOptionLabels } from '../utils/template-filters';
import { TemplateReviewSelector } from '../components/template-review-selector';

/**
 * DesktopReview - Step 1 - Desktop review screen
 * Shows popup preview in desktop viewport. When multiple templates exist (as grouped by admin), user selects which template to review.
 */
interface DesktopReviewProps { }

export const DesktopReview: React.FC<DesktopReviewProps> = ({ }) => {
  const { accountDetails, navigate, browserPreviewModalOpen, actions: genericActions } = useGenericStore();
  const { clientData, actions, selectedReviewTemplateId } = useClientFlowStore();

  const desktopTemplates = useMemo(() => getTemplatesForDevice(clientData, 'desktop'), [clientData]);
  const showTemplateSelector = desktopTemplates.length > 1;
  const selectedTemplateId =
    desktopTemplates.some((t) => t.template_id === selectedReviewTemplateId)
      ? selectedReviewTemplateId
      : (desktopTemplates[0]?.template_id ?? null);

  const template = useMemo(() => {
    if (!desktopTemplates.length) return null;
    return desktopTemplates.find((t) => t.template_id === selectedTemplateId) ?? desktopTemplates[0];
  }, [desktopTemplates, selectedTemplateId]);

  useEffect(() => {
    if (template) actions.setSelectedTemplate(template);
  }, [template, actions]);

  const onEditTemplate = () => {
    if (template) {
      navigate(
        `/coupon-builder-v2/user-template-editor/${template.template_id}`
      );
    }
  };

  const onTemplateChange = (value: string) => {
    actions.setSelectedReviewTemplateId(value);
  };

  return (
    <>
        <Row gutter={[16, 16]} >
          <Col xs={24} md={6}>
            <Card>
            <FeedbackForm type="desktop" />
            </Card>
          </Col>
          <Col xs={24} md={18}>
            <Row gutter={[16, 16]} className="relative" align={'middle'}>
              <Col xs={24} className={cn('transition-all duration-300 ease-in-out')}>
                <Alert
                  message="You're viewing one of your templates (grouped as set by your admin). Use Edit to change this template's design. In step 3 you can set copy per shopper group."
                  type="info"
                  showIcon
                  className="transition-all duration-300 ease-in-out"
                />
              </Col>

              <Col xs={24}>
                <Card>
                  {showTemplateSelector && (
                    <div className="mb-4">
                      <TemplateReviewSelector
                        templates={desktopTemplates}
                        value={selectedTemplateId}
                        onChange={onTemplateChange}
                        // label="Select template to review:"
                        size="middle"
                      />
                    </div>
                  )}
                  {template && (
                    <div className="mb-4 flex gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {getTemplateOptionLabels(template).name}
                        </p>
                        {getTemplateOptionLabels(template).descriptionFull && (
                          <p className="mt-0.5 text-sm text-gray-500">
                            {getTemplateOptionLabels(template).descriptionFull}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0">
                        <ReviewActions
                          type="desktop"
                          goToEditTemplate={onEditTemplate}
                          inline
                        />
                      </div>
                    </div>
                  )}
                  <div className="w-full">
                    {accountDetails && template ? (
                      <PopupOnlyView
                        viewport="desktop"
                        popupTemplate={[template]}
                        className="shadow-md"
                      />
                    ) : (
                      <div className="flex items-center justify-center !h-96"><Spin size="large" /></div>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </Col>

        </Row>

        {accountDetails && template && (
        <BrowserPreviewModal
          open={browserPreviewModalOpen}
          onClose={() => genericActions.setBrowserPreviewModalOpen(false)}
          viewport="desktop"
          websiteBackground={{
            backgroundImage: {
              desktop: 'https://i.ibb.co/XxDK49Hh/image-6.png',
              mobile:''
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
