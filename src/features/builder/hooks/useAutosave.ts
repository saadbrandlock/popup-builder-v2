/**
 * useAutosave Hook
 * Handles automatic saving of Unlayer designs at configurable intervals
 */

import { useCallback, useEffect, useRef } from 'react';
import { EditorRef } from 'react-email-editor';
import { useUnlayerStore } from '../stores/unlayerStore';
import { createAPI } from '@/api';
import type { AxiosInstance } from 'axios';
import { processTemplateFields } from '@/lib/utils/templateFieldProcessor';
import { useClientFlowStore } from '@/stores/clientFlowStore';
import { useTemplateFieldsStore } from '@/stores/common/template-fields.store';

export interface UseAutosaveOptions {
  enabled?: boolean;
  interval?: number; // milliseconds
  onSave?: (design: any) => Promise<void>;
  onError?: (error: Error) => void;
  // API integration options
  apiClient?: AxiosInstance;
  templateId?: string;
  accountId?: string;
  saveToAPI?: boolean; // Enable/disable API saves
  saveMode?: 'staging' | 'base';
}

export interface UseAutosaveReturn {
  lastSave: Date | null;
  hasChanges: boolean;
  isAutoSaveEnabled: boolean;
  nextAutoSave: number | null;
  performManualSave: () => Promise<void>;
  enableAutoSave: (interval?: number) => void;
  disableAutoSave: () => void;
  triggerAutoSave: () => void;
  forceAutoSaveCheck: () => void;
}

/**
 * Custom hook for handling autosave functionality
 */
