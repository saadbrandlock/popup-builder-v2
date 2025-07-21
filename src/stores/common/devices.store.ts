import { create } from 'zustand';
import { Device } from '@/types';

type DevicesState = {
  devices: Device[];
};

type DevicesActions = {
  actions: {
    setDevices: (devices: Device[]) => void;
    getDevices: () => {id: Device['id'], device_type: Device['device_type']}[];
  };
};

export const useDevicesStore = create<
  DevicesState & DevicesActions
>((set, get) => ({
  devices: [],
  actions: {
    setDevices: (devices: Device[]) => set({ devices }),
    getDevices: () => get().devices.map((device) => ({ id: device.id, device_type: device.device_type })),
  },
}));
