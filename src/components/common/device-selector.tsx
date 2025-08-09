import React from 'react';
import { Select, Tag, Space, Typography } from 'antd';
import {
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
} from '@ant-design/icons';
import { Device } from '@/types';

const { Text } = Typography;

interface DeviceSelectorProps {
  devices: Device[];
  value?: number[];
  onChange?: (value: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
  showSearch?: boolean;
}

const getDeviceIcon = (deviceType: string) => {
  switch (deviceType.toLowerCase()) {
    case 'desktop':
      return <DesktopOutlined />;
    case 'mobile':
      return <MobileOutlined />;
    case 'tablet':
      return <TabletOutlined />;
    default:
      return <DesktopOutlined />;
  }
};

const getDeviceColor = (deviceType: string) => {
  switch (deviceType.toLowerCase()) {
    case 'desktop':
      return 'blue';
    case 'mobile':
      return 'green';
    case 'tablet':
      return 'orange';
    default:
      return 'default';
  }
};

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  devices,
  value = [],
  onChange,
  placeholder = 'Select supported device types',
  disabled = false,
  showSearch = true,
}) => {
  const selectedDevices = devices.filter((device) => value.includes(device.id));

  const customTagRender = (props: any) => {
    const { label, value: deviceId, closable, onClose } = props;
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return null;

    return (
      <Tag
        color={getDeviceColor(device.device_type)}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        <Space size={4}>
          {getDeviceIcon(device.device_type)}
          {device.device_type.charAt(0).toUpperCase() +
            device.device_type.slice(1)}
        </Space>
      </Tag>
    );
  };

  return (
    <div>
      <Select
        mode="multiple"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        showSearch={showSearch}
        tagRender={customTagRender as any}
        filterOption={(input, option) => {
          // Handle both string labels and React element labels
          const labelText =
            typeof option?.label === 'string'
              ? option.label
              : option?.value
                ? devices.find((d) => d.id === option.value)?.device_type || ''
                : '';
          return labelText.toLowerCase().includes(input.toLowerCase());
        }}
        style={{ width: '100%' }}
        options={devices.map((device) => ({
          label: (
            <Space>
              {getDeviceIcon(device.device_type)}
              {device.device_type.charAt(0).toUpperCase() +
                device.device_type.slice(1)}
            </Space>
          ),
          value: device.id,
        }))}
      />

      {selectedDevices.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Selected: {selectedDevices.length} device
            {selectedDevices.length !== 1 ? 's' : ''}
          </Text>
        </div>
      )}
    </div>
  );
};

export default DeviceSelector;
