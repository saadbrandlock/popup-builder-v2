import React, { memo, useCallback } from 'react';
import { Select, ColorPicker, Slider, Divider, Typography } from 'antd';
import { 
  FONT_FAMILIES, 
  FONT_SIZE_MARKS,
  VALIDATION_CONSTRAINTS 
} from '@/features/builder/utils/reminderTabConstants';
import type { ConfigTabProps } from '@/features/builder/types';
import type { Color } from 'antd/es/color-picker';

const { Title } = Typography;
const { Option } = Select;

const StylingTab: React.FC<ConfigTabProps> = memo(({ 
  config, 
  updateConfig 
}) => {
  
  // Stable color change handlers
  const handlePrimaryColorChange = useCallback((color: Color) => {
    updateConfig('styling.colors.primary', color.toHexString());
  }, [updateConfig]);

  const handleSecondaryColorChange = useCallback((color: Color) => {
    updateConfig('styling.colors.secondary', color.toHexString());
  }, [updateConfig]);

  const handleTextColorChange = useCallback((color: Color) => {
    updateConfig('styling.colors.textColor', color.toHexString());
  }, [updateConfig]);

  const handleDraggerColorChange = useCallback((color: Color) => {
    updateConfig('styling.colors.draggerColor', color.toHexString());
  }, [updateConfig]);

  const handleFontFamilyChange = useCallback((value: string) => {
    updateConfig('styling.typography.fontFamily', value);
  }, [updateConfig]);

  const handleFontSizeChange = useCallback((value: number) => {
    updateConfig('styling.typography.fontSize', value);
  }, [updateConfig]);

  const handleFontWeightChange = useCallback((value: string) => {
    updateConfig('styling.typography.fontWeight', value);
  }, [updateConfig]);

  return (
    <div className="space-y-6">
      <div>
        <Title level={5}>Colors</Title>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <ColorPicker 
              value={config.styling.colors.primary}
              onChange={handlePrimaryColorChange}
              size="large" 
              showText 
              className="w-full"
              placement="bottomLeft"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Secondary Color</label>
            <ColorPicker 
              value={config.styling.colors.secondary}
              onChange={handleSecondaryColorChange}
              size="large" 
              showText 
              className="w-full"
              placement="bottomLeft"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Text Color</label>
            <ColorPicker 
              value={config.styling.colors.textColor}
              onChange={handleTextColorChange}
              size="large" 
              showText 
              className="w-full"
              placement="bottomLeft"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Dragger Color</label>
            <ColorPicker 
              value={config.styling.colors.draggerColor}
              onChange={handleDraggerColorChange}
              size="large" 
              showText 
              className="w-full"
              placement="bottomLeft"
            />
          </div>
        </div>
      </div>

      <Divider />

      <div>
        <Title level={5}>Typography</Title>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Font Family</label>
            <Select 
              value={config.styling.typography.fontFamily}
              onChange={handleFontFamilyChange}
              className="w-full"
            >
              {FONT_FAMILIES.map(font => (
                <Option key={font} value={font}>{font}</Option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Font Size</label>
              <Slider 
                value={config.styling.typography.fontSize}
                onChange={handleFontSizeChange}
                min={VALIDATION_CONSTRAINTS.typography.fontSize.min} 
                max={VALIDATION_CONSTRAINTS.typography.fontSize.max} 
                marks={FONT_SIZE_MARKS}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Font Weight</label>
              <Select 
                value={config.styling.typography.fontWeight}
                onChange={handleFontWeightChange}
                className="w-full"
              >
                <Option value="normal">Normal</Option>
                <Option value="bold">Bold</Option>
                <Option value="600">Semi Bold</Option>
                <Option value="300">Light</Option>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

StylingTab.displayName = 'StylingTab';

export default StylingTab;