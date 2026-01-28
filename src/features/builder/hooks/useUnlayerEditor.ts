/**
 * useUnlayerEditor Hook
 * Main integration hook for React email editor with autosave and export features
 */

import { useCallback, useRef, useState } from 'react';
import { EditorRef } from 'react-email-editor';
import { useUnlayerStore } from '../stores/unlayerStore';
import { useTemplateFieldsStore } from '@/stores/common/template-fields.store';
import { useAutosave } from './useAutosave';
import { useUnlayerImageUpload } from './useUnlayerImageUpload';
import { createAPI } from '@/api';
import { sanitizeHtml } from '@/lib/utils/helper';
import { processTemplateFields } from '@/lib/utils/templateFieldProcessor';
import { useClientFlowStore } from '@/stores/clientFlowStore';
import { useBaseTemplateStore } from '@/features/base-template';
import { useBuilderStore } from '@/stores/builder.store';

export interface UseUnlayerEditorOptions {
  projectId: number;
  autoSave?: boolean;
  autoSaveInterval?: number;
  onDesignChange?: (design: any) => void;
  onSave?: (design: any) => Promise<void>;
  onError?: (error: Error) => void;
  // Image upload options
  apiClient?: any; // AxiosInstance
  templateId?: string;
  accountId?: string;
  enableCustomImageUpload?: boolean;
  saveMode?: 'staging' | 'base';
  // Template loading options
  loadTemplateOnReady?: boolean;
  onTemplateLoad?: (template: any) => void;
  onTemplateLoadError?: (error: Error) => void;
}

export interface UseUnlayerEditorReturn {
  // Editor ref
  editorRef: React.RefObject<EditorRef>;

  // Store state
  currentDesign: any;
  savedDesign: any;
  isReady: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isExporting: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;

  // Export data
  lastExportedHtml: string | null;
  lastExportedJson: any;

  // Actions
  saveDesign: () => Promise<void>;
  loadDesign: (design: any) => void;
  exportHtml: () => Promise<string>;
  exportJson: () => Promise<any>;
  exportBoth: () => Promise<{ design: any; html: string }>;

  // Template loading
  loadTemplateById: (templateId: string) => Promise<void>;

  // Autosave
  lastAutoSave: Date | null;
  isAutoSaveEnabled: boolean;
  enableAutoSave: (interval?: number) => void;
  disableAutoSave: () => void;

  // History
  designHistory: any[];
  restoreFromHistory: (index: number) => void;
  clearHistory: () => void;

  // Editor ready handler
  onEditorReady: (unlayer: any) => void;

  // Utility
  clearError: () => void;
  reset: () => void;
}

/**
 * Decode HTML entities in Unlayer design data
 * Fixes issue where HTML content is encoded as &lt; &gt; etc.
 */
const decodeHtmlEntitiesInDesign = (designData: any): any => {
  // Create a temporary DOM element to decode HTML entities
  const decodeHtmlEntities = (str: string): string => {
    if (typeof str !== 'string') return str;

    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
  };

  // Recursively process the design data
  const processObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(processObject);
    }

    const processed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'text' && typeof value === 'string') {
        // Decode HTML entities in text fields
        processed[key] = decodeHtmlEntities(value);
        console.log(`🔧 Decoded text: "${value}" → "${processed[key]}"`);
      } else if (typeof value === 'object') {
        // Recursively process nested objects
        processed[key] = processObject(value);
      } else {
        // Keep other values as-is
        processed[key] = value;
      }
    }
    return processed;
  };

  return processObject(designData);
};

/**
 * Main hook for Unlayer editor integration
 */
