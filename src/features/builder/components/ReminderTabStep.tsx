import React, { useCallback } from 'react';
import { Card, Typography, message, Alert, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useBuilderStore } from '@/stores/builder.store';
import { useGenericStore } from '@/stores/generic.store';
import { useReminderTabAutosave } from '../hooks/useReminderTabAutosave';
import { ReminderTabEditor } from './reminder-tab';
import type { ReminderTabStepProps } from '@/features/builder/types';
import { useLoadingStore } from '@/stores/common/loading.store';
import StepNavigation, { createBackButton, createSaveButton } from './common/StepNavigation';

const { Title, Text } = Typography;

const ReminderTabStep: React.FC<ReminderTabStepProps> = ({
  onNext,
  onBack,
  onSave,
}) => {
  const { reminderTabConfig, currentTemplateId, actions } = useBuilderStore();
  const { templateByIdLoading } = useLoadingStore();
  const apiClient = useGenericStore((s) => s.apiClient);

  // Initialize autosave (apiClient from generic store)
  const {
    isSaving,
    lastSave,
    hasUnsavedChanges,
    saveError,
    performManualSave,
    triggerAutoSave,
  } = useReminderTabAutosave({
    enabled: true,
    interval: 10000, // 10 seconds
    debounceDelay: 2000, // 2 seconds
    apiClient: apiClient ?? undefined,
    templateId: currentTemplateId || undefined,
    onSave: onSave,
    onError: (error) => {
      console.error('Reminder tab autosave error:', error);
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
      message.success('Reminder tab configuration saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
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

      <>
        {templateByIdLoading ? (
          <div>
            <Spin tip={<p>Loading Template Data...</p>} />
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

            <StepNavigation
              leftButtons={[
                createBackButton(handleBack, {
                  label: 'Back to Builder',
                }),
              ]}
              rightButtons={[
                createSaveButton(handleSave, {
                  label: isSaving ? 'Saving...' : 'Save Configuration',
                  icon: isSaving ? <LoadingOutlined /> : undefined,
                  loading: isSaving,
                  disabled: isSaving,
                }),
              ]}
            />
          </>
        )}
      </>
    </div>
  );
};

export default ReminderTabStep;
