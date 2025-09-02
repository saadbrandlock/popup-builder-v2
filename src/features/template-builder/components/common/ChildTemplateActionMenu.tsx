import React from 'react';
import { Button, Dropdown, Modal, message } from 'antd';
import {
  MoreOutlined,
  EditOutlined,
  InboxOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { TCBTemplate } from '@/types';

interface ChildTemplateActionMenuProps {
  template: TCBTemplate;
  onAction: (action: 'edit' | 'delete' | 'archive', templateId: string) => void;
}

export const ChildTemplateActionMenu: React.FC<ChildTemplateActionMenuProps> = ({ 
  template, 
  onAction 
}) => {
  const handleAction = async (action: 'edit' | 'delete' | 'archive') => {
    try {
      if (action === 'delete') {
        Modal.confirm({
          title: 'Are you sure you want to delete this child template?',
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
    ];

    // Add archive option
    if (template.status !== 'archived') {
      items.push({
        key: 'archive',
        icon: <InboxOutlined />,
        label: 'Archive',
        onClick: () => handleAction('archive')
      });
    }

    // Add delete only for non-published templates
    if (template.status !== 'published') {
      if (items.length > 0) {
        items.push({
          type: 'divider'
        } as any);
      }
      items.push({
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        onClick: () => handleAction('delete'),
      });
    }

    return items;
  };

  const menuItems = getMenuItems();
  
  // Don't render if no actions available
  if (menuItems.length === 0) {
    return null;
  }

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
      <Button type="text" icon={<MoreOutlined />} size="small" />
    </Dropdown>
  );
};

export default ChildTemplateActionMenu;
