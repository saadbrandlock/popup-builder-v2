
import React, { useRef, useState } from 'react';
import { Card, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useDroppable, useDndMonitor } from '@dnd-kit/core';
import type { PopupCanvasProps, DragData } from '../types';
import {
  usePopupTemplate,
  useSelectedElement,
  useBuilderActions,
  usePopupBuilderStore,
} from '../hooks';
import { DOMElementRenderer } from './DOMElementRenderer';
import { DropIndicator, CanvasDropIndicator } from './DropIndicator';
import { htmlExportUtils } from '../utils/htmlExport';

/**
 * SimpleCanvas - Modular DOM-based canvas using utility functions
 * Follows Unlayer's approach with clean separation of concerns
 */
export const SimpleCanvas: React.FC<PopupCanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const template = usePopupTemplate();
  const selectedElement = useSelectedElement();
  const { selectElement } = useBuilderActions();
  const { parsedBuilderState, draggedComponent } = usePopupBuilderStore();

  const [canvasSize] = useState({ width: 400, height: 600 });
  const [dragOverElement, setDragOverElement] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  // Make the canvas droppable for all zones
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: 'simple-canvas',
    data: {
      type: 'canvas',
      canvas: 'simple',
    },
  });

  // Monitor drag events for visual feedback
  useDndMonitor({
    onDragOver: (event) => {
      const { active, over } = event;
      const dragData = active.data.current as DragData;
      
      if ((dragData?.type === 'canvas-element' || active.id.toString().startsWith('drag-handle-')) && over) {
        // Check if dragging over another canvas element
        if (over.id.toString().startsWith('canvas-element-')) {
          const targetElementId = over.id.toString().replace('canvas-element-', '');
          setDragOverElement(targetElementId);
          
          // Calculate drop position - simple approach based on element order
          const allElements = Object.values(parsedBuilderState?.zones || {})
            .flatMap(zone => zone.components);
          
          const draggedElementId = dragData?.element?.id;
          const draggedIndex = allElements.findIndex(el => el.id === draggedElementId);
          const targetIndex = allElements.findIndex(el => el.id === targetElementId);
          
          // Default positioning logic
          let position: 'before' | 'after' = 'after';
          
          if (draggedIndex !== -1 && targetIndex !== -1) {
            // If dragging from higher index to lower index, show 'before'
            // If dragging from lower index to higher index, show 'after'  
            position = draggedIndex > targetIndex ? 'before' : 'after';
          }
          
          console.log('🎯 Drop position calculation:', {
            targetElementId,
            draggedElementId,
            draggedIndex,
            targetIndex,
            position,
            totalElements: allElements.length
          });
          
          setDropPosition(position);
        } else {
          // Not over an element
          setDragOverElement(null);
          setDropPosition(null);
        }
      }
    },
    onDragEnd: () => {
      setDragOverElement(null);
      setDropPosition(null);
    },
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking on the canvas background, not elements
    if (e.target === e.currentTarget) {
      selectElement(null);
    }
  };

  const handleExportHTML = () => {
    htmlExportUtils.exportAsFile(template, canvasSize);
  };

  const renderCanvas = () => {
    if (!parsedBuilderState) return null;

    // Collect all elements from all zones into a single canvas
    const allElements = Object.values(parsedBuilderState.zones)
      .flatMap(zone => zone.components);

    return (
      <div className="canvas-content relative w-full h-full p-4">
        {allElements.map((element: any, index: number) => (
          <React.Fragment key={element.id}>
            {/* Drop indicator before element */}
            <DropIndicator
              position="before"
              isVisible={dragOverElement === element.id && dropPosition === 'before'}
              targetElementId={element.id}
            />
            
            <DOMElementRenderer
              element={element}
              isSelected={selectedElement === element.id}
              onSelect={() => selectElement(element.id)}
              style={{
                position: 'relative',
              }}
            />
            
            {/* Drop indicator after element */}
            <DropIndicator
              position="after"
              isVisible={dragOverElement === element.id && dropPosition === 'after'}
              targetElementId={element.id}
            />
          </React.Fragment>
        ))}
        
        {/* Empty canvas indicator */}
        {allElements.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-gray-400 text-lg text-center border-2 border-dashed border-gray-300 rounded-lg p-12 w-full max-w-md">
              <div className="mb-2">Drop components here</div>
              <div className="text-sm text-gray-500">Drag components from the library to build your popup</div>
            </div>
          </div>
        )}
        
        
        {/* Canvas drop indicator for dragging from library */}
        <CanvasDropIndicator
          isVisible={isOver && draggedComponent !== null && allElements.length === 0}
        />
      </div>
    );
  };

  return (
    <div className={`flex-1 flex flex-col h-full ${className}`}>
      <Card
        title="Canvas Preview"
        variant="borderless"
        className="flex-1 flex flex-col h-full !rounded-none"
        styles={{
          body: {
            padding: 16,
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundImage: `
              linear-gradient(45deg, #f8f9fa 25%, transparent 25%),
              linear-gradient(-45deg, #f8f9fa 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #f8f9fa 75%),
              linear-gradient(-45deg, transparent 75%, #f8f9fa 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          },
        }}
        extra={<CanvasControls onExport={handleExportHTML} elementCount={
          parsedBuilderState
            ? Object.values(parsedBuilderState.zones).reduce(
                (total, zone) => total + zone.components.length,
                0
              )
            : 0
        } />}
      >
        <div
          ref={(node) => {
            canvasRef.current = node;
            setDroppableRef(node);
          }}
          data-drop-id="simple-canvas"
          className={`relative overflow-hidden border-2 bg-white shadow-lg transition-colors ${
            isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
          style={{ 
            width: canvasSize.width,
            height: canvasSize.height,
          }}
          onClick={handleCanvasClick}
        >
          {/* Render single canvas */}
          {parsedBuilderState ? (
            renderCanvas()
          ) : (
            <EmptyCanvasState />
          )}

          {/* Selection indicator */}
          {selectedElement && (
            <SelectionIndicator selectedElementId={selectedElement} />
          )}
        </div>
      </Card>
    </div>
  );
};


/**
 * Canvas controls component
 */
interface CanvasControlsProps {
  onExport: () => void;
  elementCount: number;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({ 
  onExport, 
  elementCount 
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        size="small"
        icon={<DownloadOutlined />}
        onClick={onExport}
        className="text-xs"
      >
        Export HTML
      </Button>
      <div className="text-xs text-gray-500 ml-2">
        {elementCount} elements
      </div>
    </div>
  );
};

/**
 * Empty canvas state component
 */
const EmptyCanvasState: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="text-lg mb-2">No template loaded</div>
        <div className="text-sm">Create or load a template to get started</div>
      </div>
    </div>
  );
};

/**
 * Selection indicator component
 */
interface SelectionIndicatorProps {
  selectedElementId: string;
}

const SelectionIndicator: React.FC<SelectionIndicatorProps> = ({ 
  selectedElementId 
}) => {
  return (
    <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg p-2 text-xs text-gray-600 border z-20">
      <div className="font-medium">Selected: {selectedElementId}</div>
      <div className="text-gray-500">
        Click element to select • Drag from library to add
      </div>
    </div>
  );
};