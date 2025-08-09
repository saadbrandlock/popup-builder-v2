import { useState, useCallback, useMemo } from 'react';
import type { PopupTemplate, DeviceType, PopupElement } from '../types';
import { useBuilderActions, usePopupBuilderStore } from '../stores';

/**
 * Custom hook for popup preview functionality
 * Handles preview generation, device switching, and preview state management
 */
export const usePopupPreview = () => {
  const { template, parsedBuilderState } = usePopupBuilderStore();
  const { setPreviewMode, setPreviewDevice } = useBuilderActions();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewCss, setPreviewCss] = useState<string>('');

  /**
   * Generate preview HTML and CSS from template
   */
  const generatePreview = useCallback(async (templateData?: PopupTemplate) => {
    const targetTemplate = templateData || template;
    if (!targetTemplate) return;

    setIsGenerating(true);
    setPreviewError(null);

    try {
      const html = generatePopupHTML(targetTemplate);
      const css = generatePopupCSS(targetTemplate);
      
      setPreviewHtml(html);
      setPreviewCss(css);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate preview';
      setPreviewError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [template]);

  /**
   * Generate HTML structure for popup
   */
  const generatePopupHTML = useCallback((template: PopupTemplate): string => {
    if (!parsedBuilderState) return '';
    
    const { zones } = parsedBuilderState;
    
    // Generate HTML for each zone
    const headerHtml = zones.header.components.map(element => renderElementHTML(element)).join('\n');
    const contentHtml = zones.content.components.map(element => renderElementHTML(element)).join('\n');
    const footerHtml = zones.footer.components.map(element => renderElementHTML(element)).join('\n');
    
    return `
      <div id="popup-overlay" class="popup-overlay">
        <div id="popup-container" class="popup-container">
          <button class="popup-close" aria-label="Close">&times;</button>
          ${headerHtml ? `<div class="popup-header">${headerHtml}</div>` : ''}
          <div class="popup-content">${contentHtml}</div>
          ${footerHtml ? `<div class="popup-footer">${footerHtml}</div>` : ''}
        </div>
      </div>
    `;
  }, [parsedBuilderState]);

  /**
   * Generate CSS styles for popup
   */
  const generatePopupCSS = useCallback((template: PopupTemplate): string => {
    if (!parsedBuilderState) return '';
    
    const allElements = Object.values(parsedBuilderState.zones).flatMap(zone => zone.components);
    
    return `
      .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fade 300ms ease-out;
      }
      
      .popup-container {
        position: relative;
        width: 400px;
        max-height: 600px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .popup-close {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        z-index: 10;
      }
      
      .popup-close:hover {
        color: #333;
      }
      
      .popup-header {
        padding: 20px 20px 10px 20px;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .popup-content {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
      }
      
      .popup-footer {
        padding: 10px 20px 20px 20px;
        border-top: 1px solid #f0f0f0;
      }
      
      ${generateElementsCSS(allElements)}
      ${generateAnimationCSS()}
      ${generateResponsiveCSS(true)}
    `;
  }, [parsedBuilderState]);

  /**
   * Render individual element HTML
   */
  const renderElementHTML = useCallback((element: PopupElement): string => {
    const { id, type, config } = element;
    const elementStyle = config.style || {};
    
    const styleString = Object.entries(elementStyle)
      .map(([key, value]) => `${camelToKebab(key)}: ${value};`)
      .join(' ');

    switch (type) {
      case 'title':
        return `<h1 id="${id}" style="${styleString}">${config.content || 'Title'}</h1>`;
      
      case 'subtitle':
        return `<h2 id="${id}" style="${styleString}">${config.content || 'Subtitle'}</h2>`;
      
      case 'text':
        return `<p id="${id}" style="${styleString}">${config.content || 'Text content'}</p>`;
      
      case 'button':
        const action = config.action || {};
        const onClick = action.type === 'link' ? `window.open('${action.url || '#'}', '_blank')` : '';
        return `<button id="${id}" style="${styleString}" onclick="${onClick}">${config.content || 'Button'}</button>`;
      
      case 'image':
        return `<img id="${id}" src="${config.src || ''}" alt="${config.alt || ''}" style="${styleString}" />`;
      
      case 'email-input':
        return `<input id="${id}" type="email" placeholder="${config.placeholder || 'Enter your email'}" style="${styleString}" />`;
      
      case 'countdown':
        return `<div id="${id}" class="countdown-timer" style="${styleString}" data-end-time="${config.endTime}">00:00:00</div>`;
      
      case 'divider':
        return `<hr id="${id}" style="${styleString}" />`;
      
      case 'coupon-code':
        return `<div id="${id}" class="coupon-code" style="${styleString}" onclick="navigator.clipboard.writeText('${config.code}')">${config.code || 'SAVE20'}</div>`;
      
      default:
        return `<div id="${id}" style="${styleString}">Unknown element type: ${type}</div>`;
    }
  }, []);

  /**
   * Generate CSS for all elements
   */
  const generateElementsCSS = useCallback((elements: PopupElement[]): string => {
    return elements.map(element => {
      if (element.type === 'countdown') {
        return `
          #${element.id} {
            font-family: 'Courier New', monospace;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `;
      }
      return '';
    }).join('\n');
  }, []);

  /**
   * Generate animation CSS
   */
  const generateAnimationCSS = useCallback((): string => {
    return `
      @keyframes fade {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slide {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes scale {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      
      @keyframes bounce {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
  }, []);

  /**
   * Generate responsive CSS
   */
  const generateResponsiveCSS = useCallback((responsive: boolean): string => {
    if (!responsive) return '';
    
    return `
      @media (max-width: 768px) {
        .popup-container {
          width: 90%;
          height: auto;
          max-height: 90vh;
        }
        
        .popup-content {
          padding: 15px;
        }
      }
      
      @media (max-width: 480px) {
        .popup-container {
          width: 95%;
          margin: 10px;
        }
        
        .popup-content {
          padding: 10px;
        }
      }
    `;
  }, []);


  /**
   * Convert camelCase to kebab-case
   */
  const camelToKebab = useCallback((str: string): string => {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }, []);

  /**
   * Get device-specific preview dimensions
   */
  const getDeviceDimensions = useCallback((device: DeviceType) => {
    switch (device) {
      case 'mobile':
        return { width: 375, height: 667 };
      case 'tablet':
        return { width: 768, height: 1024 };
      case 'desktop':
      default:
        return { width: 1200, height: 800 };
    }
  }, []);

  /**
   * Switch preview device
   */
  const switchDevice = useCallback((device: DeviceType) => {
    setPreviewDevice(device);
  }, [setPreviewDevice]);

  /**
   * Toggle preview mode
   */
  const togglePreview = useCallback((enabled: boolean) => {
    setPreviewMode(enabled);
    if (enabled) {
      generatePreview();
    }
  }, [setPreviewMode, generatePreview]);

  /**
   * Get full preview URL (for external preview)
   */
  const getPreviewUrl = useCallback((templateId: string): string => {
    return `${window.location.origin}/popup-preview/${templateId}`;
  }, []);

  /**
   * Export preview as HTML file
   */
  const exportAsHtml = useCallback(() => {
    if (!previewHtml || !previewCss) return;
    
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Popup Preview</title>
        <style>${previewCss}</style>
      </head>
      <body>
        ${previewHtml}
        <script>
          // Add countdown timer functionality
          document.querySelectorAll('.countdown-timer').forEach(timer => {
            const endTime = new Date(timer.dataset.endTime).getTime();
            
            const updateTimer = () => {
              const now = new Date().getTime();
              const distance = endTime - now;
              
              if (distance < 0) {
                timer.innerHTML = "EXPIRED";
                return;
              }
              
              const days = Math.floor(distance / (1000 * 60 * 60 * 24));
              const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((distance % (1000 * 60)) / 1000);
              
              timer.innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
            };
            
            updateTimer();
            setInterval(updateTimer, 1000);
          });
          
          // Add close functionality
          document.querySelector('.popup-close')?.addEventListener('click', () => {
            document.querySelector('.popup-overlay').style.display = 'none';
          });
        </script>
      </body>
      </html>
    `;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `popup-preview-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [previewHtml, previewCss]);

  // Memoized preview data
  const previewData = useMemo(() => ({
    html: previewHtml,
    css: previewCss,
    isReady: !!(previewHtml && previewCss),
  }), [previewHtml, previewCss]);

  return {
    // State
    isGenerating,
    previewError,
    previewData,
    
    // Actions
    generatePreview,
    switchDevice,
    togglePreview,
    exportAsHtml,
    
    // Utilities
    getDeviceDimensions,
    getPreviewUrl,
    
    // Clear error
    clearError: () => setPreviewError(null),
  };
};
