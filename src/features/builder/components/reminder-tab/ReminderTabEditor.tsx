import React, { useState, useCallback } from 'react';
import { Card, Tabs, Radio, Typography, Alert, Button, Space } from 'antd';
import {
  SettingOutlined,
  EyeOutlined,
  MobileOutlined,
  DesktopOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { ReminderTabHTMLConverter } from '@/features/builder/utils/reminderTabHtmlEngine';
import ReminderTabPreview from './ReminderTabPreview';
import BasicSettingsTab from './BasicSettingsTab';
import StylingTab from './StylingTab';
import AnimationsTab from './AnimationsTab';
import AdvancedTab from './AdvancedTab';
import type { ReminderTabEditorProps } from '@/features/builder/types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ReminderTabEditor: React.FC<ReminderTabEditorProps> = ({
  config,
  onConfigChange,
  saveStatus,
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>(
    'desktop'
  );

  // Optimized config update function
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
      onConfigChange(newConfig);
    },
    [config, onConfigChange]
  );

  // Memoized button handlers
  const handleGeneratePreview = useCallback(() => {
    console.log('Generated config:', config);
    const converter = new ReminderTabHTMLConverter();
    const htmlOutput = converter.convertToHTML(config);
    console.log('Generated HTML:', htmlOutput);
    alert('Preview generated! Check console for output.');
  }, [config]);

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <div className="lg:col-span-2">
        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane
              tab={
                <span>
                  <SettingOutlined />
                  Basic Settings
                </span>
              }
              key="basic"
            >
              <BasicSettingsTab config={config} updateConfig={updateConfig} />
            </TabPane>

            <TabPane tab={<span>Styling</span>} key="styling">
              <StylingTab config={config} updateConfig={updateConfig} />
            </TabPane>

            <TabPane tab={<span>Animations</span>} key="animations">
              <AnimationsTab config={config} updateConfig={updateConfig} />
            </TabPane>

            <TabPane
              tab={
                <span>
                  <CodeOutlined />
                  Advanced
                </span>
              }
              key="advanced"
            >
              <AdvancedTab config={config} updateConfig={updateConfig} />
            </TabPane>
          </Tabs>
        </Card>
      </div>

      {/* Preview Panel */}
      <div className="lg:col-span-1">
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
              <Radio.Button value="desktop">
                <DesktopOutlined />
              </Radio.Button>
              <Radio.Button value="mobile">
                <MobileOutlined />
              </Radio.Button>
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
      </div>
    </div>
  );
};

export default ReminderTabEditor;
