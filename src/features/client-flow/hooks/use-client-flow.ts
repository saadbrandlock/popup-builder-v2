import { createAPI } from '@/api';
import { useClientFlowStore } from '@/stores/clientFlowStore';
import { useDevicesStore } from '@/stores/common/devices.store';
import { useLoadingStore } from '@/stores/common/loading.store';
import { useGenericStore } from '@/stores/generic.store';

export const useClientFlow = () => {
  const apiClient = useGenericStore((s) => s.apiClient);
  const api = apiClient ? createAPI(apiClient) : null;
  const { actions: loadingActions } = useLoadingStore();
  const { actions: clientFlowActions, clientData } = useClientFlowStore();
  const { devices, actions: deviceActions } = useDevicesStore();

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
    if (!api) return;
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
    } finally {
      loadingActions.setShopperDetailsLoading(false);
    }
  };

  const getCleintTemplatesData = async (accountId: number) => {
    if (!api) return;
    if (clientData && clientData.length) {
      return;
    }

    loadingActions.setClientTemplateDetailsLoading(true);
    try {
      const response = await api.templates.getCleintTemplatesData(accountId);
      clientFlowActions.setClientData(response);
    } catch (error) {
    } finally {
      loadingActions.setClientTemplateDetailsLoading(false);
    }
  };

  const getContentFieldsWithContent = async (accountId: number) => {
    if (!api) return;
    loadingActions.setContentSubDataLoading(true);
    try {
      const response =
        await api.templateFields.getTemplateFieldsWithContent(accountId);
      clientFlowActions.setContentFields(response);
    } catch (error) {
    } finally {
      loadingActions.setContentSubDataLoading(false);
    }
  };

  const getDevices = async () => {
    if (!api) return;
    if (devices.length > 0) return;

    loadingActions.setDevicesLoading(true);
    try {
      const response = await api.devices.getDevices();
      deviceActions.setDevices(response);
    } catch (error) {
    } finally {
      loadingActions.setDevicesLoading(false);
    }
  };

  return {
    getShopperDetails,
    getCleintTemplatesData,
    getContentFieldsWithContent,
    getDevices
  };
};
