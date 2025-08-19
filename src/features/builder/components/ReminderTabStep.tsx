import React, { useCallback } from 'react';
import { Card, Button, Space, Typography, message, Alert } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, SaveOutlined, LoadingOutlined } from '@ant-design/icons';
import { useBuilderStore } from '@/stores/builder.store';
import { useGenericStore } from '@/stores/generic.store';
import { useReminderTabAutosave } from '../hooks/useReminderTabAutosave';
import { ReminderTabEditor } from './reminder-tab';
import type { ReminderTabStepProps } from '@/features/builder/types';

const { Title, Text } = Typography;

const ReminderTabStep: React.FC<ReminderTabStepProps> = ({
  onNext,
  onBack,
  onSave,
  apiClient
}) => {
  const { reminderTabConfig, currentTemplateId, actions } = useBuilderStore();

  // Initialize autosave
  const {
    isSaving,
    lastSave,
    hasUnsavedChanges,
    saveError,
    performManualSave,
    triggerAutoSave
  } = useReminderTabAutosave({
    enabled: true,
    interval: 10000, // 10 seconds
    debounceDelay: 2000, // 2 seconds
    apiClient: apiClient,
    templateId: currentTemplateId || undefined,
    onSave: onSave,
    onError: (error) => {
      console.error('Reminder tab autosave error:', error);
      message.error(`Autosave failed: ${error.message}`);
    }
  });

  const handleConfigChange = useCallback((config: any) => {
    console.log('📝 ReminderTabStep: Config change detected', config);
    actions.setReminderTabConfig(config);
  }, [actions]);

  const handleSave = useCallback(async () => {
    try {
      await performManualSave();
      message.success('Reminder tab configuration saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      message.error('Failed to save reminder tab configuration');
    }
  }, [performManualSave]);

  const handleBack = useCallback(() => {
    actions.setAdminBuilderStep(1);
    if (onBack) {
      onBack();
    }
  }, [actions, onBack]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <Title level={2} className="mb-2">
          Reminder Tab Configuration
        </Title>
        <Text type="secondary">
          Design a reminder tab that will appear on your website to attract visitor attention
        </Text>
      </div>

      {/* Save Status Alert */}
      {saveError && (
        <Alert
          message="Save Error"
          description={saveError}
          type="error"
          showIcon
          closable
          className="mb-4"
        />
      )}

      {hasUnsavedChanges && !isSaving && (
        <Alert
          message="Unsaved Changes"
          description="You have unsaved changes to your reminder tab configuration"
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      <Card className="mb-6">
        <ReminderTabEditor 
          config={reminderTabConfig}
          onConfigChange={handleConfigChange}
          saveStatus={{
            isSaving,
            lastSave,
            hasUnsavedChanges,
            saveError
          }}
        />
      </Card>

      <div className="flex justify-between items-center">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          size="large"
        >
          Back to Builder
        </Button>

        <Space>
          <Button
            icon={isSaving ? <LoadingOutlined /> : <SaveOutlined />}
            onClick={handleSave}
            loading={isSaving}
            disabled={isSaving}
            size="large"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default ReminderTabStep;