export const useAutosave = (
  editorRef: React.RefObject<EditorRef>,
  options: UseAutosaveOptions = {}
): UseAutosaveReturn => {
  const {
    enabled: propEnabled = true,
    interval: propInterval = 30000, // 30 seconds default
    onSave,
    onError,
    apiClient,
    templateId,
    accountId,
    saveToAPI = false,
    saveMode = 'staging',
  } = options;

  // Store state
  const store = useUnlayerStore();
  const { actions } = store;
  const templateFieldsStore = useTemplateFieldsStore();
  const { templateFields } = templateFieldsStore;
  
  // Local state for autosave timing
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastChangeRef = useRef<Date | null>(null);
  const nextAutoSaveRef = useRef<number | null>(null);


  // Get current autosave settings from store
  const autoSaveEnabled = store.autoSaveEnabled && propEnabled;
  const autoSaveInterval = store.autoSaveInterval || propInterval;
  const hasUnsavedChanges = store.hasUnsavedChanges;
  const lastAutoSave = store.lastAutoSave;

  /**
   * Perform autosave operation
   */
  const performAutoSave = useCallback(async () => {
    if (!editorRef.current?.editor || !hasUnsavedChanges) {
      return;
    }

    try {
      
      const unlayer = editorRef.current.editor;
      
      // Get current design from editor
      unlayer.saveDesign(async (design: any) => {
        try {
          // Process template fields before saving
          const processedDesign = templateFields.length > 0 
            ? processTemplateFields(design, templateFields)
            : design;

            
          
          // Only save to our custom API when enabled
          if (saveToAPI && apiClient && templateId) {
            const api = createAPI(apiClient);
            const selectedTemplate = useClientFlowStore.getState().selectedTemplate;
            
            // Check if we're editing a template from client review
            if (selectedTemplate && selectedTemplate.template_id === templateId) {
              
              // Use the client review template update API
              await api.templates.updateClientReviewTemplate(templateId, {
                builder_state_json: processedDesign
              });
              
              // Update the selectedTemplate in the store as well
              useClientFlowStore.getState().actions.setSelectedTemplate({
                ...selectedTemplate,
                builder_state_json: processedDesign
              });
              
            } else {
              if (saveMode === 'base') {
                await api.templates.updateBaseTemplate(templateId, {
                  builder_state_json: processedDesign,
                });
              } else {
                
                // Use regular staging template API
                await api.templates.upsertTemplate(templateId, {
                  builder_state_json: processedDesign,
                  is_builder_state: true
                });
                
              }
            }
            
            // Update local store state without calling saveDesign
            actions.setCurrentDesign(processedDesign);
            actions.markUnsavedChanges(false);
            actions.setLastAutoSave(new Date());
          } else {
          }
          
          // Call external save handler if provided
          if (onSave) {
            await onSave(processedDesign);
          }
          
        } catch (error) {
          console.error('❌ Autosave error:', error);
          const err = error instanceof Error ? error : new Error('Autosave failed');
          actions.setError(`Autosave failed: ${err.message}`);
          onError?.(err);
        }
      });
    } catch (error) {
      console.error('❌ Autosave error:', error);
      const err = error instanceof Error ? error : new Error('Autosave failed');
      actions.setError(`Autosave failed: ${err.message}`);
      onError?.(err);
    }
  }, [editorRef, hasUnsavedChanges, actions, onSave, onError, saveToAPI, apiClient, templateId, templateFields, saveMode]);

  /**
   * Manual save operation
   */
  const performManualSave = useCallback(async () => {
    if (!editorRef.current?.editor) {
      throw new Error('Editor not available');
    }

    return new Promise<void>((resolve, reject) => {
      const unlayer = editorRef.current?.editor;
      
      if (!unlayer) {
        reject(new Error('Editor not available'));
        return;
      }
      
      unlayer.saveDesign(async (design: any) => {
        try {
          // Process template fields before saving
          const processedDesign = templateFields.length > 0 
            ? processTemplateFields(design, templateFields)
            : design;
          
          // Only save to our custom API when enabled
          if (saveToAPI && apiClient && templateId) {
            const api = createAPI(apiClient);
            const selectedTemplate = useClientFlowStore.getState().selectedTemplate;
            
            // Check if we're editing a template from client review
            if (selectedTemplate && selectedTemplate.template_id === templateId) {
              
              // Use the client review template update API
              await api.templates.updateClientReviewTemplate(templateId, {
                builder_state_json: processedDesign
              });
              
              // Update the selectedTemplate in the store as well
              useClientFlowStore.getState().actions.setSelectedTemplate({
                ...selectedTemplate,
                builder_state_json: processedDesign
              });
              
            } else {
              if (saveMode === 'base') {
                await api.templates.updateBaseTemplate(templateId, {
                  builder_state_json: processedDesign,
                });
              } else {
                
                // Use regular staging template API
                await api.templates.upsertTemplate(templateId, {
                  builder_state_json: processedDesign,
                  is_builder_state: true
                });
                
              }
            }
            
            // Update local store state without calling saveDesign
            actions.setCurrentDesign(processedDesign);
            actions.markUnsavedChanges(false);
            actions.setLastAutoSave(new Date());
          } else {
          }
          
          if (onSave) {
            await onSave(processedDesign);
          }
          
          resolve();
        } catch (error) {
          console.error('❌ Manual save error:', error);
          const err = error instanceof Error ? error : new Error('Manual save failed');
          actions.setError(`Save failed: ${err.message}`);
          onError?.(err);
          reject(err);
        }
      });
    });
  }, [editorRef, actions, onSave, onError, saveToAPI, apiClient, templateId, templateFields, saveMode]);

  /**
   * Enable autosave with optional interval
   */
  const enableAutoSave = useCallback((interval?: number) => {
    actions.enableAutoSave(interval);
  }, [actions]);

  /**
   * Disable autosave
   */
  const disableAutoSave = useCallback(() => {
    actions.disableAutoSave();
    
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [actions]);

  /**
   * Calculate next autosave time
   */
  const calculateNextAutoSave = useCallback((): number | null => {
    if (!autoSaveEnabled || !hasUnsavedChanges) {
      return null;
    }

    const lastChange = lastChangeRef.current;
    if (!lastChange) {
      return null;
    }

    return lastChange.getTime() + autoSaveInterval;
  }, [autoSaveEnabled, hasUnsavedChanges, autoSaveInterval]);

  /**
   * Manual auto-save trigger
   */
  const triggerAutoSave = useCallback(() => {
    performAutoSave();
  }, [performAutoSave]);

  /**
   * Force auto-save check (sets up interval if needed)
   */
  const forceAutoSaveCheck = useCallback(() => {
    if (autoSaveEnabled && hasUnsavedChanges && !intervalRef.current) {
      
      intervalRef.current = setInterval(() => {
        performAutoSave();
      }, autoSaveInterval);

      nextAutoSaveRef.current = calculateNextAutoSave();
    }
  }, [autoSaveEnabled, hasUnsavedChanges, autoSaveInterval, performAutoSave, calculateNextAutoSave]);

  /**
   * Setup autosave interval
   */
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Setup new interval if autosave is enabled and always keep it running
    if (autoSaveEnabled) {
      
      intervalRef.current = setInterval(() => {
        // Only perform auto-save if there are unsaved changes
        if (hasUnsavedChanges) {  
          performAutoSave();
        }
      }, autoSaveInterval);

      // Update next autosave time
      nextAutoSaveRef.current = calculateNextAutoSave();
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoSaveEnabled, autoSaveInterval, performAutoSave, calculateNextAutoSave]); // Removed hasUnsavedChanges dependency

  /**
   * Track design changes
   */
  useEffect(() => {
    if (hasUnsavedChanges) {
      lastChangeRef.current = new Date();
      nextAutoSaveRef.current = calculateNextAutoSave();
    }
  }, [hasUnsavedChanges, calculateNextAutoSave]);

  return {
    lastSave: lastAutoSave,
    hasChanges: hasUnsavedChanges,
    isAutoSaveEnabled: autoSaveEnabled,
    nextAutoSave: nextAutoSaveRef.current,
    performManualSave,
    enableAutoSave,
    disableAutoSave,
    triggerAutoSave,
    forceAutoSaveCheck,
  };
};