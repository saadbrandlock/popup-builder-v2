import React from 'react';
import { Table, Typography, Tag } from 'antd';
import { TCBTemplate } from '@/types';
import { DeviceTags, StatusTag } from '../index';
import { ChildTemplateActionMenu } from './ChildTemplateActionMenu';
import { TimeDisplay } from '@/components';

const { Text } = Typography;

interface ChildTemplatesTableProps {
  childTemplates: TCBTemplate[];
  onChildAction: (action: 'edit' | 'delete' | 'archive', templateId: string) => void;
}

export const ChildTemplatesTable: React.FC<ChildTemplatesTableProps> = ({
  childTemplates,
  onChildAction,
}) => {
  const childColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: TCBTemplate) => (
        <div>
          <Text strong>{name}</Text>
          {record.description && (
            <div className="mt-1">
              <Text type="secondary" className="text-xs">
                {record.description}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: 'Devices',
      dataIndex: 'devices',
      key: 'devices',
      render: (devices: { device_type: string; id: number }[]) => (
        <DeviceTags
          devices={devices.map((device) => device.device_type.toLowerCase())}
        />
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'generic' ? 'green' : 'orange'}>
          {type === 'generic' ? 'Generic' : 'Specific'}
        </Tag>
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (dateString: string) => (
        <TimeDisplay
          dateString={dateString}
          showIcon={true}
          showRelative={true}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, record: TCBTemplate) => (
        <ChildTemplateActionMenu template={record} onAction={onChildAction} />
      ),
    },
  ];

  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <div className="mb-3">
        <Text strong className="text-sm">
          Child Templates ({childTemplates.length})
        </Text>
      </div>
      <Table
        columns={childColumns}
        dataSource={childTemplates}
        rowKey="id"
        pagination={false}
        size="small"
        className="bg-white"
      />
    </div>
  );
};

export default ChildTemplatesTable;
