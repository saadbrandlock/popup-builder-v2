// Popup Builder Types - Phase 1 (REFACTORED)
// Aligned with actual API response structure and database schema

import type { TemplateStatus } from '../../../types/common';
import type { TCBTemplate } from '../../../types/template';
import type { ComponentDefinition } from '../../../types/api';

// Import grid-specific types
export * from '../../../types/grid';

// ============================================================================
// CORE POPUP TYPES - API ALIGNED
// ============================================================================

// Use TCBTemplate directly as the primary template interface (matches API response)
export type PopupTemplate = TCBTemplate;

// Zone-based builder state structure (matches API builder_state_json)
export interface PopupBuilderState {
  zones: {
    header: ZoneConfig;
    content: ZoneConfig;
    footer: ZoneConfig;
  };
}

export interface ZoneConfig {
  components: PopupElement[];
}

// Template with parsed builder state for UI consumption
export interface PopupTemplateWithState extends PopupTemplate {
  parsedBuilderState: PopupBuilderState;
}

// PopupElement now aligns with database component structure + supports tree structure
export interface PopupElement {
  id: string; // Generated UUID for element instance
  type: string; // Component type from database (e.g., 'button', 'text', 'image')
  config: Record<string, any>; // Component configuration (merged from default_config_json + customizations)
  zone: 'header' | 'content' | 'footer'; // Zone placement
  order?: number; // Order within zone
  
  // Tree structure support for containers
  parentId?: string; // ID of parent container (if nested)
  children?: PopupElement[]; // Child elements (for containers)
}

// For backward compatibility and UI positioning (if needed for advanced layouts)
export interface ElementPosition {
  x?: number;
  y?: number;
  width?: string | number;
  height?: string | number;
  zIndex?: number;
}

// Style interface that matches database component style structure
export interface ElementStyle {
  // Common CSS properties that components can use
  backgroundColor?: string;
  color?: string;
  fontSize?: string | number;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  padding?: string;
  margin?: string;
  borderRadius?: string | number;
  border?: string;
  boxShadow?: string;
  display?: string;
  width?: string;
  height?: string;
  gap?: string;
  alignItems?: string;
  justifyContent?: string;
  flexDirection?: string;
  cursor?: string;
  textDecoration?: string;
  lineHeight?: string | number;
  objectFit?: string;
  maxHeight?: string;
  maxWidth?: string;
  minHeight?: string;
  minWidth?: string;
  overflow?: string;
  position?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  transition?: string;
  userSelect?: string;
}

// ============================================================================
// COMPONENT TYPES - DATABASE ALIGNED
// ============================================================================

// Use ComponentDefinition from API types directly (matches database structure)
export type ComponentConfig = ComponentDefinition;

// Zone types based on database allowed_in_zones
export type ZoneType = 'header' | 'content' | 'footer';

// Component categories
export interface ComponentCategory {
  code: string;
  name: string;
  display_name: string;
  icon?: string;
  color?: string;
  order: number;
}

// ============================================================================
// COMPONENT TYPES
// ============================================================================

export type ComponentType = 
  | 'container'
  | 'grid'
  | 'title'
  | 'subtitle' 
  | 'text'
  | 'button'
  | 'link'
  | 'image'
  | 'logo'
  | 'countdown'
  | 'coupon-code'
  | 'progress-bar'
  | 'email-input'
  | 'social-links'
  | 'divider'
  | 'spacer'
  | 'close-button';

// ============================================================================
// TREE-BASED COMPONENT HIERARCHY (Phase 2)
// ============================================================================

// Enhanced PopupElement with parent-child relationships
export interface PopupElementEnhanced extends PopupElement {
  parentId?: string;
  parentType?: 'canvas' | 'container' | 'grid-cell';
  parentCellId?: string; // For grid children: 'row-0-col-1'
  constraints: {
    allowedChildren: string[];
    maxChildren?: number;
    canContainChildren: boolean;
  };
  position: {
    order: number;
    nestingLevel: number;
  };
}

// Container: Single drop zone with children array
export interface ContainerElement extends PopupElementEnhanced {
  type: 'container';
  children: PopupElementEnhanced[];
  config: {
    style: Record<string, any>;
    layout: 'vertical' | 'horizontal';
    gap: string;
    padding: string;
    maxChildren?: number;
    allowedChildTypes?: string[];
  } & Record<string, any>;
}

// Grid: Multi-cell with independent drop zones - Updated for Phase 3
export interface GridElement extends PopupElement {
  type: 'grid';
  config: {
    rows: number;
    columns: number;
    columnFractions: number[]; // [6, 6] for equal columns
    style: GridStyles;
    gap: string;
    cellMinHeight?: string;
    cellStyle?: GridCellStyles;
    responsive?: {
      mobile?: {
        columns: number;
        stackOnMobile: boolean;
      };
    };
  };
  cells: {
    [cellKey: string]: PopupElement[]; // 'row-0-col-0': [components]
  };
}

// Tree-based builder state structure
export interface PopupBuilderStateEnhanced {
  zones: {
    header: ZoneConfigEnhanced;
    content: ZoneConfigEnhanced;
    footer: ZoneConfigEnhanced;
  };
  componentHierarchy: {
    nodes: Map<string, PopupElementEnhanced>;
    rootNodes: string[];
    selectedNodes: string[];
    focusedContainer?: {
      id: string;
      type: 'container' | 'grid';
      cellId?: string; // For grid focus
    };
  };
}

export interface ZoneConfigEnhanced {
  components: PopupElementEnhanced[];
}

