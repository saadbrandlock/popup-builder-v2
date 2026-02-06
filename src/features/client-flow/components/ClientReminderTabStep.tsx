import React, { useCallback } from 'react';
import { message, Alert, Spin, Button, Card, Space, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, LoadingOutlined } from '@ant-design/icons';
import { useBuilderStore } from '@/stores/builder.store';
import { useGenericStore } from '@/stores/generic.store';
import { useLoadingStore } from '@/stores/common/loading.store';
import { ReminderTabEditor } from '../../builder/components/reminder-tab';
import { useReminderTabAutosave } from '../../builder/hooks/useReminderTabAutosave';

const { Title, Text } = Typography;

export interface ClientReminderTabStepProps {
  onBack: () => void;
  onComplete?: () => void;
}

/**
 * ClientReminderTabStep - Reminder tab step for client flow
 * Simplified version with client-specific navigation (apiClient from generic store)
 */
export const ClientReminderTabStep: React.FC<ClientReminderTabStepProps> = ({
  onBack,
  onComplete,
}) => {
  const apiClient = useGenericStore((s) => s.apiClient);
  const { reminderTabConfig, currentTemplateId, actions } = useBuilderStore();
  const { templateByIdLoading } = useLoadingStore();

  const {
    isSaving,
    lastSave,
    hasUnsavedChanges,
    saveError,
    performManualSave,
  } = useReminderTabAutosave({
    enabled: true,
    interval: 10000,
    debounceDelay: 2000,
    apiClient: apiClient ?? undefined,
    templateId: currentTemplateId || undefined,
    onError: (error) => {
      console.error('Reminder tab autosave error:', error);
      message.error(`Autosave failed: ${error.message}`);
    },
  });

  const handleConfigChange = useCallback(
    (config: any) => {
      actions.setReminderTabConfig(config);
    },
    [actions]
  );

  const handleSave = useCallback(async () => {
    try {
      await performManualSave();
      message.success('Reminder tab configuration saved!');
    } catch (error) {
      console.error('Save error:', error);
      message.error('Failed to save reminder tab configuration');
    }
  }, [performManualSave]);

  const handleComplete = useCallback(async () => {
    try {
      await performManualSave();
      message.success('Template editing completed!');
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Save error:', error);
      // Still complete even if save fails - autosave should have saved
      if (onComplete) {
        onComplete();
      }
    }
  }, [performManualSave, onComplete]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <Title level={2} className="mb-2">
          Reminder Tab Configuration
        </Title>
        <Text type="secondary">
          Design a reminder tab that will appear on your website to attract
          visitor attention
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

      {templateByIdLoading ? (
        <div className="flex items-center justify-center h-96">
          <Spin size="large" tip="Loading..." />
        </div>
      ) : (
        <>
          <Card className="mb-6">
            <ReminderTabEditor
              config={reminderTabConfig}
              onConfigChange={handleConfigChange}
              saveStatus={{
                isSaving,
                lastSave,
                hasUnsavedChanges,
                saveError,
              }}
            />
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
            >
              Back to Editor
            </Button>
            <Space>
              <Button
                size="large"
                icon={isSaving ? <LoadingOutlined /> : <SaveOutlined />}
                onClick={handleSave}
                loading={isSaving}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleComplete}
              >
                Complete Editing
              </Button>
            </Space>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientReminderTabStep;
