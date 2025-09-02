import React, { memo, useCallback, useState } from 'react';
import { Select, Card } from 'antd';
import { ANIMATION_TYPES, POPUP_TRIGGER_TYPES } from '@/features/builder/utils/reminderTabConstants';
import AnimationPreview from './AnimationPreview';
import type { ConfigTabProps } from '@/features/builder/types';

const { Option } = Select;

const AnimationsTab: React.FC<ConfigTabProps> = memo(({ 
  config, 
  updateConfig 
}) => {
  const [playingAnimation, setPlayingAnimation] = useState<string | null>(null);
  
  const handleEntranceTypeChange = useCallback((value: string) => {
    updateConfig('animations.entrance.type', value);
  }, [updateConfig]);

  const handleDurationChange = useCallback((value: string) => {
    updateConfig('animations.entrance.duration', value);
  }, [updateConfig]);

  const handlePopupTriggerChange = useCallback((value: string) => {
    updateConfig('animations.popupTrigger.type', value);
  }, [updateConfig]);

  const playAnimation = useCallback((animationType: string) => {
    setPlayingAnimation(animationType);
    const duration = parseFloat(config.animations.entrance.duration) * 1000;
    setTimeout(() => {
      setPlayingAnimation(null);
    }, duration);
  }, [config.animations.entrance.duration]);

  return (
    <div className="space-y-6">
        {/* Entrance Animation Section */}
      <Card title="Entrance Animation" size="small">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Animation Type</label>
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

          {/* Animation Preview */}
          <div>
            <label className="block text-sm font-medium mb-2">Preview</label>
            <Card size="small" className="bg-gray-50">
              <AnimationPreview
                type={config.animations.entrance.type}
                duration={config.animations.entrance.duration}
                onPlay={() => playAnimation(config.animations.entrance.type)}
                isPlaying={playingAnimation === config.animations.entrance.type}
              />
            </Card>
          </div>
        </div>
      </Card>

      {/* Popup Trigger Animation Section */}
      <Card title="Popup Trigger Animation" size="small">
        <div>
          <label className="block text-sm font-medium mb-2">Trigger Type</label>
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
          <div className="mt-2">
            <small className="text-gray-500">
              This determines how the popup/modal appears when the reminder tab is clicked
            </small>
          </div>
        </div>
      </Card>
    </div>
  );
});

AnimationsTab.displayName = 'AnimationsTab';

export default AnimationsTab;