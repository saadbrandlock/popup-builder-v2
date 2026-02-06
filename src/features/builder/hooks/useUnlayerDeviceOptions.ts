import { useMemo } from 'react';
import { useBuilderStore } from '@/stores/builder.store';

export type UnlayerDevice = 'desktop' | 'mobile';

export interface UnlayerDeviceOptions {
  devices: UnlayerDevice[];
  defaultDevice: UnlayerDevice;
}

/**
 * Derives Unlayer editor device options from template state.
 * When template has only mobile → editor opens in mobile-only mode.
 * When template has only desktop → editor opens in desktop-only mode.
 * When both or no devices → editor shows both; default desktop.
 * See https://docs.unlayer.com/builder/device-management
 */
export function useUnlayerDeviceOptions(): UnlayerDeviceOptions {
  const templateState = useBuilderStore((s) => s.templateState);

  return useMemo(() => {
    const allowed: UnlayerDevice[] = ['desktop', 'mobile'];
    if (!templateState?.devices?.length) {
      return { devices: allowed, defaultDevice: 'desktop' };
    }
    const supported = templateState.devices
      .map((d) => d.device_type.toLowerCase() as UnlayerDevice)
      .filter((t): t is UnlayerDevice => allowed.includes(t));
    const unique = [...new Set(supported)];
    if (unique.length === 0) {
      return { devices: allowed, defaultDevice: 'desktop' };
    }
    if (unique.length === 1) {
      return { devices: unique, defaultDevice: unique[0] };
    }
    return { devices: ['desktop', 'mobile'], defaultDevice: 'desktop' };
  }, [templateState?.devices]);
}
