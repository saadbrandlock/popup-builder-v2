import { useState, useEffect, useMemo } from 'react';
import { AxiosInstance } from 'axios';
import { createAPI } from '@/api';
import { CleanTemplateResponse, ClientFlowData } from '@/types';
import { BaseTemplate } from '@/features/base-template/types';
import {
  convertTemplateToClientFlowData,
  convertCleanTemplateToClientFlowData,
} from '@/lib/utils/template-to-client-flow-converter';
import { useGenericStore } from '@/stores/generic.store';
import { useDevicesStore } from '@/stores/common/devices.store';

interface UseTemplatePreviewDataOptions {
  /**
   * BaseTemplate object (for direct conversion without API call)
   */
  template?: BaseTemplate | CleanTemplateResponse | null;
  
  /**
   * Template ID to fetch from API (uses apiClient from store or option)
   */
  templateId?: string | null;
  
  /**
   * API client instance (optional; when not provided, uses apiClient from generic store)
   */
  apiClient?: AxiosInstance;
  
  /**
   * Whether to fetch data (useful for conditional fetching)
   */
  enabled?: boolean;
  
  /**
   * Custom HTML content to use instead of template's html_content
   */
  htmlContent?: string | null;
}

interface UseTemplatePreviewDataReturn {
  /**
   * Converted ClientFlowData array (ready for PopupPreviewTabs)
   */
  previewData: ClientFlowData[] | null;
  
  /**
   * Loading state (true when fetching from API)
   */
  loading: boolean;
  
  /**
   * Error message if conversion/fetching failed
   */
  error: string | null;
  
  /**
   * Manually trigger data refresh
   */
  refetch: () => Promise<void>;
}

/**
 * Hook to get template preview data in ClientFlowData format
 * 
 * Supports two modes:
 * 1. Direct conversion from BaseTemplate (no API call, instant)
 * 2. Fetch from API using templateId (requires apiClient)
 * 
 * @example
 * // Direct conversion (no API call)
 * const { previewData, loading } = useTemplatePreviewData({
 *   baseTemplate: template,
 *   enabled: previewModalVisible
 * });
 * 
 * @example
 * // Fetch from API
 * const { previewData, loading } = useTemplatePreviewData({
 *   templateId: template.template_id,
 *   apiClient: apiClient,
 *   enabled: previewModalVisible
 * });
 */
export function useTemplatePreviewData(
  options: UseTemplatePreviewDataOptions
): UseTemplatePreviewDataReturn {
  const {
    template,
    templateId,
    apiClient: apiClientOption,
    enabled = true,
    htmlContent,
  } = options;

  const apiClientFromStore = useGenericStore((s) => s.apiClient);
  const apiClient = apiClientOption ?? apiClientFromStore;
  const storeDevices = useDevicesStore((s) => s.devices);

  const [previewData, setPreviewData] = useState<ClientFlowData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Merge devices from store into clientData so PopupPreviewTabs has desktop + mobile etc.
  const mergeDevicesIntoPreviewData = useMemo(() => {
    const devicesForMerge =
      storeDevices.length > 0
        ? storeDevices.map((d) => ({ id: d.id, device_type: d.device_type }))
        : null;
    return (data: ClientFlowData[] | null): ClientFlowData[] | null => {
      if (!data || !data.length) return data;
      if (!devicesForMerge || !devicesForMerge.length) return data;
      return data.map((item) => ({
        ...item,
        devices: devicesForMerge,
        device_type_ids: devicesForMerge.map((d) => d.id),
      }));
    };
  }, [storeDevices]);

  // Direct conversion from BaseTemplate or CleanTemplateResponse (no API call)
  const directPreviewData = useMemo<ClientFlowData[] | null>(() => {
    if (!enabled || !template) {
      return null;
    }

    try {
      const converted = convertTemplateToClientFlowData(template, htmlContent);
      const data = converted ? [converted] : null;
      return data ? mergeDevicesIntoPreviewData(data) : null;
    } catch (err) {
      console.error('Failed to convert template to preview data:', err);
      return null;
    }
  }, [template, htmlContent, enabled, mergeDevicesIntoPreviewData]);

  // Fetch from API using templateId
  const fetchTemplateData = async () => {
    if (!enabled || !templateId || !apiClient) {
      setPreviewData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const api = createAPI(apiClient);
      const templateResponse = await api.templates.getTemplateById(templateId);
      if (templateResponse) {
        // HTML content might not be in CleanTemplateResponse, use provided htmlContent or empty string
        const converted = convertCleanTemplateToClientFlowData(
          templateResponse,
          htmlContent || ''
        );
        const raw = converted ? [converted] : null;
        setPreviewData(mergeDevicesIntoPreviewData(raw));
      } else {
        setPreviewData(null);
        setError('Template not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch template data';
      console.error('Failed to fetch template data for preview:', err);
      setError(errorMessage);
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  };

  // Run only when enabled so callers can gate until e.g. preview HTML is ready
  useEffect(() => {
    if (!enabled) {
      setPreviewData(null);
      setLoading(false);
      return;
    }
    if (template && htmlContent) {
      setPreviewData(directPreviewData);
      setLoading(false);
      setError(null);
    } else if (templateId && apiClient) {
      fetchTemplateData();
    } else {
      setPreviewData(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, directPreviewData, templateId, apiClient, enabled]);

  return {
    previewData,
    loading,
    error,
    refetch: fetchTemplateData,
  };
}
