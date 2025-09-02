import React, { useCallback } from 'react';
import {
  Card,
  Form,
  Switch,
  Select,
  Slider,
  ColorPicker,
  Input,
  Radio,
  Typography,
  Row,
  Col,
  Collapse
} from 'antd';
import { FONT_FAMILIES, FONT_SIZE_MARKS } from '../../utils/reminderTabConstants';
import type { ConfigTabProps } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const DesktopTabConfig: React.FC<ConfigTabProps> = ({
  config,
  updateConfig
}) => {
  const handleChange = useCallback((path: string, value: any) => {
    updateConfig(`desktop.${path}`, value);
  }, [updateConfig]);

  return (
    <div className="space-y-6">
      <Card title="Global Settings" size="small">
        <Form.Item label="Enable Reminder Components">
          <Switch
            checked={config.enabled || false}
            onChange={(checked) => updateConfig('enabled', checked)}
          />
          <Text type="secondary" className="block mt-1">
            Enable or disable reminder tab/button across all devices
          </Text>
        </Form.Item>
      </Card>

      <Card title="Desktop Tab Configuration" size="small">
        {/* Enable/Disable */}
        <Form.Item label="Enable Desktop Tab">
          <Switch
            checked={config.desktop?.enabled || false}
            onChange={(checked) => handleChange('enabled', checked)}
          />
        </Form.Item>

        {config.desktop?.enabled && (
          <Collapse defaultActiveKey={['display', 'dimensions', 'colors', 'typography', 'interactions']}>
            {/* Display Settings */}
            <Panel header="Display Settings" key="display">
              <Form.Item label="Tab Text">
                <Input
                  value={config.desktop?.display?.text || ''}
                  onChange={(e) => handleChange('display.text', e.target.value)}
                  placeholder="Enter tab text"
                  maxLength={50}
                />
              </Form.Item>

              <Form.Item label="Position">
                <Radio.Group
                  value={config.desktop?.display?.position || 'left'}
                  onChange={(e) => handleChange('display.position', e.target.value)}
                >
                  <Radio value="left">Left Side</Radio>
                  <Radio value="right">Right Side</Radio>
                </Radio.Group>
              </Form.Item>
            </Panel>

            {/* Dimensions */}
            <Panel header="Dimensions & Size" key="dimensions">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Width">
                    <Slider
                      min={60}
                      max={150}
                      value={config.desktop?.styling?.dimensions?.width || 80}
                      onChange={(value) => handleChange('styling.dimensions.width', value)}
                      marks={{ 60: '60px', 80: '80px', 120: '120px', 150: '150px' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Height">
                    <Slider
                      min={100}
                      max={250}
                      value={config.desktop?.styling?.dimensions?.height || 160}
                      onChange={(value) => handleChange('styling.dimensions.height', value)}
                      marks={{ 100: '100px', 160: '160px', 200: '200px', 250: '250px' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>

            {/* Colors */}
            <Panel header="Colors & Appearance" key="colors">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Primary Color">
                    <ColorPicker
                      value={config.desktop?.styling?.colors?.primary || '#8B0000'}
                      onChange={(color) => handleChange('styling.colors.primary', color.toHexString())}
                      showText
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Secondary Color">
                    <ColorPicker
                      value={config.desktop?.styling?.colors?.secondary || '#DC143C'}
                      onChange={(color) => handleChange('styling.colors.secondary', color.toHexString())}
                      showText
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Text Color">
                    <ColorPicker
                      value={config.desktop?.styling?.colors?.textColor || '#FFFFFF'}
                      onChange={(color) => handleChange('styling.colors.textColor', color.toHexString())}
                      showText
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Dragger Color">
                    <ColorPicker
                      value={config.desktop?.styling?.colors?.draggerColor || '#666666'}
                      onChange={(color) => handleChange('styling.colors.draggerColor', color.toHexString())}
                      showText
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Dot Color">
                    <ColorPicker
                      value={config.desktop?.styling?.colors?.dotColor || 'rgba(255, 255, 255, 0.8)'}
                      onChange={(color) => handleChange('styling.colors.dotColor', color.toRgbString())}
                      showText
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>

            {/* Typography */}
            <Panel header="Typography & Text" key="typography">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Font Family">
                    <Select
                      value={config.desktop?.styling?.typography?.fontFamily || 'Arial, sans-serif'}
                      onChange={(value) => handleChange('styling.typography.fontFamily', value)}
                    >
                      {FONT_FAMILIES.map((font) => (
                        <Option key={font} value={font}>
                          <span style={{ fontFamily: font }}>{font}</span>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Font Size">
                    <Slider
                      min={10}
                      max={20}
                      value={config.desktop?.styling?.typography?.fontSize || 14}
                      onChange={(value) => handleChange('styling.typography.fontSize', value)}
                      marks={FONT_SIZE_MARKS}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Font Weight">
                    <Select
                      value={config.desktop?.styling?.typography?.fontWeight || 'bold'}
                      onChange={(value) => handleChange('styling.typography.fontWeight', value)}
                    >
                      <Option value="normal">Normal</Option>
                      <Option value="bold">Bold</Option>
                      <Option value="600">Semi Bold</Option>
                      <Option value="700">Bold</Option>
                      <Option value="800">Extra Bold</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Letter Spacing">
                    <Input
                      value={config.desktop?.styling?.typography?.letterSpacing || '1px'}
                      onChange={(e) => handleChange('styling.typography.letterSpacing', e.target.value)}
                      placeholder="e.g., 1px"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>

            {/* Interactions */}
            <Panel header="Interactions & Behavior" key="interactions">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Enable Dragging">
                    <Switch
                      checked={config.desktop?.interactions?.dragging?.enabled || false}
                      onChange={(checked) => handleChange('interactions.dragging.enabled', checked)}
                    />
                    <Text type="secondary" className="block mt-1">
                      Allow users to drag the tab vertically
                    </Text>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Enable Clicking">
                    <Switch
                      checked={config.desktop?.interactions?.clicking?.enabled || false}
                      onChange={(checked) => handleChange('interactions.clicking.enabled', checked)}
                    />
                    <Text type="secondary" className="block mt-1">
                      Allow users to click the tab to trigger popup
                    </Text>
                  </Form.Item>
                </Col>
              </Row>
            </Panel>
          </Collapse>
        )}
      </Card>

      {!config.desktop?.enabled && (
        <Card>
          <div className="text-center text-gray-500 py-8">
            <Text type="secondary">
              Desktop tab is disabled. Enable it to configure appearance and behavior.
            </Text>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DesktopTabConfig;