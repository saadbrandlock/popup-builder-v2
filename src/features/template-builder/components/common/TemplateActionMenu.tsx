import React from 'react';
import { Button, Dropdown, Modal, message } from 'antd';
import {
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  CloudUploadOutlined,
  InboxOutlined,
  DeleteOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { CleanTemplateResponse, TemplateAction } from '@/types';

interface TemplateActionMenuProps {
  template: CleanTemplateResponse;
  onAction: (action: TemplateAction, templateId: string) => void;
}

export const TemplateActionMenu: React.FC<TemplateActionMenuProps> = ({ 
  template, 
  onAction 
}) => {
  const handleAction = async (action: TemplateAction) => {
    try {
      if (action === 'delete') {
        Modal.confirm({
          title: 'Are you sure you want to delete this template?',
          content: 'This action cannot be undone.',
          okText: 'Yes, Delete',
          okType: 'danger',
          cancelText: 'Cancel',
          onOk: () => onAction(action, template.id)
        });
      } else {
        onAction(action, template.id);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      message.error(`Failed to ${action} template`);
    }
  };

  const getMenuItems = () => {
    const items = [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
        onClick: () => handleAction('edit')
      },
      {
        key: 'preview',
        icon: <EyeOutlined />,
        label: 'Preview',
        onClick: () => handleAction('preview')
      },
      {
        key: 'duplicate',
        icon: <CopyOutlined />,
        label: 'Duplicate',
        onClick: () => handleAction('duplicate')
      }
    ];

    // Add publish/unpublish based on status
    if (template.status === 'draft') {
      items.push({
        key: 'publish',
        icon: <CloudUploadOutlined />,
        label: 'Publish',
        onClick: () => handleAction('publish')
      });
    }

    // Add archive option
    if (template.status !== 'archived') {
      items.push({
        key: 'archive',
        icon: <InboxOutlined />,
        label: 'Archive',
        onClick: () => handleAction('archive')
      });
    }

    // Add delete only for non-published templates (Epic requirement ADM-08)
    if (template.status !== 'published') {
      items.push({
        type: 'divider'
      } as any);
      items.push({
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        onClick: () => handleAction('delete'),
      });
    }

    return items;
  };

  return (
    <Dropdown menu={{ items: getMenuItems() }} trigger={['click']}>
      <Button type="text" icon={<MoreOutlined />} />
    </Dropdown>
  );
};

export default TemplateActionMenu;