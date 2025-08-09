import React from 'react';
import { Button, Space, Typography, Tooltip, Divider } from 'antd';
import { 
  SaveOutlined, 
  EyeOutlined, 
  LoadingOutlined, 
  DesktopOutlined,
  TabletOutlined,
  MobileOutlined,
  UndoOutlined,
  RedoOutlined,
  SettingOutlined
} from '@ant-design/icons';
import type { ActionBarProps, DeviceType } from '../types';
import { useBuilderMode, useBuilderActions, usePopupTemplate } from '../hooks';



const { Text } = Typography;

/**
 * ActionBar - Top action bar with save, preview, and mode controls
 * Provides quick access to common popup builder actions
 */
export const ActionBar: React.FC<ActionBarProps> = ({
  onSave,
  onPreview,
  saving,
  isDirty,
  className = '',
}) => {
  const mode = useBuilderMode();
  const template = usePopupTemplate();
  const { setMode, setPreviewDevice } = useBuilderActions();

  const handleDeviceChange = (device: DeviceType) => {
    setPreviewDevice(device);
  };

  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode);
  };

  const getDeviceIcon = (device: DeviceType) => {
    switch (device) {
      case 'desktop':
        return <DesktopOutlined />;
      case 'tablet':
        return <TabletOutlined />;
      case 'mobile':
        return <MobileOutlined />;
      default:
        return <DesktopOutlined />;
    }
  };

  return (
        <div className={`bg-white border-b border-gray-200 py-2 px-4 sticky top-0 z-50 ${className} md:py-1.5 md:px-3`}>
            <div className="flex items-center justify-between w-full md:flex-wrap md:gap-2">
        {/* Left section - Template info */}
                {/* Left section - Template info */}
        <div className="flex items-center gap-3 flex-1 min-w-0 md:order-1 md:flex-1 md:w-full">
                    <div className="flex flex-col min-w-0 md:flex-row md:items-center md:gap-2">
                        <Text strong className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
              {template?.name || 'Untitled Popup'}
            </Text>
                        <Text type="secondary" className="text-xs leading-tight md:whitespace-nowrap">
              {isDirty ? (
                                <span className="text-yellow-500">
                  • Unsaved changes
                </span>
              ) : (
                                <span className="text-green-500">
                  ✓ Saved
                </span>
              )}
            </Text>
          </div>
        </div>

        {/* Center section - Mode and device controls */}
                {/* Center section - Mode and device controls */}
        <div className="flex items-center gap-3 flex-shrink-0 md:order-2 md:flex-auto md:justify-center md:gap-2">
          {/* Mode switcher */}
                    {/* Mode switcher */}
          <div className="flex items-center">
            <Button.Group>
              <Button
                type={mode === 'builder' ? 'primary' : 'default'}
                onClick={() => handleModeChange('builder')}
                size="small"
              >
                Builder
              </Button>
              <Button
                type={mode === 'preview' ? 'primary' : 'default'}
                onClick={() => handleModeChange('preview')}
                size="small"
              >
                Preview
              </Button>
              <Button
                type={mode === 'settings' ? 'primary' : 'default'}
                onClick={() => handleModeChange('settings')}
                size="small"
                icon={<SettingOutlined />}
              >
                Settings
              </Button>
            </Button.Group>
          </div>

          <Divider type="vertical" />

          {/* Device switcher */}
                    {/* Device switcher */}
          <div className="flex items-center">
            <Button.Group>
              <Tooltip title="Desktop View">
                <Button
                  size="small"
                  icon={getDeviceIcon('desktop')}
                  onClick={() => handleDeviceChange('desktop')}
                />
              </Tooltip>
              <Tooltip title="Tablet View">
                <Button
                  size="small"
                  icon={getDeviceIcon('tablet')}
                  onClick={() => handleDeviceChange('tablet')}
                />
              </Tooltip>
              <Tooltip title="Mobile View">
                <Button
                  size="small"
                  icon={getDeviceIcon('mobile')}
                  onClick={() => handleDeviceChange('mobile')}
                />
              </Tooltip>
            </Button.Group>
          </div>

          <Divider type="vertical" />

          {/* History controls */}
                    {/* History controls */}
          <div className="flex items-center gap-1 md:hidden">
            <Tooltip title="Undo">
              <Button
                size="small"
                icon={<UndoOutlined />}
                disabled={true} // TODO: Implement undo/redo
              />
            </Tooltip>
            <Tooltip title="Redo">
              <Button
                size="small"
                icon={<RedoOutlined />}
                disabled={true} // TODO: Implement undo/redo
              />
            </Tooltip>
          </div>
        </div>

        {/* Right section - Action buttons */}
                {/* Right section - Action buttons */}
        <div className="flex items-center gap-3 flex-shrink-0 md:order-3">
          <Space>
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={onPreview}
              size="small"
            >
              Preview
            </Button>
            
            <Button
              type="primary"
              icon={saving ? <LoadingOutlined spin /> : <SaveOutlined />}
              onClick={onSave}
              loading={saving}
              disabled={!isDirty}
              size="small"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};
