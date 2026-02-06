import React, { useState, useEffect } from 'react';
import { Tabs, Card, Typography } from 'antd';
import { MonitorSpeaker, Smartphone } from 'lucide-react';
import { PopupOnlyView } from '../index';
import { ClientFlowData } from '@/types';

const { Title } = Typography;

interface PopupPreviewTabsProps {
  clientData: ClientFlowData[] | null;
  className?: string;
}

export const PopupPreviewTabs: React.FC<PopupPreviewTabsProps> = ({ 
  clientData,
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');
  const [desktopTemplate, setDesktopTemplate] = useState<ClientFlowData | null>(null);
  const [mobileTemplate, setMobileTemplate] = useState<ClientFlowData | null>(null);

  useEffect(() => {
    if (clientData && clientData.length) {
      // Find template where desktop is the FIRST/PRIMARY device
      const desktop = clientData.find((t) => t.devices.some((device) => device.device_type === 'desktop'));
      // Find template where mobile is the FIRST/PRIMARY device
      const mobile = clientData.find(
        (t) => t.devices.some((device) => device.device_type === 'mobile')
      );

      setDesktopTemplate(desktop || null);
      setMobileTemplate(mobile || null);
    }
  }, [clientData]);

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