// Drop zone system for containers and grids
export interface DropZone {
  id: string;
  type: 'canvas' | 'container' | 'grid-cell' | 'between-elements';
  parentId?: string;
  cellId?: string; // For grid cells: 'row-0-col-1'
  position: number;
  accepts: string[]; // Based on allowed_children_types
  visual: {
    highlight: boolean;
    showIndicator: boolean;
    indicatorType: 'line' | 'box' | 'outline' | 'cell-highlight';
  };
  constraints: {
    maxChildren?: number;
    currentChildCount: number;
  };
}

// Grid-specific drop zone calculation
export interface GridDropZone extends DropZone {
  type: 'grid-cell';
  cellCoordinates: {
    row: number;
    col: number;
  };
  cellId: string; // 'row-0-col-1'
  isEmptyCell: boolean;
}

export interface ComponentProperty {
  key: string;
  label: string;
  type: PropertyType;
  default: any;
  required: boolean;
  validation?: PropertyValidation;
  options?: PropertyOption[];
  conditional?: PropertyConditional;
}

export type PropertyType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'image'
  | 'url'
  | 'font'
  | 'spacing';

export interface PropertyValidation {
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
  custom?: (value: any) => boolean | string;
}

export interface PropertyOption {
  label: string;
  value: any;
  icon?: string;
}

export interface PropertyConditional {
  property: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

// ============================================================================
// REMINDER TAB CONFIG
// ============================================================================

export interface ReminderTabConfig {
  enabled: boolean;
  title: string;
  message: string;
  buttonText: string;
  buttonAction: 'close' | 'redirect' | 'custom';
  redirectUrl?: string;
  customAction?: string;
  appearance: ReminderTabAppearance;
}

export interface ReminderTabAppearance {
  position: 'left' | 'right' | 'top' | 'bottom';
  backgroundColor: string;
  textColor: string;
  size: 'small' | 'medium' | 'large';
  animation: boolean;
}

// ============================================================================
// STORE STATE TYPES
// ============================================================================

export interface PopupBuilderStoreState {
  // Template data
  template: PopupTemplate | null;
  availableComponents: ComponentConfig[];
  instanceCounts: Record<string, number>;
  
  // UI state
  mode: BuilderMode;
  selectedElement: string | null;
  draggedComponent: ComponentConfig | null;
  
  // User permissions
  userRole: UserRole;
  canEdit: boolean;
  canPublish: boolean;
  
  // Loading and error states
  loading: boolean;
  saving: boolean;
  error: string | null;
  isDirty: boolean;
  
  // Preview state
  previewMode: boolean;
  previewDevice: DeviceType;
}

export type BuilderMode = 'builder' | 'preview' | 'settings';
export type UserRole = 'admin' | 'editor' | 'viewer';
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface PopupBuilderActions {
  // Template management
  loadTemplate: (template: PopupTemplate) => void;
  saveTemplate: () => Promise<void>;
  resetTemplate: () => void;
  
  // Component management
  loadAvailableComponents: (components: ComponentConfig[]) => void;
  addElement: (componentType: string, zone: ZoneType) => void;
  removeElement: (elementId: string) => void;
  updateElement: (elementId: string, updates: Partial<PopupElement>) => void;
  duplicateElement: (elementId: string) => void;
  
  // Selection and interaction
  selectElement: (elementId: string | null) => void;
  moveElement: (elementId: string, newZone: ZoneType, newOrder?: number) => void;
  resizeElement: (elementId: string, dimensions: { width: number; height: number }) => void;
  
  // Drag and drop
  startDrag: (component: ComponentConfig) => void;
  endDrag: () => void;
  
  // UI state
  setMode: (mode: BuilderMode) => void;
  setPreviewMode: (enabled: boolean) => void;
  setPreviewDevice: (device: DeviceType) => void;
  
  // Template metadata updates
  updateTemplateMetadata: (metadata: { name?: string; description?: string }) => void;
  updateReminderTab: (config: Partial<ReminderTabConfig>) => void;
  
  // Utility
  canAddComponent: (componentType: string) => boolean;
  getElementById: (elementId: string) => PopupElement | null;
  clearError: () => void;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface PopupTemplatePayload {
  name: string;
  description?: string;
  builder_state_json: PopupBuilderState;
  status: TemplateStatus;
}

// PopupTemplateResponse should match TCBTemplate structure from API
export type PopupTemplateResponse = PopupTemplate;

export interface ComponentLibraryResponse {
  components: ComponentConfig[];
  categories: ComponentCategory[];
}

// ============================================================================
// DRAG AND DROP TYPES
// ============================================================================

export interface DragData {
  type: 'component' | 'element' | 'canvas-element';
  component?: ComponentConfig;
  element?: PopupElement;
}

export interface DropResult {
  position: ElementPosition;
  targetZone: 'canvas' | 'trash';
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PopupBuilderError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExportOptions {
  format: 'html' | 'json' | 'image';
  includeCSS: boolean;
  includeJS: boolean;
  minify: boolean;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface PopupBuilderProps {
  templateId?: string;
  apiClient: any; // AxiosInstance from parent
  onSave?: (template: PopupTemplate) => void;
  onPreview?: (template: PopupTemplate) => void;
  onError?: (error: PopupBuilderError) => void;
  className?: string;
  readOnly?: boolean;
}

export interface PopupCanvasProps {
  className?: string;
}

export interface ComponentLibraryProps {
  apiClient: any;
  className?: string;
}

export interface PropertyPanelProps {
  className?: string;
}

export interface PopupPreviewProps {
  template: PopupTemplate;
  device: DeviceType;
  className?: string;
}

export interface ActionBarProps {
  onSave: () => void;
  onPreview: () => void;
  saving: boolean;
  isDirty: boolean;
  className?: string;
}
