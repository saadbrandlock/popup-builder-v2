import React from 'react';
import { Modal } from 'antd';
import { BrowserPreview } from '../index';
import type { WebsiteData } from '../../../features/client-flow/types/clientFlow';

interface BrowserPreviewModalProps {
  open: boolean;
  onClose: () => void;
  viewport: 'desktop' | 'mobile';
  websiteBackground: WebsiteData;
  popupTemplate: any | null;
}

export const BrowserPreviewModal: React.FC<BrowserPreviewModalProps> = ({
  open,
  onClose,
  viewport,
  websiteBackground,
  popupTemplate,
}) => {
  const templateId = Array.isArray(popupTemplate) && popupTemplate[0]?.template_id != null
    ? String(popupTemplate[0].template_id)
    : 'none';
  return (
    <Modal
      title={`${viewport === 'desktop' ? 'Desktop' : 'Mobile'} Preview`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={viewport === 'desktop' ? 1400 : 600}
      centered
      destroyOnClose
    >
      <div className="py-4">
        <BrowserPreview
          key={`${viewport}-${templateId}`}
          className="shadow-md"
          viewport={viewport}
          websiteBackground={websiteBackground}
          popupTemplate={popupTemplate}
          showBrowserChrome={true}
          interactive={false}
          scale={viewport === 'desktop' ? 0.9 : 1}
        />
      </div>
    </Modal>
  );
};
