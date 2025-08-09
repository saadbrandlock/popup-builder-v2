import React, { useCallback, Suspense } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragOverlay,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import type {
  ComponentConfig,
  PopupElement,
  DragData,
  ZoneType,
} from '../types';
import { useBuilderActions, usePopupBuilderStore } from '../stores';
import { GridManager } from '../utils/gridManager';
import dynamicImportLucideIcon from '../../../lib/utils/dynamic-icons';

/**
 * Custom hook for drag and drop functionality
 * Handles component dragging from library to canvas and element reordering
 */
export const useDragAndDrop = () => {
  const { template, parsedBuilderState } = usePopupBuilderStore();
  const {
    startDrag,
    endDrag,
    addElement,
    addElementToContainer,
    addElementToGridCell,
    reorderContainerChildren,
    moveElementBetweenContainers,
    moveElementToContainer,
    moveElementToZone,
    selectElement,
    reorderElements,
  } = useBuilderActions();

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Handle drag start event
   */
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const dragData = active.data.current as DragData;

      if (dragData?.type === 'component') {
        startDrag(dragData.component!);
      } else if (dragData?.type === 'canvas-element' || active.id.toString().startsWith('drag-handle-')) {
        if (dragData?.element) {
          selectElement(dragData.element.id);
        }
        startDrag(null);
      } else if (dragData?.type === 'element') {
        selectElement(dragData.element!.id);
      }
    },
    [startDrag, selectElement]
  );

  /**
   * Handle drag over event (for visual feedback)
   */
  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Visual feedback is handled by SimpleCanvas component
  }, []);

  /**
   * Calculate drop position relative to target element
   */
  const calculateDropPosition = useCallback(
    (event: DragEndEvent, targetElementId: string): 'before' | 'after' => {
      // Get the target and dragged elements
      const targetElement = document.querySelector(`[data-element-id="${targetElementId}"]`);
      const dragData = event.active.data.current as DragData;
      const draggedElement = document.querySelector(`[data-element-id="${dragData?.element?.id}"]`);
      
      if (!targetElement || !draggedElement) return 'after';

      const targetRect = targetElement.getBoundingClientRect();
      const draggedRect = draggedElement.getBoundingClientRect();
      
      // Compare centers to determine position
      const targetCenterY = targetRect.top + targetRect.height / 2;
      const draggedCenterY = draggedRect.top + draggedRect.height / 2;

      // If dragged element center is above target center, insert before; otherwise after
      return draggedCenterY < targetCenterY ? 'before' : 'after';
    },
    []
  );

  /**
   * Handle canvas element reordering with position-based logic
   */
  const handleCanvasElementReorder = useCallback(
    (activeId: string, targetId: string, position: 'before' | 'after') => {
      console.log('🔄 handleCanvasElementReorder called:', { activeId, targetId, position });
      
      if (!parsedBuilderState || activeId === targetId) {
        console.log('❌ Early return:', { parsedBuilderState: !!parsedBuilderState, sameId: activeId === targetId });
        return;
      }

      // For single canvas, all elements are in content zone
      const zoneComponents = parsedBuilderState.zones.content.components;
      const activeIndex = zoneComponents.findIndex((el) => el.id === activeId);
      const targetIndex = zoneComponents.findIndex((el) => el.id === targetId);
      
      console.log('📍 Element indices:', { activeIndex, targetIndex, totalElements: zoneComponents.length });

      if (activeIndex !== -1 && targetIndex !== -1) {
        // Calculate new position based on drop position
        let newIndex;
        if (position === 'before') {
          newIndex = targetIndex;
          // If moving from after to before, don't adjust
        } else { // position === 'after'
          newIndex = targetIndex + 1;
          // If moving from before target to after, adjust for removal
          if (activeIndex < targetIndex) {
            newIndex = targetIndex; // Element will be removed, so target moves up
          }
        }

        console.log('✅ Calling reorderElements:', { zone: 'content', fromIndex: activeIndex, toIndex: newIndex });
        
        // Use the new reorderElements action
        reorderElements('content', activeIndex, newIndex);
      } else {
        console.log('❌ Element not found in components array');
      }
    },
    [parsedBuilderState, reorderElements]
  );

  /**
   * Handle canvas background drop - find closest element or append at end
   */
  /**
   * Enhanced element reordering that handles containers and nested elements
   */
  const handleElementReorderWithContainers = useCallback(
    (activeId: string, targetId: string, position: 'before' | 'after') => {
      console.log('🔄 handleElementReorderWithContainers called:', { activeId, targetId, position });
      
      if (!parsedBuilderState || activeId === targetId) {
        console.log('❌ Early return:', { parsedBuilderState: !!parsedBuilderState, sameId: activeId === targetId });
        return;
      }

      // Enhanced recursive tree traversal with full support for nested structures
      const findElementInTree = (elementId: string): { element: PopupElement; parent: PopupElement | null; parentZone: string | null; siblingIndex: number; parentCell?: string } | null => {
        interface TreePath {
          zoneName: string;
          isInContainer: boolean;
          containerId?: string;
          isInGridCell?: boolean;
          cellId?: string;
        }

        const searchWithPath = (elements: PopupElement[], path: TreePath, parentElement: PopupElement | null): { element: PopupElement; parent: PopupElement | null; parentZone: string; siblingIndex: number; parentCell?: string } | null => {
          for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            
            if (element.id === elementId) {
              return { 
                element, 
                parent: parentElement, 
                parentZone: path.zoneName, 
                siblingIndex: i,
                parentCell: path.cellId
              };
            }
            
            // RECURSIVE SEARCH FOR CONTAINER CHILDREN
            if (element.children && element.children.length > 0) {
              const found = searchWithPath(element.children, {
                ...path,
                containerId: element.id,
                isInContainer: true
              }, element);
              if (found) return found;
            }
            
            // RECURSIVE SEARCH FOR GRID CELLS
            if (element.type === 'grid' && (element as any).cells) {
              const gridElement = element as any;
              for (const [cellId, cellComponents] of Object.entries(gridElement.cells)) {
                if (Array.isArray(cellComponents)) {
                  const found = searchWithPath(cellComponents, {
                    ...path,
                    containerId: element.id,
                    isInGridCell: true,
                    cellId
                  }, element);
                  if (found) return found;
                }
              }
            }
          }
          return null;
        };
        
        // Search all zones recursively
        for (const [zoneName, zone] of Object.entries(parsedBuilderState.zones)) {
          const found = searchWithPath(zone.components, { zoneName, isInContainer: false }, null);
          if (found) return found;
        }
        return null;
      };

      const activeInfo = findElementInTree(activeId);
      const targetInfo = findElementInTree(targetId);

      if (!activeInfo || !targetInfo) {
        console.log('❌ Could not find active or target element');
        return;
      }

      console.log('📍 Element locations:', { 
        active: { parent: activeInfo.parent?.id, zone: activeInfo.parentZone, index: activeInfo.siblingIndex },
        target: { parent: targetInfo.parent?.id, zone: targetInfo.parentZone, index: targetInfo.siblingIndex }
      });

      // Same parent (including both being root elements in same zone)
      if (activeInfo.parent?.id === targetInfo.parent?.id && activeInfo.parentZone === targetInfo.parentZone) {
        console.log('🔄 Moving within same container/zone');
        
        if (activeInfo.parent) {
          // Moving within a container
          const container = activeInfo.parent;
          const children = [...container.children!];
          const [movedElement] = children.splice(activeInfo.siblingIndex, 1);
          
          let newIndex = targetInfo.siblingIndex;
          if (position === 'after') newIndex++;
          if (activeInfo.siblingIndex < targetInfo.siblingIndex && position === 'before') newIndex--;
          
          children.splice(newIndex, 0, movedElement);
          
          // Update the container in the store
          const updatedZones = JSON.parse(JSON.stringify(parsedBuilderState.zones));
          const containerIndex = updatedZones[activeInfo.parentZone].components.findIndex((c: PopupElement) => c.id === container.id);
          updatedZones[activeInfo.parentZone].components[containerIndex].children = children.map((child, index) => ({
            ...child,
            order: index
          }));

          // Update store using the new action
          reorderContainerChildren(container.id, children);
          
        } else {
          // Moving within same zone (root level)
          reorderElements(activeInfo.parentZone as ZoneType, activeInfo.siblingIndex, targetInfo.siblingIndex + (position === 'after' ? 1 : 0));
        }
      } else {
        console.log('🔄 Moving between different containers/zones');
        
        // Calculate target position
        let targetPosition = targetInfo.siblingIndex;
        if (position === 'after') targetPosition++;
        
        // Handle different cross-container scenarios
        if (targetInfo.parent && activeInfo.parent) {
          // Container to container move
          console.log('📦 Moving from container to container');
          moveElementBetweenContainers(
            activeInfo.parent.id,
            targetInfo.parent.id,
            activeInfo.element.id,
            targetPosition
          );
        } else if (targetInfo.parent && !activeInfo.parent) {
          // Zone to container move
          console.log('🌍 Moving from zone to container');
          moveElementToContainer(
            activeInfo.element.id,
            targetInfo.parent.id,
            targetPosition
          );
        } else if (!targetInfo.parent && activeInfo.parent) {
          // Container to zone move
          console.log('📦 Moving from container to zone');
          moveElementToZone(
            activeInfo.element.id,
            targetInfo.parentZone as ZoneType,
            targetPosition
          );
        } else {
          // Zone to zone move (different zones)
          console.log('🌍 Moving between different zones');
          moveElementToZone(
            activeInfo.element.id,
            targetInfo.parentZone as ZoneType,
            targetPosition
          );
        }
      }
    },
    [parsedBuilderState, template, reorderElements, reorderContainerChildren, moveElementBetweenContainers, moveElementToContainer, moveElementToZone]
  );

  /**
   * Handle dropping a component into a grid cell
   */
  const handleGridCellDrop = useCallback(
    (component: ComponentConfig, cellDropZoneId: string) => {
      console.log('🏗️ handleGridCellDrop called:', { componentType: component.type, cellDropZoneId });
      
      if (!parsedBuilderState) {
        console.log('❌ No parsed builder state');
        return;
      }

      // Parse the grid cell drop zone ID using GridManager
      const parseResult = GridManager.parseDropZoneId(`grid-${cellDropZoneId}`);
      
      if (!parseResult) {
        console.log('❌ Invalid grid cell drop zone ID format:', cellDropZoneId);
        return;
      }

      const { gridId, cellId } = parseResult;
      const cellCoordinates = GridManager.parseCellId(cellId);

      console.log('🔍 Parsed grid drop info:', { gridId, cellId, cellCoordinates });

      // Find the grid element
      let gridElement: any = null;
      let gridZone: ZoneType | null = null;

      // Search for the grid in all zones
      for (const [zoneName, zone] of Object.entries(parsedBuilderState.zones)) {
        const found = zone.components.find(el => el.id === gridId && el.type === 'grid');
        if (found) {
          gridElement = found;
          gridZone = zoneName as ZoneType;
          break;
        }
      }

      if (!gridElement || !gridZone) {
        console.log('❌ Grid not found:', gridId);
        return;
      }

      console.log('✅ Grid found:', { gridElement: gridElement.id, gridZone, cellId });

      // Create new element for the grid cell
      const newElement: PopupElement = {
        id: `${component.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: component.type,
        zone: gridZone, // Use the grid's zone
        config: { ...component.default_config_json },
        order: 0, // Will be handled by grid cell logic
      };

      // Add element to the grid cell using a new store action
      addElementToGridCell(component.type, gridId, cellId);
      
      console.log('✅ Component added to grid cell via store method');
    },
    [parsedBuilderState, addElementToGridCell]
  );

  /**
   * Handle dropping a component into a container
   */
  const handleContainerDrop = useCallback(
    (component: ComponentConfig, containerId: string) => {
      console.log('🏗️ handleContainerDrop called:', { componentType: component.type, containerId });
      
      if (!parsedBuilderState) {
        console.log('❌ No parsed builder state');
        return;
      }

      // Find the container element
      let containerElement: PopupElement | null = null;
      let containerZone: ZoneType | null = null;

      // Search for the container in all zones
      for (const [zoneName, zone] of Object.entries(parsedBuilderState.zones)) {
        const found = zone.components.find(el => el.id === containerId && el.type === 'container');
        if (found) {
          containerElement = found;
          containerZone = zoneName as ZoneType;
          break;
        }
      }

      if (!containerElement || !containerZone) {
        console.log('❌ Container not found:', containerId);
        return;
      }

      console.log('✅ Container found:', { containerElement, containerZone });

      // Create new element for the container
      const newElement: PopupElement = {
        id: `${component.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: component.type,
        zone: containerZone, // Use the container's zone for now
        config: { ...component.default_config_json },
        order: 0, // Will be handled by container logic
      };

      // Use the new store method to add element to container
      addElementToContainer(component.type, containerId);
      
      console.log('✅ Component added to container via store method');
    },
    [parsedBuilderState, addElementToContainer]
  );

  const handleCanvasBackgroundDrop = useCallback(
    (event: DragEndEvent, element?: PopupElement) => {
      if (!element || !parsedBuilderState) return;
      
      console.log('🎨 handleCanvasBackgroundDrop called for element:', element.id);
      
      // Get all elements in content zone
      const zoneComponents = parsedBuilderState.zones.content.components;
      if (zoneComponents.length <= 1) {
        console.log('📝 Only one element or less, nothing to reorder');
        return;
      }
      
      // Get the drop coordinates
      const dropY = event.activatorEvent?.clientY || 0;
      console.log('📍 Drop Y coordinate:', dropY);
      
      // Get canvas bounds to detect edge drops - use same logic as visual feedback
      const canvasElement = document.querySelector('[data-drop-id="simple-canvas"]');
      const draggedElement = document.querySelector(`[data-element-id="${element.id}"]`);
      let isEdgeDrop = false;
      let edgePosition: 'top' | 'bottom' | null = null;
      
      if (canvasElement && draggedElement) {
        const canvasRect = canvasElement.getBoundingClientRect();
        const draggedRect = draggedElement.getBoundingClientRect();
        const draggedCenterY = draggedRect.top + draggedRect.height / 2;
        const relativeY = draggedCenterY - canvasRect.top;
        const edgeThreshold = 80; // Same as visual feedback
        
        console.log('🎯 Edge drop detection (fixed):', { 
          draggedCenterY, 
          canvasTop: canvasRect.top, 
          relativeY, 
          canvasHeight: canvasRect.height,
          edgeThreshold 
        });
        
        if (relativeY < edgeThreshold) {
          isEdgeDrop = true;
          edgePosition = 'top';
        } else if (relativeY > canvasRect.height - edgeThreshold) {
          isEdgeDrop = true;
          edgePosition = 'bottom';
        }
      }
      
      console.log('🎯 Edge drop detection:', { isEdgeDrop, edgePosition });
      
      if (isEdgeDrop) {
        // Handle edge drops - move to beginning or end
        const activeIndex = zoneComponents.findIndex((el) => el.id === element.id);
        if (activeIndex !== -1) {
          const newIndex = edgePosition === 'top' ? 0 : zoneComponents.length - 1;
          console.log('🔝 Edge drop: moving to', edgePosition, 'activeIndex:', activeIndex, 'newIndex:', newIndex);
          
          // Only reorder if position actually changes
          if (activeIndex !== newIndex) {
            reorderElements('content', activeIndex, newIndex);
          } else {
            console.log('📍 No reorder needed - already at target position');
          }
        }
      } else {
        // Find the closest element based on Y position (existing logic)
        let closestElement = null;
        let closestDistance = Infinity;
        let insertPosition: 'before' | 'after' = 'after';
        
        for (const comp of zoneComponents) {
          if (comp.id === element.id) continue; // Skip self
          
          const elementDOM = document.querySelector(`[data-element-id="${comp.id}"]`);
          if (elementDOM) {
            const rect = elementDOM.getBoundingClientRect();
            const elementCenterY = rect.top + rect.height / 2;
            const distance = Math.abs(dropY - elementCenterY);
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestElement = comp;
              insertPosition = dropY < elementCenterY ? 'before' : 'after';
            }
          }
        }
        
        if (closestElement) {
          console.log('🎯 Closest element found:', closestElement.id, 'position:', insertPosition);
          handleElementReorderWithContainers(element.id, closestElement.id, insertPosition);
        } else {
          console.log('❌ No closest element found');
        }
      }
    },
    [parsedBuilderState, handleElementReorderWithContainers, reorderElements]
  );

  /**
   * Handle drag end event
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      console.log('🎯 Drag End:', { activeId: active.id, overId: over?.id });

      if (!over) {
        console.log('❌ No drop target');
        endDrag();
        return;
      }

      const dragData = active.data.current as DragData;
      const dropZone = over.id as string;
      console.log('📦 Drag data:', { type: dragData?.type, elementId: dragData?.element?.id });

      if (dragData?.type === 'component') {
        // Dropping a component from library to canvas
        if (dropZone.startsWith('container-')) {
          // Dropping into a container
          const containerId = dropZone.replace('container-', '');
          console.log('📦 Dropping component into container:', containerId);
          handleContainerDrop(dragData.component!, containerId);
        } else if (dropZone.startsWith('grid-cell-')) {
          // Dropping into a grid cell
          const cellDropZoneId = dropZone.replace('grid-cell-', '');
          console.log('🏗️ Dropping component into grid cell:', cellDropZoneId);
          handleGridCellDrop(dragData.component!, cellDropZoneId);
        } else {
          // Dropping into regular zone
          const targetZone = determineDropZone(event, dropZone);
          if (targetZone) {
            addElement(dragData.component!.type, targetZone);
          }
        }
      } else if (dragData?.type === 'canvas-element' || active.id.toString().startsWith('drag-handle-')) {
        // Reordering an existing canvas element
        console.log('🔄 Canvas element drag detected, dropZone:', dropZone);
        
        if (over.id.toString().startsWith('canvas-element-')) {
          // Dropped on another element - reorder relative to that element
          const targetElementId = over.id.toString().replace('canvas-element-', '');
          const dropPosition = calculateDropPosition(event, targetElementId);
          console.log('🎯 Dropping on element:', targetElementId, 'position:', dropPosition);
          if (dragData?.element) {
            handleElementReorderWithContainers(dragData.element.id, targetElementId, dropPosition);
          }
        } else if (over.id === 'simple-canvas') {
          // Dropped on canvas background - find closest element or append at end
          console.log('🎨 Dropped on canvas background, finding closest element');
          handleCanvasBackgroundDrop(event, dragData?.element);
        }
      }

      endDrag();
    },
    [endDrag, addElement, handleElementReorderWithContainers, calculateDropPosition, handleCanvasBackgroundDrop, handleContainerDrop]
  );

  /**
   * Determine which zone the element should be dropped into
   */
  const determineDropZone = useCallback(
    (event: DragEndEvent, dropZoneId: string): ZoneType | null => {
      // If dropping directly on a zone
      if (dropZoneId.startsWith('zone-')) {
        const zoneName = dropZoneId.replace('zone-', '') as ZoneType;
        if (['header', 'content', 'footer'].includes(zoneName)) {
          return zoneName;
        }
      }

      // If dropping on the main canvas, default to content zone (single zone)
      if (dropZoneId === 'simple-canvas') {
        return 'content';
      }

      return null;
    },
    []
  );

  /**
   * Get next available order for a zone
   */
  const getNextOrder = useCallback(
    (zone: ZoneType): number => {
      if (!parsedBuilderState) return 0;

      const zoneComponents = parsedBuilderState.zones[zone].components;
      return zoneComponents.length;
    },
    [parsedBuilderState]
  );

  /**
   * Check if drop is valid
   */
  const isValidDrop = useCallback(
    (dragData: DragData, dropZone: string): boolean => {
      if (dragData.type === 'component') {
        // Components can be dropped on canvas, specific zones, containers, or grid cells
        return (
          dropZone === 'popup-canvas' ||
          dropZone === 'simple-canvas' ||
          dropZone.startsWith('zone-') ||
          dropZone.startsWith('container-') ||
          dropZone.startsWith('grid-cell-')
        );
      } else if (dragData.type === 'canvas-element') {
        // Canvas elements can be reordered within canvas or dropped on other elements
        return (
          dropZone === 'simple-canvas' ||
          dropZone.startsWith('canvas-element-') ||
          dropZone.startsWith('drag-handle-')
        );
      } else if (dragData.type === 'element') {
        // Elements can be moved within canvas, zones, or reordered
        return (
          dropZone === 'popup-canvas' ||
          dropZone === 'simple-canvas' ||
          dropZone.startsWith('zone-') ||
          dropZone.startsWith('element-')
        );
      }
      return false;
    },
    []
  );

  /**
   * Get drag overlay content (returns JSX element)
   */
  const getDragOverlay = useCallback(
    (
      activeId: string | null,
      dragData: DragData | null
    ): React.ReactElement | null => {
      if (!activeId || !dragData) return null;

      if (dragData.type === 'component') {
        return React.createElement(
          'div',
          {
            className:
              'bg-white border-2 border-blue-500 rounded-lg p-3 shadow-2xl opacity-90 pointer-events-none transform rotate-3 scale-105',
            style: {
              zIndex: 9999,
              backdropFilter: 'blur(4px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            },
          },
          React.createElement(
            'div',
            {
              className: 'flex items-center space-x-2',
            },
            React.createElement(
              'div',
              {
                className:
                  'w-6 h-6 bg-blue-100 rounded flex items-center justify-center',
              },
              React.createElement(
                Suspense,
                {
                  fallback: React.createElement(
                    'span',
                    {
                      className: 'text-blue-600 text-xs font-bold',
                    },
                    dragData.component?.icon_name?.charAt(0).toUpperCase() ||
                      dragData.component?.name.charAt(0).toUpperCase()
                  ),
                },
                dragData.component?.icon_name
                  ? (() => {
                      const IconComponent = dynamicImportLucideIcon(
                        dragData.component.icon_name
                      );
                      return React.createElement(IconComponent, {
                        className: 'w-4 h-4 text-blue-600',
                      });
                    })()
                  : React.createElement(
                      'span',
                      {
                        className: 'text-blue-600 text-xs font-bold',
                      },
                      dragData.component?.name.charAt(0).toUpperCase()
                    )
              )
            ),
            React.createElement(
              'span',
              {
                className: 'text-sm font-medium text-gray-800',
              },
              dragData.component?.name
            )
          )
        );
      } else if (dragData.type === 'element') {
        return React.createElement(
          'div',
          {
            className:
              'bg-white border-2 border-green-500 rounded p-2 shadow-lg opacity-80',
          },
          React.createElement(
            'span',
            {
              className: 'text-sm font-medium',
            },
            'Moving Element'
          )
        );
      }

      return null;
    },
    []
  );

  /**
   * Create draggable data for component
   */
  const createComponentDragData = useCallback(
    (component: ComponentConfig): DragData => ({
      type: 'component',
      component,
    }),
    []
  );

  /**
   * Create draggable data for element
   */
  const createElementDragData = useCallback(
    (element: PopupElement): DragData => ({
      type: 'element',
      element,
    }),
    []
  );

  /**
   * Create draggable data for canvas element (for reordering)
   */
  const createCanvasElementDragData = useCallback(
    (element: PopupElement): DragData => ({
      type: 'canvas-element',
      element,
    }),
    []
  );

  return {
    // DnD Context props
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,

    // Utility functions
    determineDropZone,
    handleCanvasElementReorder,
    handleElementReorderWithContainers,
    handleContainerDrop,
    handleGridCellDrop,
    calculateDropPosition,
    isValidDrop,
    getDragOverlay,
    createComponentDragData,
    createElementDragData,
    createCanvasElementDragData,
    getNextOrder,

    // DnD Components (re-export for convenience)
    DndContext,
    DragOverlay,
  };
};
