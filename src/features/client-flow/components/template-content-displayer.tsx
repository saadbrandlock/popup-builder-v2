import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  memo,
} from 'react';
import { Card, Tabs, Typography, Skeleton } from 'antd';
import { MonitorSpeaker, Smartphone, Tablet } from 'lucide-react';
import { Safari } from '@/components/magicui/safari';
import Android from '@/components/magicui/android';
import { useClientFlowStore } from '@/stores/clientFlowStore';
import { useDevicesStore } from '@/stores/common/devices.store';
import { safeDecodeAndSanitizeHtml } from '@/lib/utils/helper';
import {
  templateContentParser,
  ContentMapping,
} from '@/lib/utils/template-content-parser';
import { WebsiteData } from '../types/clientFlow';

const { Title } = Typography;

interface TemplateContentDisplayerProps {
  className?: string;
  websiteBackground: WebsiteData;
}

interface DeviceConfig {
  id: number;
  device_type: string;
  title: string;
  icon: React.ReactNode;
  containerClass: string;
}

const DEVICE_ICONS = {
  desktop: <MonitorSpeaker size={16} />,
  mobile: <Smartphone size={16} />,
  tablet: <Tablet size={16} />,
} as const;

const CONTAINER_CLASSES = {
  desktop: 'w-full max-w-4xl',
  mobile: 'w-full max-w-sm',
  tablet: 'w-full max-w-2xl',
} as const;

const getDeviceIcon = (deviceType: string) => {
  const type = deviceType.toLowerCase() as keyof typeof DEVICE_ICONS;
  return DEVICE_ICONS[type] || DEVICE_ICONS.desktop;
};

const getContainerClass = (deviceType: string) => {
  const type = deviceType.toLowerCase() as keyof typeof CONTAINER_CLASSES;
  return CONTAINER_CLASSES[type] || CONTAINER_CLASSES.desktop;
};

export const TemplateContentDisplayer: React.FC<
  TemplateContentDisplayerProps
