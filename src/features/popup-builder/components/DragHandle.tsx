import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { DragOutlined } from '@ant-design/icons';
import type { PopupElement, DragData } from '../types';

interface DragHandleProps {
  element: PopupElement;
  isSelected: boolean;
  className?: string;
}

/**
 * DragHandle - Provides drag functionality for canvas elements
 * Appears when element is selected and enables reordering within canvas
 */
export const DragHandle: React.FC<DragHandleProps> = ({
  element,
  isSelected,
  className = '',
}) => {
  const dragData: DragData = {
    type: 'canvas-element',
    element,
  };

  const {

    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `drag-handle-${element.id}`,
    data: dragData,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Show drag handle when element is selected
  if (!isSelected) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute -top-2 -left-2 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center cursor-grab shadow-lg transition-all hover:bg-blue-600 hover:scale-110 z-50 border-2 border-white ${
        isDragging ? 'cursor-grabbing opacity-75 scale-105' : ''
      } ${className}`}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      title="Drag to reorder"
    >
      <DragOutlined 
        style={{ fontSize: '12px', color: 'black' }} 
      />
    </div>
  );
};