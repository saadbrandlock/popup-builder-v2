/**
 * useReminderTabAutosave Hook
 * Handles automatic saving of reminder tab configuration at configurable intervals
 */

import { useCallback, useEffect, useRef } from 'react';
import { useLoadingStore } from '@/stores/common/loading.store';
import { createAPI } from '@/api';
import type { AxiosInstance } from 'axios';
import type { ReminderTabConfig } from '@/features/builder/types';
import { useBuilderStore } from '@/stores/builder.store';

export interface UseReminderTabAutosaveOptions {
  enabled?: boolean;
  interval?: number; // milliseconds - default 10 seconds
  debounceDelay?: number; // milliseconds - default 5 seconds
  apiClient?: AxiosInstance;
  templateId?: string;
  onSave?: (config: ReminderTabConfig) => Promise<void>;
  onError?: (error: Error) => void;
}

export interface UseReminderTabAutosaveReturn {
  isSaving: boolean;
  lastSave: Date | null;
  hasUnsavedChanges: boolean;
  saveError: string | null;
  performManualSave: () => Promise<void>;
  triggerAutoSave: () => void;
  disableAutoSave: () => void;
}

/**
 * Custom hook for handling reminder tab autosave functionality
 */
export const useReminderTabAutosave = (
  options: UseReminderTabAutosaveOptions = {}
): UseReminderTabAutosaveReturn => {
  const {
    enabled: propEnabled = true,
    interval: propInterval = 10000, // 10 seconds default
    debounceDelay = 5000, // 5 seconds debounce
    apiClient,
    templateId,
    onSave,
    onError
  } = options;

  // Store state
  const { 
    reminderTabConfig,
    reminderTabUnsavedChanges,
    reminderTabLastSave,
    reminderTabSaveError,
    actions 
  } = useBuilderStore();
  
  // Loading state from loading store
  const { reminderTabAutosaving, actions: loadingActions } = useLoadingStore();

  // Local refs for managing timers
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastConfigRef = useRef<ReminderTabConfig | null>(null);

  // lastConfigRef will be initialized in the useEffect

  // Auto-save enabled state
  const autoSaveEnabled = propEnabled && !!templateId && !!apiClient;

  /**
   * Perform autosave operation
   */
  const performAutoSave = useCallback(async () => {  
    if (!autoSaveEnabled || !reminderTabUnsavedChanges || reminderTabAutosaving) {
      return;
    }

    try {
      
      loadingActions.setReminderTabAutosaving(true);
      actions.setReminderTabSaveError(null);

      // Save to API
      if (apiClient && templateId) {
        const api = createAPI(apiClient);
        await api.templates.upsertTemplate(templateId, {
          reminder_tab_state_json: reminderTabConfig,
          is_builder_state: false
        });
        
      }

      // Call external save handler if provided
      if (onSave) {
        await onSave(reminderTabConfig);
      }

      // Update store state
      actions.markReminderTabUnsaved(false);
      actions.setReminderTabLastSave(new Date());
      
    } catch (error) {
      console.error('❌ Reminder tab autosave error:', error);
      const err = error instanceof Error ? error : new Error('Autosave failed');
      actions.setReminderTabSaveError(err.message);
      onError?.(err);
    } finally {
      loadingActions.setReminderTabAutosaving(false);
    }
  }, [
    autoSaveEnabled, 
    reminderTabUnsavedChanges, 
    reminderTabAutosaving,
    reminderTabConfig,
    apiClient, 
    templateId, 
    actions,
    loadingActions,
    onSave, 
    onError
  ]);

  /**
   * Manual save operation
   */
  const performManualSave = useCallback(async () => {
    if (!templateId || !apiClient) {
      throw new Error('Template ID and API client are required for manual save');
    }

    try {
      
      loadingActions.setReminderTabAutosaving(true);
      actions.setReminderTabSaveError(null);

      const api = createAPI(apiClient);
      await api.templates.upsertTemplate(templateId, {
        reminder_tab_state_json: reminderTabConfig,
        is_builder_state: false
      });

      if (onSave) {
        await onSave(reminderTabConfig);
      }

      // Update store state
      actions.markReminderTabUnsaved(false);
      actions.setReminderTabLastSave(new Date());
      
    } catch (error) {
      console.error('❌ Manual reminder tab save error:', error);
      const err = error instanceof Error ? error : new Error('Manual save failed');
      actions.setReminderTabSaveError(err.message);
      onError?.(err);
      throw err;
    } finally {
      loadingActions.setReminderTabAutosaving(false);
    }
  }, [templateId, apiClient, reminderTabConfig, actions, loadingActions, onSave, onError]);

  /**
   * Debounced autosave trigger
   */
  const triggerDebouncedAutoSave = useCallback(() => {
    
    // Clear existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce timer
    debounceRef.current = setTimeout(() => {
      performAutoSave();
    }, debounceDelay);
  }, [performAutoSave, debounceDelay]);

  /**
   * Manual auto-save trigger (bypasses debounce)
   */
  const triggerAutoSave = useCallback(() => {
    performAutoSave();
  }, [performAutoSave]);

  /**
   * Disable autosave
   */
  const disableAutoSave = useCallback(() => {
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Clear debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  /**
   * Setup autosave interval
   */
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Setup new interval if autosave is enabled
    if (autoSaveEnabled) {
      
      intervalRef.current = setInterval(() => {
        // Only perform auto-save if there are unsaved changes
        if (reminderTabUnsavedChanges && !reminderTabAutosaving) {
          performAutoSave();
        }
      }, propInterval);
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoSaveEnabled, propInterval, reminderTabUnsavedChanges, reminderTabAutosaving, performAutoSave]);

  /**
   * Track config changes and trigger debounced autosave
   */
  useEffect(() => {
    // Skip on initial mount if lastConfigRef is not initialized properly
    if (lastConfigRef.current === null) {
      lastConfigRef.current = JSON.parse(JSON.stringify(reminderTabConfig)); // Deep copy
      return;
    }
    
    // Create deep copies for comparison to avoid reference issues
    const lastConfigStr = JSON.stringify(lastConfigRef.current);
    const currentConfigStr = JSON.stringify(reminderTabConfig);
    const configChanged = lastConfigStr !== currentConfigStr;
    
    if (configChanged) {
      actions.markReminderTabUnsaved(true);
      lastConfigRef.current = JSON.parse(JSON.stringify(reminderTabConfig)); // Deep copy to avoid reference issues
      
      // Trigger debounced autosave if enabled
      if (autoSaveEnabled) {
        triggerDebouncedAutoSave();
      }
    }
  }, [reminderTabConfig, actions, autoSaveEnabled, triggerDebouncedAutoSave, templateId, apiClient]);

  /**
   * Alternative: Listen for unsaved changes flag and trigger autosave
   */
  useEffect(() => {
    if (reminderTabUnsavedChanges && autoSaveEnabled && !reminderTabAutosaving) {
      triggerDebouncedAutoSave();
    }
  }, [reminderTabUnsavedChanges, autoSaveEnabled, reminderTabAutosaving, triggerDebouncedAutoSave]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disableAutoSave();
    };
  }, [disableAutoSave]);

  return {
    isSaving: reminderTabAutosaving,
    lastSave: reminderTabLastSave,
    hasUnsavedChanges: reminderTabUnsavedChanges,
    saveError: reminderTabSaveError,
    performManualSave,
    triggerAutoSave,
    disableAutoSave,
  };
};