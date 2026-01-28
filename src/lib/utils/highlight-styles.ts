/**
 * Highlight Styles Utility
 * Generates CSS for field highlighting effects in template iframes
 */

export interface HighlightConfig {
  style: 'outline' | 'overlay' | 'both';
  color: string;
  animationDuration: number;
  showTooltip: boolean;
  pulseAnimation: boolean;
}

export const DEFAULT_HIGHLIGHT_CONFIG: HighlightConfig = {
  style: 'outline',
  color: '#1890ff',
  animationDuration: 1000,
  showTooltip: true,
  pulseAnimation: true,
};

/**
 * Generate CSS for highlighting effects
 * @param config - Highlight configuration
 * @returns CSS string to inject into iframe
 */
export function generateHighlightCSS(config: HighlightConfig = DEFAULT_HIGHLIGHT_CONFIG): string {
  const { color, animationDuration, style, showTooltip, pulseAnimation } = config;
  
  const animationDurationSec = animationDuration / 1000;
  
  return `
    /* Field Highlight Styles */
    .field-highlighted {
      ${style === 'outline' || style === 'both' ? `
        outline: 3px solid ${color} !important;
        outline-offset: 4px;
      ` : ''}
      ${style === 'overlay' || style === 'both' ? `
        position: relative;
        box-shadow: 0 0 0 3px ${color}40, 0 0 20px ${color}60 !important;
      ` : ''}
      ${pulseAnimation ? `animation: highlight-pulse ${animationDurationSec}s ease-in-out infinite;` : ''}
      scroll-behavior: smooth;
      transition: all 0.3s ease;
      z-index: 9999 !important;
    }
    
    ${pulseAnimation ? `
    @keyframes highlight-pulse {
      0%, 100% { 
        outline-color: ${color};
        ${style === 'overlay' || style === 'both' ? `box-shadow: 0 0 0 3px ${color}40, 0 0 20px ${color}60;` : ''}
      }
      50% { 
        outline-color: ${color}80;
        ${style === 'overlay' || style === 'both' ? `box-shadow: 0 0 0 5px ${color}60, 0 0 30px ${color}80;` : ''}
      }
    }
    ` : ''}
    
    ${showTooltip ? `
    .field-highlight-tooltip {
      position: absolute;
      top: -40px;
      left: 50%;
      transform: translateX(-50%);
      background: ${color};
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      pointer-events: none;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      animation: tooltip-fadein 0.2s ease-in;
    }
    
    .field-highlight-tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: ${color};
    }
    
    @keyframes tooltip-fadein {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-5px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
    ` : ''}
    
    /* Clickable field indicator */
    .field-clickable {
      cursor: pointer;
      transition: opacity 0.2s ease;
    }
    
    .field-clickable:hover {
      opacity: 0.8;
    }
    
    /* Smooth scroll */
    html {
      scroll-behavior: smooth;
    }
  `;
}

/**
 * Create a tooltip element
 * @param fieldName - Name of the field to display
 * @returns HTMLElement for the tooltip
 */
export function createTooltipElement(fieldName: string): HTMLDivElement {
  const tooltip = document.createElement('div');
  tooltip.className = 'field-highlight-tooltip';
  tooltip.textContent = fieldName;
  return tooltip;
}
