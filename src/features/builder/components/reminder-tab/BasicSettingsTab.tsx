import React, { memo } from 'react';
import { Switch, Typography, Card, Form } from 'antd';
import type { ConfigTabProps } from '@/features/builder/types';

const { Text } = Typography;

const BasicSettingsTab: React.FC<ConfigTabProps> = memo(({ 
  config, 
  updateConfig 
}) => (
  <div className="space-y-6">
    <Card title="Global Settings" size="small">
      <Form.Item label="Enable Reminder Components">
        <Switch 
          checked={config.enabled}
          onChange={(checked) => updateConfig('enabled', checked)}
        />
        <Text type="secondary" className="block mt-1">
          Enable or disable reminder tab/button across all devices
        </Text>
      </Form.Item>
      
      <Text type="secondary" className="block mt-4">
        Configure animations and device-specific settings in their respective tabs.
      </Text>
    </Card>
  </div>
));

BasicSettingsTab.displayName = 'BasicSettingsTab';

export default BasicSettingsTab;