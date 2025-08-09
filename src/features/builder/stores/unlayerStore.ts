/**
 * Unlayer Store - React Package Based
 * Enhanced Zustand store for React email editor integration
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  UnlayerDesign,
} from '../types/unlayer.d';

// Enhanced state interface for React package
interface UnlayerState {
  // Design management
  currentDesign: UnlayerDesign | null;
  savedDesign: UnlayerDesign | null;
  designHistory: UnlayerDesign[];

  // Export data
  lastExportedHtml: string | null;
  lastExportedJson: any;

  // Autosave
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  lastAutoSave: Date | null;
  hasUnsavedChanges: boolean;

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  isExporting: boolean;
  isReady: boolean;
  error: string | null;

  // Project
  projectId: number | null;
}

interface UnlayerActions {
  // Design operations
  setCurrentDesign: (design: UnlayerDesign | null) => void;
  loadDesign: (design: UnlayerDesign) => void;
  saveDesign: (design: UnlayerDesign) => Promise<void>;
  exportHtml: (html: string) => void;
  exportJson: (design: UnlayerDesign) => void;
  exportBoth: (design: UnlayerDesign, html: string) => void;

  // Autosave
  enableAutoSave: (interval?: number) => void;
  disableAutoSave: () => void;
  setLastAutoSave: (date: Date) => void;
  markUnsavedChanges: (hasChanges: boolean) => void;

  // History
  addToHistory: (design: UnlayerDesign) => void;
  restoreFromHistory: (index: number) => void;
  clearHistory: () => void;

  // Project management
  setProjectId: (projectId: number) => void;

  // State management
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setExporting: (exporting: boolean) => void;
  setReady: (ready: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Reset functions
  reset: () => void;
}

/**
 * Unlayer Store - Following codebase patterns with actions object
 */
export const useUnlayerStore = create(
  subscribeWithSelector<UnlayerState & { actions: UnlayerActions }>(
    (set, get) => ({
      // Initial state
      currentDesign: null,
      savedDesign: null,
      designHistory: [],

      // Export data
      lastExportedHtml: null,
      lastExportedJson: null,

      // Autosave
      autoSaveEnabled: true,
      autoSaveInterval: 30000, // 30 seconds
      lastAutoSave: null,
      hasUnsavedChanges: false,

      // UI state
      isLoading: false,
      isSaving: false,
      isExporting: false,
      isReady: false,
      error: null,

      // Project
      projectId: null,

      actions: {
        // Design operations
        setCurrentDesign: (design: UnlayerDesign | null) => {
          set({
            currentDesign: design,
            hasUnsavedChanges: design !== get().savedDesign,
            error: null,
          });
        },

        loadDesign: (design: UnlayerDesign) => {
          set({
            currentDesign: design,
            savedDesign: design,
            hasUnsavedChanges: false,
            error: null,
          });
        },

        saveDesign: async (design: UnlayerDesign): Promise<void> => {
          set({ isSaving: true, error: null });

          try {
            // Add to history before saving
            const state = get();
            if (state.currentDesign) {
              state.actions.addToHistory(state.currentDesign);
            }

            set({
              savedDesign: design,
              currentDesign: design,
              hasUnsavedChanges: false,
              isSaving: false,
              lastAutoSave: new Date(),
              error: null,
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to save design';
            set({
              isSaving: false,
              error: errorMessage,
            });
          }
        },

        exportHtml: (html: string) => {
          set({
            lastExportedHtml: html,
            error: null,
          });
        },

        exportJson: (design: UnlayerDesign) => {
          set({
            lastExportedJson: design,
            error: null,
          });
        },

        exportBoth: (design: UnlayerDesign, html: string) => {
          set({
            lastExportedJson: design,
            lastExportedHtml: html,
            error: null,
          });
        },

        // Autosave
        enableAutoSave: (interval: number = 30000) => {
          set({
            autoSaveEnabled: true,
            autoSaveInterval: interval,
          });
        },

        disableAutoSave: () => {
          set({ autoSaveEnabled: false });
        },

        setLastAutoSave: (date: Date) => {
          set({ lastAutoSave: date });
        },

        markUnsavedChanges: (hasChanges: boolean) => {
          set({ hasUnsavedChanges: hasChanges });
        },

        // History
        addToHistory: (design: UnlayerDesign) => {
          const state = get();
          const newHistory = [...state.designHistory, design];

          // Keep only last 10 designs in history
          if (newHistory.length > 10) {
            newHistory.shift();
          }

          set({ designHistory: newHistory });
        },

        restoreFromHistory: (index: number) => {
          const state = get();
          const design = state.designHistory[index];

          if (design) {
            set({
              currentDesign: design,
              hasUnsavedChanges: true,
            });
          }
        },

        clearHistory: () => {
          set({ designHistory: [] });
        },

        // Project management
        setProjectId: (projectId: number) => {
          set({ projectId });
        },

        // State management
        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        setSaving: (saving: boolean) => {
          set({ isSaving: saving });
        },

        setExporting: (exporting: boolean) => {
          set({ isExporting: exporting });
        },

        setReady: (ready: boolean) => {
          set({
            isReady: ready,
            error: ready ? null : get().error,
          });
        },

        setError: (error: string | null) => {
          set({
            error,
            isLoading: false,
            isSaving: false,
            isExporting: false,
          });
        },

        clearError: () => {
          set({ error: null });
        },

        // Reset functions
        reset: () => {
          set({
            currentDesign: null,
            savedDesign: null,
            designHistory: [],
            lastExportedHtml: null,
            lastExportedJson: null,
            autoSaveEnabled: true,
            autoSaveInterval: 30000,
            lastAutoSave: null,
            hasUnsavedChanges: false,
            isLoading: false,
            isSaving: false,
            isExporting: false,
            isReady: false,
            error: null,
            projectId: null,
          });
        },
      },
    })
  )
);

// Selector hooks for specific state slices (following codebase patterns)
export const useUnlayerDesign = () =>
  useUnlayerStore((state) => state.currentDesign);
export const useUnlayerLoading = () =>
  useUnlayerStore((state) => state.isLoading);
export const useUnlayerReady = () => useUnlayerStore((state) => state.isReady);
export const useUnlayerError = () => useUnlayerStore((state) => state.error);
export const useUnlayerProjectId = () =>
  useUnlayerStore((state) => state.projectId);
export const useUnlayerExportedHtml = () =>
  useUnlayerStore((state) => state.lastExportedHtml);
export const useUnlayerActions = () =>
  useUnlayerStore((state) => state.actions);

// Computed selectors
export const useUnlayerStatus = () =>
  useUnlayerStore((state) => ({
    isReady: state.isReady,
    isLoading: state.isLoading,
    hasError: !!state.error,
    hasDesign: !!state.currentDesign,
    hasExportedHtml: !!state.lastExportedHtml,
  }));