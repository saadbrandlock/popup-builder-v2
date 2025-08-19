import React, { memo } from 'react';
import { Input, Switch, Radio, InputNumber, Divider, Typography } from 'antd';
import { VALIDATION_CONSTRAINTS } from '@/features/builder/utils/reminderTabConstants';
import type { ConfigTabProps } from '@/features/builder/types';

const { Text } = Typography;

const BasicSettingsTab: React.FC<ConfigTabProps> = memo(({ 
  config, 
  updateConfig 
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <Text strong>Enable Reminder Tab</Text>
        <br />
        <Text type="secondary" className="text-sm">
          Show or hide the reminder tab on your website
        </Text>
      </div>
      <Switch 
        checked={config.enabled}
        onChange={(checked) => updateConfig('enabled', checked)}
      />
    </div>

    <Divider />

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Display Text</label>
        <Input 
          value={config.display.text}
          onChange={(e) => updateConfig('display.text', e.target.value)}
          placeholder="e.g., Special Offer!" 
          maxLength={VALIDATION_CONSTRAINTS.text.maxLength}
          showCount
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Position</label>
        <Radio.Group 
          value={config.display.position}
          onChange={(e) => updateConfig('display.position', e.target.value)}
        >
          <Radio.Button value="left">Left Side</Radio.Button>
          <Radio.Button value="right">Right Side</Radio.Button>
        </Radio.Group>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Width (px)</label>
          <InputNumber 
            value={config.styling.dimensions.width}
            onChange={(value) => updateConfig('styling.dimensions.width', value)}
            min={VALIDATION_CONSTRAINTS.dimensions.width.min} 
            max={VALIDATION_CONSTRAINTS.dimensions.width.max} 
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Height (px)</label>
          <InputNumber 
            value={config.styling.dimensions.height}
            onChange={(value) => updateConfig('styling.dimensions.height', value)}
            min={VALIDATION_CONSTRAINTS.dimensions.height.min} 
            max={VALIDATION_CONSTRAINTS.dimensions.height.max} 
            className="w-full"
          />
        </div>
      </div>
    </div>
  </div>
));

BasicSettingsTab.displayName = 'BasicSettingsTab';

export default BasicSettingsTab;