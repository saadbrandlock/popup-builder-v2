import { create } from 'zustand';
import { CBTemplateFieldContentIdMapping } from '@/types';

type TemplateFieldsState = {
  templateFields: CBTemplateFieldContentIdMapping[];
};

type TemplateFieldsActions = {
  actions: {
    setTemplateFields: (
      templateFields: CBTemplateFieldContentIdMapping[]
    ) => void;
  };
};

export const useTemplateFieldsStore = create<
  TemplateFieldsState & TemplateFieldsActions
>((set, get) => ({
  templateFields: [],
  actions: {
    setTemplateFields: (templateFields: CBTemplateFieldContentIdMapping[]) =>
      set({ templateFields }),
  },
}));
