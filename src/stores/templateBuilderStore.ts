import { create } from 'zustand';

type TemplateBuilderState = {};

type TemplateBuilderActions = {
  actions: {};
};

export const useTemplateBuilderStore = create<
  TemplateBuilderState & TemplateBuilderActions
>((set) => ({
  actions: {},
}));
