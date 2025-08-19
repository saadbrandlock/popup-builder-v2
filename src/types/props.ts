import { AxiosInstance } from 'axios';
import { ShopperType, AccountDetails } from './common';

export interface BaseProps {
  apiClient: AxiosInstance;
  navigate: (path: string) => void;
  shoppers: ShopperType[];
  accountDetails: AccountDetails | null;
  accounts: AccountDetails[] | [];
  authProvider: { userId: string; accountId: string; role: string };
  company_id?: number;
}
