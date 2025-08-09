/**
 * Container Manager Utilities
 * Handles container-specific operations and validations
 */

import type { ComponentNode, ContainerComponent } from './componentTree';

export interface ContainerConfig {
  layout: 'vertical' | 'horizontal';
  gap: string;
  padding: string;
  style: Record<string, any>;
  maxChildren?: number;
  allowedChildTypes?: string[];
}

export interface ContainerChildPosition {
  index: number;
  insertPosition: 'before' | 'after' | 'inside';
}

export class ContainerManager {
  /**
   * Create a new container component
   */
  static createContainer(
    id: string,
    config: Partial<ContainerConfig> = {}
  ): ContainerComponent {
    const defaultConfig: ContainerConfig = {
      layout: 'vertical',
      gap: '12px',
      padding: '16px',
      style: {
        backgroundColor: 'transparent',
        borderRadius: '8px',
        border: '1px dashed #d9d9d9',
      },
    };

    return {
      id,
      type: 'container',
      children: [],
      config: { ...defaultConfig, ...config },
      constraints: {
        allowedChildren: config.allowedChildTypes || [],
        maxChildren: config.maxChildren,
        canContainChildren: true,
      },
      position: {
        order: 0,
        nestingLevel: 0,
      },
    };
  }

  /**
   * Check if a component can be added to the container
   */
  static canAddChild(
    container: ContainerComponent,
    childType: string
  ): { canAdd: boolean; reason?: string } {
    // Check max children limit
    if (container.constraints.maxChildren && 
        container.children.length >= container.constraints.maxChildren) {
      return {
        canAdd: false,
        reason: `Container has reached maximum children limit (${container.constraints.maxChildren})`,
      };
    }

    // Check allowed child types
    if (container.constraints.allowedChildren.length > 0 && 
        !container.constraints.allowedChildren.includes(childType)) {
      return {
        canAdd: false,
        reason: `Component type '${childType}' is not allowed in this container`,
      };
    }

    return { canAdd: true };
  }

  /**
   * Add a child component to the container
   */
  static addChild(
    container: ContainerComponent,
    child: ComponentNode,
    position?: number
  ): boolean {
    const canAdd = this.canAddChild(container, child.type);
    if (!canAdd.canAdd) {
      console.warn('Cannot add child to container:', canAdd.reason);
      return false;
    }

    // Update child's parent info
    child.parentId = container.id;
    child.parentType = 'container';
    child.position.nestingLevel = container.position.nestingLevel + 1;

    // Add to container
    if (position !== undefined && position >= 0 && position <= container.children.length) {
      container.children.splice(position, 0, child);
    } else {
      container.children.push(child);
    }

    // Update order for all children
    this.updateChildrenOrder(container);

    return true;
  }

  /**
   * Remove a child component from the container
   */
  static removeChild(container: ContainerComponent, childId: string): ComponentNode | null {
    const childIndex = container.children.findIndex(c => c.id === childId);
    if (childIndex === -1) return null;

    const [removedChild] = container.children.splice(childIndex, 1);
    
    // Update order for remaining children
    this.updateChildrenOrder(container);

    // Clear parent info from removed child
    removedChild.parentId = undefined;
    removedChild.parentType = undefined;

    return removedChild;
  }

  /**
   * Reorder children within the container
   */
  static reorderChildren(
    container: ContainerComponent,
    fromIndex: number,
    toIndex: number
  ): boolean {
    if (fromIndex < 0 || fromIndex >= container.children.length ||
        toIndex < 0 || toIndex >= container.children.length) {
      return false;
    }

    // Move child
    const [movedChild] = container.children.splice(fromIndex, 1);
    container.children.splice(toIndex, 0, movedChild);

    // Update order for all children
    this.updateChildrenOrder(container);

    return true;
  }

  /**
   * Update the order property for all children
   */
  static updateChildrenOrder(container: ContainerComponent): void {
    container.children.forEach((child, index) => {
      child.position.order = index;
    });
  }

  /**
   * Calculate drop position for a drag operation
   */
  static calculateDropPosition(
    container: ContainerComponent,
    _dropY: number,
    _containerRect: DOMRect
  ): ContainerChildPosition {
    if (container.children.length === 0) {
      return {
        index: 0,
        insertPosition: 'inside',
      };
    }

    // For now, simplified logic - add to end
    // In a real implementation, this would calculate based on mouse position
    // relative to existing children
    return {
      index: container.children.length,
      insertPosition: 'after',
    };
  }

  /**
   * Get container layout styles
   */
  static getLayoutStyles(container: ContainerComponent): Record<string, any> {
    const baseStyles: Record<string, any> = {
      display: 'flex',
      gap: container.config.gap,
      padding: container.config.padding,
      ...container.config.style,
    };

    // Add layout-specific styles
    if (container.config.layout === 'vertical') {
      baseStyles.flexDirection = 'column';
    } else {
      baseStyles.flexDirection = 'row';
    }

    return baseStyles;
  }

  /**
   * Get drop zone styles for empty container
   */
  static getDropZoneStyles(container: ContainerComponent): Record<string, any> {
    const isEmpty = container.children.length === 0;
    
    if (!isEmpty) return {};

    return {
      minHeight: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px dashed #d9d9d9',
      borderRadius: '8px',
      backgroundColor: '#fafafa',
      color: '#999',
      fontSize: '14px',
    };
  }

  /**
   * Validate container configuration
   */
  static validateConfig(config: Partial<ContainerConfig>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.layout && !['vertical', 'horizontal'].includes(config.layout)) {
      errors.push('Container layout must be either "vertical" or "horizontal"');
    }

    if (config.maxChildren && config.maxChildren < 0) {
      errors.push('Container maxChildren must be a positive number or undefined');
    }

    if (config.gap && typeof config.gap !== 'string') {
      errors.push('Container gap must be a valid CSS gap value (string)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clone a container with all its children
   */
  static cloneContainer(
    container: ContainerComponent,
    newId: string,
    cloneChildren = true
  ): ContainerComponent {
    const cloned: ContainerComponent = {
      ...container,
      id: newId,
      children: cloneChildren ? container.children.map((child, index) => ({
        ...child,
        id: `${child.type}_${Date.now()}_${index}`,
        parentId: newId,
      })) : [],
    };

    return cloned;
  }

  /**
   * Convert container to HTML structure
   */
  static toHTML(container: ContainerComponent): string {
    const styles = this.getLayoutStyles(container);
    const styleString = Object.entries(styles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');

    const childrenHTML = container.children
      .map(child => `  <!-- Child component: ${child.type} -->`)
      .join('\n');

    return `<div class="popup-container" data-component-id="${container.id}" style="${styleString}">
${childrenHTML}
</div>`;
  }
}