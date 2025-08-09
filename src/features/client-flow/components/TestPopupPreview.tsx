import React, { useEffect } from 'react';
import { Card, Button, Space, Select } from 'antd';
import { PopupPreview } from '../../popup-builder/components/PopupPreview';
import { useTemplateData } from '../hooks/useTemplateData';
import { useClientFlowStore } from '../../../stores/clientFlowStore';
import type { DeviceType } from '../../popup-builder/types';

/**
 * Test component to verify PopupPreview integration with client-flow
 * This component will be replaced by actual BrowserPreview in Phase 2
 */
export const TestPopupPreview: React.FC = () => {
  const { templates, selectedTemplate, loading, selectTemplate } = useTemplateData();
  const { previewSettings, actions } = useClientFlowStore();
  
  const [device, setDevice] = React.useState<DeviceType>('desktop');

  // Auto-load templates on mount
  useEffect(() => {
    // This will trigger the useTemplateData hook to fetch dummy templates
  }, []);

  if (loading) {
    return (
      <Card className="h-96">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading templates...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!selectedTemplate) {
    return (
      <Card className="h-96">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="mb-4">No template selected</p>
            {templates.length > 0 && (
              <Button onClick={() => selectTemplate(templates[0].id)}>
                Load First Template
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card title="PopupPreview Test Controls" size="small">
        <Space wrap>
          <div>
            <label className="block text-sm font-medium mb-1">Template:</label>
            <Select
              value={selectedTemplate.id}
              onChange={selectTemplate}
              style={{ width: 200 }}
              options={templates.map(template => ({
                label: template.name,
                value: template.id,
              }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Device:</label>
            <Select
              value={device}
              onChange={setDevice}
              style={{ width: 120 }}
              options={[
                { label: 'Desktop', value: 'desktop' },
                { label: 'Mobile', value: 'mobile' },
              ]}
            />
          </div>

          <Button 
            onClick={() => actions.updatePreviewSettings({ 
              interactive: !previewSettings.interactive 
            })}
            type={previewSettings.interactive ? 'primary' : 'default'}
          >
            Interactive: {previewSettings.interactive ? 'ON' : 'OFF'}
          </Button>
        </Space>
      </Card>

      {/* PopupPreview Test */}
      <Card title={`Testing PopupPreview - ${selectedTemplate.name}`}>
        <div className="bg-gray-50 p-4 rounded">
          <PopupPreview
            template={selectedTemplate}
            device={device}
            className="w-full"
          />
        </div>
      </Card>

      {/* Template Info */}
      <Card title="Template Details" size="small">
        <div className="space-y-2 text-sm">
          <div><strong>ID:</strong> {selectedTemplate.id}</div>
          <div><strong>Name:</strong> {selectedTemplate.name}</div>
          <div><strong>Description:</strong> {selectedTemplate.description}</div>
          <div><strong>Status:</strong> {selectedTemplate.status}</div>
          <div><strong>Components:</strong> {
            (() => {
              try {
                const zones = selectedTemplate.builder_state_json.zones as any;
                return Object.values(zones)
                  .reduce((total: number, zone: any) => total + (zone.components?.length || 0), 0);
              } catch {
                return 'N/A';
              }
            })()
          }</div>
        </div>
      </Card>
    </div>
  );
};
