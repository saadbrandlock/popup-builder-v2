import { MergeOptions, TemplateData } from '@/types';
import { useState, useCallback, useRef } from 'react';
import { OptimizedHTMLMerger } from '../utils/popup-reminder-tab-html-merger';
import { ReminderTabConfig } from '@/features/builder/types';

export function useOptimizedHTMLMerger() {
  const [mergedHtml, setMergedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const merger = useRef(new OptimizedHTMLMerger());

  const merge = useCallback(
    (
      reminderInput: ReminderTabConfig | string,
      templateHtml: string,
      options: MergeOptions = {}
    ): string => {
      setIsLoading(true);
      setError(null);

      try {
        const result = merger.current.merge(reminderInput, templateHtml, options);
        setMergedHtml(result);
        setIsLoading(false);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Merge failed';
        setError(errorMessage);
        setIsLoading(false);
        return '';
      }
    },
    []
  );

  const mergeFromRecord = useCallback(
    (record: TemplateData, options: MergeOptions = {}): string => {
      setIsLoading(true);
      setError(null);

      try {
        const result = merger.current.mergeFromRecord(record, options);
        setMergedHtml(result);
        setIsLoading(false);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Merge failed';
        setError(errorMessage);
        setIsLoading(false);
        return '';
      }
    },
    []
  );

  return { mergedHtml, merge, mergeFromRecord, isLoading, error };
}
