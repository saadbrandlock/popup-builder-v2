import { TemplateConfig } from '@/types';
import { create } from 'zustand';

type BuilderState = {
  adminBuilderStep: number;
  templateState: any;
  templateConfig: TemplateConfig | null;
  currentTemplateId: string | null;
};

type BuilderActions = {
  actions: {
    setAdminBuilderStep: (step: number) => void;
    setTemplateState: (state: any) => void;
    setTemplateConfig: (config: TemplateConfig) => void;
    setCurrentTemplateId: (id: string | null) => void;
  };
};

export const useBuilderStore = create<BuilderState & BuilderActions>((set) => ({
  adminBuilderStep: 0,
  templateState: null,
  templateConfig: null,
  currentTemplateId: null,
  actions: {
    setAdminBuilderStep: (step: number) => set({ adminBuilderStep: step }),
    setTemplateState: (state: any) => set({ templateState: state }),
    setTemplateConfig: (config: TemplateConfig) => set({ templateConfig: config }),
    setCurrentTemplateId: (id: string | null) => set({ currentTemplateId: id }),
  },
}));
