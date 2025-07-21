import { create } from 'zustand';

type LoadingState = {
  templateListingLoading: boolean;
  templateListActionLoading: boolean;
  devicesLoading: boolean;
};

type LoadingActions = {
  actions: {
    setTemplateListingLoading: (loading: boolean) => void;
    setTemplateListActionLoading: (loading: boolean) => void;
    setDevicesLoading: (loading: boolean) => void;
  };
};

export const useLoadingStore = create<LoadingState & LoadingActions>((set) => ({
  templateListingLoading: false,
  templateListActionLoading: false,
  devicesLoading: false,
  actions: {
    setTemplateListingLoading: (loading: boolean) => set({ templateListingLoading: loading }),
    setTemplateListActionLoading: (loading: boolean) => set({ templateListActionLoading: loading }),
    setDevicesLoading: (loading: boolean) => set({ devicesLoading: loading }),
  },
}));
