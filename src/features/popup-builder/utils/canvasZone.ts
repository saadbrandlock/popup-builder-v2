import type { PopupElement, ZoneType } from '../types';

/**
 * Canvas Zone Utilities
 * Handles zone-based layout and element positioning
 */

export interface ZoneConfig {
  name: ZoneType;
  height: number;
  minHeight: number;
  maxHeight?: number;
  allowedElements: string[];
  borderStyle?: React.CSSProperties;
  backgroundColor?: string;
}

export interface CanvasZoneProps {
  zoneName: ZoneType;
  elements: PopupElement[];
  canvasSize: { width: number; height: number };
  isDropTarget?: boolean;
  isOver?: boolean;
  selectedElementId?: string | null;
  onElementSelect: (elementId: string) => void;
}

/**
 * Zone configuration manager
 */
export class ZoneConfigManager {
  private static readonly DEFAULT_ZONES: Record<ZoneType, Omit<ZoneConfig, 'height'>> = {
    header: {
      name: 'header',
      minHeight: 60,
      maxHeight: 200,
      allowedElements: ['title', 'subtitle', 'logo', 'close-button', 'image', 'text', 'button', 'link', 'divider', 'spacer', 'container', 'grid', 'progress-bar'],
      borderStyle: { borderBottom: '1px dashed #e0e0e0' },
    },
    content: {
      name: 'content',
      minHeight: 200,
      allowedElements: ['title', 'subtitle', 'text', 'button', 'image', 'countdown', 'coupon-code', 'email-input', 'progress-bar', 'link', 'divider', 'spacer', 'container', 'grid', 'social-links'],
      borderStyle: {},
    },
    footer: {
      name: 'footer',
      minHeight: 60,
      maxHeight: 150,
      allowedElements: ['text', 'button', 'email-input', 'link', 'divider', 'spacer', 'social-links', 'container', 'grid', 'close-button'],
      borderStyle: { borderTop: '1px dashed #e0e0e0' },
    },
  };

  /**
   * Get zone configuration
   */
  static getZoneConfig(zoneName: ZoneType, canvasHeight: number): ZoneConfig {
    const baseConfig = this.DEFAULT_ZONES[zoneName];
    const height = this.calculateZoneHeight(zoneName, canvasHeight);
    
    return {
      ...baseConfig,
      height,
    };
  }

  /**
   * Calculate zone height based on canvas size
   */
  private static calculateZoneHeight(zoneName: ZoneType, canvasHeight: number): number {
    // Default equal distribution with minimums
    const equalHeight = canvasHeight / 3;
    const config = this.DEFAULT_ZONES[zoneName];
    
    if (equalHeight < config.minHeight) {
      return config.minHeight;
    }
    
    if (config.maxHeight && equalHeight > config.maxHeight) {
      return config.maxHeight;
    }
    
    return equalHeight;
  }

  /**
   * Check if element is allowed in zone
   */
  static isElementAllowedInZone(elementType: string, zoneName: ZoneType): boolean {
    const config = this.DEFAULT_ZONES[zoneName];
    return config.allowedElements.includes(elementType);
  }

  /**
   * Get all allowed elements for a zone
   */
  static getAllowedElementsForZone(zoneName: ZoneType): string[] {
    return this.DEFAULT_ZONES[zoneName].allowedElements;
  }

  /**
   * Get zones where element is allowed
   */
  static getZonesForElement(elementType: string): ZoneType[] {
    return Object.entries(this.DEFAULT_ZONES)
      .filter(([, config]) => config.allowedElements.includes(elementType))
      .map(([zoneName]) => zoneName as ZoneType);
  }
}

/**
 * Zone layout manager
 */
