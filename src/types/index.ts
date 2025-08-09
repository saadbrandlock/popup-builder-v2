// Re-export all common types
export * from './api';
export * from './common';
export * from './template';

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