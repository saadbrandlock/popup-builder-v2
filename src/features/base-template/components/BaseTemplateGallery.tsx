import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Typography,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Empty,
  Space,
  message,
} from 'antd';
import {
  PlusOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useBaseTemplateStore, useCategoryStore } from '../stores';
import { BaseTemplate } from '../types';
import { BaseProps } from '@/types/props';
import { BaseTemplateCard } from './BaseTemplateCard';
import { BaseTemplateCardSkeleton } from '@/components/skeletons';
import { useDebouncedCallback } from '@/lib/hooks';
import { createAPI } from '@/api';
import { useDevicesStore } from '@/stores/common/devices.store';
import { useLoadingStore } from '@/stores/common/loading.store';
import { useGenericStore } from '@/stores/generic.store';

const { Title, Text } = Typography;
const { Search } = Input;

interface BaseTemplateGalleryProps extends Partial<BaseProps> {
  onCreateTemplate: () => void;
  onEditTemplate: (template: BaseTemplate) => void;
  onPreviewTemplate: (template: BaseTemplate) => void;
  onDeleteTemplate: (template: BaseTemplate) => void;
  onUpdateStatus?: (template: BaseTemplate, status: 'archive' | 'active' | 'deleted') => Promise<void>;
  onLoadTemplates?: (filters?: {
    categoryId?: number | null;
    status?: string | null;
    nameSearch?: string | null;
  }) => Promise<void>;
  loading?: boolean;
}

export const BaseTemplateGallery: React.FC<BaseTemplateGalleryProps> = ({
  onCreateTemplate,
  onEditTemplate,
  onPreviewTemplate,
  onDeleteTemplate,
  onUpdateStatus,
  onLoadTemplates,
  loading = false,
  navigate,
}) => {
  const { templates, filters, actions: templateActions } = useBaseTemplateStore();
  const { categories } = useCategoryStore();
  const { devices, actions: deviceActions } = useDevicesStore();
  const { actions: loadingActions } = useLoadingStore();
  const apiClient = useGenericStore((s) => s.apiClient);

  // Load devices once on gallery init (stored in devices store, reused for preview; not on every re-render)
  useEffect(() => {
    if (devices.length > 0 || !apiClient) return;
    loadingActions.setDevicesLoading(true);
    const api = createAPI(apiClient);
    api.devices
      .getDevices()
      .then((response) => deviceActions.setDevices(response))
      .catch((error) => {
        console.error('Error loading devices:', error);
        message.error('Failed to load devices');
      })
      .finally(() => loadingActions.setDevicesLoading(false));
  }, [apiClient]); // Intentionally not depending on devices.length so we only run when apiClient is set

  // Track previous filter values to prevent unnecessary API calls
  const prevFiltersRef = useRef<{
    categoryId: number | null;
    status: string | null;
    nameSearch: string | null;
  }>({
    categoryId: filters.categoryId,
    status: filters.status,
    nameSearch: filters.nameSearch,
  });
  const isInitialMount = useRef(true);

  // Memoize filter values to compare actual changes
  const filterValues = useMemo(
    () => ({
      categoryId: filters.categoryId,
      status: filters.status,
      nameSearch: filters.nameSearch,
    }),
    [filters.categoryId, filters.status, filters.nameSearch]
  );

  // Store onLoadTemplates in ref to prevent unnecessary re-renders
  const onLoadTemplatesRef = useRef(onLoadTemplates);
  useEffect(() => {
    onLoadTemplatesRef.current = onLoadTemplates;
  }, [onLoadTemplates]);

  // Debounced load function for search
  const debouncedLoadTemplates = useDebouncedCallback(
    (filters: typeof filterValues) => {
      if (onLoadTemplatesRef.current) {
        onLoadTemplatesRef.current(filters);
      }
    },
    500
  );

  // Load templates when filters change (server-side filtering)
  useEffect(() => {
    if (!onLoadTemplatesRef.current) return;

    // Check if filters actually changed
    const filtersChanged =
      prevFiltersRef.current.categoryId !== filterValues.categoryId ||
      prevFiltersRef.current.status !== filterValues.status ||
      prevFiltersRef.current.nameSearch !== filterValues.nameSearch;

    if (!filtersChanged && !isInitialMount.current) {
      return;
    }

    // Update ref
    prevFiltersRef.current = { ...filterValues };
    isInitialMount.current = false;

    if (filterValues.nameSearch !== null && filterValues.nameSearch !== undefined && filterValues.nameSearch !== '') {
      // Use debounced version for search
      debouncedLoadTemplates(filterValues);
    } else {
      // Immediate load for category and status filters, or initial load
      onLoadTemplatesRef.current(filterValues);
    }
    // Only depend on actual filter values, not onLoadTemplates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues.categoryId, filterValues.status, filterValues.nameSearch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'archive':
        return 'orange';
      case 'deleted':
        return 'red';
      default:
        return 'default';
    }
  };

  const getAvailableStatuses = (currentStatus: string): Array<'archive' | 'active' | 'deleted'> => {
    const allStatuses: Array<'archive' | 'active' | 'deleted'> = ['archive', 'active', 'deleted'];
    return allStatuses.filter((status) => status !== currentStatus);
  };


  return (
    <div className="space-y-6">
      <div className="flex sm:items-center justify-between gap-4">
        <div>
          <Title level={2} className="mb-1!">
            Base Templates
          </Title>
          <Text type="secondary">
            Manage reusable template designs across categories
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreateTemplate}
        >
          Create Template
        </Button>
      </div>

      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Search templates..."
                allowClear
                onChange={(e) =>
                  templateActions.setFilters({ nameSearch: e.target.value || null })
                }
                value={filters.nameSearch || ''}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                allowClear
                style={{ width: '100%' }}
                placeholder="Filter by Category"
                onChange={(value) =>
                  templateActions.setFilters({ categoryId: value || null })
                }
                value={filters.categoryId}
              >
                {categories.map((category) => (
                  <Select.Option key={category.id} value={category.id}>
                    <Space>
                      <FolderOutlined />
                      {category.name}
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                allowClear
                style={{ width: '100%' }}
                placeholder="Filter by Status"
                onChange={(value) =>
                  templateActions.setFilters({ status: value || null })
                }
                value={filters.status}
              >
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="archive">Archive</Select.Option>
                <Select.Option value="deleted">Deleted</Select.Option>
              </Select>
            </Col>
          </Row>

          {loading ? (
            <Row gutter={[16, 16]}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <Col xs={24} sm={12} md={8} lg={6} key={item}>
                  <BaseTemplateCardSkeleton />
                </Col>
              ))}
            </Row>
          ) : templates.length > 0 ? (
            <Row gutter={[16, 16]}>
              {templates.map((template) => (
                <Col xs={24} sm={12} md={8} lg={6} key={template.id}>
                  <BaseTemplateCard
                    template={template}
                    onEditTemplate={onEditTemplate}
                    onPreviewTemplate={onPreviewTemplate}
                    onDeleteTemplate={onDeleteTemplate}
                    onUpdateStatus={onUpdateStatus}
                    getStatusColor={getStatusColor}
                    getAvailableStatuses={getAvailableStatuses}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description={
                !loading && (filters.categoryId || filters.status || filters.nameSearch)
                  ? 'No templates found matching your filters'
                  : 'No templates yet. Create your first template!'
              }
            />
          )}
        </Space>
      </Card>
    </div>
  );
};
