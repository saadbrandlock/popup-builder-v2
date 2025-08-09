/**
 * Container Drop Zone Component
 * Handles single drop zone for container components with visual feedback
 */

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { ContainerElement } from '../types';

interface ContainerDropZoneProps {
  container: ContainerElement;
  children: React.ReactNode;
  onDrop?: (elementId: string, position: number) => void;
  className?: string;
  showDropIndicator?: boolean;
}

export const ContainerDropZone: React.FC<ContainerDropZoneProps> = ({
  container,
  children,
  onDrop: _onDrop,
  className = '',
  showDropIndicator = true,
}) => {
  const dropZoneId = `container-${container.id}`;
  
  const { isOver, setNodeRef, active } = useDroppable({
    id: dropZoneId,
    data: {
      type: 'container',
      containerId: container.id,
      accepts: container.constraints.allowedChildren,
      maxChildren: container.constraints.maxChildren,
      currentChildCount: container.children.length,
    },
  });

  const isDragActive = !!active;
  const canAcceptDrop = isDragActive && isOver;
  const isEmpty = container.children.length === 0;

  // Container layout styles
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: container.config.layout === 'vertical' ? 'column' : 'row',
    gap: container.config.gap,
    padding: container.config.padding,
    minHeight: isEmpty ? '80px' : 'auto',
    position: 'relative',
    border: isEmpty ? '2px dashed #d9d9d9' : '1px solid transparent',
    borderRadius: '8px',
    backgroundColor: isEmpty ? '#fafafa' : 'transparent',
    transition: 'all 0.2s ease',
    ...container.config.style,
  };

  // Drop zone overlay styles
  const dropOverlayStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: '2px dashed #1890ff',
    borderRadius: '8px',
    backgroundColor: 'rgba(24, 144, 255, 0.1)',
    pointerEvents: 'none',
    zIndex: 10,
    opacity: canAcceptDrop ? 1 : 0,
    transition: 'opacity 0.2s ease',
  };

  const emptyStateStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
    fontSize: '14px',
    fontStyle: 'italic',
    height: '100%',
    minHeight: '60px',
  };

  return (
    <div
      ref={setNodeRef}
      className={`container-drop-zone ${className}`}
      style={containerStyles}
      data-container-id={container.id}
      data-container-type="container"
    >
      {/* Drop overlay for visual feedback */}
      {showDropIndicator && (
        <div style={dropOverlayStyles} className="container-drop-overlay" />
      )}

      {/* Empty state */}
      {isEmpty && !isDragActive && (
        <div style={emptyStateStyles} className="container-empty-state">
          Drop components here
        </div>
      )}

      {/* Container children */}
      {children}

      {/* Drop indicator for drag active state */}
      {isDragActive && isOver && isEmpty && (
        <div style={emptyStateStyles} className="container-drop-indicator">
          <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
            Drop here to add to container
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Container Child Drop Indicator
 * Shows where components will be inserted between existing children
 */
interface ContainerChildDropIndicatorProps {
  containerId: string;
  position: number;
  isVisible: boolean;
  layout: 'vertical' | 'horizontal';
}

export const ContainerChildDropIndicator: React.FC<ContainerChildDropIndicatorProps> = ({
  containerId,
  position,
  isVisible,
  layout,
}) => {
  if (!isVisible) return null;

  const indicatorStyles: React.CSSProperties = {
    width: layout === 'vertical' ? '100%' : '4px',
    height: layout === 'vertical' ? '4px' : '100%',
    backgroundColor: '#1890ff',
    borderRadius: '2px',
    margin: layout === 'vertical' ? '4px 0' : '0 4px',
    transition: 'all 0.2s ease',
    boxShadow: '0 0 8px rgba(24, 144, 255, 0.5)',
    zIndex: 100,
  };

  return (
    <div
      className="container-child-drop-indicator"
      style={indicatorStyles}
      data-container-id={containerId}
      data-position={position}
    />
  );
};

/**
 * Container Boundary Indicator
 * Shows container boundaries and nesting level
 */
interface ContainerBoundaryIndicatorProps {
  container: ContainerElement;
  isSelected: boolean;
  nestingLevel: number;
}

export const ContainerBoundaryIndicator: React.FC<ContainerBoundaryIndicatorProps> = ({
  container: _container,
  isSelected,
  nestingLevel,
}) => {
  const boundaryStyles: React.CSSProperties = {
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    border: isSelected ? '2px solid #1890ff' : '1px solid #e8e8e8',
    borderRadius: '8px',
    pointerEvents: 'none',
    zIndex: 1,
    transition: 'all 0.2s ease',
  };

  const labelStyles: React.CSSProperties = {
    position: 'absolute',
    top: '-24px',
    left: '0',
    backgroundColor: isSelected ? '#1890ff' : '#666',
    color: 'white',
    padding: '2px 8px',
    fontSize: '12px',
    borderRadius: '4px',
    fontWeight: 'bold',
    zIndex: 2,
  };

  return (
    <div className="container-boundary-indicator">
      <div style={boundaryStyles} />
      <div style={labelStyles}>
        Container{nestingLevel > 0 && ` (Level ${nestingLevel})`}
      </div>
    </div>
  );
};

/**
 * Container Component Wrapper
 * Main wrapper that combines drop zone, boundaries, and children
 */
interface ContainerComponentWrapperProps {
  container: ContainerElement;
  children: React.ReactNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDrop?: (elementId: string, position: number) => void;
  showBoundaries?: boolean;
  className?: string;
}

export const ContainerComponentWrapper: React.FC<ContainerComponentWrapperProps> = ({
  container,
  children,
  isSelected,
  onSelect,
  onDrop,
  showBoundaries = true,
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(container.id);
  };

  const wrapperStyles: React.CSSProperties = {
    position: 'relative',
    cursor: 'pointer',
  };

  return (
    <div
      className={`container-wrapper ${className}`}
      style={wrapperStyles}
      onClick={handleClick}
      data-container-id={container.id}
    >
      {/* Boundary indicator */}
      {showBoundaries && (
        <ContainerBoundaryIndicator
          container={container}
          isSelected={isSelected}
          nestingLevel={container.position.nestingLevel}
        />
      )}

      {/* Drop zone */}
      <ContainerDropZone
        container={container}
        onDrop={onDrop}
        className="container-main-drop-zone"
      >
        {children}
      </ContainerDropZone>
    </div>
  );
};