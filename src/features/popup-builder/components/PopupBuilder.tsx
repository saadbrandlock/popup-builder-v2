import React, { useEffect, useCallback, useState } from 'react';
import { Layout, message } from 'antd';
import { DndContext, DragStartEvent } from '@dnd-kit/core';
import type { PopupBuilderProps } from '../types';
import {
  usePopupBuilderStore,
  useBuilderActions,
  useDragAndDrop,
} from '../hooks';
import {
  ActionBar,
  ComponentLibrary,
  PropertyPanel,
  PopupPreview,
} from './';
import { SimpleCanvas } from './SimpleCanvas';

const { Header, Content, Sider } = Layout;

/**
 * PopupBuilder - Main popup builder component that assembles all sub-components
 * Provides drag-and-drop functionality and manages the overall builder state
 */
export const PopupBuilder: React.FC<PopupBuilderProps> = ({
  templateId,
  apiClient,
  onSave,
  onPreview,
  onError,
  className = '',
  readOnly = false,
}) => {
  const { template, mode, isDirty, saving, error, draggedComponent } = usePopupBuilderStore();
  const { loadTemplate, saveTemplate, clearError } = useBuilderActions();
  
  const [activeId, setActiveId] = useState<string | null>(null);

  const {
    sensors,
    handleDragStart: originalHandleDragStart,
    handleDragOver,
    handleDragEnd: originalHandleDragEnd,
    getDragOverlay,
    DragOverlay: DnDDragOverlay,
  } = useDragAndDrop();
  
  // Wrap drag handlers to track active drag state
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    originalHandleDragStart(event);
  }, [originalHandleDragStart]);
  
  const handleDragEnd = useCallback((event: any) => {
    setActiveId(null);
    originalHandleDragEnd(event);
  }, [originalHandleDragEnd]);

  // Smart template initialization - handles all scenarios
  useEffect(() => {
    const initializeTemplateForBuilder = async () => {
      console.log('🎯 PopupBuilder: Starting smart template initialization');
      
      try {
        // Import template loader
        const { initializeTemplate } = await import('../utils/templateLoader');
        
        // Initialize template using smart loading system - handles all scenarios
        const template = await initializeTemplate(templateId, apiClient);
        
        console.log('✅ PopupBuilder: Template initialized successfully');
        loadTemplate(template);
        
      } catch (error) {
        console.error('❌ PopupBuilder: Critical template initialization failure:', error);
        // The templateLoader should handle all fallbacks, but this is a safety net
        throw error; // Re-throw to prevent silent failures
      }
    };

    initializeTemplateForBuilder();
  }, [templateId, apiClient, loadTemplate]);

  // Handle save action
  const handleSave = useCallback(async () => {
    try {
      await saveTemplate();
      message.success('Template saved successfully');
      onSave?.(template!);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save template';
      message.error(errorMessage);
      onError?.({ code: 'SAVE_ERROR', message: errorMessage });
    }
  }, [saveTemplate, template, onSave, onError]);

  // Handle preview action
  const handlePreview = useCallback(() => {
    if (template) {
      onPreview?.(template);
    }
  }, [template, onPreview]);

  // Handle errors
  useEffect(() => {
    if (error) {
      message.error(error);
      onError?.({ code: 'BUILDER_ERROR', message: error });
      clearError();
    }
  }, [error, onError, clearError]);

  // Render based on mode
  const renderContent = () => {
    switch (mode) {
      case 'preview':
        return template ? (
          <PopupPreview
            template={template}
            device="desktop"
            className="h-full m-5"
          />
        ) : null;

      case 'settings':
        return (
          <div className="h-full p-5 bg-white">
            <PropertyPanel />
          </div>
        );

      case 'builder':
      default:
        return (
          <Layout className="h-full bg-gray-100 md:flex-col">
            {/* Left sidebar - Component Library */}
            <Sider
              width={280}
              className="bg-white border-r border-gray-200 xl:w-[240px] md:w-full md:h-[200px]"
              theme="light"
              style={{ overflow: 'auto' }}
            >
              <ComponentLibrary apiClient={apiClient} />
            </Sider>

            {/* Main content - Simple Canvas */}
            <Content className="bg-gray-100 flex items-center justify-center overflow-auto md:flex-1 md:p-2.5">
              <SimpleCanvas />
            </Content>

            {/* Right sidebar - Property Panel */}
            <Sider
              width={320}
              className="bg-white border-l border-gray-200 overflow-hidden xl:w-[280px] md:w-full md:h-[200px]"
              theme="light"
            >
              <PropertyPanel />
            </Sider>
          </Layout>
        );
    }
  };

  return (
    <div
      className={`h-screen flex flex-col bg-gray-100 ${className} ${readOnly ? 'pointer-events-none opacity-80' : ''}`}
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Layout className="h-full bg-white">
          {/* Header with action bar */}
          <Header className="h-auto p-0 bg-white border-b border-gray-200">
            <ActionBar
              onSave={handleSave}
              onPreview={handlePreview}
              saving={saving}
              isDirty={isDirty}
            />
          </Header>

          {/* Main content area */}
          <Content className="flex-1 bg-gray-100 overflow-hidden">
            {renderContent()}
          </Content>
        </Layout>

        {/* Drag overlay */}
        <DnDDragOverlay>
          {getDragOverlay(activeId, draggedComponent ? { type: 'component', component: draggedComponent } : null)}
        </DnDDragOverlay>
      </DndContext>
    </div>
  );
};
