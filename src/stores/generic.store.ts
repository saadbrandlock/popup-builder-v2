import { create } from 'zustand';
import { ShopperType, AccountDetails } from '@/types/common';

type GenericState = {
  shoppers: ShopperType[];
  accountDetails: AccountDetails | null;
  authProvider: { userId: string; accountId: string; role: string };
  navigate: (path: string) => void;
};

type GenericActions = {
  actions: {
    setShoppers: (shoppers: ShopperType[]) => void;
    setAccount: (accounts: AccountDetails) => void;
    setAuthProvider: (authProvider: {
      userId: string;
      accountId: string;
      role: string;
    }) => void;
    setNavigate: (navigate: (path: string) => void) => void;
  };
};

export const useGenericStore = create<GenericState & GenericActions>((set) => ({
  shoppers: [],
  accountDetails: null,
  authProvider: { userId: '', accountId: '', role: '' },
  navigate: () => {},
  actions: {
    setShoppers: (shoppers: ShopperType[]) => set({ shoppers }),
    setAccount: (accountDetails: AccountDetails) => set({ accountDetails }),
    setAuthProvider: (authProvider: {
      userId: string;
      accountId: string;
      role: string;
    }) => set({ authProvider }),
    setNavigate: (navigate: (path: string) => void) => set({ navigate }),
  },
}));
