import React, { useEffect } from 'react';
import { message, Alert, Button, Card, Row, Col, Space, Typography, Badge } from 'antd';
import { ArrowRightOutlined, SaveOutlined } from '@ant-design/icons';
import EmailEditor, { UnlayerOptions } from 'react-email-editor';
import { useBuilderStore } from '@/stores/builder.store';
import { useGenericStore } from '@/stores/generic.store';
import { useLoadingStore } from '@/stores/common/loading.store';
import { useUnlayerEditor } from '../../builder/hooks/useUnlayerEditor';
import { manageEditorMode, manageMergeTags } from '../../builder/utils';

const { Title, Text } = Typography;

export interface ClientEditorStepProps {
  unlayerConfig: UnlayerOptions;
  apiClient: any;
  templateId: string;
  onNext: () => void;
}

/**
 * ClientEditorStep - Editor step for client flow
 * Simplified version of UnlayerMain without admin navigation
 */
export const ClientEditorStep: React.FC<ClientEditorStepProps> = ({
  unlayerConfig,
  apiClient,
  templateId,
  onNext,
}) => {
  const { currentTemplateId } = useBuilderStore();
  const { authProvider } = useGenericStore();
  const { builderAutosaving } = useLoadingStore();

  const {
    editorRef,
    isReady,
    isSaving,
    hasUnsavedChanges,
    error,
    saveDesign,
    lastAutoSave,
    onEditorReady,
    clearError,
  } = useUnlayerEditor({
    projectId: unlayerConfig.projectId as number,
    autoSave: true,
    autoSaveInterval: 30000,
    apiClient,
    templateId: templateId || currentTemplateId || undefined,
    accountId: authProvider?.accountId,
    enableCustomImageUpload: true,
  });

  // Remove Unlayer branding
  useEffect(() => {
    const removebranding = () => {
      const branding = document.querySelector('a.blockbuilder-branding');
      if (branding) {
        branding.remove();
      }
    };

    if (isReady) {
      setTimeout(removebranding, 1000);
      const interval = setInterval(removebranding, 5000);
      return () => clearInterval(interval);
    }
  }, [isReady]);

  const handleManualSave = async () => {
    try {
      await saveDesign();
      message.success('Design saved successfully!');
    } catch (error) {
      console.error('Manual save failed:', error);
      message.error('Failed to save design');
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Header Controls */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              Edit Popup Design
              {hasUnsavedChanges && (
                <Badge
                  dot
                  style={{ marginLeft: '8px' }}
                  title="Unsaved changes"
                />
              )}
            </Title>
          </Col>
          <Col flex="auto">
            <Space>
              <Text type="secondary">
                Status: {isReady ? 'Ready' : 'Loading...'}
              </Text>
              {lastAutoSave && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Last saved: {lastAutoSave.toLocaleTimeString()}
                </Text>
              )}
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleManualSave}
              loading={isSaving || builderAutosaving}
              disabled={!isReady || !hasUnsavedChanges}
            >
              {isSaving || builderAutosaving ? 'Saving...' : 'Save'}
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
            editorId="bl-client-editor"
            ref={editorRef}
            onReady={onEditorReady}
            options={{
              ...unlayerConfig,
              tools: manageEditorMode(true), // Always design mode for client
              mergeTags: manageMergeTags(),
            }}
            style={{
              height: '700px',
              width: '100%',
            }}
          />
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end mt-6">
        <Button
          type="primary"
          size="large"
          icon={<ArrowRightOutlined />}
          onClick={onNext}
        >
          Next: Reminder Tab
        </Button>
      </div>
    </div>
  );
};

export default ClientEditorStep;
