import { BaseProps } from '@/types/props';
import { Steps, Alert, Spin, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { useLoadingStore } from '@/stores/common/loading.store';
import { useBuilderStore } from '@/stores/builder.store';
import { useBuilderMain } from '../../builder/hooks/useBuilderMain';
import { UnlayerOptions } from 'react-email-editor';
import { useSyncGenericContext } from '@/lib/hooks/use-sync-generic-context';
import { ClientEditorStep } from '../components/ClientEditorStep';
import { ClientReminderTabStep } from '../components/ClientReminderTabStep';

export interface ClientEditorProps extends BaseProps {
  unlayerConfig: UnlayerOptions;
  templateId: string; // Required - always edit mode
  onComplete?: () => void;
  /** Called when user exits editor (e.g. return to review); confirm is shown before calling */
  onExit?: () => void;
}

/**
 * ClientEditor - Simplified editor for client flow
 * Only has 2 steps: Editor and Reminder Tab
 * Always in edit mode - requires templateId
 */
export const ClientEditor: React.FC<ClientEditorProps> = ({
  apiClient,
  navigate,
  shoppers,
  accountDetails,
  accounts,
  authProvider,
  templateId,
  unlayerConfig,
  onComplete,
  onExit,
}) => {
  // Sync first so apiClient and context are in store before useBuilderMain etc.
  useSyncGenericContext({
    accountDetails,
    authProvider,
    shoppers,
    navigate,
    accounts,
    apiClient,
  });

  const { loadTemplate } = useBuilderMain();
  const { actions } = useBuilderStore();
  const { templateByIdLoading } = useLoadingStore();

  // Local step state for client editor (0 = Editor, 1 = Reminder Tab)
  const [currentStep, setCurrentStep] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load template on mount
  useEffect(() => {
    if (templateId) {
      actions.setCurrentTemplateId(templateId);
      loadTemplate(templateId).catch((error) => {
        console.error('Failed to load template:', error);
        setLoadError('Failed to load template. Please try again.');
      });
    }
  }, [templateId]);

  // Clear persisted store data when component unmounts
  useEffect(() => {
    return () => {
      actions.clearPersistedStore();
    };
  }, []);

  const handleNextStep = () => {
    if (currentStep < 1) {
      setCurrentStep(currentStep + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loadError) {
    return (
      <Alert
        message="Error Loading Template"
        description={loadError}
        type="error"
        showIcon
        action={
          <Button
            type="link"
            onClick={() => {
              setLoadError(null);
              loadTemplate(templateId).catch(() => {
                setLoadError('Failed to load template. Please try again.');
              });
            }}
          >
            Retry
          </Button>
        }
      />
    );
  }

  if (templateByIdLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" tip="Loading template..." />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <Steps current={currentStep} style={{ margin: 0 }}>
          <Steps.Step title="Editor" />
          <Steps.Step title="Reminder Tab" />
        </Steps>
      </div>

      {currentStep === 0 && (
        <ClientEditorStep
          unlayerConfig={unlayerConfig}
          templateId={templateId}
          onNext={handleNextStep}
          onExit={onExit}
        />
      )}
      {currentStep === 1 && (
        <ClientReminderTabStep
          onBack={handlePrevStep}
          onComplete={onComplete}
        />
      )}
    </>
  );
};
