import React, { useState } from 'react';
import { Tag, Space, Tooltip } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { 
  MobileOutlined, 
  TabletOutlined, 
  DesktopOutlined, 
  UserOutlined,
  CheckCircleOutlined,
  EditOutlined,
  PauseCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  HistoryOutlined
} from '@ant-design/icons';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export interface TagItem {
  key: string | number;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

export interface EnhancedTagGroupProps {
  title: string;
  items: TagItem[];
  maxVisible?: number;
  showTooltip?: boolean;
  maxWidth?: number;
}

// Helper function to get device icon
export const getDeviceIcon = (deviceType: string): React.ReactNode => {
  const type = deviceType.toLowerCase();
  if (type.includes('mobile') || type.includes('phone')) return <MobileOutlined />;
  if (type.includes('tablet')) return <TabletOutlined />;
  if (type.includes('desktop') || type.includes('computer')) return <DesktopOutlined />;
  return null;
};

// Helper function to get device color
export const getDeviceColor = (deviceType: string): string => {
  const type = deviceType.toLowerCase();
  if (type.includes('mobile') || type.includes('phone')) return 'blue';
  if (type.includes('tablet')) return 'orange';
  if (type.includes('desktop') || type.includes('computer')) return 'green';
  return 'default';
};

// Helper function to get status color based on status value
export const getStatusColor = (status: string): string => {
  if (!status) return 'default';
  
  const statusLower = status.toLowerCase();
  
  // Active/Live/Published states
  if (statusLower.includes('active') || statusLower.includes('live') || statusLower.includes('published')) {
    return 'green';
  }
  
  // Draft/Pending states
  if (statusLower.includes('draft') || statusLower.includes('pending') || statusLower.includes('editing')) {
    return 'blue';
  }
  
  // Paused/Suspended states
  if (statusLower.includes('pause') || statusLower.includes('suspend') || statusLower.includes('hold')) {
    return 'orange';
  }
  
  // Archived/Inactive/Disabled states
  if (statusLower.includes('archive') || statusLower.includes('inactive') || statusLower.includes('disable')) {
    return 'red';
  }
  
  // Review/Approval states
  if (statusLower.includes('review') || statusLower.includes('approval') || statusLower.includes('waiting')) {
    return 'purple';
  }
  
  // Error/Failed states
  if (statusLower.includes('error') || statusLower.includes('fail') || statusLower.includes('reject')) {
    return 'volcano';
  }
  
  // Default for unknown statuses
  return 'default';
};

// Helper function to get status icon
export const getStatusIcon = (status: string): React.ReactNode => {
  if (!status) return null;
  
  const statusLower = status.toLowerCase();
  
  // Active/Live/Published states
  if (statusLower.includes('active') || statusLower.includes('live') || statusLower.includes('published')) {
    return <CheckCircleOutlined />;
  }
  
  // Draft/Pending/Editing states
  if (statusLower.includes('draft') || statusLower.includes('pending') || statusLower.includes('editing')) {
    return <EditOutlined />;
  }
  
  // Paused/Suspended states
  if (statusLower.includes('pause') || statusLower.includes('suspend') || statusLower.includes('hold')) {
    return <PauseCircleOutlined />;
  }
  
  // Archived/Inactive/Disabled states
  if (statusLower.includes('archive') || statusLower.includes('inactive') || statusLower.includes('disable')) {
    return <StopOutlined />;
  }
  
  // Review/Approval/Waiting states
  if (statusLower.includes('review') || statusLower.includes('approval') || statusLower.includes('waiting')) {
    return <ClockCircleOutlined />;
  }
  
  // Error/Failed states
  if (statusLower.includes('error') || statusLower.includes('fail') || statusLower.includes('reject')) {
    return <ExclamationCircleOutlined />;
  }
  
  return null;
};

// Helper function to get relative time
export const getRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Never';
  
  try {
    const date = dayjs(dateString);
    if (!date.isValid()) return 'Invalid date';
    
    return date.fromNow();
  } catch (error) {
    return 'Invalid date';
  }
};

// Helper function to format full date
export const formatFullDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'No date available';
  
  try {
    const date = dayjs(dateString);
    if (!date.isValid()) return 'Invalid date format';
    
    return date.format('dddd, MMMM D, YYYY [at] h:mm:ss A');
  } catch (error) {
    return 'Invalid date format';
  }
};

