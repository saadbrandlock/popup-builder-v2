import React, { useMemo } from 'react';
import { Select, Tag, Typography } from 'antd';
import type { SelectProps } from 'antd';
import { BaseTemplate } from '@/features/base-template/types';

const { Text } = Typography;

interface BaseTemplateSelectProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  disabled?: boolean;
  loading?: boolean;
  baseTemplates: BaseTemplate[];
}

type BaseTemplateOption = {
  value: string;
  label: string;
  searchLabel: string;
  name: string;
  categoryName: string;
  isFeatured: boolean;
};

const BaseTemplateSelect: React.FC<BaseTemplateSelectProps> = ({
  value,
  onChange,
  disabled,
  loading,
  baseTemplates,
}) => {
  const options: SelectProps['options'] = useMemo(() => {
    const mapped: BaseTemplateOption[] = baseTemplates.map((t) => {
      const categoryName = t.category?.name || 'Uncategorized';
      const isFeatured = !!t.is_featured;
      const name = t.name || t.template_id || 'Untitled template';
      const collapsedLabel = categoryName ? `${name} — ${categoryName}` : name;

      return {
        value: t.template_id,
        label: collapsedLabel,
        searchLabel: `${name} ${categoryName}`.trim(),
        name,
        categoryName,
        isFeatured,
      };
    });

    return mapped;
  }, [baseTemplates]);

  const handleChange: SelectProps['onChange'] = (val) => {
    if (onChange) {
      onChange((val as string) ?? null);
    }
  };

  return (
    <Select
      allowClear
      showSearch
      placeholder="Search base templates by name or category (leave empty to start from scratch)"
      disabled={disabled}
      loading={loading}
      value={value ?? undefined}
      onChange={handleChange}
      options={options}
      optionFilterProp="searchLabel"
      optionRender={(option) => {
        const data = option.data as BaseTemplateOption;
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Text strong ellipsis className="max-w-full">
                {data.name}
              </Text>
              {data.isFeatured && (
                <Tag color="gold" style={{ marginLeft: 4 }}>
                  Featured
                </Tag>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
              {data.categoryName}
            </Text>
          </div>
        );
      }}
      filterOption={(input, option) =>
        ((option as any)?.searchLabel ?? '')
          .toLowerCase()
          .includes(input.toLowerCase())
      }
    />
  );
};

export default BaseTemplateSelect;

