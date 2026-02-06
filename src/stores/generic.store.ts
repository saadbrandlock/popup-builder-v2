import { create } from 'zustand';
import type { AxiosInstance } from 'axios';
import { ShopperType, AccountDetails } from '@/types/common';

type GenericState = {
  shoppers: ShopperType[];
  accountDetails: AccountDetails | null;
  accounts: AccountDetails[];
  authProvider: { userId: string; accountId: string; role: string };
  navigate: any;
  apiClient: AxiosInstance | null;
  browserPreviewModalOpen: boolean;
};

type GenericActions = {
  actions: {
    setShoppers: (shoppers: ShopperType[]) => void;
    setAccount: (accountDetails: AccountDetails) => void;
    setAccounts: (accounts: AccountDetails[]) => void;
    setAuthProvider: (authProvider: {
      userId: string;
      accountId: string;
      role: string;
    }) => void;
    setNavigate: (navigate: (path: string) => void) => void;
    setApiClient: (apiClient: AxiosInstance | null) => void;
    setBrowserPreviewModalOpen: (open: boolean) => void;
  };
};

export const useGenericStore = create<GenericState & GenericActions>((set) => ({
  shoppers: [],
  accountDetails: null,
  accounts: [],
  authProvider: { userId: '', accountId: '', role: '' },
  navigate: null,
  apiClient: null,
  browserPreviewModalOpen: false,
  actions: {
    setShoppers: (shoppers: ShopperType[]) => set({ shoppers }),
    setAccount: (accountDetails: AccountDetails) => set({ accountDetails }),
    setAccounts: (accounts: AccountDetails[]) => set({ accounts }),
    setAuthProvider: (authProvider: {
      userId: string;
      accountId: string;
      role: string;
    }) => set({ authProvider }),
    setNavigate: (navigate: (path: string) => void) => set({ navigate }),
    setApiClient: (apiClient: AxiosInstance | null) => set({ apiClient }),
    setBrowserPreviewModalOpen: (open: boolean) => set({ browserPreviewModalOpen: open }),
  },
}));