export class ZoneLayoutManager {
  /**
   * Calculate responsive zone heights
   */
  static calculateZoneHeights(canvasSize: { width: number; height: number }): Record<ZoneType, number> {
    const { height } = canvasSize;
    
    // Start with equal distribution
    const equalHeight = height / 3;
    
    const headerConfig = ZoneConfigManager.getZoneConfig('header', height);
    const contentConfig = ZoneConfigManager.getZoneConfig('content', height);
    const footerConfig = ZoneConfigManager.getZoneConfig('footer', height);
    
    // Adjust based on min/max constraints
    let headerHeight = Math.max(headerConfig.minHeight, equalHeight);
    let footerHeight = Math.max(footerConfig.minHeight, equalHeight);
    let contentHeight = height - headerHeight - footerHeight;
    
    // Ensure content has minimum height
    if (contentHeight < contentConfig.minHeight) {
      contentHeight = contentConfig.minHeight;
      const remaining = height - contentHeight;
      headerHeight = Math.min(headerHeight, remaining / 2);
      footerHeight = remaining - headerHeight;
    }
    
    return {
      header: headerHeight,
      content: contentHeight,
      footer: footerHeight,
    };
  }

  /**
   * Generate zone styles
   */
  static generateZoneStyles(zoneName: ZoneType, config: ZoneConfig, isOver: boolean = false): React.CSSProperties {
    return {
      height: `${config.height}px`,
      minHeight: `${config.minHeight}px`,
      padding: '8px',
      position: 'relative',
      backgroundColor: config.backgroundColor || (isOver ? '#f0f8ff' : 'transparent'),
      transition: 'background-color 0.2s ease',
      ...config.borderStyle,
    };
  }

  /**
   * Generate zone label styles
   */
  static generateZoneLabelStyles(): React.CSSProperties {
    return {
      position: 'absolute',
      top: '4px',
      left: '8px',
      fontSize: '11px',
      color: '#999',
      textTransform: 'uppercase',
      fontWeight: 500,
      backgroundColor: 'white',
      padding: '2px 6px',
      borderRadius: '3px',
      zIndex: 10,
      userSelect: 'none',
    };
  }

  /**
   * Generate empty zone message styles
   */
  static generateEmptyZoneStyles(): React.CSSProperties {
    return {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px dashed #d9d9d9',
      borderRadius: '8px',
      color: '#999',
      fontSize: '14px',
      textAlign: 'center',
      padding: '20px',
      marginTop: '20px',
    };
  }
}

/**
 * Zone element positioning
 */
export class ZoneElementPositioner {
  /**
   * Calculate element positions within a zone
   */
  static calculateElementPositions(
    elements: PopupElement[],
    zoneConfig: ZoneConfig,
    canvasWidth: number
  ): Array<PopupElement & { position: { x: number; y: number; width: number; height: number } }> {
    let currentY = 8; // Start with some padding
    const padding = 8;
    const elementSpacing = 8;
    
    return elements.map((element, index) => {
      const elementHeight = this.getElementHeight(element);
      const elementWidth = this.getElementWidth(element, canvasWidth - (padding * 2));
      
      const position = {
        x: padding,
        y: currentY,
        width: elementWidth,
        height: elementHeight,
      };
      
      currentY += elementHeight + elementSpacing;
      
      return {
        ...element,
        position,
      };
    });
  }

  /**
   * Get default element height
   */
  private static getElementHeight(element: PopupElement): number {
    const config = element.config || {};
    const style = config.style || {};
    
    // If height is specified in config, use it
    if (style.height) {
      return parseInt(style.height.toString()) || this.getDefaultHeight(element.type);
    }
    
    return this.getDefaultHeight(element.type);
  }

  /**
   * Get default element width
   */
  private static getElementWidth(element: PopupElement, maxWidth: number): number {
    const config = element.config || {};
    const style = config.style || {};
    
    // If width is specified in config, use it
    if (style.width) {
      const width = style.width.toString();
      if (width.includes('%')) {
        const percentage = parseInt(width) / 100;
        return Math.floor(maxWidth * percentage);
      } else {
        return Math.min(parseInt(width) || maxWidth, maxWidth);
      }
    }
    
    return this.getDefaultWidth(element.type, maxWidth);
  }

