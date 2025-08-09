import React from 'react';
import type { PopupElement } from '../types';

/**
 * Element Renderer Utilities
 * Handles rendering of all popup element types as DOM elements
 */

export interface ElementRendererOptions {
  isSelected?: boolean;
  onSelect?: (e?: React.MouseEvent) => void;
  style?: React.CSSProperties;
  className?: string;
}

export interface ElementStyles {
  [key: string]: React.CSSProperties;
}

/**
 * Element style generator based on component configuration
 */
export class ElementStyleGenerator {
  /**
   * Generate CSS styles for an element based on its config
   */
  static generateStyles(element: PopupElement): React.CSSProperties {
    const config = element.config || {};
    const style = config.style || {};
    
    // Base styles that apply to all elements
    const baseStyles: React.CSSProperties = {
      margin: style.margin || '0',
      padding: style.padding || '0',
      fontFamily: style.fontFamily || 'Arial, sans-serif',
      position: 'relative',
    };

    // Element-specific styles
    const elementStyles = this.getElementSpecificStyles(element);
    
    // Merge all styles
    return {
      ...baseStyles,
      ...elementStyles,
      ...this.parseStyleProperties(style),
    };
  }

  /**
   * Get element-specific default styles
   */
  private static getElementSpecificStyles(element: PopupElement): React.CSSProperties {
    const config = element.config || {};
    
    switch (element.type) {
      case 'title':
        return {
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333333',
          textAlign: 'center',
          margin: '10px 5px',
          lineHeight: '1.2',
        };
      
      case 'subtitle':
        return {
          fontSize: '18px',
          fontWeight: 'normal',
          color: '#666666',
          textAlign: 'center',
          margin: '5px 5px 10px 5px',
          lineHeight: '1.4',
        };
      
      case 'text':
        return {
          fontSize: '14px',
          color: '#444444',
          textAlign: 'left',
          margin: '10px 5px',
          lineHeight: '1.5',
        };
      
      case 'button':
        return {
          background: '#1677ff',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'background 0.3s',
          margin: '10px auto',
          display: 'block',
          textAlign: 'center',
        };
      
      case 'image':
      case 'logo':
        return {
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '4px',
          margin: '10px 0',
          objectFit: 'cover' as const,
          maxHeight: element.type === 'logo' ? '80px' : '300px',
          width: element.type === 'logo' ? '120px' : 'auto',
          display: element.type === 'logo' ? 'block' : 'inline-block',
        };
      
      case 'countdown':
        return {
          margin: '15px 0',
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#ff4d4f',
          fontFamily: 'monospace',
        };
      
      case 'coupon-code':
        return {
          background: '#f0f5ff',
          color: '#1677ff',
          border: '2px dashed #1677ff',
          borderRadius: '4px',
          padding: '12px 20px',
          margin: '15px 10px',
          textAlign: 'center',
          cursor: 'pointer',
          userSelect: 'all' as const,
          fontSize: '20px',
          fontWeight: 'bold',
          position: 'relative',
        };
      
      case 'email-input':
        return {
          width: '100%',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          padding: '10px 15px',
          fontSize: '14px',
          background: '#ffffff',
          margin: '10px 0',
          boxSizing: 'border-box' as const,
        };
      
      case 'progress-bar':
        return {
          margin: '15px 0',
          width: '100%',
        };
      
      case 'link':
        return {
          color: '#1677ff',
          textDecoration: 'underline',
          cursor: 'pointer',
          margin: '5px',
          display: 'inline-block',
          fontSize: '14px',
        };
      
      case 'divider':
        return {
          width: '100%',
          height: '1px',
          border: 'none',
          backgroundColor: '#d9d9d9',
          margin: '15px 0',
        };
      
      case 'spacer':
        return {
          width: '100%',
          height: '20px',
        };
      
      case 'close-button':
        return {
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '30px',
          height: '30px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: '#000000',
          borderRadius: '50%',
          padding: '5px 8px',
          margin: '5px',
        };
      
      case 'social-links':
        return {
          display: 'flex',
          gap: '15px',
          margin: '15px 0',
          justifyContent: 'center',
        };
      
      case 'container':
        return {
          width: '100%',
          padding: '10px',
          margin: '0',
          border: 'none',
          borderRadius: '4px',
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'stretch',
        };
      
      case 'grid':
        const rows = config.rows || 2;
        const columns = config.columns || 2;
        return {
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: '10px',
          width: '100%',
          border: 'none',
          margin: '0',
          padding: '10px',
        };
      
      default:
        return {
          padding: '8px',
          border: '1px dashed #ccc',
          borderRadius: '4px',
          background: '#f5f5f5',
          color: '#666',
          textAlign: 'center',
        };
    }
  }

