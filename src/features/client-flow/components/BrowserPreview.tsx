import React, { useEffect, useState } from 'react';
import { WebsiteBackground } from './WebsiteBackground';
import type { BrowserPreviewProps } from '../types/clientFlow';
import { Safari } from '@/components/magicui/safari';
import Android from '@/components/magicui/android';
import { safeDecodeAndSanitizeHtml } from '@/lib/utils/helper';
import type { ClientFlowData } from '@/types/api';

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
        const template =
          popupTemplate.find((t: ClientFlowData) =>
            t.devices.some((device) => device.device_type === viewport)
          ) || popupTemplate[0]; // Fallback to first template

        if (template && template.template_html) {
          const processedHtml = await safeDecodeAndSanitizeHtml(
            template.template_html
          );
          setSanitizedHtml(processedHtml);
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

  // Render popup overlay component
  const PopupOverlay = () => {
    if (!sanitizedHtml || isProcessing) {
      return null;
    }

    console.log('sanitizedHtml', sanitizedHtml);

    return (
      <div
        // className="popup-template-container max-w-md mx-4 bg-white rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => {
          if (interactive) {
            e.stopPropagation();
            onPopupInteraction?.('popup-click');
          }
        }}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
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
