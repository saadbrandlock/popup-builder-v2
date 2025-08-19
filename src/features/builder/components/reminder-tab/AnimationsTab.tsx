import React, { memo, useCallback } from 'react';
import { Select } from 'antd';
import { ANIMATION_TYPES, POPUP_TRIGGER_TYPES } from '@/features/builder/utils/reminderTabConstants';
import type { ConfigTabProps } from '@/features/builder/types';

const { Option } = Select;

const AnimationsTab: React.FC<ConfigTabProps> = memo(({ 
  config, 
  updateConfig 
}) => {
  
  const handleEntranceTypeChange = useCallback((value: string) => {
    updateConfig('animations.entrance.type', value);
  }, [updateConfig]);

  const handleDurationChange = useCallback((value: string) => {
    updateConfig('animations.entrance.duration', value);
  }, [updateConfig]);

  const handlePopupTriggerChange = useCallback((value: string) => {
    updateConfig('animations.popupTrigger.type', value);
  }, [updateConfig]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Entrance Animation</label>
        <Select 
          value={config.animations.entrance.type}
          onChange={handleEntranceTypeChange}
          className="w-full"
        >
          {ANIMATION_TYPES.map(anim => (
            <Option key={anim.value} value={anim.value}>
              {anim.label}
            </Option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Animation Duration</label>
        <Select 
          value={config.animations.entrance.duration}
          onChange={handleDurationChange}
          className="w-full"
        >
          <Option value="0.2s">Fast (0.2s)</Option>
          <Option value="0.3s">Normal (0.3s)</Option>
          <Option value="0.5s">Slow (0.5s)</Option>
          <Option value="0.8s">Very Slow (0.8s)</Option>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Popup Trigger Animation</label>
        <Select 
          value={config.animations.popupTrigger.type}
          onChange={handlePopupTriggerChange}
          className="w-full"
        >
          {POPUP_TRIGGER_TYPES.map(trigger => (
            <Option key={trigger.value} value={trigger.value}>
              {trigger.label}
            </Option>
          ))}
        </Select>
      </div>
    </div>
  );
});

AnimationsTab.displayName = 'AnimationsTab';

export default AnimationsTab;