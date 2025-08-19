import { createAPI } from '@/api';
import { useClientFlowStore } from '@/stores/clientFlowStore';
import { useLoadingStore } from '@/stores/common/loading.store';
import { useGenericStore } from '@/stores/generic.store';
import { message } from 'antd';
import { AxiosInstance } from 'axios';

export const useClientFlow = ({ apiClient }: { apiClient: AxiosInstance }) => {
  const api = createAPI(apiClient);
  const { actions: loadingActions } = useLoadingStore();
  const { actions: clientFlowActions, clientData } = useClientFlowStore();

  const getShopperDetails = async ({
    account_id,
    company_id,
    shopper_id,
    shopper_name,
  }: {
    account_id: number;
    company_id: number;
    shopper_id: number;
    shopper_name: string;
  }) => {
    loadingActions.setShopperDetailsLoading(true);
    try {
      const response = await api.content.getShopperDetails({
        account_id,
        company_id,
        shopper_id,
        shopper_name,
        end_date: '2025-07-31',
        start_date: '2025-07-01',
        currency: 'USD',
        phase: 'LISTENING_PHASE',
        split: 0,
        layout_type: 'SHOPPER',
        mf_id: 'sectionD',
        shopper_mode: null,
        shopper_mode_date_range: [],
        data_incomplete_flag: false,
      });
      clientFlowActions.setShopperDetails(response);
    } catch (error) {
      console.error('Error loading shopper details:', error);
      message.error('Failed to load shopper details');
    } finally {
      loadingActions.setShopperDetailsLoading(false);
    }
  };

  const getCleintTemplatesData = async (accountId: number) => {
    if (clientData && clientData.length) {
      return;
    }

    loadingActions.setClientTemplateDetailsLoading(true);
    try {
      const response = await api.templates.getCleintTemplatesData(accountId);
      clientFlowActions.setClientData(response);
    } catch (error) {
      console.error('Error loading client templates:', error);
      message.error('Failed to load client templates');
    } finally {
      loadingActions.setClientTemplateDetailsLoading(false);
    }
  };

  return {
    getShopperDetails,
    getCleintTemplatesData,
  };
};