// Helper function to get time-based color
export const getTimeColor = (dateString: string | null | undefined): string => {
  if (!dateString) return 'default';
  
  try {
    const date = dayjs(dateString);
    if (!date.isValid()) return 'default';
    
    const now = dayjs();
    const diffInHours = now.diff(date, 'hour');
    
    if (diffInHours < 1) return 'green';        // Very recent
    if (diffInHours < 24) return 'blue';        // Within last day
    if (diffInHours < 168) return 'orange';     // Within last week
    return 'default';                           // Older
  } catch (error) {
    return 'default';
  }
};

// Helper function to create device tag items
export const createDeviceTagItems = (devices: { id: number; device_type: string }[]): TagItem[] => {
  return devices.map((device) => ({
    key: device.id,
    label: device.device_type,
    color: getDeviceColor(device.device_type),
    icon: getDeviceIcon(device.device_type),
  }));
};

// Helper function to create shopper segment tag items
export const createShopperTagItems = (
  shopperIds: number[],
  shopperLookup: Map<number, string>
): TagItem[] => {
  return shopperIds.map((id) => ({
    key: id,
    label: shopperLookup.get(id) || `Shopper ${id}`,
    color: 'purple',
    icon: <UserOutlined />,
  }));
};

// Enhanced tag component with tooltip and collapsible functionality
export const EnhancedTagGroup: React.FC<EnhancedTagGroupProps> = ({
  title,
  items,
  maxVisible = 2,
  showTooltip = true,
  maxWidth = 280,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) {
    return (
      <div style={{ color: '#999', fontStyle: 'italic', fontSize: '12px' }}>
        No {title.toLowerCase()}
      </div>
    );
  }

  const visibleItems = expanded ? items : items.slice(0, maxVisible);
  const hasMore = items.length > maxVisible;

  const content = (
    <Space wrap size={[4, 4]} style={{ maxWidth }}>
      {visibleItems.map((item) => (
        <Tag
          key={item.key}
          color={item.color}
          icon={item.icon}
          style={{
            margin: '2px 0',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '500',
          }}
        >
          {item.label}
        </Tag>
      ))}
      {hasMore && !expanded && (
        <Tag
          style={{
            cursor: 'pointer',
            backgroundColor: '#f0f0f0',
            borderColor: '#d9d9d9',
            color: '#666',
            fontSize: '11px',
          }}
          onClick={() => setExpanded(true)}
        >
          +{items.length - maxVisible} more
        </Tag>
      )}
      {expanded && hasMore && (
        <Tag
          style={{
            cursor: 'pointer',
            backgroundColor: '#f0f0f0',
            borderColor: '#d9d9d9',
            color: '#666',
            fontSize: '11px',
          }}
          onClick={() => setExpanded(false)}
        >
          Show less
        </Tag>
      )}
    </Space>
  );

  if (showTooltip && items.length > maxVisible && !expanded) {
    const tooltipContent = (
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>All {title}:</div>
        {items.map((item) => (
          <div key={item.key} style={{ margin: '2px 0' }}>
            {item.icon} {item.label}
          </div>
        ))}
      </div>
    );

    return (
      <Tooltip title={tooltipContent} placement="topLeft">
        {content}
      </Tooltip>
    );
  }

  return content;
};

// Preset components for common use cases
export const DeviceTagGroup: React.FC<{
  devices: { id: number; device_type: string }[];
  maxVisible?: number;
  showTooltip?: boolean;
}> = ({ devices, maxVisible = 2, showTooltip = true }) => {
  const deviceItems = createDeviceTagItems(devices);
  return (
    <EnhancedTagGroup
      title="Devices"
      items={deviceItems}
      maxVisible={maxVisible}
      showTooltip={showTooltip}
    />
  );
};

export const ShopperSegmentTagGroup: React.FC<{
  shopperIds: number[];
  shopperLookup: Map<number, string>;
  maxVisible?: number;
  showTooltip?: boolean;
}> = ({ shopperIds, shopperLookup, maxVisible = 3, showTooltip = true }) => {
  const shopperItems = createShopperTagItems(shopperIds, shopperLookup);
  return (
    <EnhancedTagGroup
      title="Shopper Segments"
      items={shopperItems}
      maxVisible={maxVisible}
      showTooltip={showTooltip}
    />
  );
};

// Enhanced Status Tag component
export const StatusTag: React.FC<{
  status: string | null | undefined;
  showIcon?: boolean;
  style?: React.CSSProperties;
}> = ({ status, showIcon = true, style = {} }) => {
  if (!status) {
    return (
      <Tag style={{ color: '#999', fontStyle: 'italic', ...style }}>
        No status
      </Tag>
    );
  }

  const color = getStatusColor(status);
  const icon = showIcon ? getStatusIcon(status) : null;
  
  return (
    <Tag 
      color={color} 
      icon={icon}
      style={{ 
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '500',
        textTransform: 'capitalize',
        ...style 
      }}
    >
      {status}
    </Tag>
  );
};

