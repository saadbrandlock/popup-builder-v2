import React, { useEffect } from 'react';
import { AxiosInstance } from 'axios';
import {
  Typography,
  Button,
  Table,
  Empty,
  Spin,
  Space,
  Tag,
  Dropdown,
  Alert,
  Select,
  Input,
  TableProps,
} from 'antd';
import {
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  EyeOutlined,
  CheckOutlined,
  InboxOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { CouponTemplate } from '../types';
import StatusTag from './common/StatusTag';
import DeviceTags from './common/DeviceTags';
import {
  SharedTemplateTable,
  ShopperSegmentTagGroup,
  TimeDisplay,
} from '@/components/common';
import { FilterComponent } from '@/components/common/shared-table';
import { useTemplateListingStore } from '@/stores/list/templateListing.store';
import { useDevicesStore } from '@/stores/common/devices.store';
import { useLoadingStore } from '@/stores/common/loading.store';
import { SorterResult } from 'antd/es/table/interface';
import { AccountDetails, ShopperType } from '@/types';
import { BaseProps } from '@/types/props';
import { useGenericStore } from '@/stores/generic.store';
import { shopperLookup } from '@/lib/utils/helper';
import { useDebouncedCallback } from '@/lib/hooks/use-debounce';
import { FetchParams } from '@/api/types/main.types';
import { useTemplateListing } from '../hooks/use-template-listing';

const { Title, Text } = Typography;
const { Search } = Input;

interface TemplatesListingProps extends BaseProps {}

export const TemplatesListing: React.FC<TemplatesListingProps> = ({
  apiClient,
  navigate,
  shoppers,
  accountDetails,
  authProvider,
}) => {
  const { handleAction, getTemplates, getDevices } =
    useTemplateListing({apiClient});

  const { devices } = useDevicesStore();
  const { devicesLoading, templateListingLoading } = useLoadingStore();
  const {
    actions: genericActions,
    accountDetails: genericAccountDetails,
    shoppers: genericShoppers,
    authProvider: genericAuthProvider,
    navigate: genericNavigate,
  } = useGenericStore();
  const { templates, pagination, filters, sorter, error, actions } =
    useTemplateListingStore();

  const getActionMenuItems = (template: CouponTemplate) => {
    const items = [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
        onClick: () => handleAction('edit', template.id),
      },
      {
        key: 'preview',
        icon: <EyeOutlined />,
        label: 'Preview',
        onClick: () => handleAction('preview', template.id),
      },
    ];

    if (template.status === 'draft') {
      items.push({
        key: 'publish',
        icon: <CheckOutlined />,
        label: 'Publish',
        onClick: () => handleAction('publish', template.id),
      });
    }

    if (template.status !== 'archived') {
      items.push({
        key: 'archive',
        icon: <InboxOutlined />,
        label: 'Archive',
        onClick: () => handleAction('archive', template.id),
      });
    }

    if (template.status !== 'published') {
      items.push({
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        onClick: () => handleAction('delete', template.id),
      });
    }

    return items;
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Device',
      dataIndex: 'devices',
      key: 'devices',
      sorter: true,
      render: (devices: string[]) => <DeviceTags devices={devices} />,
    },
    {
      title: 'Shopper Segments',
      dataIndex: 'shopper_ids',
      key: 'shopper_ids',
      width: 220,
      render: (shopper_ids: number[]) => {
        return (
          <ShopperSegmentTagGroup
            shopperIds={shopper_ids}
            shopperLookup={shopperLookup(shoppers)}
            maxVisible={2}
            showTooltip={true}
          />
        );
      },
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusTag status={status as any} />,
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdated',
      sorter: true,
      key: 'lastUpdated',
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
      width: 60,
      render: (_: any, template: CouponTemplate) => (
        <Dropdown
          menu={{ items: getActionMenuItems(template) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ];

  const filterComponents: FilterComponent[] = [
    {
      key: 'device',
      component: (
        <Select
          allowClear
          style={{ width: '100%' }}
          placeholder="Filter by Device"
          onChange={(value) => handleFilterChange('deviceId', value)}
          value={filters.deviceId}
          options={devices.map((device) => ({
            label: device.device_type,
            value: device.id,
          }))}
          loading={devicesLoading}
        />
      ),
    },
    {
      key: 'status',
      component: (
        <Select
          allowClear
          style={{ width: '100%' }}
          placeholder="Filter by Status"
          onChange={(value) => handleFilterChange('status', value)}
          value={filters.status}
          options={[
            { label: 'Draft', value: 'draft' },
            { label: 'Active', value: 'active' },
            { label: 'Archived', value: 'archived' },
            { label: 'Published', value: 'published' },
          ]}
        />
      ),
    },
  ];

  const handleFilterChange = (
    filterType: 'deviceId' | 'status' | 'nameSearch',
    value: number | string | null
  ) => {
    actions.setFilters(value, filterType);
    actions.setPagination({ ...pagination, current: 1 });
  };

  const handleResetFilters = () => {
    actions.resetFilters();
    actions.setPagination({ ...pagination, current: 1 });
  };

  const handleTableChange: TableProps<CouponTemplate>['onChange'] = (
    newPagination,
    tableFilters, // Antd table filters, not used directly here as we have separate state
    newSorter
  ) => {
    const sorterResult = newSorter as SorterResult<CouponTemplate>;
    const newSortColumn = sorterResult.field
      ? `t.${sorterResult.field}`
      : 't.name';
    const newSortDirection = sorterResult.order
      ? sorterResult.order === 'ascend'
        ? 'asc'
        : 'desc'
      : 'asc';

    actions.setPagination(newPagination);
    actions.setSorter({
      sortColumn: newSortColumn,
      sortDirection: newSortDirection === 'asc' ? 'ascend' : 'descend',
    });
  };

  const debouncedFetchTemplates = useDebouncedCallback(
    () => getTemplates(),
    500
  );

  useEffect(() => {
    if (filters.nameSearch !== undefined) {
      debouncedFetchTemplates();
    } else {
      getTemplates();
    }
  }, [filters, pagination.current, pagination.pageSize, sorter]);

  useEffect(() => {
    getDevices();
  }, []);

  useEffect(() => {
    if (!genericAccountDetails && accountDetails) {
      genericActions.setAccount(accountDetails);
    }
    if (!genericAuthProvider && authProvider) {
      genericActions.setAuthProvider(authProvider);
    }
    if (!genericShoppers && shoppers) {
      genericActions.setShoppers(shoppers);
    }
    if (!genericNavigate && navigate) {
      genericActions.setNavigate(navigate);
    }
  }, [authProvider, accountDetails, shoppers, navigate]);

  const renderError = () => (
    <div className="text-center py-12">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <Text type="danger">Error loading templates</Text>
            <br />
            <Text type="secondary" className="text-xs">
              {error}
            </Text>
          </div>
        }
      />
    </div>
  );

  if (error) {
    return renderError();
  }

  return (
    <div className={`space-y-6`}>
      {/* Header */}
      <div className="flex sm:items-center justify-between gap-4">
        <div>
          <Title level={2} className="!mb-1">
            Coupon Templates Listing
          </Title>
          <Text type="secondary">
            Manage and organize your coupon templates
          </Text>
        </div>

        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/coupon-builder-v2/template/new')}
          >
            Create Template
          </Button>
        </Space>
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <SharedTemplateTable<CouponTemplate>
        title=""
        columns={columns}
        rowKey="id"
        dataSource={templates}
        pagination={pagination}
        loading={templateListingLoading}
        onChange={handleTableChange}
        filters={filterComponents}
        onResetFilters={handleResetFilters}
        search={
          <Search
            placeholder="Search by name"
            allowClear
            onSearch={(value) =>
              handleFilterChange('nameSearch', value || null)
            }
            onChange={(e) =>
              handleFilterChange('nameSearch', e.target.value || null)
            }
            value={filters.nameSearch}
            style={{ width: '400px' }}
          />
        }
      />
    </div>
  );
};

export default TemplatesListing;
