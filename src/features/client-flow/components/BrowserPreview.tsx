import React from 'react';
import { PopupPreview } from '../../popup-builder/components/PopupPreview';
import { WebsiteBackground } from './WebsiteBackground';
import type { BrowserPreviewProps } from '../types/clientFlow';
import type { DeviceType } from '../../popup-builder/types';
import { Safari } from '@/components/magicui/safari';
import Android from '@/components/magicui/android';

/**
 * BrowserPreview - Enhanced wrapper that combines existing PopupPreview with website background
 * Provides realistic browser context for popup previews
 */
export const BrowserPreview: React.FC<BrowserPreviewProps> = ({
  viewport,
  websiteBackground,
  popupTemplate,
  showBrowserChrome = true,
  interactive = false,
  scale = 1,
  onPopupInteraction,
  className = '',
}) => {
  // Map viewport to DeviceType for existing PopupPreview
  const deviceType: DeviceType = viewport;

  // Calculate dimensions based on viewport
  const dimensions = {
    desktop: { width: 1200, height: 800 },
    mobile: { width: 375, height: 667 },
  };

  const { width, height } = dimensions[viewport];

  return (
    <>
      {viewport === 'desktop' ? (
        showBrowserChrome ? (
          <Safari url={websiteBackground.websiteUrl}>
            <div
              className="browser-viewport relative overflow-hidden"
              style={{ width: `${width}px`, height: `${height}px` }}
            >
              {/* Website Background Layer */}
              <WebsiteBackground
                websiteData={websiteBackground}
                viewport={viewport}
                className="absolute inset-0"
              />

              {/* Popup Overlay Layer */}
              {popupTemplate && (
                <div className="popup-overlay-wrapper absolute inset-0 z-20">
                  <PopupPreview
                    template={popupTemplate}
                    device={deviceType}
                    className="w-full h-full"
                  />
                </div>
              )}

              {/* Interactive Overlay */}
              {interactive && onPopupInteraction && (
                <div
                  className="interactive-overlay absolute inset-0 z-30 cursor-pointer"
                  onClick={() => onPopupInteraction('click')}
                  onMouseEnter={() => onPopupInteraction('hover')}
                  style={{ pointerEvents: interactive ? 'auto' : 'none' }}
                />
              )}
            </div>
          </Safari>
        ) : (
          <div
            className="browser-viewport relative overflow-hidden bg-gray-100 rounded-lg shadow-lg"
            style={{ width: `${width}px`, height: `${height}px` }}
          >
            <WebsiteBackground
              websiteData={websiteBackground}
              viewport={viewport}
              className="absolute inset-0"
            />
            {popupTemplate && (
              <div className="popup-overlay-wrapper absolute inset-0 z-20">
                <PopupPreview
                  template={popupTemplate}
                  device={deviceType}
                  className="w-full h-full"
                />
              </div>
            )}
            {interactive && onPopupInteraction && (
              <div
                className="interactive-overlay absolute inset-0 z-30 cursor-pointer"
                onClick={() => onPopupInteraction('click')}
                onMouseEnter={() => onPopupInteraction('hover')}
                style={{ pointerEvents: interactive ? 'auto' : 'none' }}
              />
            )}
          </div>
        )
      ) : showBrowserChrome ? (
        <Android className="inline-block">
          <div className="relative h-full w-full">
            <WebsiteBackground
              websiteData={websiteBackground}
              viewport={viewport}
              className="absolute inset-0"
            />
            {popupTemplate && (
              <div className="popup-overlay-wrapper absolute inset-0 z-20">
                <PopupPreview
                  template={popupTemplate}
                  device={deviceType}
                  className="w-full h-full"
                />
              </div>
            )}
            {interactive && onPopupInteraction && (
              <div
                className="interactive-overlay absolute inset-0 z-30 cursor-pointer"
                onClick={() => onPopupInteraction('click')}
                onMouseEnter={() => onPopupInteraction('hover')}
                style={{ pointerEvents: interactive ? 'auto' : 'none' }}
              />
            )}
          </div>
        </Android>
      ) : (
        <div
          className="browser-viewport relative overflow-hidden bg-gray-100 rounded-lg shadow-lg"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          <WebsiteBackground
            websiteData={websiteBackground}
            viewport={viewport}
            className="absolute inset-0"
          />
          {popupTemplate && (
            <div className="popup-overlay-wrapper absolute inset-0 z-20">
              <PopupPreview
                template={popupTemplate}
                device={deviceType}
                className="w-full h-full"
              />
            </div>
          )}
          {interactive && onPopupInteraction && (
            <div
              className="interactive-overlay absolute inset-0 z-30 cursor-pointer"
              onClick={() => onPopupInteraction('click')}
              onMouseEnter={() => onPopupInteraction('hover')}
              style={{ pointerEvents: interactive ? 'auto' : 'none' }}
            />
          )}
        </div>
      )}

      {/* Device Info */}
      <div className="device-info absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {viewport.charAt(0).toUpperCase() + viewport.slice(1)} - {width} ×{' '}
        {height}
      </div>
    </>
  );
};

/**
 * BrowserPreviewSkeleton - Loading state component
 */
export const BrowserPreviewSkeleton: React.FC<{
  viewport: 'desktop' | 'mobile';
}> = ({ viewport }) => {
  const dimensions = {
    desktop: { width: 1200, height: 800 },
    mobile: { width: 375, height: 667 },
  };

  const { width, height } = dimensions[viewport];

  return (
    <div
      className="browser-preview-skeleton bg-gray-200 rounded-lg shadow-lg overflow-hidden animate-pulse"
      style={{
        width: `${width}px`,
        height: `${height + (viewport === 'desktop' ? 80 : 50)}px`,
      }}
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
