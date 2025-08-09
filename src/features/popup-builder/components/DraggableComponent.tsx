import React, { Suspense } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, Tooltip } from 'antd';
import type { ComponentConfig } from '../types';
import { useCanAddComponent, useInstanceCount } from '../hooks';
import dynamicImportLucideIcon from '../../../lib/utils/dynamic-icons';

interface DraggableComponentProps {
  component: ComponentConfig;
  disabled?: boolean;
  className?: string;
}

/**
 * DraggableComponent - Represents a draggable component in the component library
 * Can be dragged from the library to the canvas to create new popup elements
 */
export const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  disabled = false,
  className = '',
}) => {
  const canAdd = useCanAddComponent(component.type);
  const instanceCount = useInstanceCount(component.type);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `component-${component.type}`,
      data: {
        type: 'component',
        component,
      },
      disabled: disabled || !canAdd,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const isDisabled = disabled || !canAdd;
  const maxReached = component.max_instances !== null && instanceCount >= component.max_instances;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative mb-2 ${className} ${isDragging ? 'opacity-30 z-[1000]' : ''} transition-opacity duration-200`}
      {...listeners}
      {...attributes}
    >
      <Tooltip
        title={
          maxReached
            ? `Maximum ${component.max_instances} instances reached`
            : component.max_instances === null
            ? `${component.name} component (unlimited)`
            : `${component.name} component`
        }
        placement="top"
      >
        <Card
          size="small"
          hoverable={!isDisabled}
          className={`
            text-center
            ${isDisabled ? 'opacity-50 bg-gray-100' : 'hover:border-blue-500 hover:shadow-lg'}
            ${isDragging ? 'transform rotate-3 shadow-xl' : ''}
            ${maxReached ? 'border-red-500 bg-red-50' : ''}
          `}
          bodyStyle={{
            padding: '12px',
            cursor: isDisabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          }}
        >
          <div className="component-icon">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mb-2 mx-auto">
              <Suspense fallback={
                <span className="text-blue-600 text-sm font-bold">
                  {component.icon_name?.charAt(0).toUpperCase() || component.name.charAt(0).toUpperCase()}
                </span>
              }>
                {component.icon_name ? (() => {
                  const IconComponent = dynamicImportLucideIcon(component.icon_name);
                  return <IconComponent className="w-5 h-5 text-blue-600" />;
                })() : (
                  <span className="text-blue-600 text-sm font-bold">
                    {component.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </Suspense>
            </div>
          </div>

          <div className="component-info">
            <div className="component-name text-xs font-medium text-gray-800 mb-1">
              {component.name}
            </div>

            <div className="component-meta text-xs text-gray-500">
              {instanceCount}/{component.max_instances ?? '∞'}
            </div>
          </div>

          {maxReached && (
            <div className="max-indicator absolute top-1 right-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          )}
        </Card>
      </Tooltip>
    </div>
  );
};
