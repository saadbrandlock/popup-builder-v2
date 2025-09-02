import React, { useEffect, useState, useRef } from 'react';
import { WebsiteBackground } from './WebsiteBackground';
import type { BrowserPreviewProps } from '../types/clientFlow';
import { Safari } from '@/components/magicui/safari';
import Android from '@/components/magicui/android';
import { safeDecodeAndSanitizeHtml } from '@/lib/utils/helper';
import type { ClientFlowData } from '@/types/api';
import { useOptimizedHTMLMerger } from '@/lib/hooks';
import { ReminderTabConfig } from '@/features/builder/types';

/**
 * BrowserPreview - Enhanced wrapper that combines existing PopupPreview with website background
 * Provides realistic browser context for popup previews
 */
export const BrowserPreview: React.FC<BrowserPreviewProps> = ({
  viewport,
  websiteBackground,
  popupTemplate,
  interactive = false,
  scale = 1,
  onPopupInteraction,
  className = '',
}) => {
  const [sanitizedHtml, setSanitizedHtml] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { mergeFromRecord } = useOptimizedHTMLMerger();

  // Process popup template HTML when it changes
  useEffect(() => {
    const processPopupHtml = async () => {
      if (
        !popupTemplate ||
        !Array.isArray(popupTemplate) ||
        popupTemplate.length === 0
      ) {
        setSanitizedHtml('');
        return;
      }

      setIsProcessing(true);
      try {
        // Get the first template that matches the current viewport
        const template = popupTemplate[0]; // Fallback to first template

        if (template && template.template_html) {
          const processedHtml = await safeDecodeAndSanitizeHtml(
            template.template_html
          );

          const mergedHtml = mergeFromRecord(
            {
              reminder_tab_state_json:
                template.reminder_tab_state_json as ReminderTabConfig,
              template_html: processedHtml,
            },
            {
              enableAnimations: true,
              animationDuration: '0.4s',
            }
          );

          console.log('mergedHtml', mergedHtml);

          setSanitizedHtml(mergedHtml);
        } else {
          setSanitizedHtml('');
        }
      } catch (error) {
        console.error('Error processing popup template HTML:', error);
        setSanitizedHtml('');
      } finally {
        setIsProcessing(false);
      }
    };

    processPopupHtml();
  }, [popupTemplate, viewport]);

  // Update iframe content when sanitizedHtml changes
  useEffect(() => {
    if (iframeRef.current && sanitizedHtml) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(sanitizedHtml);
        iframeDoc.close();

        // Setup interaction handlers if interactive mode is enabled
        if (interactive) {
          const handlePopupInteraction = (event: string) => {
            onPopupInteraction?.(event);
          };

          // Listen for custom events from the iframe
          iframe.contentWindow?.addEventListener('popupInteraction', (e: any) => {
            handlePopupInteraction(e.detail?.type || 'popup-interaction');
          });
        }
      }
    }
  }, [sanitizedHtml, interactive, onPopupInteraction]);

  // Render popup overlay component
  const PopupOverlay = () => {
    if (!sanitizedHtml || isProcessing) {
      return null;
    }

    console.log('sanitizedHtml', sanitizedHtml);

    return (
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0 bg-transparent"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'transparent',
          overflow: 'hidden'
        }}
        title="Interactive Popup Preview"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    );
  };

  return (
    <div className="w-full flex justify-center">
      {viewport === 'desktop' ? (
        <Safari
          url={websiteBackground.websiteUrl}
          imageSrc={websiteBackground.backgroundImage.desktop}
          fit="contain"
          align="top"
          className="w-full"
        >
          <PopupOverlay />
        </Safari>
      ) : (
        <Android
          className="inline-block"
          url={websiteBackground.websiteUrl}
          imageSrc={websiteBackground.backgroundImage.mobile}
          fit="contain"
          align="top"
        >
          <PopupOverlay />
        </Android>
      )}
    </div>
  );
};

/**
 * BrowserPreviewSkeleton - Loading state component
 */
export const BrowserPreviewSkeleton: React.FC<{
  viewport: 'desktop' | 'mobile';
}> = ({ viewport }) => {
  return (
    <div
      className="browser-preview-skeleton bg-gray-200 rounded-lg shadow-lg overflow-hidden animate-pulse"
      // style={{
      //   width: `${width}px`,
      //   height: `${height + (viewport === 'desktop' ? 80 : 50)}px`,
      // }}
    >
      {/* Chrome Skeleton */}
      <div
        className={`bg-gray-300 ${viewport === 'desktop' ? 'h-20' : 'h-12'}`}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          </div>
          <div className="flex-1 mx-4">
            <div className="h-6 bg-gray-400 rounded"></div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-8 space-y-4">
        <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="space-y-2">
              <div className="h-32 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
