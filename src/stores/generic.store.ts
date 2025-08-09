import { create } from 'zustand';
import { ShopperType, AccountDetails } from '@/types/common';

type GenericState = {
  shoppers: ShopperType[];
  accountDetails: AccountDetails | null;
  accounts: AccountDetails[];
  authProvider: { userId: string; accountId: string; role: string };
  navigate: any;
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
  };
};

export const useGenericStore = create<GenericState & GenericActions>((set) => ({
  shoppers: [],
  accountDetails: null,
  accounts: [],
  authProvider: { userId: '', accountId: '', role: '' },
  navigate: null,
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
  },
}));
