import { useEffect } from 'react';
import { useGenericStore } from '@/stores/generic.store';
import type { ShopperType, AccountDetails } from '@/types/common';

export type GenericContextParams = {
  accountDetails?: AccountDetails | null;
  authProvider?: { userId: string; accountId: string; role: string } | null;
  shoppers?: ShopperType[] | null;
  navigate?: ((path: string) => void) | any | null;
  accounts?: AccountDetails[] | null;
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
}: GenericContextParams) => {
  const {
    actions,
    accountDetails: storeAccount,
    authProvider: storeAuth,
    shoppers: storeShoppers,
    navigate: storeNavigate,
    accounts: storeAccounts,
  } = useGenericStore();

  useEffect(() => {
    if (!storeAccount && accountDetails) {
      actions.setAccount(accountDetails);
    }

    if (
      authProvider &&
      (!storeAuth.userId || !storeAuth.accountId || !storeAuth.role)
    ) {
      actions.setAuthProvider(authProvider);
    }

    if (shoppers && !storeShoppers.length) {
      actions.setShoppers(shoppers);
    }

    if (!storeNavigate && navigate) {
      actions.setNavigate(navigate as any);
    }

    if (accounts && !storeAccounts.length) {
      actions.setAccounts(accounts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    accountDetails,
    authProvider,
    shoppers,
    navigate,
    storeAccount,
    storeAuth.userId,
    storeAuth.accountId,
    storeAuth.role,
    storeShoppers.length,
    storeNavigate,
  ]);
};
