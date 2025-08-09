import React, { useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { PopupElement } from '../types';
import type { GridCellStyles } from '../../../types/grid';
import { GridManager } from '../utils/gridManager';
import { DOMElementRenderer } from './DOMElementRenderer';
import { usePopupBuilderStore } from '../stores/popupBuilderStore';

interface GridCellDropZoneProps {
  gridId: string;
  cellId: string;
  row: number;
  col: number;
  components: PopupElement[];
  onSelect: (childId: string, e: React.MouseEvent) => void;
  nestingLevel: number;
  cellStyle?: GridCellStyles;
  isGridSelected: boolean;
}

/**
 * GridCellDropZone - Individual grid cell that accepts component drops
 * Following the architecture design from advanced-dnd-features-plan.md
 */
export const GridCellDropZone: React.FC<GridCellDropZoneProps> = ({ 
  gridId, 
  cellId, 
  row,
  col,
  components, 
  onSelect, 
  nestingLevel,
  cellStyle,
  isGridSelected
}) => {
  const selectedElement = usePopupBuilderStore(state => state.selectedElement);
  
  // Make this cell a droppable zone
  const { setNodeRef, isOver } = useDroppable({
    id: GridManager.getCellDropZoneId(gridId, cellId),
    data: { 
      type: 'grid-cell',
      gridId,
      cellId,
      cellCoordinates: GridManager.parseCellId(cellId),
      row,
      col,
      components: components.length
    }
  });

  // Handle component selection within this cell
  const handleComponentSelect = useCallback((componentId: string) => {
    return (e: React.MouseEvent) => {
      onSelect(componentId, e);
    };
  }, [onSelect]);

  const isEmpty = components.length === 0;
  
  // Calculate cell styles
  const cellStyles: React.CSSProperties = {
    minHeight: '60px',
    padding: '8px',
    border: isOver 
      ? '2px solid #1890ff' 
      : isEmpty 
        ? '1px dashed #d1d5db' 
        : '1px solid #e5e7eb',
    borderRadius: '4px',
    backgroundColor: isOver 
      ? 'rgba(24, 144, 255, 0.1)' 
      : isEmpty 
        ? 'rgba(0, 0, 0, 0.02)' 
        : 'transparent',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    position: 'relative',
    cursor: isEmpty ? 'default' : 'pointer',
    // Apply custom cell styles
    ...cellStyle,
    // Override with drag state styles
    ...(isOver && {
      backgroundColor: 'rgba(24, 144, 255, 0.1)',
      borderColor: '#1890ff',
      borderStyle: 'solid'
    })
  };

  // Cell coordinates label (only show when grid is selected and cell is empty)
  const showCellLabel = isGridSelected && isEmpty;

  return (
    <div 
      ref={setNodeRef}
      className={`grid-cell ${isOver ? 'drag-over' : ''} ${isEmpty ? 'empty' : 'has-content'}`}
      style={cellStyles}
      data-cell-id={cellId}
      data-grid-id={gridId}
      data-row={row}
      data-col={col}
    >
      {/* Cell coordinates label */}
      {showCellLabel && (
        <div
          style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            backgroundColor: 'rgba(24, 144, 255, 0.8)',
            color: 'white',
            padding: '1px 4px',
            fontSize: '10px',
            borderRadius: '2px',
            fontWeight: 'bold',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        >
          {row},{col}
        </div>
      )}

      {/* Render components in this cell */}
      {components.length > 0 ? (
        components.map((component) => (
          <DOMElementRenderer
            key={component.id}
            element={component}
            isSelected={selectedElement === component.id}
            onSelect={handleComponentSelect(component.id)}
            nestingLevel={nestingLevel}
            parentContainer={gridId}
            parentCell={cellId}
          />
        ))
      ) : (
        /* Empty cell placeholder */
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '12px',
            height: '100%',
            minHeight: '40px',
            fontStyle: 'italic',
            pointerEvents: 'none',
            textAlign: 'center',
            opacity: isOver ? 0.7 : 0.5,
            transition: 'opacity 0.2s ease'
          }}
        >
          {isOver ? 'Drop here' : 'Empty cell'}
        </div>
      )}

      {/* Drop indicator overlay */}
      {isOver && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(24, 144, 255, 0.1)',
            border: '2px solid #1890ff',
            borderRadius: '4px',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#1890ff',
            fontWeight: 'bold'
          }}
        >
          Drop component here
        </div>
      )}
    </div>
  );
};