  /**
   * Parse style properties from config
   */
  private static parseStyleProperties(style: any): React.CSSProperties {
    const parsedStyles: React.CSSProperties = {};
    
    // Common style properties that can be directly applied
    const directProperties = [
      'color', 'backgroundColor', 'fontSize', 'fontWeight', 'fontFamily',
      'textAlign', 'lineHeight', 'margin', 'padding', 'border', 'borderRadius',
      'width', 'height', 'maxWidth', 'maxHeight', 'display', 'position',
      'top', 'right', 'bottom', 'left', 'gap', 'flexDirection', 'alignItems',
      'justifyContent', 'gridTemplateColumns', 'gridTemplateRows'
    ];

    directProperties.forEach(prop => {
      if (style[prop] !== undefined) {
        parsedStyles[prop as keyof React.CSSProperties] = style[prop];
      }
    });

    return parsedStyles;
  }
}

/**
 * Element props generator
 */
export class ElementPropsGenerator {
  /**
   * Generate props for an element based on its type and config
   */
  static generateProps(element: PopupElement, options: ElementRendererOptions = {}) {
    const config = element.config || {};
    const baseProps = {
      'data-element-id': element.id,
      'data-element-type': element.type,
      className: `popup-element popup-${element.type} ${options.className || ''}`.trim(),
      style: {
        ...ElementStyleGenerator.generateStyles(element),
        ...options.style,
        ...(options.isSelected && {
          outline: '2px solid #1677ff',
          outlineOffset: '2px',
        }),
      },
      onClick: options.onSelect,
    };

    // Element-specific props
    switch (element.type) {
      case 'button':
        return {
          ...baseProps,
          type: 'button' as const,
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            options.onSelect?.(e);
            // Handle button action
            const action = config.action || {};
            if (action.type === 'link' && action.url) {
              window.open(action.url, '_blank');
            }
          },
        };
      
      case 'image':
      case 'logo':
        return {
          ...baseProps,
          src: config.src || (element.type === 'logo' ? 'https://via.placeholder.com/120x80?text=LOGO' : 'https://via.placeholder.com/200x150'),
          alt: config.alt || (element.type === 'logo' ? 'Logo' : 'Image'),
          onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src = 'https://via.placeholder.com/200x150?text=Failed+to+load';
          },
        };
      
      case 'email-input':
        return {
          ...baseProps,
          type: 'email' as const,
          placeholder: config.placeholder || 'Enter your email',
          required: config.required || false,
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            options.onSelect?.(e);
          },
        };
      
      case 'link':
        return {
          ...baseProps,
          href: config.href || 'https://example.com',
          target: config.target || '_blank',
          rel: 'noopener noreferrer',
        };
      
      case 'countdown':
        return {
          ...baseProps,
          'data-end-time': config.endTime || '',
          'data-format': config.format || 'DD:HH:MM:SS',
        };
      
      case 'coupon-code':
        return {
          ...baseProps,
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            options.onSelect?.(e);
            // Copy to clipboard
            const code = config.code || 'SAVE20';
            navigator.clipboard.writeText(code).then(() => {
              alert(`Coupon code copied: ${code}`);
            });
          },
        };
      
      case 'close-button':
        return {
          ...baseProps,
          type: 'button' as const,
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            options.onSelect?.(e);
            // Handle close action
            if (window.parent !== window) {
              window.parent.postMessage('closePopup', '*');
            }
          },
        };
      
      default:
        return baseProps;
    }
  }
}

/**
 * Element content generator
 */
