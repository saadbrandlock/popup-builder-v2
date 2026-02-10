import React from 'react';
import { Tabs, Typography } from 'antd';
import { ClientFlowData } from '@/types';
import { getTemplateOptionLabels } from '../utils/template-filters';
import { cn } from '@/lib/utils';

const { Text } = Typography;

export interface TemplateReviewSelectorProps {
  /** Templates to show as tabs (e.g. for current device). */
  templates: ClientFlowData[];
  /** Currently selected template_id. */
  value: string | null;
  onChange: (templateId: string) => void;
  /** Label shown above the tabs (e.g. "Select template to review:"). */
  label?: React.ReactNode;
  className?: string;
  /** Tab size. */
  size?: 'small' | 'middle' | 'large';
}

/**
 * Shared template selector using Ant Design Tabs for review steps (Desktop, Mobile, Final).
 * Each tab shows the template name; switching tabs shows that template's description below the tab bar.
 */
export const TemplateReviewSelector: React.FC<TemplateReviewSelectorProps> = ({
  templates,
  value,
  onChange,
  label,
  className,
  size = 'middle',
}) => {
  const activeKey = value ?? templates[0]?.template_id ?? null;

  const tabItems = React.useMemo(
    () =>
      templates.map((t) => {
        const { name } = getTemplateOptionLabels(t);
        return {
          key: t.template_id,
          label: name,
        };
      }),
    [templates]
  );

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label != null && (
        <Text strong className="shrink-0">
          {label}
        </Text>
      )}
      <Tabs
        type="line"
        size={size}
        activeKey={activeKey ?? undefined}
        onChange={(key) => onChange(key)}
        items={tabItems}
        className="template-review-selector-tabs"
      />
    </div>
  );
};
