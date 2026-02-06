import React, { useEffect } from 'react';
import { message, Alert, Button, Card, Row, Col, Space, Typography, Badge, Spin, Popover, Modal } from 'antd';
import { ArrowRightOutlined, SaveOutlined, InfoCircleOutlined, LogoutOutlined } from '@ant-design/icons';
import EmailEditor, { UnlayerOptions } from 'react-email-editor';
import { useBuilderStore } from '@/stores/builder.store';
import { useGenericStore } from '@/stores/generic.store';
import { useLoadingStore } from '@/stores/common/loading.store';
import { useUnlayerEditor } from '../../builder/hooks/useUnlayerEditor';
import { useUnlayerDeviceOptions } from '../../builder/hooks/useUnlayerDeviceOptions';
import { manageEditorMode, manageMergeTags } from '../../builder/utils';
import { selectFirstBlockWhenReady, hidePopupTabInEditor } from '../../builder/utils/unlayerDefaultSelection';

const { Title, Text } = Typography;

const EDIT_INFO_POINTS = [
  'Click on template items below to edit their properties (text, images, colors, etc.) in the left panel.',
  'You don\'t have to continue to the next step if you\'re done with your design.',
];

const editInfoPopoverContent = (
  <div style={{ maxWidth: 320 }}>
    <Text strong style={{ display: 'block', marginBottom: 8 }}>Editing tips</Text>
    <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
      {EDIT_INFO_POINTS.map((point, i) => (
        <li key={i} style={{ marginBottom: 4 }}>
          <Text type="secondary">{point}</Text>
        </li>
      ))}
    </ul>
  </div>
);

export interface ClientEditorStepProps {
  unlayerConfig: UnlayerOptions;
  templateId: string;
  onNext: () => void;
  onExit?: () => void;
}

/**
 * ClientEditorStep - Editor step for client flow
 * Simplified version of UnlayerMain without admin navigation (apiClient from generic store)
 */
export const ClientEditorStep: React.FC<ClientEditorStepProps> = ({
  unlayerConfig,
  templateId,
  onNext,
  onExit,
}) => {
  const { currentTemplateId, templateState } = useBuilderStore();
  const authProvider = useGenericStore((s) => s.authProvider);
  const apiClient = useGenericStore((s) => s.apiClient);
  const { builderAutosaving } = useLoadingStore();
  const { devices, defaultDevice } = useUnlayerDeviceOptions();

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

  const handleExitClick = () => {
    Modal.confirm({
      title: 'Exit editor?',
      content: 'Have you saved your changes? If you are done with your design, you can exit and return to the review step.',
      okText: 'Yes, exit',
      cancelText: 'Stay',
      onOk: () => onExit?.(),
    });
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Header Controls */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12}>
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

          <Col xs={24} md={12} className='text-right'>
            <Space>
              <Popover
                content={editInfoPopoverContent}
                title={null}
                trigger="hover"
                placement="bottomRight"
                styles={{ body: { padding: '12px 16px' } }}
              >
                <Button type='text' aria-label="Editing tips" icon={<InfoCircleOutlined className='text-blue-500' />} />
              </Popover>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleManualSave}
                loading={isSaving || builderAutosaving}
                disabled={!isReady || !hasUnsavedChanges}
              >
                {isSaving || builderAutosaving ? 'Saving...' : 'Save'}
              </Button>
            </Space>
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

      {/* Editor Container - only mount when template (and devices) is loaded so device view is correct */}
      <Card>
        <div
          style={{
            height: '700px',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          {!templateState ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <Spin size="large" tip="Loading editor..." />
            </div>
          ) : (
            <EmailEditor
              key={`bl-client-editor-${templateId ?? ''}-${devices.join('-')}-${defaultDevice}`}
              editorId="bl-client-editor"
              ref={editorRef}
              onReady={(unlayer) => {
                onEditorReady(unlayer);
                selectFirstBlockWhenReady(unlayer, 'bl-client-editor');
                hidePopupTabInEditor('bl-client-editor');
              }}
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
                tools: manageEditorMode(true), // Always design mode for client
                mergeTags: manageMergeTags(),
                devices,
                defaultDevice,
                tabs: {
                  content: { enabled: false },
                  blocks: { enabled: false },
                  popup: { enabled: false },
                  Popup: { enabled: false },
                  dev: { enabled: false },
                },
                features: { audit: false },
              }}
              style={{
                height: '700px',
                width: '100%',
              }}
            />
          )}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end gap-2 mt-6">
        {onExit && (
          <Button
            size="large"
            icon={<LogoutOutlined />}
            onClick={handleExitClick}
          >
            Exit
          </Button>
        )}
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