export class ElementContentGenerator {
  /**
   * Generate content for an element
   */
  static generateContent(element: PopupElement): React.ReactNode {
    const config = element.config || {};
    
    switch (element.type) {
      case 'title':
      case 'subtitle':
      case 'text':
      case 'button':
      case 'link':
        return config.content || this.getDefaultContent(element.type);
      
      case 'countdown':
        return this.generateCountdownContent();
      
      case 'coupon-code':
        return this.generateCouponContent(config);
      
      case 'progress-bar':
        return this.generateProgressBarContent(config);
      
      case 'social-links':
        return this.generateSocialLinksContent(config);
      
      case 'close-button':
        return config.content || '×';
      
      case 'divider':
      case 'spacer':
        return null; // These elements don't have text content
      
      case 'container':
      case 'grid':
        return 'Container'; // Placeholder text for container elements
      
      default:
        return element.type;
    }
  }

  /**
   * Get default content for element types
   */
  private static getDefaultContent(type: string): string {
    const defaults: Record<string, string> = {
      title: 'Enter Title Here',
      subtitle: 'Enter Subtitle Here',
      text: 'Enter your text content here.',
      button: 'Click Me',
      link: 'Click here',
    };
    return defaults[type] || type;
  }

  /**
   * Generate countdown content
   */
  private static generateCountdownContent(): React.ReactNode {
    return React.createElement('span', { className: 'countdown-display' }, '00:00:00:00');
  }

  /**
   * Generate coupon code content
   */
  private static generateCouponContent(config: any): React.ReactNode {
    return React.createElement(React.Fragment, null, [
      React.createElement('span', { key: 'code', className: 'coupon-text' }, config.code || 'SAVE20'),
      React.createElement('span', { key: 'hint', className: 'copy-hint' }, config.copyText || 'Click to copy'),
    ]);
  }

  /**
   * Generate progress bar content
   */
  private static generateProgressBarContent(config: any): React.ReactNode {
    const progress = config.progress || 75;
    const showPercentage = config.showPercentage !== false;
    
    return React.createElement(React.Fragment, null, [
      config.labelText && React.createElement('div', { key: 'label', className: 'progress-label' }, config.labelText),
      React.createElement('div', { key: 'container', className: 'progress-container' }, [
        React.createElement('div', {
          key: 'fill',
          className: 'progress-fill',
          style: { width: `${progress}%` }
        }, showPercentage ? `${progress}%` : null)
      ])
    ]);
  }

  /**
   * Generate social links content
   */
  private static generateSocialLinksContent(config: any): React.ReactNode {
    const links = config.links || [];
    
    return React.createElement(React.Fragment, null, 
      links.map((link: any, index: number) => 
        React.createElement('a', {
          key: index,
          href: link.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: `social-link social-${link.platform}`
        }, this.getSocialIcon(link.platform))
      )
    );
  }

  /**
   * Get social media icon
   */
  private static getSocialIcon(platform: string): string {
    const icons: Record<string, string> = {
      facebook: '📘',
      twitter: '🐦',
      instagram: '📷',
      linkedin: '💼',
      youtube: '📺',
      tiktok: '🎵',
    };
    return icons[platform] || '🔗';
  }
}

/**
 * Main element renderer utility
 */
export const elementRendererUtils = {
  ElementStyleGenerator,
  ElementPropsGenerator,
  ElementContentGenerator,
  
  /**
   * Get complete element configuration for rendering
   */
  getElementConfig(element: PopupElement, options: ElementRendererOptions = {}) {
    return {
      props: ElementPropsGenerator.generateProps(element, options),
      content: ElementContentGenerator.generateContent(element),
      styles: ElementStyleGenerator.generateStyles(element),
    };
  },
  
  /**
   * Check if element is interactive
   */
  isInteractiveElement(type: string): boolean {
    return ['button', 'email-input', 'link', 'coupon-code', 'close-button'].includes(type);
  },
  
  /**
   * Check if element is a container
   */
  isContainerElement(type: string): boolean {
    return ['container', 'grid'].includes(type);
  },
  
  /**
   * Get element tag name
   */
  getElementTagName(type: string): string {
    const tagMap: Record<string, string> = {
      title: 'h1',
      subtitle: 'h2',
      text: 'p',
      button: 'button',
      image: 'img',
      logo: 'img',
      'email-input': 'input',
      link: 'a',
      divider: 'hr',
      'close-button': 'button',
    };
    return tagMap[type] || 'div';
  }
};