> = memo(({ className, websiteBackground }) => {
  const {
    clientData,
    activeContentShopper,
    selectedDeviceId,
    actions,
    contentFormData,
  } = useClientFlowStore();
  const { devices } = useDevicesStore();
  const [sanitizedHtml, setSanitizedHtml] = useState<Record<number, string>>(
    {}
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const iframeRefs = useRef<Record<number, HTMLIFrameElement | null>>({});

  // Create device configs from API data (memoized)
  const deviceConfigs: DeviceConfig[] = useMemo(
    () =>
      devices.map((device) => ({
        id: device.id,
        device_type: device.device_type,
        title: `${device.device_type.charAt(0).toUpperCase() + device.device_type.slice(1)} Preview`,
        icon: getDeviceIcon(device.device_type),
        containerClass: getContainerClass(device.device_type),
      })),
    [devices]
  );

  // Set default selected device if none selected and update store
  useEffect(() => {
    if (!selectedDeviceId && devices.length > 0) {
      actions.setSelectedDeviceId(devices[0].id);
    }
  }, [selectedDeviceId, devices.length, actions]);

  const activeDeviceId = useMemo(
    () => selectedDeviceId || (devices.length > 0 ? devices[0].id : null),
    [selectedDeviceId, devices.length]
  );

  const contentMapping: ContentMapping = useMemo(() => {
    const mapping: ContentMapping = {};

    // Use contentFormData from store
    Object.entries(contentFormData).forEach(([fieldId, value]) => {
      if (value && typeof value === 'string') {
        mapping[fieldId] = value;
      }
    });

    return mapping;
  }, [contentFormData]);

  const processTemplateHtml = useCallback(async () => {
    if (!clientData || !activeContentShopper.content.id || devices.length === 0)
      return;

    setIsProcessing(true);
    try {
      const newSanitizedHtml: Record<number, string> = {};

      for (const device of devices) {
        const template = clientData.find((item) => {
          return item.devices?.some((d) => d.id === device.id);
        });

        if (template?.template_html) {
          const sanitizedHtml = await safeDecodeAndSanitizeHtml(
            template.template_html
          );

          const processedHtml = templateContentParser.updateContent(
            sanitizedHtml,
            contentMapping
          );

          newSanitizedHtml[device.id] = processedHtml;
        }
      }

      setSanitizedHtml(newSanitizedHtml);
    } catch (error) {
      console.error('Error processing template HTML:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [clientData, activeContentShopper.content.id, devices, contentMapping]);

  useEffect(() => {
    if (clientData && activeContentShopper.content.id && devices.length > 0) {
      processTemplateHtml();
    }
  }, [clientData, activeContentShopper.content.id, devices.length, contentMapping]);

  const updateIframe = useCallback(
    (iframe: HTMLIFrameElement | null, html: string) => {
      if (!iframe || !html) return;

      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
      }
    },
    []
  );

  // Single effect to handle all iframe updates
  useEffect(() => {
    const updateAllIframes = () => {
      Object.entries(sanitizedHtml).forEach(([deviceId, html]) => {
        const iframe = iframeRefs.current[parseInt(deviceId)];
        if (iframe && html) {
          updateIframe(iframe, html);
        }
      });
    };

    // Update immediately
    updateAllIframes();

    // Also update active device specifically (for tab switching)
    if (activeDeviceId && sanitizedHtml[activeDeviceId]) {
      const iframe = iframeRefs.current[activeDeviceId];
      if (iframe) {
        updateIframe(iframe, sanitizedHtml[activeDeviceId]);
      }
    }
  }, [sanitizedHtml, activeDeviceId, updateIframe]);

  const TemplateIframe = memo(({ config }: { config: DeviceConfig }) => (
    <iframe
      ref={(el) => {
        if (el) {
          iframeRefs.current[config.id] = el;
          const html = sanitizedHtml[config.id];
          if (html) {
            updateIframe(el, html);
          }
        }
      }}
      className="w-full h-full border-0 bg-transparent"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        background: 'transparent',
        overflow: 'hidden',
      }}
      title={`${config.device_type} Template Preview`}
      sandbox="allow-scripts allow-same-origin allow-forms"
    />
  ));

  const renderTemplatePreview = useCallback(
    (config: DeviceConfig) => {
      const html = sanitizedHtml[config.id];
      const isEmpty = !html && !isProcessing;

      if (isProcessing) {
        return (
          <div className="flex justify-center items-center h-96">
            <Skeleton.Image style={{ width: 300, height: 400 }} />
          </div>
        );
      }

      if (isEmpty) {
        return (
          <div className="flex justify-center items-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <Typography.Text type="secondary">
                No {config.device_type} template available
              </Typography.Text>
            </div>
          </div>
        );
      }

      return (
        <div className="w-full flex justify-center">
          {config.device_type.toLowerCase() === 'desktop' ? (
            <Safari
              url={websiteBackground.websiteUrl}
              imageSrc={websiteBackground.backgroundImage.desktop}
              fit="contain"
              align="top"
              className="w-full max-w-4xl"
            >
              <TemplateIframe config={config} />
            </Safari>
          ) : (
            <Android
              className="inline-block"
              url={websiteBackground.websiteUrl}
              imageSrc={websiteBackground.backgroundImage.mobile}
              fit="contain"
              align="top"
            >
              <TemplateIframe config={config} />
            </Android>
          )}
        </div>
      );
    },
    [sanitizedHtml, isProcessing, websiteBackground, updateIframe]
  );

  const tabItems = useMemo(
    () =>
      deviceConfigs.map((config) => ({
        key: config.id.toString(),
        label: (
          <span className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </span>
        ),
        children: (
          <div className="w-full flex justify-center p-4">
            <div className={config.containerClass}>
              {renderTemplatePreview(config)}
            </div>
          </div>
        ),
      })),
    [deviceConfigs, renderTemplatePreview]
  );

  const handleTabChange = useCallback(
    (key: string) => {
      const deviceId = parseInt(key);
      actions.setSelectedDeviceId(deviceId);
    },
    [actions]
  );

  // Early return conditions
  const shouldShowLoading = !clientData || clientData.length === 0;
  const shouldShowShopperError = !activeContentShopper.content.id;
  const shouldShowDevicesLoading = devices.length === 0;

  if (shouldShowLoading) {
    return (
      <Card className={`template-content-displayer ${className || ''}`}>
        <div className="flex justify-center items-center h-96">
          <Typography.Text type="secondary">
            Loading template data...
          </Typography.Text>
        </div>
      </Card>
    );
  }

  if (shouldShowShopperError) {
    return (
      <Card className={`template-content-displayer ${className || ''}`}>
        <div className="flex justify-center items-center h-96">
          <Typography.Text type="secondary">
            Please select a shopper segment
          </Typography.Text>
        </div>
      </Card>
    );
  }

  if (shouldShowDevicesLoading) {
    return (
      <Card className={`template-content-displayer ${className || ''}`}>
        <div className="flex justify-center items-center h-96">
          <Typography.Text type="secondary">Loading devices...</Typography.Text>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-4">
        <Title level={4} className="mb-2">
          Template Preview
        </Title>
        <Typography.Text type="secondary">
          Live preview with your content changes
        </Typography.Text>
      </div>

      <Tabs
        activeKey={activeDeviceId?.toString()}
        onChange={handleTabChange}
        items={tabItems}
        size="large"
        className="template-preview-tabs"
      />
    </>
  );
});

export default TemplateContentDisplayer;
