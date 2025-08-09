import React, { useState, useMemo } from 'react';
import { Card, Input, Select, Spin, Alert, Empty, Tabs, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ComponentLibraryProps } from '../types';
import { useComponentLibrary } from '../hooks';
import { DraggableComponent } from './DraggableComponent';
import { useDebouncedCallback } from '../../../lib/hooks/use-debounce';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * ComponentLibrary - Panel displaying available components that can be dragged to canvas
 * Supports filtering, searching, and categorization
 */
export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
  apiClient,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const {
    components,
    loading,
    error,
    reload,
    searchComponents,
    filterByCategory,
    getComponentsByCategory,
    getCategories,
  } = useComponentLibrary(apiClient);

  // Get available categories
  const categories = useMemo(() => getCategories(), [getCategories]);

  // Filter components by category locally (since we now load filtered data from API)
  const filteredComponents = useMemo(() => {
    return selectedCategory === 'all'
      ? components
      : getComponentsByCategory(selectedCategory);
  }, [components, selectedCategory, getComponentsByCategory]);

  // Group components by category for tab view
  const componentsByCategory = useMemo(() => {
    const grouped: Record<string, typeof components> = {};

    filteredComponents.forEach((component) => {
      const category = component.category_code;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(component);
    });

    return grouped;
  }, [filteredComponents]);

  // Debounced search function
  const debouncedSearch = useDebouncedCallback(async (searchValue: string) => {
    await searchComponents(searchValue);
  }, 500);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    await filterByCategory(category);
  };

  const renderComponentGrid = (categoryComponents: typeof components) => {
    if (categoryComponents.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No components found"
          style={{ margin: '20px 0' }}
        />
      );
    }

    return (
      <Row className="mt-4" gutter={[6, 6]}>
        {categoryComponents.map((component) => (
          <Col xs={24} md={12}>
            <DraggableComponent key={component.id} component={component} />
          </Col>
        ))}
      </Row>
    );
  };

  const renderCategoryTab = (category: string) => {
    const categoryComponents = componentsByCategory[category];
    if (!categoryComponents) return null;

    // Get category display name from first component in category
    const categoryDisplayName =
      categoryComponents[0]?.category_display_name ||
      category.charAt(0).toUpperCase() + category.slice(1);

    return (
      <TabPane
        tab={
          <span>
            {categoryDisplayName}
            <span className="text-gray-400 text-xs ml-1 overflow-y-auto">
              ({categoryComponents.length})
            </span>
          </span>
        }
        key={category}
      >
        {renderComponentGrid(categoryComponents)}
      </TabPane>
    );
  };

  if (error) {
    return (
      <Card
        className={`h-full flex flex-col ${className}`}
        variant="borderless"
        styles={{
          body: {
            padding: '16px',
          },
        }}
      >
        <Alert
          message="Failed to load components"
          description={error}
          type="error"
          showIcon
          action={
            <button
              onClick={reload}
              className="bg-transparent border-none text-blue-500 cursor-pointer flex items-center gap-1 hover:underline"
            >
              <ReloadOutlined /> Retry
            </button>
          }
        />
      </Card>
    );
  }

  return (
    <Card
      className={`${className} !rounded-none`}
      title="Components"
      variant="borderless"
      size="small"
      styles={{
        body: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '12px',
        },
      }}
      extra={
        <div className="flex gap-2">
          <button
            onClick={reload}
            className="bg-transparent border-none cursor-pointer p-1 rounded text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reload components"
            disabled={loading}
          >
            <ReloadOutlined spin={loading} />
          </button>
        </div>
      }
    >
      {/* Search and filter controls */}
      {/* Search and filter controls */}
      <div className="flex gap-2 mb-3 flex-col items-end">
        <Search
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onSearch={handleSearch}
          prefix={<SearchOutlined />}
          allowClear
          size="small"
          className="flex-1"
        />

        <Select
          value={selectedCategory}
          onChange={handleCategoryChange}
          size="small"
          className="w-full"
          style={{ width: 120 }}
        >
          <Option value="all">All ({components.length})</Option>
          {categories.map((category) => {
            const count = getComponentsByCategory(category).length;
            const categoryDisplayName =
              components.find((c) => c.category_code === category)
                ?.category_display_name ||
              category.charAt(0).toUpperCase() + category.slice(1);
            return (
              <Option key={category} value={category}>
                {categoryDisplayName} ({count})
              </Option>
            );
          })}
        </Select>
      </div>

      {/* Component content */}
      {/* Component content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-52 text-gray-500">
            <Spin size="large" />
            <p className="mt-3 mb-0 text-gray-500">Loading components...</p>
          </div>
        ) : (
          <Tabs
            type="card"
            size="small"
            className="h-full flex flex-col"
            tabBarStyle={{ marginBottom: 0, flexShrink: 0 }}
          >
            {/* All components tab */}
            <TabPane
              tab={
                <span>
                  All
                  <span className="category-count">
                    ({filteredComponents.length})
                  </span>
                </span>
              }
              key="all"
            >
              {renderComponentGrid(filteredComponents)}
            </TabPane>

            {/* Category-specific tabs */}
            {categories
              .map((category) => renderCategoryTab(category))
              .filter(Boolean)}
          </Tabs>
        )}
      </div>
    </Card>
  );
};
