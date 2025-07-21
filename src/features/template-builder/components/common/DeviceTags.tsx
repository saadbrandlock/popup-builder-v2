import React from 'react';
import { Tag, Space } from 'antd';

interface DeviceTagsProps {
  devices: string[];
  maxVisible?: number;
  size?: 'default' | 'small';
}

export const DeviceTags: React.FC<DeviceTagsProps> = ({ 
  devices, 
  maxVisible = 3,
}) => {
  const visibleDevices = devices.slice(0, maxVisible);
  const remainingCount = devices.length - maxVisible;

  return (
    <Space size={[0, 4]} wrap>
      {visibleDevices.map((device, index) => (
        <Tag key={index} color="blue">
          {device}
        </Tag>
      ))}
      {remainingCount > 0 && (
        <Tag color="default">
          +{remainingCount} more
        </Tag>
      )}
    </Space>
  );
};

export default DeviceTags;