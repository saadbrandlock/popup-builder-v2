import { message } from 'antd';
import { useDevicesStore } from '@/stores/common/devices.store';
import { useLoadingStore } from '@/stores/common/loading.store';
import { AxiosInstance } from 'axios';
import { createAPI } from '@/api';

export const useConfigStep = ({ apiClient }: { apiClient: AxiosInstance }) => {
  const api = createAPI(apiClient);

  const { devices, actions: deviceActions } = useDevicesStore();
  const { actions: loadingActions } = useLoadingStore();

  const getDevices = async () => {
    if (devices.length > 0) return;

    loadingActions.setDevicesLoading(true);
    try {
      const response = await api.devices.getDevices();
      deviceActions.setDevices(response);
    } catch (error) {
      console.error('Error loading devices:', error);
      message.error('Failed to load devices');
    } finally {
      loadingActions.setDevicesLoading(false);
    }
  };

  return { getDevices };
};
