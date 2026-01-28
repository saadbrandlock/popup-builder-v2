import React, { useEffect, useState, useRef, useMemo } from 'react';
import { safeDecodeAndSanitizeHtml } from '@/lib/utils/helper';
import { useOptimizedHTMLMerger } from '@/lib/hooks';
import { ReminderTabConfig } from '@/features/builder/types';
import { Spin } from 'antd';
import { useFieldHighlight } from '../hooks/use-field-highlight';
import { useClientFlowStore } from '@/stores/clientFlowStore';
import { templateContentParser, ContentMapping } from '@/lib/utils/template-content-parser';

interface PopupOnlyViewProps {
  viewport: 'desktop' | 'mobile';
  popupTemplate: any | null;
  className?: string;
  showViewportLabel?: boolean;
}

export const PopupOnlyView: React.FC<PopupOnlyViewProps> = ({
  viewport,
  popupTemplate,
  className = '',
  showViewportLabel = true,
}) => {
  const [baseHtml, setBaseHtml] = useState<string>(''); // Base HTML without content updates
  const [sanitizedHtml, setSanitizedHtml] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { mergeFromRecord } = useOptimizedHTMLMerger();
  const { contentFormData } = useClientFlowStore();
  
  // Initialize field highlighting
  useFieldHighlight(iframeRef, {
    enableBidirectional: false, // Disable click-to-focus for popup-only view
  });

  // Create content mapping from form data
  const contentMapping: ContentMapping = useMemo(() => {
    const mapping: ContentMapping = {};
    Object.entries(contentFormData).forEach(([fieldId, value]) => {
      if (value && typeof value === 'string') {
        mapping[fieldId] = value;
      }
    });
    return mapping;
  }, [contentFormData]);

  // Process popup template HTML (only when template changes)
  useEffect(() => {
    const processPopupHtml = async () => {
      if (!popupTemplate || !Array.isArray(popupTemplate) || popupTemplate.length === 0) {
        setBaseHtml('');
        setSanitizedHtml('');
        return;
      }

      setIsProcessing(true);
      try {
        const template = popupTemplate[0];

        if (template && template.template_html) {
          const processedHtml = await safeDecodeAndSanitizeHtml(template.template_html);

          const mergedHtml = mergeFromRecord(
            {
              reminder_tab_state_json: template.reminder_tab_state_json as ReminderTabConfig,
              template_html: processedHtml,
            },
            {
              enableAnimations: true,
              animationDuration: '0.4s',
              autoOpenPopup: true,
              disableCloseButtons: true,
              hideReminderTab: true,
            }
          );

          setBaseHtml(mergedHtml);
        }
      } catch (error) {
        console.error('Error processing popup template:', error);
        setBaseHtml('');
      } finally {
        setIsProcessing(false);
      }
    };

    processPopupHtml();
  }, [popupTemplate, viewport]);

  // Apply content updates when form data changes
  useEffect(() => {
    if (!baseHtml) {
      setSanitizedHtml('');
      return;
    }

    try {
      // Apply content mapping to the base HTML
      const updatedHtml = templateContentParser.updateContent(baseHtml, contentMapping);
      setSanitizedHtml(updatedHtml);
    } catch (error) {
      console.error('Error applying content updates:', error);
      setSanitizedHtml(baseHtml);
    }
  }, [baseHtml, contentMapping]);

  // Update iframe content and inject viewport-specific styles
  useEffect(() => {
    if (iframeRef.current && sanitizedHtml) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(sanitizedHtml);
        iframeDoc.close();

        // Inject viewport-specific styles for .u-popup-container
        const style = iframeDoc.createElement('style');
        style.id = 'viewport-styles';
        style.textContent = `
          .u-popup-container {
            width: ${viewport === 'desktop' ? '100%' : '375px'} !important;
            margin: 0 auto;
          }
          
          body {
            overflow: hidden !important;
          }
        `;
        iframeDoc.head.appendChild(style);

        // Set fixed height based on viewport
        const fixedHeight = viewport === 'desktop' ? '600px' : '650px';
        iframe.style.height = fixedHeight;
      }
    }
  }, [sanitizedHtml, viewport]);

  if (isProcessing) {
    return <div className="flex items-center justify-center h-96"><Spin size='large' /></div>;
  }

  return (
    <div className="flex items-center justify-center !w-full overflow-hidden">
      <iframe
        ref={iframeRef}
        className="border-0 bg-transparent"
        style={{
          width: '100%',
          height: viewport === 'desktop' ? '600px' : '650px',
          border: 'none',
          background: 'transparent',
          overflow: 'hidden',
        }}
        title={`${viewport === 'desktop' ? 'Desktop' : 'Mobile'} Popup Preview`}
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
};
