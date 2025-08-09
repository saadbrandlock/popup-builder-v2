/**
 * Grid-specific types for multi-cell grid component system
 * Following the architecture design from advanced-dnd-features-plan.md
 */

import type { PopupElement } from './index';

/**
 * Grid styles interface for styling the grid container
 */
export interface GridStyles {
  backgroundColor?: string;
  border?: string;
  borderRadius?: string;
  padding?: string;
  gap?: string;
  minHeight?: string;
  [key: string]: any; // Allow for additional CSS properties
}

/**
 * Grid cell styles interface for individual cell styling
 */
export interface GridCellStyles {
  backgroundColor?: string;
  border?: string;
  borderRadius?: string;
  padding?: string;
  minHeight?: string;
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  [key: string]: any; // Allow for additional CSS properties
}

/**
 * Grid configuration interface
 */
export interface GridConfig {
  id: string;
  rows: number;
  columns: number;
  columnFractions: number[]; // [6, 6] for equal columns, [8, 4] for 2:1 ratio
  cellMinHeight: string;
  gap: string;
  style: GridStyles;
  cellStyle?: GridCellStyles; // Default styles for all cells
  responsive?: {
    mobile?: {
      columns: number;
      stackOnMobile: boolean;
    };
  };
}

/**
 * Grid element interface extending PopupElement
 */
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

/**
 * Grid cell coordinates interface
 */
export interface GridCellCoordinates {
  row: number;
  col: number;
}

/**
 * Grid cell drop zone interface for drag and drop
 */
export interface GridCellDropZone {
  id: string; // 'grid-${gridId}-cell-${cellId}'
  type: 'grid-cell';
  gridId: string;
  cellId: string; // 'row-0-col-0'
  cellCoordinates: GridCellCoordinates;
  accepts: string[]; // Based on allowed_children_types
  components: PopupElement[];
  isEmpty: boolean;
  maxComponents?: number; // Optional limit per cell
}

/**
 * Grid drop data interface for drag and drop operations
 */
export interface GridCellDropData {
  type: 'grid-cell';
  gridId: string;
  cellId: string;
  cellCoordinates: GridCellCoordinates;
  position?: number; // Position within the cell
  components?: PopupElement[];
}

/**
 * Grid cell info interface for rendering and management
 */
export interface GridCellInfo {
  cellId: string;
  coordinates: GridCellCoordinates;
  components: PopupElement[];
  isEmpty: boolean;
  style?: GridCellStyles;
}

/**
 * Grid template presets for common layouts
 */
export interface GridTemplate {
  id: string;
  name: string;
  description: string;
  rows: number;
  columns: number;
  columnFractions: number[];
  thumbnail?: string;
  category: 'layout' | 'marketing' | 'content' | 'custom';
}

/**
 * Common grid templates
 */
export const GRID_TEMPLATES: GridTemplate[] = [
  {
    id: 'two-columns',
    name: '2 Columns',
    description: 'Equal width two column layout',
    rows: 1,
    columns: 2,
    columnFractions: [6, 6],
    category: 'layout'
  },
  {
    id: 'three-columns',
    name: '3 Columns',
    description: 'Equal width three column layout',
    rows: 1,
    columns: 3,
    columnFractions: [4, 4, 4],
    category: 'layout'
  },
  {
    id: 'sidebar-main',
    name: 'Sidebar + Main',
    description: 'Narrow sidebar with wide main content',
    rows: 1,
    columns: 2,
    columnFractions: [3, 9],
    category: 'layout'
  },
  {
    id: 'main-sidebar',
    name: 'Main + Sidebar',
    description: 'Wide main content with narrow sidebar',
    rows: 1,
    columns: 2,
    columnFractions: [9, 3],
    category: 'layout'
  },
  {
    id: 'hero-two-cols',
    name: 'Hero + 2 Columns',
    description: 'Full width header with two columns below',
    rows: 2,
    columns: 2,
    columnFractions: [6, 6],
    category: 'marketing'
  },
  {
    id: 'four-grid',
    name: '2x2 Grid',
    description: 'Four equal sections in a grid',
    rows: 2,
    columns: 2,
    columnFractions: [6, 6],
    category: 'content'
  }
];

/**
 * Grid utility types
 */
export type GridCellPosition = 'start' | 'center' | 'end';
export type GridCellAlignment = 'stretch' | 'start' | 'center' | 'end';
export type GridResponsiveBreakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * Grid event types for handling grid-specific operations
 */
export interface GridCellResizeEvent {
  gridId: string;
  cellId: string;
  newFraction: number;
}

export interface GridStructureChangeEvent {
  gridId: string;
  action: 'add-row' | 'remove-row' | 'add-column' | 'remove-column';
  position?: number;
}

export interface GridCellMergeEvent {
  gridId: string;
  sourceCellId: string;
  targetCellId: string;
}