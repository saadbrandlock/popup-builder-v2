import { create } from 'zustand';

type LoadingState = {
  templateListingLoading: boolean;
  templateListActionLoading: boolean;
  devicesLoading: boolean;
  configSaving: boolean;
  contentListingLoading: boolean;
  contentActionLoading: boolean;
  contentSubDataLoading: boolean;
  shopperDetailsLoading: boolean;
  clientTemplateDetailsLoading: boolean;
  // Builder autosave loading states
  builderAutosaving: boolean;
  reminderTabAutosaving: boolean;
};

type LoadingActions = {
  actions: {
    setTemplateListingLoading: (loading: boolean) => void;
    setTemplateListActionLoading: (loading: boolean) => void;
    setDevicesLoading: (loading: boolean) => void;
    setConfigSaving: (loading: boolean) => void;
    setContentListingLoading: (loading: boolean) => void;
    setContentActionLoading: (loading: boolean) => void;
    setContentSubDataLoading: (loading: boolean) => void;
    setShopperDetailsLoading: (loading: boolean) => void;
    setClientTemplateDetailsLoading: (loading: boolean) => void;
    // Builder autosave actions
    setBuilderAutosaving: (loading: boolean) => void;
    setReminderTabAutosaving: (loading: boolean) => void;
  };
};

export const useLoadingStore = create<LoadingState & LoadingActions>((set) => ({
  templateListingLoading: false,
  templateListActionLoading: false,
  devicesLoading: false,
  configSaving: false,
  contentListingLoading: false,
  contentActionLoading: false,
  contentSubDataLoading: false,
  shopperDetailsLoading: false,
  clientTemplateDetailsLoading: false,
  // Builder autosave initial states
  builderAutosaving: false,
  reminderTabAutosaving: false,
  actions: {
    setTemplateListingLoading: (loading: boolean) =>
      set({ templateListingLoading: loading }),
    setTemplateListActionLoading: (loading: boolean) =>
      set({ templateListActionLoading: loading }),
    setDevicesLoading: (loading: boolean) => set({ devicesLoading: loading }),
    setConfigSaving: (loading: boolean) => set({ configSaving: loading }),
    setContentListingLoading: (loading: boolean) =>
      set({ contentListingLoading: loading }),
    setContentActionLoading: (loading: boolean) =>
      set({ contentActionLoading: loading }),
    setContentSubDataLoading: (loading: boolean) =>
      set({ contentSubDataLoading: loading }),
    setShopperDetailsLoading: (loading: boolean) =>
      set({ shopperDetailsLoading: loading }),
    setClientTemplateDetailsLoading: (loading: boolean) =>
      set({ clientTemplateDetailsLoading: loading }),
    // Builder autosave actions
    setBuilderAutosaving: (loading: boolean) =>
      set({ builderAutosaving: loading }),
    setReminderTabAutosaving: (loading: boolean) =>
      set({ reminderTabAutosaving: loading }),
  },
}));
