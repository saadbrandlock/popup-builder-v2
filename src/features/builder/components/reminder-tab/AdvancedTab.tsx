import React, { memo, useCallback } from 'react';
import { Switch, Slider, Collapse, Typography } from 'antd';
import { 
  MOBILE_FONT_SIZE_MARKS,
  VALIDATION_CONSTRAINTS 
} from '@/features/builder/utils/reminderTabConstants';
import type { ConfigTabProps } from '@/features/builder/types';

const { Text } = Typography;
const { Panel } = Collapse;

const AdvancedTab: React.FC<ConfigTabProps> = memo(({ 
  config, 
  updateConfig 
}) => {
  
  const handleDraggingToggle = useCallback((checked: boolean) => {
    updateConfig('interactions.dragging.enabled', checked);
  }, [updateConfig]);

  const handleClickingToggle = useCallback((checked: boolean) => {
    updateConfig('interactions.clicking.enabled', checked);
  }, [updateConfig]);

  const handleMobileHideToggle = useCallback((checked: boolean) => {
    updateConfig('responsive.mobile.hide', checked);
  }, [updateConfig]);

  const handleMobileFontSizeChange = useCallback((value: number) => {
    updateConfig('responsive.mobile.fontSize', value);
  }, [updateConfig]);

  return (
    <Collapse ghost>
      <Panel header="Interaction Settings" key="interactions">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Text strong>Enable Dragging</Text>
              <br />
              <Text type="secondary" className="text-sm">
                Allow users to drag and reposition the tab
              </Text>
            </div>
            <Switch 
              checked={config.interactions.dragging.enabled}
              onChange={handleDraggingToggle}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Text strong>Enable Clicking</Text>
              <br />
              <Text type="secondary" className="text-sm">
                Allow users to click the tab to open popup
              </Text>
            </div>
            <Switch 
              checked={config.interactions.clicking.enabled}
              onChange={handleClickingToggle}
            />
          </div>
        </div>
      </Panel>

      <Panel header="Mobile Settings" key="mobile">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Text strong>Hide on Mobile</Text>
              <br />
              <Text type="secondary" className="text-sm">
                Hide the reminder tab on mobile devices
              </Text>
            </div>
            <Switch 
              checked={config.responsive.mobile.hide}
              onChange={handleMobileHideToggle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mobile Font Size</label>
            <Slider 
              value={config.responsive.mobile.fontSize}
              onChange={handleMobileFontSizeChange}
              min={VALIDATION_CONSTRAINTS.typography.mobileFontSize.min} 
              max={VALIDATION_CONSTRAINTS.typography.mobileFontSize.max} 
              marks={MOBILE_FONT_SIZE_MARKS}
            />
          </div>
        </div>
      </Panel>
    </Collapse>
  );
});

AdvancedTab.displayName = 'AdvancedTab';

export default AdvancedTab;