import React, { useCallback } from 'react';
import type { GridElement } from '../types';
import { usePopupBuilderStore, useBuilderActions } from '../stores/popupBuilderStore';
import { GridManager } from '../utils/gridManager';
import { GridCellDropZone } from './GridCellDropZone';

interface GridRendererProps {
  element: GridElement;
  isSelected: boolean;
  onSelect: (e?: React.MouseEvent) => void;
  nestingLevel?: number;
}

/**
 * GridRenderer - Renders grid components with multi-cell drop zones
 * Following the architecture design from advanced-dnd-features-plan.md
 */
export const GridRenderer: React.FC<GridRendererProps> = ({ 
  element, 
  isSelected, 
  onSelect, 
  nestingLevel = 0 
}) => {
  const actions = useBuilderActions();
  const selectedElement = usePopupBuilderStore(state => state.selectedElement);
  
  const { rows, columns, cells, config } = element;
  
  // Handle grid selection
  const handleGridSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🎯 Grid selected:', element.id);
    actions.selectElement(element.id);
    onSelect?.(e);
  }, [actions, element.id, onSelect]);

  // Handle child element selection
  const handleChildClick = useCallback((childId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent grid selection
    console.log('🎯 Grid child element clicked:', childId);
    actions.selectElement(childId);
  }, [actions]);

  // Calculate grid styles
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: GridManager.getGridTemplateColumns(config.columnFractions),
    gridTemplateRows: GridManager.getGridTemplateRows(rows, config.cellMinHeight || '100px'),
    gap: config.gap,
    border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
    borderRadius: '6px',
    padding: '8px',
    position: 'relative',
    minHeight: `${rows * 100}px`, // Minimum height based on rows
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ...config.style
  };

  // Grid container styles
  const gridContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
  };

  // Render individual grid cells
  const renderGridCells = () => {
    const cellElements: React.ReactElement[] = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const cellId = GridManager.createCellId(row, col);
        const cellComponents = cells[cellId] || [];
        
        cellElements.push(
          <GridCellDropZone
            key={cellId}
            gridId={element.id}
            cellId={cellId}
            row={row}
            col={col}
            components={cellComponents}
            onSelect={handleChildClick}
            nestingLevel={nestingLevel + 1}
            cellStyle={config.cellStyle}
            isGridSelected={isSelected}
          />
        );
      }
    }
    
    return cellElements;
  };

  return (
    <div style={gridContainerStyle}>
      {/* Grid selection label */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '-24px',
            left: '0',
            backgroundColor: '#1890ff',
            color: 'white',
            padding: '2px 8px',
            fontSize: '12px',
            borderRadius: '4px',
            fontWeight: 'bold',
            zIndex: 2,
          }}
        >
          Grid ({rows}×{columns})
        </div>
      )}
      
      {/* Main grid container */}
      <div 
        style={gridStyle}
        onClick={handleGridSelect}
        data-grid-id={element.id}
        data-grid-rows={rows}
        data-grid-columns={columns}
        className="popup-grid"
      >
        {renderGridCells()}
      </div>
      
      {/* Grid info overlay when selected */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            bottom: '-24px',
            right: '0',
            backgroundColor: 'rgba(24, 144, 255, 0.9)',
            color: 'white',
            padding: '2px 8px',
            fontSize: '11px',
            borderRadius: '4px',
            fontWeight: 'normal',
            opacity: 0.8,
            zIndex: 2,
          }}
        >
          {GridManager.getTotalComponentCount(element)} components
        </div>
      )}
    </div>
  );
};