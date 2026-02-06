import type { AxiosInstance } from 'axios';
import { useGenericStore } from '@/stores/generic.store';
import type { ShopperType, AccountDetails } from '@/types/common';

export type GenericContextParams = {
  accountDetails?: AccountDetails | null;
  authProvider?: { userId: string; accountId: string; role: string } | null;
  shoppers?: ShopperType[] | null;
  navigate?: ((path: string) => void) | any | null;
  accounts?: AccountDetails[] | null;
  apiClient?: AxiosInstance | null;
};

/**
 * useSyncGenericContext
 * Syncs provided context props into the global generic store once, avoiding duplicate writes.
 * Safe to call in multiple components; it only sets missing store values.
 */
export const useSyncGenericContext = ({
  accountDetails,
  authProvider,
  shoppers,
  navigate,
  accounts,
  apiClient,
}: GenericContextParams) => {
  // Sync into store synchronously so hooks that run later in this (or child) component see the value on first render
  const state = useGenericStore.getState();
  if (!state.accountDetails && accountDetails) {
    state.actions.setAccount(accountDetails);
  }
  if (
    authProvider &&
    (!state.authProvider.userId || !state.authProvider.accountId || !state.authProvider.role)
  ) {
    state.actions.setAuthProvider(authProvider);
  }
  if (shoppers && !state.shoppers.length) {
    state.actions.setShoppers(shoppers);
  }
  if (!state.navigate && navigate) {
    state.actions.setNavigate(navigate as any);
  }
  if (accounts && !state.accounts.length) {
    state.actions.setAccounts(accounts);
  }
  // Keep apiClient in sync when prop changes (e.g. after re-auth)
  if (apiClient && apiClient !== state.apiClient) {
    state.actions.setApiClient(apiClient);
  }
};
