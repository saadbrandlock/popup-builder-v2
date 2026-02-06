import { useGenericStore } from '@/stores/generic.store';

/**
 * Returns the API client from the generic store (synced via useSyncGenericContext).
 * Use this instead of prop-drilling apiClient.
 */
export const useApiClient = () => useGenericStore((s) => s.apiClient);
