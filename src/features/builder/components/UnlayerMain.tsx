import { useEffect, useState } from 'react';
import { Button, Space, Typography, Card, Row, Col, Alert, Badge } from 'antd';
import EmailEditor, { UnlayerOptions } from 'react-email-editor';
import { useUnlayerEditor } from '../hooks/useUnlayerEditor';
import { useUnlayerDeviceOptions } from '../hooks/useUnlayerDeviceOptions';
import { useBuilderStore } from '@/stores/builder.store';
import { useGenericStore } from '@/stores/generic.store';
import { useLoadingStore } from '@/stores/common/loading.store';
import { sanitizeHtml } from '@/lib/utils/helper';
import { manageEditorMode, manageMergeTags } from '../utils';
import StepNavigation, { createPreviousButton, createNextButton } from './common/StepNavigation';

const { Title, Text } = Typography;

interface UnlayerMainProps {
  unlayerConfig: UnlayerOptions;
  initialDesign?: any;
  onSave?: (design: any) => Promise<void>;
  onError?: (error: Error) => void;
  // Image upload configuration
  enableCustomImageUpload?: boolean;
  clientTemplateId?: string;
  saveMode?: 'staging' | 'base';
}

export const UnlayerMain = ({
  unlayerConfig,
  initialDesign,
  onSave,
  onError,
  enableCustomImageUpload = true,
  clientTemplateId = '',
  saveMode = 'staging',
}: UnlayerMainProps) => {
  // State for UI controls
  const [autoSaveInterval] = useState(30);
  const [designMode, setDesignMode] = useState(false);
  const [showStepsNavigation, setShowStepsNavigation] = useState(true);

  // Store values for image upload (apiClient from generic store)
  const {
    currentTemplateId,
    actions: builderActions,
  } = useBuilderStore();
  const authProvider = useGenericStore((s) => s.authProvider);
  const apiClient = useGenericStore((s) => s.apiClient);

  // Loading states for showing combined loading status
  const { builderAutosaving } = useLoadingStore();

  // Device options from template (mobile-only, desktop-only, or both)
  const { devices, defaultDevice } = useUnlayerDeviceOptions();

  // Main editor hook with all functionality
  const {
    editorRef,
    isReady,
    isSaving,
    hasUnsavedChanges,
    error,
    lastExportedHtml,
    lastExportedJson,
    saveDesign,
    loadDesign,
    lastAutoSave,
    onEditorReady,
    clearError,
  } = useUnlayerEditor({
    projectId: unlayerConfig.projectId as number,
    autoSave: true,
    autoSaveInterval: autoSaveInterval * 1000, // Convert to milliseconds
    onSave,
    onError,
    apiClient,
    templateId: clientTemplateId || currentTemplateId || undefined,
    accountId: authProvider.accountId,
    enableCustomImageUpload,
    saveMode,
  });

  // Load initial design when component mounts
  useEffect(() => {
    if (initialDesign && isReady) {
      loadDesign(initialDesign);
    }
  }, [initialDesign, isReady, loadDesign]);


  useEffect(() => {
    setDesignMode(window.location.href.includes('user-template-editor'));
    setShowStepsNavigation(!window.location.href.includes('base-templates'));
  }, []);

  const handleManualSave = async () => {
    try {
      await saveDesign();
    } catch (error) {
      console.error('Manual save failed:', error);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Header Controls */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle" justify="space-between">
          <Col xs={24} sm={12}>
            <Title level={4} style={{ margin: 0 }}>
              Popup Builder
              {hasUnsavedChanges && (
                <Badge
                  dot
                  style={{ marginLeft: '8px' }}
                  title="Unsaved changes"
                />
              )}
            </Title>
              <div>
                <Text type="secondary">
                  Status: {isReady ? 'Ready' : 'Loading...'}
                </Text>
                {lastAutoSave && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Last saved: {lastAutoSave.toLocaleTimeString()}
                  </Text>
                )}
              </div>
          </Col>
          <Col xs={24} sm={12} className='text-right'>
            
              <Button
                type="primary"
                onClick={handleManualSave}
                loading={isSaving || builderAutosaving}
                disabled={!isReady || !hasUnsavedChanges}
              >
                {isSaving || builderAutosaving ? 'Saving...' : 'Save Design'}
              </Button>
          </Col>
        </Row>
      </Card>


      {/* Error Display */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          closable
          onClose={clearError}
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* Editor Container */}
      <div style={{ position: 'relative' }}>
        <Card>
          <div
            style={{
              height: '700px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            <EmailEditor
              editorId="bl-popup-builder"
              ref={editorRef}
              onReady={onEditorReady}
              options={{
                ...unlayerConfig,
                appearance: {
                  ...unlayerConfig.appearance,
                  panels: {
                    ...unlayerConfig.appearance?.panels,
                    tools: {
                      ...unlayerConfig.appearance?.panels?.tools,
                      dock: 'left',
                    },
                  },
                },
                tools: manageEditorMode(designMode),
                mergeTags: manageMergeTags(),
                devices,
                defaultDevice,
                ...(designMode && {
                  tabs: {
                    content: { enabled: false },
                    blocks: { enabled: false },
                    popup: { enabled: false },
                    Popup: { enabled: false },
                    dev: { enabled: false },
                  },
                  features: { audit: false },
                }),
              }}
              style={{
                height: '700px',
                width: '100%',
              }}
            />
          </div>
        </Card>
      </div>

      {/* Export Results Display (for debugging) */}
      {(lastExportedHtml || lastExportedJson) && (
        <Card style={{ marginTop: '16px' }}>
          <Title level={5}>Last Export Results</Title>
          {lastExportedHtml && (
            <div style={{ marginBottom: '8px' }}>
              <Text strong>HTML Length:</Text> {lastExportedHtml.length}{' '}
              characters
            </div>
          )}
          {lastExportedJson && (
            <div>
              <Text strong>JSON Keys:</Text>{' '}
              {Object.keys(lastExportedJson).join(', ')}
            </div>
          )}
        </Card>
      )}

      {/* Navigation Buttons */}
   {
    showStepsNavigation && (
      <StepNavigation
      style={{ marginTop: '24px' }}
      leftButtons={[
        createPreviousButton(
          () => builderActions.setAdminBuilderStep(0),
          'Previous: Config'
        ),
      ]}
      rightButtons={[
        createNextButton(
          () => builderActions.setAdminBuilderStep(2),
          { label: 'Next: Reminder Tab' }
        ),
      ]}
    />
    )
   }
    </div>
  );
};
