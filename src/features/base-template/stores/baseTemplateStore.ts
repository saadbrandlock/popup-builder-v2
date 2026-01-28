import { create } from 'zustand';
import { BaseTemplate, BaseTemplateFilters } from '../types';

interface BaseTemplateState {
  templates: BaseTemplate[];
  selectedTemplate: BaseTemplate | null;
  filters: BaseTemplateFilters;
  currentStep: number;
  templateId: string | null;
  designJson: any;
  htmlContent: string | null;
  selectedCategoryId: number | null;
  actions: {
    setTemplates: (templates: BaseTemplate[]) => void;
    setSelectedTemplate: (template: BaseTemplate | null) => void;
    setFilters: (filters: Partial<BaseTemplateFilters>) => void;
    resetFilters: () => void;
    setCurrentStep: (step: number) => void;
    setTemplateId: (templateId: string | null) => void;
    setDesignJson: (design: any) => void;
    setHtmlContent: (html: string | null) => void;
    setSelectedCategoryId: (categoryId: number | null) => void;
    reset: () => void;
  };
}

const initialFilters: BaseTemplateFilters = {
  categoryId: null,
  status: null,
  nameSearch: null,
};

export const useBaseTemplateStore = create<BaseTemplateState>((set) => ({
  templates: [],
  selectedTemplate: null,
  filters: initialFilters,
  currentStep: 0,
  templateId: null,
  designJson: null,
  htmlContent: null,
  selectedCategoryId: null,
  actions: {
    setTemplates: (templates) => set({ templates }),
    setSelectedTemplate: (template) => set({ selectedTemplate: template }),
    setFilters: (newFilters) =>
      set((state) => ({
        filters: { ...state.filters, ...newFilters },
      })),
    resetFilters: () => set({ filters: initialFilters }),
    setCurrentStep: (step) => set({ currentStep: step }),
    setTemplateId: (templateId) => set({ templateId }),
    setDesignJson: (design) => set({ designJson: design }),
    setHtmlContent: (html) => set({ htmlContent: html }),
    setSelectedCategoryId: (categoryId) => set({ selectedCategoryId: categoryId }),
    reset: () =>
      set({
        selectedTemplate: null,
        currentStep: 0,
        templateId: null,
        designJson: null,
        htmlContent: null,
        selectedCategoryId: null,
      }),
  },
}));
