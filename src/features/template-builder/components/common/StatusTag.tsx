import React from 'react';
import { Tag } from 'antd';
import { TCBTemplate } from '@/types';

interface StatusTagProps {
  status: TCBTemplate['status'];
  size?: 'default' | 'small';
}

export const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  const statusConfig = {
    draft: { color: 'default', text: 'Draft' },
    published: { color: 'success', text: 'Published' },
    archive: { color: 'warning', text: 'Archived' },
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  return <Tag color={config.color}>{config.text}</Tag>;
};

export default StatusTag;
