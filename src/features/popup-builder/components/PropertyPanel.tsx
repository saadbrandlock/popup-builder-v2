import React, { useMemo } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  ColorPicker,
  Switch,
  Empty,
  Divider,
} from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import type { PropertyPanelProps, ComponentProperty } from '../types';
import {
  useSelectedElementData,
  useBuilderActions,
  usePopupTemplate,
  usePopupBuilderStore,
} from '../hooks';

const { Option } = Select;
const { TextArea } = Input;

/**
 * PropertyPanel - Panel for editing properties of selected popup elements
 * Dynamically renders form controls based on element type and properties
 */
export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  className = '',
}) => {
  const selectedElement = useSelectedElementData();
  const template = usePopupTemplate();
  const { updateElement } = useBuilderActions();
  const { availableComponents } = usePopupBuilderStore(); // Move hook to top level

  const [form] = Form.useForm();

  // Handle property changes
  const handlePropertyChange = (key: string, value: any) => {
    if (!selectedElement) return;

    updateElement(selectedElement.id, {
      config: {
        ...selectedElement.config,
        [key]: value,
      },
    });
  };

  // Handle style changes
  const handleStyleChange = (key: string, value: any) => {
    if (!selectedElement) return;

    const currentStyle = selectedElement.config.style || {};
    updateElement(selectedElement.id, {
      config: {
        ...selectedElement.config,
        style: {
          ...currentStyle,
          [key]: value,
        },
      },
    });
  };


  // Render form control based on property type
  const renderPropertyControl = (property: ComponentProperty, value: any) => {
    const commonProps = {
      value: value || property.default,
      onChange: (val: any) => handlePropertyChange(property.key, val),
    };

    switch (property.type) {
      case 'text':
        return (
          <Input
            {...commonProps}
            placeholder={property.label}
            onChange={(e) => handlePropertyChange(property.key, e.target.value)}
          />
        );

      case 'textarea':
        return (
          <TextArea
            {...commonProps}
            placeholder={property.label}
            rows={3}
            onChange={(e) => handlePropertyChange(property.key, e.target.value)}
          />
        );

      case 'number':
        return (
          <InputNumber
            {...commonProps}
            placeholder={property.label}
            min={property.validation?.min}
            max={property.validation?.max}
            style={{ width: '100%' }}
          />
        );

      case 'boolean':
        return (
          <Switch
            checked={value || property.default}
            onChange={(checked) => handlePropertyChange(property.key, checked)}
          />
        );

      case 'select':
        return (
          <Select {...commonProps} placeholder={`Select ${property.label}`}>
            {property.options?.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );

      case 'color':
        return (
          <ColorPicker
            value={value || property.default}
            onChange={(color) =>
              handlePropertyChange(property.key, color.toHexString())
            }
            showText
            style={{ width: '100%' }}
          />
        );

      case 'url':
        return (
          <Input
            {...commonProps}
            placeholder="https://example.com"
            onChange={(e) => handlePropertyChange(property.key, e.target.value)}
          />
        );

      case 'image':
        return (
          <Input
            {...commonProps}
            placeholder="Image URL"
            onChange={(e) => handlePropertyChange(property.key, e.target.value)}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            onChange={(e) => handlePropertyChange(property.key, e.target.value)}
          />
        );
    }
  };

  // Get component properties from the available components store
  const getComponentProperties = () => {
    if (!selectedElement) return [];

    // Get the component definition from the store to access its properties
    const componentDef = availableComponents.find(c => c.type === selectedElement.type);
    
    if (!componentDef || !componentDef.properties) return [];

    // Convert database properties structure to ComponentProperty array
    const properties: ComponentProperty[] = [];
    
    Object.entries(componentDef.properties).forEach(([key, propDef]: [string, any]) => {
      // Only include properties that are client customizable
      if (componentDef.client_customizable_props[key]) {
        properties.push({
          key,
          label: propDef.label || key.charAt(0).toUpperCase() + key.slice(1),
          type: propDef.type || 'text',
          default: propDef.default,
          required: propDef.required || false,
          options: propDef.options ? propDef.options.map((opt: any) => 
            typeof opt === 'string' ? { label: opt, value: opt } : opt
          ) : undefined,
          validation: propDef.validation,
        });
      }
    });

    return properties;
  };

  // Memoize component properties to prevent hook order changes
  const componentProperties = useMemo(() => getComponentProperties(), [selectedElement, availableComponents]);

  // Memoize component definition to prevent hook order changes
  const componentDef = useMemo(() => {
    if (!selectedElement) return null;
    return availableComponents.find(c => c.type === selectedElement.type) || null;
  }, [selectedElement, availableComponents]);

  // Memoize style properties to prevent hook order changes
  const styleProperties = useMemo(() => {
    if (!componentDef || !selectedElement) return [];
    
    const styleProps = componentDef.client_customizable_props?.style;
    if (!styleProps || typeof styleProps !== 'object') return [];
    
    return Object.keys(styleProps).filter(key => styleProps[key]);
  }, [componentDef, selectedElement]);

  return (
    <Card
      className={`h-full flex flex-col ${className} !rounded-none`}
      variant="borderless"
      styles={{ body: { flex: 1, padding: '12px', overflowY: 'auto', minHeight: 0 } }}
      title={
        <div className="flex items-center gap-2">
          <SettingOutlined />
          <span>Properties</span>
        </div>
      }
      size="small"
    >
      {!selectedElement ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Select an element to edit its properties"
          style={{ margin: '40px 0' }}
        />
      ) : (
        <div className="min-h-0">
          <Form form={form} layout="vertical" size="small">
            {/* Element Info */}
            <div className="text-center mb-4">
              <h4 className="mb-1 text-blue-500 font-semibold">
                {selectedElement.type.toUpperCase()}
              </h4>
              <p className="m-0 text-xs text-gray-500 font-mono">
                ID: {selectedElement.id}
              </p>
            </div>

            <Divider />

            {/* Component Properties */}
            {componentProperties.length > 0 && (
              <>
                <h4 className="mt-4 mb-3 text-gray-800 text-sm font-semibold">
                  Content
                </h4>
                {componentProperties.map((property) => (
                  <Form.Item
                    key={property.key}
                    label={property.label}
                    required={property.required}
                  >
                    {renderPropertyControl(
                      property,
                      selectedElement.config[property.key]
                    )}
                  </Form.Item>
                ))}
                <Divider />
              </>
            )}

            {/* Style Properties - dynamically rendered based on client_customizable_props */}
            {styleProperties.length > 0 && (
              <>
                <h4 className="mt-4 mb-3 text-gray-800 text-sm font-semibold">
                  Style
                </h4>
                {styleProperties.map(styleKey => {
                  const currentValue = selectedElement.config.style?.[styleKey];
                  
                  // Render different controls based on the style property
                  if (styleKey.toLowerCase().includes('color')) {
                    return (
                      <Form.Item key={styleKey} label={styleKey.charAt(0).toUpperCase() + styleKey.slice(1)}>
                        <ColorPicker
                          value={currentValue || '#ffffff'}
                          onChange={(color) => handleStyleChange(styleKey, color.toHexString())}
                          showText
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    );
                  }
                  
                  if (styleKey === 'textAlign') {
                    return (
                      <Form.Item key={styleKey} label="Text Align">
                        <Select
                          value={currentValue || 'left'}
                          onChange={(value) => handleStyleChange(styleKey, value)}
                        >
                          <Option value="left">Left</Option>
                          <Option value="center">Center</Option>
                          <Option value="right">Right</Option>
                        </Select>
                      </Form.Item>
                    );
                  }
                  
                  if (styleKey.toLowerCase().includes('size') || styleKey.toLowerCase().includes('width') || styleKey.toLowerCase().includes('height') || styleKey.toLowerCase().includes('radius')) {
                    return (
                      <Form.Item key={styleKey} label={styleKey.charAt(0).toUpperCase() + styleKey.slice(1)}>
                        <Input
                          value={currentValue || ''}
                          onChange={(e) => handleStyleChange(styleKey, e.target.value)}
                          placeholder="e.g., 14px, 100%, auto"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    );
                  }
                  
                  // Default to text input for other style properties
                  return (
                    <Form.Item key={styleKey} label={styleKey.charAt(0).toUpperCase() + styleKey.slice(1)}>
                      <Input
                        value={currentValue || ''}
                        onChange={(e) => handleStyleChange(styleKey, e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  );
                })}
              </>
            )}
          </Form>
        </div>
      )}
    </Card>
  );
};