  /**
   * Get default height for element type
   */
  private static getDefaultHeight(elementType: string): number {
    const heights: Record<string, number> = {
      title: 40,
      subtitle: 30,
      text: 60,
      button: 44,
      image: 150,
      logo: 60,
      countdown: 50,
      'coupon-code': 60,
      'email-input': 40,
      'progress-bar': 40,
      link: 20,
      divider: 1,
      spacer: 20,
      'close-button': 30,
      'social-links': 40,
      container: 100,
      grid: 120,
    };
    
    return heights[elementType] || 40;
  }

  /**
   * Get default width for element type
   */
  private static getDefaultWidth(elementType: string, maxWidth: number): number {
    const widthRatios: Record<string, number> = {
      title: 1.0,
      subtitle: 1.0,
      text: 1.0,
      button: 0.6,
      image: 0.8,
      logo: 0.4,
      countdown: 0.7,
      'coupon-code': 0.8,
      'email-input': 1.0,
      'progress-bar': 1.0,
      link: 0.5,
      divider: 1.0,
      spacer: 1.0,
      'close-button': 0.1,
      'social-links': 0.6,
      container: 1.0,
      grid: 1.0,
    };
    
    const ratio = widthRatios[elementType] || 1.0;
    return Math.floor(maxWidth * ratio);
  }
}

/**
 * Zone drop validation
 */
export class ZoneDropValidator {
  /**
   * Check if drop is valid
   */
  static isValidDrop(elementType: string, targetZone: ZoneType): boolean {
    return ZoneConfigManager.isElementAllowedInZone(elementType, targetZone);
  }

  /**
   * Get drop validation message
   */
  static getDropValidationMessage(elementType: string, targetZone: ZoneType): string {
    if (this.isValidDrop(elementType, targetZone)) {
      return `Drop ${elementType} in ${targetZone} zone`;
    }
    
    const allowedZones = ZoneConfigManager.getZonesForElement(elementType);
    if (allowedZones.length === 0) {
      return `${elementType} cannot be dropped in any zone`;
    }
    
    return `${elementType} can only be dropped in: ${allowedZones.join(', ')}`;
  }

  /**
   * Get visual feedback for drop validation
   */
  static getDropFeedbackStyles(isValid: boolean): React.CSSProperties {
    return {
      backgroundColor: isValid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      borderColor: isValid ? '#22c55e' : '#ef4444',
      borderStyle: 'dashed',
      borderWidth: '2px',
    };
  }
}

/**
 * Main canvas zone utilities
 */
export const canvasZoneUtils = {
  ZoneConfigManager,
  ZoneLayoutManager,
  ZoneElementPositioner,
  ZoneDropValidator,
  
  /**
   * Get complete zone configuration
   */
  getCompleteZoneConfig(zoneName: ZoneType, canvasSize: { width: number; height: number }) {
    const config = ZoneConfigManager.getZoneConfig(zoneName, canvasSize.height);
    const styles = ZoneLayoutManager.generateZoneStyles(zoneName, config);
    
    return {
      config,
      styles,
      labelStyles: ZoneLayoutManager.generateZoneLabelStyles(),
      emptyStyles: ZoneLayoutManager.generateEmptyZoneStyles(),
    };
  },
  
  /**
   * Validate and position elements in zone
   */
  processZoneElements(elements: PopupElement[], zoneName: ZoneType, canvasSize: { width: number; height: number }) {
    const config = ZoneConfigManager.getZoneConfig(zoneName, canvasSize.height);
    const validElements = elements.filter(el => 
      ZoneConfigManager.isElementAllowedInZone(el.type, zoneName)
    );
    const positionedElements = ZoneElementPositioner.calculateElementPositions(
      validElements, 
      config, 
      canvasSize.width
    );
    
    return {
      validElements,
      positionedElements,
      invalidElements: elements.filter(el => 
        !ZoneConfigManager.isElementAllowedInZone(el.type, zoneName)
      ),
    };
  }
};