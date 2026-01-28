import React, { useState, useCallback, useMemo } from 'react';
import { Card, Tabs, Radio, Typography, Alert, Button, Space, Row, Col } from 'antd';
import {
  EyeOutlined,
  MobileOutlined,
  DesktopOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { useBuilderStore } from '@/stores/builder.store';
import ReminderTabPreview from './ReminderTabPreview';
import AnimationsTab from './AnimationsTab';
import MobileFloatingButtonTab from './MobileFloatingButtonTab';
import DesktopTabConfig from './DesktopTabConfig';
import type {
  ReminderTabConfig,
  ReminderTabEditorProps,
} from '@/features/builder/types';

const { Title } = Typography;
const { TabPane } = Tabs;

const ReminderTabEditor: React.FC<ReminderTabEditorProps> = ({
  config,
  onConfigChange,
  saveStatus,
}) => {
  const { templateState } = useBuilderStore();
  const [activeTab, setActiveTab] = useState('desktop');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>(
    'desktop'
  );

  // Determine supported devices from template
  const supportedDevices = useMemo(() => {
    if (!templateState?.devices) {
      console.log('No devices found, defaulting to desktop');
      return ['desktop'];
    }
    const devices = templateState.devices.map((device) =>
      device.device_type.toLowerCase()
    );
    console.log('Supported devices:', devices);
    return devices;
  }, [templateState?.devices]);

  const hasDesktop = supportedDevices.includes('desktop');
  const hasMobile = supportedDevices.includes('mobile');

  // Set initial preview device and active tab based on supported devices
  React.useEffect(() => {
    if (!hasDesktop && hasMobile) {
      setPreviewDevice('mobile');
      setActiveTab('mobile');
    } else if (hasDesktop && !hasMobile) {
      setPreviewDevice('desktop');
      setActiveTab('desktop');
    } else if (hasDesktop && hasMobile) {
      // Both available, default to desktop
      setPreviewDevice('desktop');
      setActiveTab('desktop');
    } else {
      // Fallback to animations tab if no devices detected
      setActiveTab('animations');
    }
  }, [hasDesktop, hasMobile]);

  // Initialize config with proper device enablement on mount/device change
  React.useEffect(() => {
    if (!hasDesktop && hasMobile) {
      // Mobile-only template: ensure desktop is disabled, mobile is enabled
      const newConfig = { 
        ...config, 
        desktop: { ...config.desktop, enabled: false },
        mobile: { ...config.mobile, enabled: true }
      };
      onConfigChange(newConfig);
    } else if (hasDesktop && !hasMobile) {
      // Desktop-only template: ensure mobile is disabled, desktop is enabled  
      const newConfig = { 
        ...config, 
        desktop: { ...config.desktop, enabled: true },
        mobile: { ...config.mobile, enabled: false }
      };
      onConfigChange(newConfig);
    }
    // For both devices supported, let user control both
  }, [hasDesktop, hasMobile]); // Only run when device support changes

  // Optimized config update function with device-based auto-disable
  const updateConfig = useCallback(
    (path: string, value: any) => {
      const newConfig = { ...config };
      const keys = path.split('.');
      let current: any = newConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      // Auto-disable opposite device based on template support
      if (!hasDesktop && hasMobile) {
        // Mobile-only template: disable desktop
        newConfig.desktop = { ...newConfig.desktop, enabled: false };
      } else if (hasDesktop && !hasMobile) {
        // Desktop-only template: disable mobile
        newConfig.mobile = { ...newConfig.mobile, enabled: false };
      }
      
      onConfigChange(newConfig);
    },
    [config, onConfigChange, hasDesktop, hasMobile]
  );

  // Convert new config to legacy format for HTML generation
  const convertToLegacyConfig = useCallback((newConfig: ReminderTabConfig) => {
    return {
      enabled: newConfig.enabled,
      display: newConfig.desktop.display,
      styling: newConfig.desktop.styling,
      animations: newConfig.animations,
      interactions: newConfig.desktop.interactions,
      responsive: {
        mobile: {
          fontSize: 12,
          hide: false,
        },
      },
    };
  }, []);

  // Memoized button handlers
  const handleGeneratePreview = useCallback(() => {
    console.log('Generated config:', config);
  }, [config, convertToLegacyConfig]);

  const handleViewCode = useCallback(() => {
    console.log('Generated HTML code', config);
    alert('Generated code logged to console!');
  }, [config]);

  const handleResetColors = useCallback(() => {
    updateConfig('styling.colors.primary', '#8B0000');
    updateConfig('styling.colors.secondary', '#DC143C');
    updateConfig('styling.colors.textColor', '#FFFFFF');
    updateConfig('styling.colors.draggerColor', '#666666');
    updateConfig('styling.colors.dotColor', 'rgba(255, 255, 255, 0.8)');
  }, [updateConfig]);

  const handlePreviewDeviceChange = useCallback((e: any) => {
    setPreviewDevice(e.target.value);
  }, []);

  return (
    <Row gutter={[24, 24]}>
      {/* Configuration Panel */}
      <Col xs={24} lg={16}>
        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            {/* Desktop Configuration */}
            {hasDesktop && (
              <TabPane
                tab={
                  <span>
                    <DesktopOutlined className='mr-2' />
                    <span>Desktop Tab</span>
                  </span>
                }
                key="desktop"
              >
                <DesktopTabConfig config={config} updateConfig={updateConfig} />
              </TabPane>
            )}

            {/* Mobile Configuration */}
            {hasMobile && (
              <TabPane
                tab={
                  <span>
                    <MobileOutlined className='mr-2' />
                    <span>Mobile Button</span>
                  </span>
                }
                key="mobile"
              >
                <MobileFloatingButtonTab
                  config={config}
                  updateConfig={updateConfig}
                />
              </TabPane>
            )}

            <TabPane tab={<span>Animations</span>} key="animations">
              <AnimationsTab config={config} updateConfig={updateConfig} />
            </TabPane>
          </Tabs>
        </Card>
      </Col>

      {/* Preview Panel */}
      <Col xs={24} lg={8}>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <Title level={4} className="mb-0">
              Preview
            </Title>
            <Radio.Group
              value={previewDevice}
              onChange={handlePreviewDeviceChange}
              size="small"
            >
              {hasDesktop && (
                <Radio.Button value="desktop">
                  <DesktopOutlined />
                </Radio.Button>
              )}
              {hasMobile && (
                <Radio.Button value="mobile">
                  <MobileOutlined />
                </Radio.Button>
              )}
            </Radio.Group>
          </div>

          <ReminderTabPreview config={config} previewDevice={previewDevice} />

          <div className="mt-4 space-y-2">
            <Alert
              message="Live Preview"
              description="Changes are reflected instantly in the preview above"
              type="info"
              showIcon
            />

            {/* Save Status */}
            {saveStatus && (
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>
                    Device: {previewDevice === 'mobile' ? 'Mobile' : 'Desktop'}
                  </span>
                  <span>Status: {config.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    {saveStatus.isSaving && '💾 Saving...'}
                    {!saveStatus.isSaving &&
                      !saveStatus.hasUnsavedChanges &&
                      '✅ Saved'}
                    {!saveStatus.isSaving &&
                      saveStatus.hasUnsavedChanges &&
                      '⚠️ Unsaved changes'}
                    {saveStatus.saveError && '❌ Save error'}
                  </span>
                  <span>
                    {saveStatus.lastSave
                      ? `Last saved: ${saveStatus.lastSave.toLocaleTimeString()}`
                      : 'Not saved yet'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="mt-4">
          <Title level={5}>Quick Actions</Title>
          <Space direction="vertical" className="w-full">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              block
              onClick={handleGeneratePreview}
            >
              Generate Preview
            </Button>

            <Button icon={<CodeOutlined />} block onClick={handleViewCode}>
              View Generated Code
            </Button>

            <Button type="dashed" block onClick={handleResetColors}>
              Reset Colors
            </Button>
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default ReminderTabEditor;
