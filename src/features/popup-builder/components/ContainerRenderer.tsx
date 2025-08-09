import { useDroppable } from '@dnd-kit/core';
import { useCallback } from 'react';
import { useBuilderActions, usePopupBuilderStore } from '../stores';
import { ContainerElement, PopupElement } from '../types';
import { DOMElementRenderer } from './DOMElementRenderer';

/**
 * Enhanced Container Renderer - Supports recursive child rendering
 */
interface ContainerRendererProps {
  element: ContainerElement | PopupElement;
  isSelected: boolean;
  onSelect?: () => void;
  nestingLevel: number;
  [key: string]: any; // For spread props
}

const ContainerRenderer: React.FC<ContainerRendererProps> = ({
  element,
  isSelected,
  onSelect,
  nestingLevel,
  ...props
}) => {
  const actions = useBuilderActions();
  const selectedElement = usePopupBuilderStore(
    (state) => state.selectedElement
  );

  const hasChildren = element.children && element.children.length > 0;

  // Make the container a droppable zone for new components
  const { setNodeRef: setContainerRef, isOver: isContainerOver } = useDroppable(
    {
      id: `container-${element.id}`,
      data: {
        type: 'container',
        containerId: element.id,
        accepts: ['title', 'text', 'button', 'image'], // TODO: Get from component constraints
      },
    }
  );

  const handleSelect = useCallback(() => {
    actions.selectElement(element.id);
    onSelect?.();
  }, [actions, element.id, onSelect]);

  // Proper child click handler that prevents parent container selection
  const handleChildClick = useCallback(
    (childId: string, e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent parent container selection
      console.log('🎯 Child element clicked:', childId);
      actions.selectElement(childId);
    },
    [actions]
  );

  return (
    <div
      ref={setContainerRef}
      style={{
        border: isSelected
          ? '2px solid #1890ff'
          : isContainerOver
            ? '2px dashed #1890ff'
            : '1px dashed #d9d9d9',
        borderRadius: '8px',
        padding: '16px',
        minHeight: hasChildren ? 'auto' : '80px',
        backgroundColor: hasChildren
          ? isContainerOver
            ? 'rgba(24, 144, 255, 0.05)'
            : 'transparent'
          : isContainerOver
            ? 'rgba(24, 144, 255, 0.1)'
            : '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.2s ease',
        position: 'relative',
        cursor: 'pointer',
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect();
      }}
      data-container-id={element.id}
      {...props}
    >
      {/* Container label */}
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
          Container
        </div>
      )}

      {/* Render children if they exist */}
      {hasChildren ? (
        element.children!.map((child) => (
          <DOMElementRenderer
            key={child.id}
            element={child}
            isSelected={selectedElement === child.id}
            onSelect={(e) => handleChildClick(child.id, e as React.MouseEvent)}
            nestingLevel={nestingLevel + 1}
            parentContainer={element.id}
          />
        ))
      ) : (
        /* Empty container placeholder */
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '14px',
            height: '100%',
            minHeight: '60px',
            fontStyle: 'italic',
            pointerEvents: 'none', // Don't interfere with container click
          }}
        >
          Drop components here
        </div>
      )}
    </div>
  );
};

export default ContainerRenderer;
