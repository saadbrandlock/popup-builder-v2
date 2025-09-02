import React, { useCallback } from 'react';
import {
  Card,
  Form,
  Switch,
  Select,
  Slider,
  ColorPicker,
  InputNumber,
  Typography,
  Space,
  Row,
  Col,
  Collapse
} from 'antd';
import * as AntdIcons from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGift, 
  faTags, 
  faPercentage, 
  faCrown, 
  faStar, 
  faFire, 
  faBell, 
  faBolt, 
  faShoppingCart, 
  faBullhorn, 
  faThumbsUp, 
  faHeart 
} from '@fortawesome/free-solid-svg-icons';
import { FLOATING_BUTTON_ICONS } from '../../utils/reminderTabConstants';
import type { ConfigTabProps } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const MobileFloatingButtonTab: React.FC<ConfigTabProps> = ({
  config,
  updateConfig
}) => {
  const handleChange = useCallback((path: string, value: any) => {
    updateConfig(`mobile.${path}`, value);
  }, [updateConfig]);

  const renderIconPreview = (iconType: string, iconValue: string) => {
    if (iconType === 'antd') {
      const IconComponent = (AntdIcons as any)[iconValue];
      return IconComponent ? <IconComponent /> : null;
    }
    if (iconType === 'emoji') {
      return <span style={{ fontSize: '16px' }}>{iconValue}</span>;
    }
    if (iconType === 'fontawesome') {
      // Map FontAwesome class names to actual FontAwesome icons
      const iconMapping: Record<string, any> = {
        'fas fa-gift': faGift,
        'fas fa-tags': faTags,
        'fas fa-percentage': faPercentage,
        'fas fa-crown': faCrown,
        'fas fa-star': faStar,
        'fas fa-fire': faFire,
        'fas fa-bell': faBell,
        'fas fa-bolt': faBolt,
        'fas fa-shopping-cart': faShoppingCart,
        'fas fa-bullhorn': faBullhorn,
        'fas fa-thumbs-up': faThumbsUp,
        'fas fa-heart': faHeart,
      };
      const iconDef = iconMapping[iconValue] || faGift;
      return <FontAwesomeIcon icon={iconDef} />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card title="Mobile Floating Button Configuration" size="small">
        {/* Enable/Disable */}
        <Form.Item label="Enable Floating Button">
          <Switch
            checked={config.mobile?.enabled || false}
            onChange={(checked) => handleChange('enabled', checked)}
          />
        </Form.Item>

        {config.mobile?.enabled && (
          <Collapse defaultActiveKey={['icon', 'position', 'appearance', 'animation']}>
            {/* Icon Selection */}
            <Panel header="Icon Configuration" key="icon">
              <Form.Item label="Icon">
                <Select
                  value={config.mobile?.icon?.value || 'fas fa-gift'}
                  onChange={(value) => {
                    const selectedIcon = FLOATING_BUTTON_ICONS.find(icon => icon.value === value);
                    if (selectedIcon) {
                      handleChange('icon.type', selectedIcon.type);
                      handleChange('icon.value', selectedIcon.value);
                    }
                  }}
                  style={{ width: '100%' }}
                >
                  {FLOATING_BUTTON_ICONS.map((icon) => (
                    <Option key={icon.value} value={icon.value}>
                      <Space>
                        {renderIconPreview(icon.type, icon.value)}
                        {icon.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Icon Size">
                    <Slider
                      min={16}
                      max={40}
                      value={config.mobile?.icon?.size || 24}
                      onChange={(value) => handleChange('icon.size', value)}
                      marks={{ 16: '16px', 24: '24px', 32: '32px', 40: '40px' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Icon Color">
                    <ColorPicker
                      value={config.mobile?.icon?.color || '#FFFFFF'}
                      onChange={(color) => handleChange('icon.color', color.toHexString())}
                      showText
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>

            {/* Position */}
            <Panel header="Position & Placement" key="position">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Bottom Distance">
                    <InputNumber
                      min={0}
                      max={100}
                      value={config.mobile?.position?.bottom || 24}
                      onChange={(value) => handleChange('position.bottom', value || 24)}
                      addonAfter="px"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Right Distance">
                    <InputNumber
                      min={0}
                      max={100}
                      value={config.mobile?.position?.right || 24}
                      onChange={(value) => handleChange('position.right', value || 24)}
                      addonAfter="px"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>

            {/* Styling */}
            <Panel header="Appearance & Styling" key="appearance">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Button Size">
                    <Slider
                      min={40}
                      max={80}
                      value={config.mobile?.styling?.size || 56}
                      onChange={(value) => handleChange('styling.size', value)}
                      marks={{ 40: '40px', 56: '56px', 72: '72px', 80: '80px' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Background Color">
                    <ColorPicker
                      value={config.mobile?.styling?.backgroundColor || '#8B0000'}
                      onChange={(color) => handleChange('styling.backgroundColor', color.toHexString())}
                      showText
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Border Color">
                    <ColorPicker
                      value={config.mobile?.styling?.borderColor || '#DC143C'}
                      onChange={(color) => handleChange('styling.borderColor', color.toHexString())}
                      showText
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Border Width">
                    <InputNumber
                      min={0}
                      max={10}
                      value={config.mobile?.styling?.borderWidth || 2}
                      onChange={(value) => handleChange('styling.borderWidth', value || 0)}
                      addonAfter="px"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>

            {/* Animations */}
            <Panel header="Animation & Effects" key="animation">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Hover Effect">
                    <Switch
                      checked={config.mobile?.animations?.hover?.enabled || false}
                      onChange={(checked) => handleChange('animations.hover.enabled', checked)}
                    />
                  </Form.Item>
                </Col>
                {config.mobile?.animations?.hover?.enabled && (
                  <Col span={12}>
                    <Form.Item label="Hover Scale">
                      <Slider
                        min={1.0}
                        max={1.3}
                        step={0.1}
                        value={config.mobile?.animations?.hover?.scale || 1.1}
                        onChange={(value) => handleChange('animations.hover.scale', value)}
                        marks={{ 1.0: '1.0x', 1.1: '1.1x', 1.2: '1.2x', 1.3: '1.3x' }}
                      />
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </Panel>
          </Collapse>
        )}
      </Card>

      {!config.mobile?.enabled && (
        <Card>
          <div className="text-center text-gray-500 py-8">
            <Text type="secondary">
              Mobile floating button is disabled. Enable it to configure appearance and behavior.
            </Text>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MobileFloatingButtonTab;