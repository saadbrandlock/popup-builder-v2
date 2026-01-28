import { useEffect, useState } from 'react';
import { Button, Space, Typography, Card, Row, Col, Alert, Badge } from 'antd';
import EmailEditor, { UnlayerOptions } from 'react-email-editor';
import { useUnlayerEditor } from '../hooks/useUnlayerEditor';
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
  apiClient?: any; // AxiosInstance
  enableCustomImageUpload?: boolean;
  clientTemplateId?: string;
  saveMode?: 'staging' | 'base';
}

export const UnlayerMain = ({
  unlayerConfig,
  initialDesign,
  onSave,
  onError,
  apiClient,
  enableCustomImageUpload = true,
  clientTemplateId = '',
  saveMode = 'staging',
}: UnlayerMainProps) => {
  // State for UI controls
  const [autoSaveInterval] = useState(30);
  const [designMode, setDesignMode] = useState(false);

  // Store values for image upload
  const {
    currentTemplateId,
    templateState,
    actions: builderActions,
  } = useBuilderStore();
  const { authProvider } = useGenericStore();

  // Loading states for showing combined loading status
  const { builderAutosaving } = useLoadingStore();

  // Main editor hook with all functionality
  const {
    editorRef,
    isReady,
    isSaving,
    isExporting,
    hasUnsavedChanges,
    error,
    lastExportedHtml,
    lastExportedJson,
    saveDesign,
    loadDesign,
    exportHtml,
    exportJson,
    exportBoth,
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

  // Remove Unlayer branding
  // useEffect(() => {
  //   const removebranding = () => {
  //     const branding = document.querySelector('a.blockbuilder-branding');
  //     if (branding) {
  //       branding.remove();
  //     }
  //   };

  //   // Try to remove branding after editor is ready
  //   if (isReady) {
  //     setTimeout(removebranding, 1000);
  //     // Set up interval to keep removing it
  //     const interval = setInterval(removebranding, 5000);
  //     return () => clearInterval(interval);
  //   }
  // }, [isReady]);

  useEffect(() => {
    setDesignMode(window.location.href.includes('user-template-editor'));
  }, []);

  // Handle export actions
  const handleExportHtml = async () => {
    try {
      const html = await exportHtml();
      console.log('📄 Exported HTML:', html);
      return await sanitizeHtml(html);
      // You can show a modal or copy to clipboard here
    } catch (error) {
      console.error('Export HTML failed:', error);
    }
  };

  const handleExportJson = async () => {
    try {
      const design = await exportJson();
      console.log('📋 Exported JSON:', design);
      // You can show a modal or copy to clipboard here
    } catch (error) {
      console.error('Export JSON failed:', error);
    }
  };

  const handleExportBoth = async () => {
    try {
      const { design, html } = await exportBoth();
      console.log('📦 Exported both:', { design, html });
      // You can show a modal or download files here
    } catch (error) {
      console.error('Export both failed:', error);
    }
  };

  const handleManualSave = async () => {
    try {
      await saveDesign();
      console.log('💾 Manual save completed');
    } catch (error) {
      console.error('Manual save failed:', error);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Header Controls */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              Unlayer Popup Builder
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
        </Row>
      </Card>

      {/* Action Buttons */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col>
            <Space>
              <Button
                type="primary"
                onClick={handleManualSave}
                loading={isSaving || builderAutosaving}
                disabled={!isReady || !hasUnsavedChanges}
              >
                {isSaving || builderAutosaving ? 'Saving...' : 'Save Design'}
              </Button>
              <Button
                onClick={handleExportHtml}
                loading={isExporting}
                disabled={!isReady}
              >
                Export HTML
              </Button>
              <Button
                onClick={handleExportJson}
                loading={isExporting}
                disabled={!isReady}
              >
                Export JSON
              </Button>
              <Button
                onClick={handleExportBoth}
                loading={isExporting}
                disabled={!isReady}
                type="dashed"
              >
                Export Both
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Autosave Settings */}
      {/* <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col>
            <Space>
              <Text>Autosave:</Text>
              <Switch 
                checked={isAutoSaveEnabled}
                onChange={handleAutoSaveToggle}
                size="small"
              />
            </Space>
          </Col>
          <Col>
            <Space>
              <Text>Interval (seconds):</Text>
              <InputNumber
                min={10}
                max={300}
                value={autoSaveInterval}
                onChange={handleIntervalChange}
                disabled={!isAutoSaveEnabled}
                size="small"
                style={{ width: '80px' }}
              />
            </Space>
          </Col>
          <Col>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              History: {designHistory.length} versions
            </Text>
          </Col>
        </Row>
      </Card> */}

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
                tools: manageEditorMode(designMode),
                mergeTags: manageMergeTags(),
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
    </div>
  );
};
