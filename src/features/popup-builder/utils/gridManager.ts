/**
 * Grid Manager utility for grid cell operations and management
 * Following the architecture design from advanced-dnd-features-plan.md
 */

import type { PopupElement } from '../../../types';
import type { 
  GridElement, 
  GridConfig, 
  GridCellCoordinates, 
  GridCellInfo,
  GridTemplate,
  GRID_TEMPLATES 
} from '../../../types/grid';

/**
 * Grid Manager class with static utilities for grid operations
 */
export class GridManager {
  /**
   * Create empty grid with specified dimensions
   */
  static createEmptyGrid(rows: number, columns: number): GridElement['cells'] {
    const cells: GridElement['cells'] = {};
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const cellId = this.createCellId(row, col);
        cells[cellId] = [];
      }
    }
    
    return cells;
  }

  /**
   * Create a cell ID from row and column coordinates
   */
  static createCellId(row: number, col: number): string {
    return `row-${row}-col-${col}`;
  }

  /**
   * Parse cell ID to get row and column coordinates
   */
  static parseCellId(cellId: string): GridCellCoordinates {
    const match = cellId.match(/row-(\d+)-col-(\d+)/);
    if (!match) {
      throw new Error(`Invalid cell ID format: ${cellId}. Expected format: row-X-col-Y`);
    }
    
    return { 
      row: parseInt(match[1], 10), 
      col: parseInt(match[2], 10) 
    };
  }

  /**
   * Get all cell IDs for a grid with specified dimensions
   */
  static getAllCellIds(rows: number, columns: number): string[] {
    const cellIds: string[] = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        cellIds.push(this.createCellId(row, col));
      }
    }
    
    return cellIds;
  }

  /**
   * Get adjacent cell IDs (up, down, left, right)
   */
  static getAdjacentCells(cellId: string, rows: number, columns: number): string[] {
    const { row, col } = this.parseCellId(cellId);
    const adjacent: string[] = [];
    
    // Up
    if (row > 0) adjacent.push(this.createCellId(row - 1, col));
    // Down
    if (row < rows - 1) adjacent.push(this.createCellId(row + 1, col));
    // Left
    if (col > 0) adjacent.push(this.createCellId(row, col - 1));
    // Right
    if (col < columns - 1) adjacent.push(this.createCellId(row, col + 1));
    
    return adjacent;
  }

  /**
   * Get cell information including components and status
   */
  static getCellInfo(gridElement: GridElement, cellId: string): GridCellInfo {
    const coordinates = this.parseCellId(cellId);
    const components = gridElement.cells[cellId] || [];
    
    return {
      cellId,
      coordinates,
      components,
      isEmpty: components.length === 0,
      style: gridElement.config.cellStyle
    };
  }

  /**
   * Check if a cell exists in the grid
   */
  static isCellValid(cellId: string, rows: number, columns: number): boolean {
    try {
      const { row, col } = this.parseCellId(cellId);
      return row >= 0 && row < rows && col >= 0 && col < columns;
    } catch {
      return false;
    }
  }

  /**
   * Get the drop zone ID for a specific cell
   */
  static getCellDropZoneId(gridId: string, cellId: string): string {
    return `grid-${gridId}-cell-${cellId}`;
  }

  /**
   * Parse drop zone ID to extract grid ID and cell ID
   */
  static parseDropZoneId(dropZoneId: string): { gridId: string; cellId: string } | null {
    const match = dropZoneId.match(/grid-(.+)-cell-(.+)/);
    if (!match) return null;
    
    return {
      gridId: match[1],
      cellId: match[2]
    };
  }

  /**
   * Calculate grid template columns CSS value
   */
  static getGridTemplateColumns(columnFractions: number[]): string {
    return columnFractions.map(fraction => `${fraction}fr`).join(' ');
  }

  /**
   * Calculate grid template rows CSS value
   */
  static getGridTemplateRows(rows: number, minHeight = '100px'): string {
    return `repeat(${rows}, minmax(${minHeight}, auto))`;
  }

  /**
   * Validate grid configuration
   */
  static validateGridConfig(config: Partial<GridConfig>): string[] {
    const errors: string[] = [];
    
    if (!config.rows || config.rows < 1 || config.rows > 10) {
      errors.push('Rows must be between 1 and 10');
    }
    
    if (!config.columns || config.columns < 1 || config.columns > 12) {
      errors.push('Columns must be between 1 and 12');
    }
    
    if (config.columnFractions && config.columnFractions.length !== config.columns) {
      errors.push('Column fractions array length must match number of columns');
    }
    
    if (config.columnFractions) {
      const totalFractions = config.columnFractions.reduce((sum, fraction) => sum + fraction, 0);
      if (totalFractions <= 0) {
        errors.push('Total column fractions must be greater than 0');
      }
    }
    
    return errors;
  }

  /**
   * Create default grid configuration
   */
  static createDefaultGridConfig(rows = 2, columns = 2): GridConfig {
    return {
      id: `grid-${Date.now()}`,
      rows,
      columns,
      columnFractions: new Array(columns).fill(12 / columns), // Equal fractions
      cellMinHeight: '100px',
      gap: '12px',
      style: {
        backgroundColor: 'transparent',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px'
      },
      cellStyle: {
        backgroundColor: 'transparent',
        border: '1px dashed #d1d5db',
        borderRadius: '4px',
        padding: '8px',
        minHeight: '60px'
      }
    };
  }

  /**
   * Get grid template by ID
   */
  static getGridTemplate(templateId: string): GridTemplate | null {
    return GRID_TEMPLATES.find(template => template.id === templateId) || null;
  }

  /**
   * Create grid element from template
   */
  static createGridFromTemplate(templateId: string, elementId?: string): GridElement | null {
    const template = this.getGridTemplate(templateId);
    if (!template) return null;
    
    const cells = this.createEmptyGrid(template.rows, template.columns);
    
    return {
      id: elementId || `grid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'grid',
      zone: 'content', // Default zone
      config: {
        rows: template.rows,
        columns: template.columns,
        columnFractions: template.columnFractions,
        gap: '12px',
        cellMinHeight: '100px',
        style: {
          backgroundColor: 'transparent',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px'
        },
        cellStyle: {
          backgroundColor: 'transparent',
          border: '1px dashed #d1d5db',
          borderRadius: '4px',
          padding: '8px',
          minHeight: '60px'
        }
      },
      cells,
      order: 0
    };
  }

  /**
   * Resize grid by adding or removing rows/columns
   */
  static resizeGrid(
    gridElement: GridElement, 
    newRows: number, 
    newColumns: number
  ): { updatedGrid: GridElement; removedComponents: PopupElement[] } {
    const { rows: currentRows, columns: currentColumns } = gridElement.config;
    const removedComponents: PopupElement[] = [];
    const newCells: GridElement['cells'] = {};
    
    // Copy existing cells that fit in new dimensions
    for (let row = 0; row < Math.min(currentRows, newRows); row++) {
      for (let col = 0; col < Math.min(currentColumns, newColumns); col++) {
        const cellId = this.createCellId(row, col);
        newCells[cellId] = gridElement.cells[cellId] || [];
      }
    }
    
    // Create empty cells for new areas
    for (let row = 0; row < newRows; row++) {
      for (let col = 0; col < newColumns; col++) {
        const cellId = this.createCellId(row, col);
        if (!newCells[cellId]) {
          newCells[cellId] = [];
        }
      }
    }
    
    // Collect components from removed cells
    for (let row = 0; row < currentRows; row++) {
      for (let col = 0; col < currentColumns; col++) {
        if (row >= newRows || col >= newColumns) {
          const cellId = this.createCellId(row, col);
          const cellComponents = gridElement.cells[cellId] || [];
          removedComponents.push(...cellComponents);
        }
      }
    }
    
    // Update column fractions if needed
    let columnFractions = gridElement.config.columnFractions;
    if (columnFractions.length !== newColumns) {
      const equalFraction = 12 / newColumns;
      columnFractions = new Array(newColumns).fill(equalFraction);
    }
    
    const updatedGrid: GridElement = {
      ...gridElement,
      config: {
        ...gridElement.config,
        rows: newRows,
        columns: newColumns,
        columnFractions
      },
      cells: newCells
    };
    
    return { updatedGrid, removedComponents };
  }

  /**
   * Get empty cells in a grid
   */
  static getEmptyCells(gridElement: GridElement): string[] {
    const emptyCells: string[] = [];
    
    Object.entries(gridElement.cells).forEach(([cellId, components]) => {
      if (components.length === 0) {
        emptyCells.push(cellId);
      }
    });
    
    return emptyCells;
  }

  /**
   * Get total component count in grid
   */
  static getTotalComponentCount(gridElement: GridElement): number {
    return Object.values(gridElement.cells).reduce(
      (total, components) => total + components.length, 
      0
    );
  }

  /**
   * Find component in grid cells
   */
  static findComponentInGrid(gridElement: GridElement, componentId: string): {
    cellId: string;
    component: PopupElement;
    index: number;
  } | null {
    for (const [cellId, components] of Object.entries(gridElement.cells)) {
      const index = components.findIndex(comp => comp.id === componentId);
      if (index !== -1) {
        return {
          cellId,
          component: components[index],
          index
        };
      }
    }
    return null;
  }
}