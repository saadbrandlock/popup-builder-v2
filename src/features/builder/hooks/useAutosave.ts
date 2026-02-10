/**
 * useAutosave Hook
 * Handles automatic saving of Unlayer designs at configurable intervals.
 * Uses refs to avoid stale closures in interval callbacks; single interval + mutex to prevent duplicate saves.
 */

import { useCallback, useEffect, useRef } from 'react';
import { EditorRef } from 'react-email-editor';
import { useUnlayerStore } from '../stores/unlayerStore';
import { createAPI } from '@/api';
import type { AxiosInstance } from 'axios';
import { processTemplateFields } from '@/lib/utils/templateFieldProcessor';
import { saveDesignWithTimeout } from '@/lib/utils/unlayerHelpers';
import { retryWithBackoff } from '@/lib/utils/retryHelper';
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
  forceSaveNow: () => void;
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

  const autoSaveEnabled = store.autoSaveEnabled && propEnabled;
  const autoSaveInterval = store.autoSaveInterval || propInterval;
  const hasUnsavedChanges = store.hasUnsavedChanges;
  const lastAutoSave = store.lastAutoSave;

  // --- Ref mirrors for values read inside interval / async save (avoid stale closures) ---
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  const templateFieldsRef = useRef(templateFields);
  const saveToAPIRef = useRef(saveToAPI);
  const apiClientRef = useRef(apiClient);
  const templateIdRef = useRef(templateId);
  const accountIdRef = useRef(accountId);
  const saveModeRef = useRef(saveMode);
  const onSaveRef = useRef(onSave);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);
  useEffect(() => {
    templateFieldsRef.current = templateFields;
  }, [templateFields]);
  useEffect(() => {
    saveToAPIRef.current = saveToAPI;
  }, [saveToAPI]);
  useEffect(() => {
    apiClientRef.current = apiClient;
  }, [apiClient]);
  useEffect(() => {
    templateIdRef.current = templateId;
  }, [templateId]);
  useEffect(() => {
    accountIdRef.current = accountId;
  }, [accountId]);
  useEffect(() => {
    saveModeRef.current = saveMode;
  }, [saveMode]);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Mutex to prevent overlapping saves
  const isSavingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastChangeRef = useRef<Date | null>(null);
  const nextAutoSaveRef = useRef<number | null>(null);

  /**
   * Core save: get design from editor, process template fields, optional API + onSave, always update store on success.
   * Uses refs for all options so it can be stable (minimal deps) and still read fresh values.
   */
  const performSave = useCallback(
    async (isManual: boolean) => {
      if (isSavingRef.current) return;
      const editor = editorRef.current?.editor;
      if (!editor) {
        if (isManual) throw new Error('Editor not available');
        return;
      }
      if (!isManual && !hasUnsavedChangesRef.current) return;

      isSavingRef.current = true;

      try {
        const design = await saveDesignWithTimeout(editor, 10000);

        const fields = templateFieldsRef.current;
        const processedDesign =
          fields && fields.length > 0 ? processTemplateFields(design, fields) : design;

        let saveSucceeded = false;

        if (saveToAPIRef.current && apiClientRef.current && templateIdRef.current) {
          await retryWithBackoff(async () => {
            const api = createAPI(apiClientRef.current!);
            const selectedTemplate = useClientFlowStore.getState().selectedTemplate;
            const tid = templateIdRef.current!;

            if (selectedTemplate && selectedTemplate.template_id === tid) {
              await api.templates.updateClientReviewTemplate(tid, {
                builder_state_json: processedDesign,
              });
              useClientFlowStore.getState().actions.setSelectedTemplate({
                ...selectedTemplate,
                builder_state_json: processedDesign,
              });
            } else {
              if (saveModeRef.current === 'base') {
                await api.templates.updateBaseTemplate(tid, {
                  builder_state_json: processedDesign,
                });
              } else {
                await api.templates.upsertTemplate(tid, {
                  builder_state_json: processedDesign,
                  is_builder_state: true,
                });
              }
            }
          }, 2, 2000);
          saveSucceeded = true;
        }

        if (onSaveRef.current) {
          await onSaveRef.current(processedDesign);
          saveSucceeded = true;
        }

        // Always update store on success (even when only onSave was called)
        if (saveSucceeded) {
          actions.setCurrentDesign(processedDesign);
          actions.markUnsavedChanges(false);
          actions.setLastAutoSave(new Date());
        }
      } catch (error) {
        console.error('❌ Autosave error:', error);
        const err = error instanceof Error ? error : new Error('Autosave failed');
        actions.setError(`Autosave failed: ${err.message}`);
        onErrorRef.current?.(err);
        if (isManual) throw err;
      } finally {
        isSavingRef.current = false;
      }
    },
    [editorRef, actions]
  );

  const performAutoSave = useCallback(() => {
    performSave(false);
  }, [performSave]);

  const performManualSave = useCallback(async () => {
    await performSave(true);
  }, [performSave]);

  const enableAutoSave = useCallback(
    (interval?: number) => {
      actions.enableAutoSave(interval);
    },
    [actions]
  );

  const disableAutoSave = useCallback(() => {
    actions.disableAutoSave();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [actions]);

  const calculateNextAutoSave = useCallback((): number | null => {
    if (!autoSaveEnabled || !hasUnsavedChanges) return null;
    const lastChange = lastChangeRef.current;
    if (!lastChange) return null;
    return lastChange.getTime() + autoSaveInterval;
  }, [autoSaveEnabled, hasUnsavedChanges, autoSaveInterval]);

  const triggerAutoSave = useCallback(() => {
    performAutoSave();
  }, [performAutoSave]);

  /** Trigger an immediate save if there are unsaved changes; does not create a second interval. */
  const forceSaveNow = useCallback(() => {
    if (!isSavingRef.current && hasUnsavedChangesRef.current) {
      performAutoSave();
    }
  }, [performAutoSave]);

  // Single interval: callback reads from ref so no stale closure
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (autoSaveEnabled && autoSaveInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (hasUnsavedChangesRef.current && !isSavingRef.current) {
          performAutoSave();
        }
      }, autoSaveInterval);
      nextAutoSaveRef.current = calculateNextAutoSave();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoSaveEnabled, autoSaveInterval, performAutoSave, calculateNextAutoSave]);

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
    forceSaveNow,
  };
};
