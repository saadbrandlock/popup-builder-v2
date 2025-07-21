// Re-export all common types
export * from './api';
export * from './common';

// Legacy types - keeping for backward compatibility
export interface CouponTemplate {
  id: string;
  name: string;
  elements: TemplateElement[];
  dimensions: {
    width: number;
    height: number;
  };
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'barcode';
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  properties: Record<string, any>;
}