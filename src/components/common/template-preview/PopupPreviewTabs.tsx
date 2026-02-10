import React, { useState, useMemo } from 'react';
import { Tabs, Typography } from 'antd';
import { MonitorSpeaker, Smartphone } from 'lucide-react';
import { PopupOnlyView } from '../index';
import { ClientFlowData } from '@/types';
import { getTemplatesForDevice, getTemplatesForDeviceAndShopper } from '@/features/client-flow/utils/template-filters';

const { Title } = Typography;

interface PopupPreviewTabsProps {
  clientData: ClientFlowData[] | null;
  /** When set, desktop/mobile tabs show the template for this shopper group; otherwise first template per device. */
  activeShopperId?: number | null;
  className?: string;
}

export const PopupPreviewTabs: React.FC<PopupPreviewTabsProps> = ({ 
  clientData,
  activeShopperId = null,
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');

  const desktopTemplate = useMemo(() => {
    if (!clientData?.length) return null;
    const byShopper = getTemplatesForDeviceAndShopper(clientData, 'desktop', activeShopperId ?? undefined);
    const byDevice = getTemplatesForDevice(clientData, 'desktop');
    return byShopper[0] ?? byDevice[0] ?? null;
  }, [clientData, activeShopperId]);

  const mobileTemplate = useMemo(() => {
    if (!clientData?.length) return null;
    const byShopper = getTemplatesForDeviceAndShopper(clientData, 'mobile', activeShopperId ?? undefined);
    const byDevice = getTemplatesForDevice(clientData, 'mobile');
    return byShopper[0] ?? byDevice[0] ?? null;
  }, [clientData, activeShopperId]);

  const tabItems = [
    {
      key: 'desktop',
      label: (
        <span className="flex items-center gap-2">
          <MonitorSpeaker size={16} />
          Desktop Preview
        </span>
      ),
      children: desktopTemplate ? (
        <div className="!w-full flex justify-center p-4">
          <PopupOnlyView
            viewport="desktop"
            popupTemplate={[desktopTemplate]}
            showViewportLabel={false}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-96">
          <Typography.Text type="secondary">No desktop template available</Typography.Text>
        </div>
      ),
    },
    {
      key: 'mobile',
      label: (
        <span className="flex items-center gap-2">
          <Smartphone size={16} />
          Mobile Preview
        </span>
      ),
      children: mobileTemplate ? (
        <div className="w-full flex justify-center p-4">
          <PopupOnlyView
            viewport="mobile"
            popupTemplate={[mobileTemplate]}
            showViewportLabel={false}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-96">
          <Typography.Text type="secondary">No mobile template available</Typography.Text>
        </div>
      ),
    },
  ];

  return (
    <div className={className}>
      <div className="mb-4">
        <Title level={4}>
          Template Preview
        </Title>
        <Typography.Text type="secondary">
          Preview your popup design across devices
        </Typography.Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'desktop' | 'mobile')}
        items={tabItems}
        size="large"
        className="popup-preview-tabs"
      />
    </div>
  );
};
