import React from 'react';
import { Modal } from 'antd';
import { BrowserPreview } from './BrowserPreview';
import type { WebsiteData } from '../types/clientFlow';

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
  return (
    <Modal
      title={`Browser Preview - ${viewport === 'desktop' ? 'Desktop' : 'Mobile'}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={viewport === 'desktop' ? 1400 : 600}
      centered
      destroyOnHidden
    >
      <div className="py-4">
        <BrowserPreview
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
