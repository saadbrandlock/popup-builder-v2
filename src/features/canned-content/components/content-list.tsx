import React, { useState, useEffect } from 'react';
import {
  Select,
  Button,
  Space,
  Typography,
  Input,
  Popconfirm,
  message,
  Card,
} from 'antd';
import type { TableProps } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import { CBCannedContent } from '@/types';
import { useContentListingStore } from '@/stores/list/contentListing';
import { useContent } from '../hooks/use-content';
import { BaseProps } from '@/types/props';
import { useDebouncedCallback } from '@/lib/hooks';
import { TimeDisplay } from '@/components/common';
import SharedTemplateTable, {
  FilterComponent,
} from '@/components/common/shared-table';
import { useLoadingStore } from '@/stores/common/loading.store';
import CannedContentForm from './content-form';
import { useGenericStore } from '@/stores/generic.store';
import { useSyncGenericContext } from '@/lib/hooks/use-sync-generic-context';
import { splitByAndCapitalize } from '@/lib/utils/helper';

const { Search } = Input;

export interface CannedContentListProps extends BaseProps {}

const CannedContentList: React.FC<CannedContentListProps> = ({
  apiClient,
  navigate,
  shoppers,
  accountDetails,
  authProvider,
  accounts,
}) => {
  useSyncGenericContext({
    apiClient,
    navigate,
    accountDetails,
    authProvider,
    shoppers,
    accounts,
  });

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingContent, setEditingContent] = useState<CBCannedContent | null>(
    null
  );

  const { actions, pagination, filters, sorter, industries, fields, contents } =
    useContentListingStore();

  const { contentSubDataLoading, contentListingLoading } = useLoadingStore();

  const genericActions = useGenericStore((s) => s.actions);
  const genericAccountDetails = useGenericStore((s) => s.accountDetails);
  const genericShoppers = useGenericStore((s) => s.shoppers);
  const genericAuthProvider = useGenericStore((s) => s.authProvider);
  const genericNavigate = useGenericStore((s) => s.navigate);

  const {
    getContent,
    deleteContent,
    updateContent,
    createContent,
    getFields,
    getIndustries,
  } = useContent();

  const handleTableChange: TableProps<CBCannedContent>['onChange'] = (
    newPagination,
    _,
    newSorter
  ) => {
    const sorterResult = newSorter as SorterResult<CBCannedContent>;
    const newSortColumn = sorterResult.field as string;
    const newSortDirection = sorterResult.order as 'ascend' | 'descend';

    actions.setPagination(newPagination);
    actions.setSorter({
      sortColumn: newSortColumn,
      sortDirection: newSortDirection,
    });
  };

  const handleFilterChange = (
    filterType: 'industry' | 'field' | 'search' | 'shopper_ids',
    value: string | number[] | null
  ) => {
    actions.setFilters(value, filterType);
    actions.setPagination({ ...pagination, current: 1 });
  };

  const handleResetFilters = () => {
    const searchValue = filters.search;
    actions.resetFilters();
    actions.setFilters(searchValue as string, 'search');
    actions.setPagination({ ...pagination, current: 1 });
  };

  const handleEdit = (content: CBCannedContent) => {
    setEditingContent(content);
    setIsFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteContent(id);
      message.success('Content deleted successfully');
      getContent();
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingContent) {
        await updateContent(editingContent.id, values);
        message.success('Content updated successfully');
      } else {
        await createContent(values);
        message.success('Content created successfully');
      }
      setIsFormVisible(false);
      setEditingContent(null);
      getContent();
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  useEffect(() => {
    getIndustries();
    getFields();
  }, []);

  const debouncedFetchContents = useDebouncedCallback(() => getContent(), 500);

  useEffect(() => {
    if (filters.search !== undefined) {
      debouncedFetchContents();
    } else {
      getContent();
    }
  }, [pagination.current, pagination.pageSize, filters, sorter]);

  const columns: TableProps<CBCannedContent>['columns'] = [
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
      sorter: true,
      render: (text) => splitByAndCapitalize(text, '_'),
    },
    {
      title: 'Field',
      dataIndex: 'field_name',
      key: 'field_name',
      sorter: true,
      render: (text) => splitByAndCapitalize(text, '_'),
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      sorter: true,
      render: (text) => <div style={{ maxWidth: 300 }}>{text}</div>,
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      sorter: true,
      render: (dateString) => (
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
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete Content"
            description="Are you sure you want to delete this content?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filterComponents: FilterComponent[] = [
    {
      key: 'industry',
      component: (
        <Select
          value={filters.industry}
          allowClear
          style={{ width: '100%' }}
          placeholder="Filter by Industry"
          onChange={(value) => handleFilterChange('industry', value)}
          options={industries.map((i) => ({
            label: splitByAndCapitalize(i, '_'),
            value: i,
          }))}
          loading={contentSubDataLoading}
        />
      ),
    },
    {
      key: 'field',
      component: (
        <Select
          value={filters.field}
          allowClear
          style={{ width: '100%' }}
          placeholder="Filter by Field"
          onChange={(value) => handleFilterChange('field', value)}
          options={fields.map((f) => ({
            label: splitByAndCapitalize(f.key, '_'),
            value: f.value,
          }))}
          loading={contentSubDataLoading}
        />
      ),
    },
    {
      key: 'shoppers',
      component: (
        <Select
          value={filters.shopper_ids}
          allowClear
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Filter by Shopper Segments"
          onChange={(value) => handleFilterChange('shopper_ids', value)}
          options={shoppers.map((s) => ({ label: s.name, value: s.id }))}
        />
      ),
    },
  ];

  const actionButtons = (
    <Button type="primary" onClick={() => setIsFormVisible(true)}>
      Add New Content
    </Button>
  );

  useEffect(() => {
    if (!genericAccountDetails && accountDetails) {
      genericActions.setAccount(accountDetails);
    }
    if (!genericAuthProvider && authProvider) {
      genericActions.setAuthProvider(authProvider);
    }
    if (!genericShoppers.length && shoppers) {
      genericActions.setShoppers(shoppers);
    }
    if (!genericNavigate && navigate) {
      genericActions.setNavigate(navigate);
    }
  }, [authProvider, accountDetails, shoppers, navigate]);

  return (
    <>
      {/* {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )} */}
      <Card>
        <SharedTemplateTable<CBCannedContent>
          columns={columns}
          rowKey="id"
          dataSource={contents}
          pagination={pagination}
          loading={contentListingLoading}
          onChange={handleTableChange}
          filters={filterComponents}
          search={
            <Search
              placeholder="Search content......."
              allowClear
              onSearch={(value) => handleFilterChange('search', value || null)}
              onChange={(e) =>
                handleFilterChange('search', e.target.value || null)
              }
              style={{ width: '400px' }}
            />
          }
          actionButtons={actionButtons}
          onResetFilters={handleResetFilters}
        />
      </Card>
      <CannedContentForm
        visible={isFormVisible}
        onCancel={() => {
          setIsFormVisible(false);
          setEditingContent(null);
        }}
        onSubmit={handleFormSubmit}
        initialValues={editingContent}
        industries={industries}
        fields={fields}
      />
    </>
  );
};

export default CannedContentList;
