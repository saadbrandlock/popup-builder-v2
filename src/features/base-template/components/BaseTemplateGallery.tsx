import React, { useEffect, useState } from 'react';
import {
  Typography,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Empty,
  Tag,
  Space,
  Tooltip,
  Dropdown,
  MenuProps,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  MoreOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useBaseTemplateStore, useCategoryStore } from '../stores';
import { BaseTemplate } from '../types';
import { BaseProps } from '@/types/props';

const { Title, Text } = Typography;
const { Search } = Input;

interface BaseTemplateGalleryProps extends Partial<BaseProps> {
  onCreateTemplate: () => void;
  onEditTemplate: (template: BaseTemplate) => void;
  onPreviewTemplate: (template: BaseTemplate) => void;
  onDeleteTemplate: (template: BaseTemplate) => void;
  loading?: boolean;
}

export const BaseTemplateGallery: React.FC<BaseTemplateGalleryProps> = ({
  onCreateTemplate,
  onEditTemplate,
  onPreviewTemplate,
  onDeleteTemplate,
  loading = false,
  navigate,
}) => {
  const { templates, filters, actions: templateActions } = useBaseTemplateStore();
  const { categories } = useCategoryStore();

  const [filteredTemplates, setFilteredTemplates] = useState<BaseTemplate[]>([]);

  useEffect(() => {
    let result = [...templates];

    if (filters.categoryId) {
      result = result.filter((t) => t.category_id === filters.categoryId);
    }

    if (filters.status) {
      result = result.filter((t) => t.status === filters.status);
    }

    if (filters.nameSearch) {
      const search = filters.nameSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search)
      );
    }

    setFilteredTemplates(result);
  }, [templates, filters]);

  const getActionMenuItems = (template: BaseTemplate): MenuProps['items'] => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => onEditTemplate(template),
    },
    {
      key: 'preview',
      icon: <EyeOutlined />,
      label: 'Preview',
      onClick: () => onPreviewTemplate(template),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: () => onDeleteTemplate(template),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'draft':
        return 'orange';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
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
                <Select.Option value="draft">Draft</Select.Option>
                <Select.Option value="archived">Archived</Select.Option>
              </Select>
            </Col>
          </Row>

          {filteredTemplates.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredTemplates.map((template) => (
                <Col xs={24} sm={12} md={8} lg={6} key={template.id}>
                  <Card
                    hoverable
                    cover={
                      <div
                        style={{
                          height: 200,
                          background: template.thumbnail_url
                            ? `url(${template.thumbnail_url}) center/cover`
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {!template.thumbnail_url && (
                          <Text style={{ color: 'white', fontSize: 48 }}>
                            📄
                          </Text>
                        )}
                      </div>
                    }
                    actions={[
                      <Tooltip title="Edit">
                        <EditOutlined
                          key="edit"
                          onClick={() => onEditTemplate(template)}
                        />
                      </Tooltip>,
                      <Tooltip title="Preview">
                        <EyeOutlined
                          key="preview"
                          onClick={() => onPreviewTemplate(template)}
                        />
                      </Tooltip>,
                      <Dropdown
                        menu={{ items: getActionMenuItems(template) }}
                        trigger={['click']}
                      >
                        <MoreOutlined key="more" />
                      </Dropdown>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Tooltip title={template.name}>
                          <div
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {template.name}
                          </div>
                        </Tooltip>
                      }
                      description={
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {template.description && (
                            <Text
                              type="secondary"
                              style={{
                                fontSize: 12,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {template.description}
                            </Text>
                          )}
                          <Space size="small">
                            <Tag color={getStatusColor(template.status)}>
                              {template.status}
                            </Tag>
                            {template.category && (
                              <Tag icon={<FolderOutlined />}>
                                {template.category.name}
                              </Tag>
                            )}
                          </Space>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description={
                filters.categoryId || filters.status || filters.nameSearch
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
