import {  CleanTemplateResponse, TemplateConfig } from '@/types';
import { ReminderTabConfig } from '@/features/builder/types';
import { DEFAULT_REMINDER_TAB_CONFIG } from '@/features/builder/utils/reminderTabConstants';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type BuilderState = {
  adminBuilderStep: number;
  templateState: CleanTemplateResponse | null;
  templateConfig: TemplateConfig | null;
  currentTemplateId: string | null;
  reminderTabConfig: ReminderTabConfig;
  // Reminder tab autosave state
  reminderTabUnsavedChanges: boolean;
  reminderTabLastSave: Date | null;
  reminderTabSaveError: string | null;
};

type BuilderActions = {
  actions: {
    setAdminBuilderStep: (step: number) => void;
    setTemplateState: (state: any) => void;
    setTemplateConfig: (config: TemplateConfig) => void;
    setCurrentTemplateId: (id: string | null) => void;
    setReminderTabConfig: (config: ReminderTabConfig) => void;
    updateReminderTabConfig: (path: string, value: any) => void;
    // Reminder tab autosave actions
    markReminderTabUnsaved: (unsaved: boolean) => void;
    setReminderTabLastSave: (date: Date | null) => void;
    setReminderTabSaveError: (error: string | null) => void;
    // Clear persisted store data
    clearPersistedStore: () => void;
  };
};

export const useBuilderStore = create<BuilderState & BuilderActions>()(
  persist(
    (set, get) => {
      const actions = {
        setAdminBuilderStep: (step: number) => set({ adminBuilderStep: step }),
        setTemplateState: (state: any) => set({ templateState: state }),
        setTemplateConfig: (config: TemplateConfig) => set({ templateConfig: config }),
        setCurrentTemplateId: (id: string | null) => set({ currentTemplateId: id }),
        setReminderTabConfig: (config: ReminderTabConfig) => {
          set({ reminderTabConfig: config });
        },
        updateReminderTabConfig: (path: string, value: any) => {
          const currentConfig = get().reminderTabConfig;
          const newConfig = { ...currentConfig };
          const keys = path.split('.');
          let current: any = newConfig;
          
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
          }
          
          current[keys[keys.length - 1]] = value;
          set({ reminderTabConfig: newConfig });
        },
        // Reminder tab autosave actions
        markReminderTabUnsaved: (unsaved: boolean) => set({ reminderTabUnsavedChanges: unsaved }),
        setReminderTabLastSave: (date: Date | null) => set({ reminderTabLastSave: date }),
        setReminderTabSaveError: (error: string | null) => set({ reminderTabSaveError: error }),
        // Clear persisted store data
        clearPersistedStore: () => {
          localStorage.removeItem('builder-store');
        },
        
      };

      return {
        adminBuilderStep: 0,
        templateState: null,
        templateConfig: null,
        currentTemplateId: null,
        reminderTabConfig: DEFAULT_REMINDER_TAB_CONFIG,
        // Reminder tab autosave initial state
        reminderTabUnsavedChanges: false,
        reminderTabLastSave: null,
        reminderTabSaveError: null,
        actions,
      };
    },
    {
      name: 'builder-store', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist specific fields, not all state
      partialize: (state) => ({
        adminBuilderStep: state.adminBuilderStep,
        currentTemplateId: state.currentTemplateId,
      }),
      // Skip persisting functions and temporary state
      skipHydration: false,
    }
  )
);
