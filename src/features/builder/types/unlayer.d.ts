/**
 * Unlayer TypeScript Definitions
 * Type definitions for Unlayer popup builder integration
 */

// Extend Window interface to include unlayer
declare global {
  interface Window {
    unlayer: UnlayerAPI;
  }
}

// Main Unlayer API interface
export interface UnlayerAPI {
  init: (config: UnlayerConfig) => void;
  loadDesign: (design: any) => void;
  saveDesign: (callback: (design: any) => void) => void;
  exportHtml: (callback: (data: UnlayerExportResult) => void) => void;
  addEventListener: (event: UnlayerEvent, callback: (data: any) => void) => void;
  removeEventListener: (event: UnlayerEvent, callback: (data: any) => void) => void;
  setMergeTags: (mergeTags: Record<string, string>) => void;
  setDesignTags: (designTags: Record<string, string>) => void;
  showPreview: (device: UnlayerDevice) => void;
  hidePreview: () => void;
}

// Unlayer configuration interface
export interface UnlayerConfig {
  id: string;
  projectId: number;
  displayMode: 'popup';
  appearance?: UnlayerAppearance;
  user?: UnlayerUser;
  mergeTags?: Record<string, string>;
  designTags?: Record<string, string>;
  tools?: UnlayerTools;
  blocks?: UnlayerBlock[];
  bodyValues?: Record<string, any>;
  customCSS?: string;
  customJS?: string;
  fonts?: UnlayerFont[];
}

// Appearance configuration
export interface UnlayerAppearance {
  theme?: 'light' | 'dark';
  panels?: {
    tools?: {
      dock?: 'left' | 'right';
    };
  };
}

// User information
export interface UnlayerUser {
  id?: number | string;
  name?: string;
  email?: string;
}

// Tools configuration
export interface UnlayerTools {
  image?: {
    enabled?: boolean;
  };
  text?: {
    enabled?: boolean;
  };
  button?: {
    enabled?: boolean;
  };
  countdown?: {
    enabled?: boolean;
  };
  video?: {
    enabled?: boolean;
  };
  social?: {
    enabled?: boolean;
  };
  form?: {
    enabled?: boolean;
  };
}

// Custom block definition
export interface UnlayerBlock {
  name: string;
  displayName: string;
  icon: string;
  category: string;
  html: string;
  css?: string;
  js?: string;
}

// Font definition
export interface UnlayerFont {
  family: string;
  url: string;
}

// Export result from unlayer.exportHtml()
export interface UnlayerExportResult {
  design: any;
  html: string;
}

// Unlayer events
export type UnlayerEvent = 
  | 'design:loaded'
  | 'design:updated' 
  | 'editor:ready'
  | 'preview:opened'
  | 'preview:closed';

// Device types for preview
export type UnlayerDevice = 'desktop' | 'mobile';

// Design data structure (what gets saved/loaded)
export interface UnlayerDesign {
  counters?: Record<string, number>;
  body?: {
    id?: string;
    rows?: UnlayerRow[];
    values?: Record<string, any>;
  };
}

// Row structure in design
export interface UnlayerRow {
  id: string;
  cells: UnlayerCell[];
  values: Record<string, any>;
}

// Cell structure in design
export interface UnlayerCell {
  id: string;
  contents: UnlayerContent[];
  values: Record<string, any>;
}

// Content structure in design
export interface UnlayerContent {
  id: string;
  type: string;
  values: Record<string, any>;
}

// Local types for our store and components
export interface UnlayerState {
  currentDesign: UnlayerDesign | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  projectId: number | null;
  lastExportedHtml: string | null;
}

export interface UnlayerEditorProps {
  projectId: number;
  containerId?: string;
  config?: Partial<UnlayerConfig>;
  initialDesign?: UnlayerDesign;
  onReady?: () => void;
  onDesignLoad?: (design: UnlayerDesign) => void;
  onDesignUpdate?: (design: UnlayerDesign) => void;
  onError?: (error: string) => void;
}

export interface UnlayerWrapperProps extends UnlayerEditorProps {
  className?: string;
  style?: React.CSSProperties;
  height?: string | number;
  width?: string | number;
}