export const useUnlayerEditor = (options: UseUnlayerEditorOptions): UseUnlayerEditorReturn => {
  const {
    projectId,
    autoSave = true,
    autoSaveInterval = 30000,
    onDesignChange,
    onSave,
    onError,
    apiClient,
    templateId,
    accountId,
    enableCustomImageUpload = true,
    saveMode = 'staging',
    loadTemplateOnReady = true,
    onTemplateLoad,
    onTemplateLoadError,
  } = options;

  // Editor ref
  const editorRef = useRef<EditorRef>(null);

  // Store
  const store = useUnlayerStore();
  const { actions } = store;
  const templateFieldsStore = useTemplateFieldsStore();
  const { templateFields } = templateFieldsStore;

  // Image upload hook (only if apiClient is provided)
  const imageUploadHook = apiClient
    ? useUnlayerImageUpload({
        apiClient,
        templateId,
        accountId,
        onUploadSuccess: (asset) => {
          console.log('✅ Image uploaded via Unlayer:', asset);
        },
        onUploadError: (error) => {
          console.error('❌ Unlayer image upload failed:', error);
          onError?.(error);
        },
      })
    : { setupImageUpload: () => {} };

  const { setupImageUpload } = imageUploadHook;

  // Autosave hook
  const {
    lastSave: lastAutoSave,
    isAutoSaveEnabled,
    enableAutoSave,
    disableAutoSave,
    performManualSave,
    triggerAutoSave,
    forceAutoSaveCheck,
  } = useAutosave(editorRef, {
    enabled: autoSave,
    interval: autoSaveInterval,
    onSave,
    onError,
    // API integration options
    apiClient,
    templateId,
    accountId,
    saveToAPI: enableCustomImageUpload && !!apiClient && !!templateId, // Use same condition as image upload
    saveMode,
  });

  /**
   * Save current design
   */
  const saveDesign = useCallback(async (): Promise<void> => {
    await performManualSave();
  }, [performManualSave]);

  /**
   * Load design into editor
   */
  const loadDesign = useCallback(
    (design: any) => {
      if (!editorRef.current?.editor) {
        console.warn('Editor not ready, cannot load design');
        return;
      }

      try {
        const unlayer = editorRef.current.editor;
        unlayer.loadDesign(design);
        actions.loadDesign(design);

        console.log('✅ Design loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load design:', error);
        const err = error instanceof Error ? error : new Error('Failed to load design');
        actions.setError(err.message);
        onError?.(err);
      }
    },
    [actions, onError]
  );

  /**
   * Load template by ID and populate editor
   */
  const loadTemplateById = useCallback(
    async (templateId: string): Promise<void> => {
      if (!apiClient) {
        console.warn('Cannot load template - API client not provided');
        return;
      }

      try {
        actions.setLoading(true);
        const selectedTemplateClient = useClientFlowStore.getState().selectedTemplate;
        const selectedTemplateAdmin =
          saveMode === 'staging'
            ? useBuilderStore.getState().templateState
            : useBaseTemplateStore.getState().selectedTemplate;
        console.log('🔍 Loading template - selectedTemplate:', selectedTemplateClient);
        console.log('🔍 Loading template - templateId:', templateId);

        // Check if we're in template editing mode (from client review)
        if (selectedTemplateClient && selectedTemplateClient.template_id === templateId) {
          console.log('📝 Loading template from client review selectedTemplate');
          console.log(
            '📝 Loading template from client review selectedTemplate:',
            selectedTemplateClient
          );
          // Use selectedTemplate data directly (it's already a ClientFlowData)
          if (selectedTemplateClient.builder_state_json) {
            let designData = selectedTemplateClient.builder_state_json;

            if (typeof designData === 'string') {
              try {
                designData = JSON.parse(designData);
                console.log('✅ Parsed selectedTemplate JSON string to object');
              } catch (error) {
                console.error(
                  '❌ Failed to parse selectedTemplate builder_state_json as JSON:',
                  error
                );

                if (designData.includes('<') && designData.includes('>')) {
                  onTemplateLoadError?.(
                    new Error('Template contains HTML content instead of Unlayer design JSON')
                  );
                  return;
                }
              }
            }

            if (designData && typeof designData === 'object') {
              if (!designData.body && !designData.counters) {
                console.log("⚠️ selectedTemplate doesn't look like a valid Unlayer design format");
              } else {
                console.log('🔧 Fixing HTML entity encoding in selectedTemplate design data...');
                designData = decodeHtmlEntitiesInDesign(designData);
              }
            }

            loadDesign(designData);
            onTemplateLoad?.(selectedTemplateClient);
          } else {
            console.log('⚠️ selectedTemplate has no builder state');
            onTemplateLoad?.(selectedTemplateClient);
          }
        } else {
          // Normal template loading from API
          console.log('📡 Loading template from API');
          const api = createAPI(apiClient);
          console.log('this is selectedTemplateAdmin', !!selectedTemplateAdmin);

          const template = selectedTemplateAdmin?.id
            ? selectedTemplateAdmin
            : saveMode === 'staging'
              ? await api.templates.getTemplateById(templateId)
              : await api.templates.getBaseTemplateById(templateId);

          if (template.builder_state_json) {
            let designData = template.builder_state_json;
            if (typeof designData === 'string') {
              try {
                designData = JSON.parse(designData);
                console.log('✅ Parsed API template JSON string to object');
              } catch (error) {
                console.error('❌ Failed to parse API template builder_state_json as JSON:', error);

                if (designData.includes('<') && designData.includes('>')) {
                  onTemplateLoadError?.(
                    new Error('Template contains HTML content instead of Unlayer design JSON')
                  );
                  return;
                }
              }
            }

            if (designData && typeof designData === 'object') {
              if (!designData.body && !designData.counters) {
                console.log("⚠️ API template doesn't look like a valid Unlayer design format");
              } else {
                console.log('🔧 Fixing HTML entity encoding in API template design data...');
                designData = decodeHtmlEntitiesInDesign(designData);
              }
            }
            loadDesign(designData);
            onTemplateLoad?.(template);
          } else {
            console.log('⚠️ API template has no builder state');
            onTemplateLoad?.(template);
          }
        }
      } catch (error) {
        console.error('❌ Failed to load template:', error);
        const err = error instanceof Error ? error : new Error('Failed to load template');
        actions.setError(`Template load failed: ${err.message}`);
        onTemplateLoadError?.(err);
      } finally {
        actions.setLoading(false);
      }
    },
    [apiClient, loadDesign, actions, onTemplateLoad, onTemplateLoadError]
  );

  /**
   * Export HTML from current design
   */
  const exportHtml = useCallback(async (): Promise<string> => {
    if (!editorRef.current?.editor) {
      throw new Error('Editor not available');
    }

    return new Promise((resolve, reject) => {
      const unlayer = editorRef.current!.editor;

      actions.setExporting(true);

      unlayer?.exportHtml((data: any) => {
        try {
          const { html, design } = data;

          // Update store with HTML
          actions.exportHtml(html);
          actions.setCurrentDesign(design);
          actions.setExporting(false);

          console.log('✅ HTML exported successfully');
          resolve(sanitizeHtml(html));
        } catch (error) {
          const err = error instanceof Error ? error : new Error('HTML export failed');
          actions.setError(err.message);
          actions.setExporting(false);
          onError?.(err);
          reject(err);
        }
      });
    });
  }, [actions, onError]);

  /**
   * Export JSON design
   */
  const exportJson = useCallback(async (): Promise<any> => {
    if (!editorRef.current?.editor) {
      throw new Error('Editor not available');
    }

    return new Promise((resolve, reject) => {
      const unlayer = editorRef.current!.editor;

      actions.setExporting(true);

      unlayer?.saveDesign((design: any) => {
        try {
          // Process template fields before exporting
          const processedDesign =
            templateFields.length > 0 ? processTemplateFields(design, templateFields) : design;

          // Update store with processed design
          actions.exportJson(processedDesign);
          actions.setCurrentDesign(processedDesign);
          actions.setExporting(false);

          console.log('✅ JSON exported successfully with template fields processed');
          console.log('📋 Exported JSON:', processedDesign);
          resolve(processedDesign);
        } catch (error) {
          const err = error instanceof Error ? error : new Error('JSON export failed');
          actions.setError(err.message);
          actions.setExporting(false);
          onError?.(err);
          reject(err);
        }
      });
    });
  }, [actions, onError]);

  /**
   * Export both HTML and JSON
   */
  const exportBoth = useCallback(async (): Promise<{
    design: any;
    html: string;
  }> => {
    if (!editorRef.current?.editor) {
      throw new Error('Editor not available');
    }

    actions.setExporting(true);

    try {
      // Get design first
      const design = await exportJson();

      // Export HTML
      const html = await new Promise<string>((resolve, reject) => {
        const unlayer = editorRef.current!.editor;
        unlayer?.exportHtml((data: any) => {
          try {
            resolve(sanitizeHtml(data.html));
          } catch (error) {
            reject(error);
          }
        });
      });

      // Update store with both HTML and design
      actions.exportBoth(design, html);
      actions.setExporting(false);

      console.log('✅ Both HTML and JSON exported successfully with template fields processed');
      console.log('📋 Exported JSON:', design);
      console.log('🌐 Exported HTML:', html);
      return { design, html };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Export failed');
      actions.setError(err.message);
      actions.setExporting(false);
      onError?.(err);
      throw err;
    }
  }, [exportJson, actions, onError]);

  /**
   * Handle editor ready event
   */
  const onEditorReady = useCallback(
    (unlayer: any) => {
      console.log('🎉 Unlayer editor is ready');

      // Set project ID and ready state
      actions.setProjectId(projectId);
      actions.setReady(true);

      if (enableCustomImageUpload && apiClient && templateId && accountId) {
        console.log('🚀 Configuring custom image upload with:', {
          templateId,
          accountId,
          hasApiClient: !!apiClient,
        });
        setupImageUpload(unlayer);
        console.log('🖼️ Custom image upload configured for Unlayer');
      }

      // Load template if templateId provided and loading enabled
      if (loadTemplateOnReady && templateId && apiClient) {
        console.log(`🚀 Auto-loading template ${templateId}...`);
        loadTemplateById(templateId);
      }

      // Set up comprehensive design change listeners for autosave
      console.log('🔧 Setting up canvas change detection...');

      // Primary event: design:updated
      unlayer.addEventListener('design:updated', (updatedDesign: any) => {
        console.log('🔄 design:updated event fired');
        console.log('📊 Event data keys:', updatedDesign ? Object.keys(updatedDesign) : 'null');
        console.log('⏰ Timestamp:', new Date().toISOString());
        console.log('🎯 Current hasUnsavedChanges before:', store.hasUnsavedChanges);

        actions.setCurrentDesign(updatedDesign);
        actions.markUnsavedChanges(true);
        onDesignChange?.(updatedDesign);

        // Force auto-save check to ensure interval is running
        console.log('🚀 Triggering auto-save check after design update');
        forceAutoSaveCheck();

        console.log('✅ Change state updated, hasUnsavedChanges now:', true);
      });

      // Additional events to catch all possible changes
      const additionalEvents = [
        'element:added',
        'element:removed',
        'element:modified',
        'element:moved',
        'element:resized',
        'element:copied',
        'element:pasted',
        'design:loaded',
        'design:changed',
        'canvas:updated',
        'content:updated',
      ];

      // 🧪 ENHANCED DEBUG MODE - Test ALL possible events first
      console.log('🔬 ENHANCED DEBUG MODE: Testing comprehensive event detection');

      // Test basic editor events first to see if ANY events work
      const basicTestEvents = [
        'ready',
        'loaded',
        'rendered',
        'updated',
        'changed',
        'click',
        'mousedown',
        'mouseup',
      ];

      basicTestEvents.forEach((eventName) => {
        try {
          unlayer.addEventListener(eventName, (eventData: any) => {
            console.log(`🔥 BASIC EVENT FIRED: "${eventName}"`, {
              hasData: !!eventData,
              dataType: typeof eventData,
              timestamp: new Date().toISOString(),
            });
          });
        } catch (error) {
          console.log(`❌ Failed to register basic event: ${eventName}`, error);
        }
      });

      additionalEvents.forEach((eventName) => {
        try {
          unlayer.addEventListener(eventName, (data: any) => {
            console.log(`📡 Additional event fired: ${eventName}`, data ? 'with data' : 'no data');
            console.log('⏰ Timestamp:', new Date().toISOString());

            // Mark as changed for any canvas operation
            if (!store.hasUnsavedChanges) {
              console.log(`🔥 Marking unsaved changes from ${eventName} event`);
              actions.markUnsavedChanges(true);
            }

            // Force auto-save check for immediate response
            console.log(`🚀 Triggering auto-save check from ${eventName} event`);
            forceAutoSaveCheck();

            // Optionally get current design and update store
            unlayer.saveDesign((currentDesign: any) => {
              actions.setCurrentDesign(currentDesign);
              onDesignChange?.(currentDesign);
              console.log(`✅ Design updated from ${eventName} event`);
            });
          });
          console.log(`✅ Registered event listener: ${eventName}`);
        } catch (error) {
          console.log(`⚠️ Failed to register event listener: ${eventName}`, error);
        }
      });

      // Fallback: Periodic change detection
      console.log('🔄 Setting up fallback change detection...');
      const changeDetectionInterval = setInterval(() => {
        if (!unlayer || !store.isReady) return;

        unlayer.saveDesign((currentDesign: any) => {
          const currentDesignStr = JSON.stringify(currentDesign);
          const savedDesignStr = JSON.stringify(store.savedDesign);

          if (currentDesignStr !== savedDesignStr && !store.hasUnsavedChanges) {
            console.log('🔍 Change detected via fallback polling');
            console.log('⏰ Timestamp:', new Date().toISOString());
            actions.setCurrentDesign(currentDesign);
            actions.markUnsavedChanges(true);
            onDesignChange?.(currentDesign);

            // Force auto-save check for fallback detection
            console.log('🚀 Triggering auto-save check from fallback detection');
            forceAutoSaveCheck();
          }
        });
      }, 3000); // Check every 3 seconds

      // Cleanup interval on unmount/editor change
      const cleanup = () => {
        console.log('🧹 Cleaning up change detection interval');
        clearInterval(changeDetectionInterval);
      };

      // Store cleanup function for later use
      (unlayer as any).__changeDetectionCleanup = cleanup;

      console.log('✅ Unlayer editor initialized successfully');
    },
    [
      actions,
      projectId,
      onDesignChange,
      enableCustomImageUpload,
      apiClient,
      templateId,
      accountId,
      setupImageUpload,
      loadTemplateOnReady,
      loadTemplateById,
      forceAutoSaveCheck,
      store,
    ]
  );

  /**
   * Restore design from history
   */
  const restoreFromHistory = useCallback(
    (index: number) => {
      const design = store.designHistory[index];
      if (design) {
        loadDesign(design);
      }
    },
    [store.designHistory, loadDesign]
  );

  /**
   * Clear design history
   */
  const clearHistory = useCallback(() => {
    actions.clearHistory();
  }, [actions]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    actions.clearError();
  }, [actions]);

  /**
   * Reset store state
   */
  const reset = useCallback(() => {
    actions.reset();
  }, [actions]);

  return {
    // Editor ref
    editorRef,

    // Store state
    currentDesign: store.currentDesign,
    savedDesign: store.savedDesign,
    isReady: store.isReady,
    isLoading: store.isLoading,
    isSaving: store.isSaving,
    isExporting: store.isExporting,
    hasUnsavedChanges: store.hasUnsavedChanges,
    error: store.error,

    // Export data
    lastExportedHtml: store.lastExportedHtml,
    lastExportedJson: store.lastExportedJson,

    // Actions
    saveDesign,
    loadDesign,
    exportHtml,
    exportJson,
    exportBoth,

    // Template loading
    loadTemplateById,

    // Autosave
    lastAutoSave,
    isAutoSaveEnabled,
    enableAutoSave,
    disableAutoSave,

    // History
    designHistory: store.designHistory,
    restoreFromHistory,
    clearHistory,

    // Editor ready handler
    onEditorReady,

    // Utility
    clearError,
    reset,
  };
};