// Enhanced Status Group for multiple statuses (if needed)
export const StatusTagGroup: React.FC<{
  statuses: string[];
  maxVisible?: number;
  showTooltip?: boolean;
  showIcon?: boolean;
}> = ({ statuses, maxVisible = 2, showTooltip = true, showIcon = true }) => {
  const statusItems: TagItem[] = statuses.map((status, index) => ({
    key: index,
    label: status,
    color: getStatusColor(status),
    icon: showIcon ? getStatusIcon(status) : undefined,
  }));

  return (
    <EnhancedTagGroup
      title="Statuses"
      items={statusItems}
      maxVisible={maxVisible}
      showTooltip={showTooltip}
    />
  );
};

// Enhanced Time Display component
export const TimeDisplay: React.FC<{
  dateString: string | null | undefined;
  showIcon?: boolean;
  showRelative?: boolean;
  style?: React.CSSProperties;
}> = ({ dateString, showIcon = true, showRelative = true, style = {} }) => {
  if (!dateString) {
    return (
      <span style={{ color: '#999', fontStyle: 'italic', fontSize: '12px', ...style }}>
        {showIcon && <HistoryOutlined style={{ marginRight: '4px' }} />}
        Never updated
      </span>
    );
  }

  const relativeTime = getRelativeTime(dateString);
  const fullDate = formatFullDate(dateString);
  const color = getTimeColor(dateString);
  
  const content = (
    <span style={{ fontSize: '12px', ...style }}>
      {showIcon && <HistoryOutlined style={{ marginRight: '4px', color: color === 'default' ? '#666' : undefined }} />}
      <span style={{ color: color === 'default' ? '#666' : undefined }}>
        {showRelative ? relativeTime : dayjs(dateString).format('MMM D, YYYY')}
      </span>
    </span>
  );

  return (
    <Tooltip title={fullDate} placement="topLeft">
      {content}
    </Tooltip>
  );
};

// Compact Time Display for very dense layouts
export const CompactTimeDisplay: React.FC<{
  dateString: string | null | undefined;
  format?: 'relative' | 'short' | 'date-only';
}> = ({ dateString, format = 'relative' }) => {
  if (!dateString) {
    return <span style={{ color: '#999', fontSize: '10px' }}>-</span>;
  }

  const fullDate = formatFullDate(dateString);
  let displayText = '';
  
  try {
    const date = dayjs(dateString);
    if (!date.isValid()) {
      displayText = 'Invalid';
    } else {
      switch (format) {
        case 'relative':
          displayText = getRelativeTime(dateString);
          break;
        case 'short':
          displayText = date.format('MMM D, h:mm A');
          break;
        case 'date-only':
          displayText = date.format('MMM D, YY');
          break;
        default:
          displayText = getRelativeTime(dateString);
      }
    }
  } catch (error) {
    displayText = 'Invalid';
  }

  return (
    <Tooltip title={fullDate} placement="topLeft">
      <Tag style={{ fontSize: '10px', margin: 0, padding: '2px 6px' }}>
        {displayText}
      </Tag>
    </Tooltip>
  );
};

// Compact version for very dense displays
export const CompactTagGroup: React.FC<{
  items: TagItem[];
  maxVisible?: number;
  title?: string;
}> = ({ items, maxVisible = 1, title }) => {
  if (items.length === 0) return <span style={{ color: '#999' }}>-</span>;

  if (items.length === 1) {
    const item = items[0];
    return (
      <Tag color={item.color} icon={item.icon} style={{ fontSize: '10px' }}>
        {item.label}
      </Tag>
    );
  }

  const visibleItems = items.slice(0, maxVisible);
  const remaining = items.length - maxVisible;

  const tooltipContent = title && (
    <div>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{title}:</div>
      {items.map((item) => (
        <div key={item.key} style={{ margin: '2px 0', fontSize: '12px' }}>
          {item.icon} {item.label}
        </div>
      ))}
    </div>
  );

  return (
    <Tooltip title={tooltipContent} placement="topLeft">
      <Space size={2}>
        {visibleItems.map((item) => (
          <Tag
            key={item.key}
            color={item.color}
            icon={item.icon}
            style={{ fontSize: '10px', margin: '1px' }}
          >
            {item.label}
          </Tag>
        ))}
        {remaining > 0 && <Tag style={{ fontSize: '10px', margin: '1px' }}>+{remaining}</Tag>}
      </Space>
    </Tooltip>
  );
};
