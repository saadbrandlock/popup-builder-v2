/**
 * Component Tree Utilities
 * Provides tree data structure management for hierarchical component relationships
 * Supporting containers and grids with proper parent-child relationships
 */

export interface ComponentNode {
  id: string;
  type: string;
  parentId?: string;
  parentType?: 'canvas' | 'container' | 'grid-cell';
  parentCellId?: string; // For grid children: 'row-0-col-1'
  config: Record<string, any>;
  constraints: {
    allowedChildren: string[];
    maxChildren?: number;
    canContainChildren: boolean;
  };
  position: {
    order: number;
    nestingLevel: number;
  };
}

// Container: Single drop zone with children array
export interface ContainerComponent extends ComponentNode {
  type: 'container';
  children: ComponentNode[];
  config: {
    style: Record<string, any>;
    layout: 'vertical' | 'horizontal';
    gap: string;
  } & Record<string, any>;
}

// Grid: Multi-cell with independent drop zones  
export interface GridComponent extends ComponentNode {
  type: 'grid';
  config: {
    rows: number;
    columns: number;
    columnFractions: number[]; // [6, 6] for equal columns
    style: Record<string, any>;
    gap: string;
  } & Record<string, any>;
  cells: {
    [cellKey: string]: ComponentNode[]; // 'row-0-col-0': [components]
  };
}

export interface ComponentHierarchy {
  nodes: Map<string, ComponentNode>;
  rootNodes: string[];
  selectedNodes: string[];
  focusedContainer?: {
    id: string;
    type: 'container' | 'grid';
    cellId?: string; // For grid focus
  };
}

/**
 * Tree Traversal Utilities
 */
export class ComponentTreeManager {
  private hierarchy: ComponentHierarchy;

  constructor(initialHierarchy?: ComponentHierarchy) {
    this.hierarchy = initialHierarchy || {
      nodes: new Map(),
      rootNodes: [],
      selectedNodes: [],
    };
  }

  /**
   * Get the current hierarchy
   */
  getHierarchy(): ComponentHierarchy {
    return this.hierarchy;
  }

  /**
   * Add a node to the tree
   */
  addNode(node: ComponentNode): void {
    this.hierarchy.nodes.set(node.id, node);
    
    if (!node.parentId) {
      // Root node
      if (!this.hierarchy.rootNodes.includes(node.id)) {
        this.hierarchy.rootNodes.push(node.id);
      }
    } else {
      // Child node - update parent
      const parent = this.hierarchy.nodes.get(node.parentId);
      if (parent) {
        this.updateParentChild(parent, node);
      }
    }
  }

  /**
   * Remove a node and all its children
   */
  removeNode(nodeId: string): ComponentNode | null {
    const node = this.hierarchy.nodes.get(nodeId);
    if (!node) return null;

    // Remove from parent
    if (node.parentId) {
      const parent = this.hierarchy.nodes.get(node.parentId);
      if (parent) {
        this.removeFromParent(parent, nodeId);
      }
    } else {
      // Remove from root nodes
      this.hierarchy.rootNodes = this.hierarchy.rootNodes.filter(id => id !== nodeId);
    }

    // Remove all children recursively
    const children = this.getChildren(nodeId);
    children.forEach(child => this.removeNode(child.id));

    // Remove from nodes map
    this.hierarchy.nodes.delete(nodeId);

    // Remove from selection if selected
    this.hierarchy.selectedNodes = this.hierarchy.selectedNodes.filter(id => id !== nodeId);

    return node;
  }

  /**
   * Get a node by ID
   */
  getNode(nodeId: string): ComponentNode | null {
    return this.hierarchy.nodes.get(nodeId) || null;
  }

  /**
   * Get all children of a node
   */
  getChildren(nodeId: string): ComponentNode[] {
    const node = this.hierarchy.nodes.get(nodeId);
    if (!node) return [];

    if (this.isContainer(node)) {
      return (node as ContainerComponent).children || [];
    }

    if (this.isGrid(node)) {
      const grid = node as GridComponent;
      const children: ComponentNode[] = [];
      Object.values(grid.cells).forEach(cellComponents => {
        children.push(...cellComponents);
      });
      return children;
    }

    return [];
  }

  /**
   * Get children of a specific grid cell
   */
  getGridCellChildren(gridId: string, cellId: string): ComponentNode[] {
    const grid = this.hierarchy.nodes.get(gridId);
    if (!grid || !this.isGrid(grid)) return [];

    const gridComponent = grid as GridComponent;
    return gridComponent.cells[cellId] || [];
  }

  /**
   * Get all descendants of a node (children, grandchildren, etc.)
   */
  getDescendants(nodeId: string): ComponentNode[] {
    const descendants: ComponentNode[] = [];
    const children = this.getChildren(nodeId);

    children.forEach(child => {
      descendants.push(child);
      descendants.push(...this.getDescendants(child.id));
    });

    return descendants;
  }

  /**
   * Get the path from root to a specific node
   */
  getNodePath(nodeId: string): ComponentNode[] {
    const path: ComponentNode[] = [];
    let currentNode = this.hierarchy.nodes.get(nodeId);

    while (currentNode) {
      path.unshift(currentNode);
      currentNode = currentNode.parentId ? this.hierarchy.nodes.get(currentNode.parentId) : undefined;
    }

    return path;
  }

  /**
   * Get the nesting level of a node
   */
  getNestingLevel(nodeId: string): number {
    return this.getNodePath(nodeId).length - 1;
  }

  /**
   * Check if a node can contain children
   */
  canContainChildren(nodeId: string): boolean {
    const node = this.hierarchy.nodes.get(nodeId);
    return node?.constraints.canContainChildren || false;
  }

  /**
   * Check if moving a node would create a circular reference
   */
  wouldCreateCircularReference(nodeId: string, targetParentId: string): boolean {
    // A node cannot be moved into one of its own descendants
    const descendants = this.getDescendants(nodeId);
    return descendants.some(descendant => descendant.id === targetParentId);
  }

  /**
   * Move a node to a new parent
   */
  moveNode(nodeId: string, newParentId: string, newOrder?: number, cellId?: string): boolean {
    const node = this.hierarchy.nodes.get(nodeId);
    const newParent = this.hierarchy.nodes.get(newParentId);

    if (!node || !newParent) return false;

    // Check for circular reference
    if (this.wouldCreateCircularReference(nodeId, newParentId)) {
      return false;
    }

    // Remove from current parent
    if (node.parentId) {
      const currentParent = this.hierarchy.nodes.get(node.parentId);
      if (currentParent) {
        this.removeFromParent(currentParent, nodeId);
      }
    } else {
      // Remove from root nodes
      this.hierarchy.rootNodes = this.hierarchy.rootNodes.filter(id => id !== nodeId);
    }

    // Update node's parent info
    node.parentId = newParentId;
    node.parentCellId = cellId;
    node.position.nestingLevel = this.getNestingLevel(nodeId);
    
    // Add to new parent
    this.addToParent(newParent, node, newOrder, cellId);

    return true;
  }

  /**
   * Helper methods
   */
  private isContainer(node: ComponentNode): boolean {
    return node.type === 'container';
  }

  private isGrid(node: ComponentNode): boolean {
    return node.type === 'grid';
  }

  private updateParentChild(parent: ComponentNode, child: ComponentNode): void {
    if (this.isContainer(parent)) {
      const container = parent as ContainerComponent;
      if (!container.children.some(c => c.id === child.id)) {
        container.children.push(child);
      }
    } else if (this.isGrid(parent) && child.parentCellId) {
      const grid = parent as GridComponent;
      if (!grid.cells[child.parentCellId]) {
        grid.cells[child.parentCellId] = [];
      }
      if (!grid.cells[child.parentCellId].some(c => c.id === child.id)) {
        grid.cells[child.parentCellId].push(child);
      }
    }
  }

  private removeFromParent(parent: ComponentNode, childId: string): void {
    if (this.isContainer(parent)) {
      const container = parent as ContainerComponent;
      container.children = container.children.filter(c => c.id !== childId);
    } else if (this.isGrid(parent)) {
      const grid = parent as GridComponent;
      Object.keys(grid.cells).forEach(cellKey => {
        grid.cells[cellKey] = grid.cells[cellKey].filter(c => c.id !== childId);
      });
    }
  }

  private addToParent(parent: ComponentNode, child: ComponentNode, order?: number, cellId?: string): void {
    if (this.isContainer(parent)) {
      const container = parent as ContainerComponent;
      if (order !== undefined) {
        container.children.splice(order, 0, child);
      } else {
        container.children.push(child);
      }
    } else if (this.isGrid(parent) && cellId) {
      const grid = parent as GridComponent;
      if (!grid.cells[cellId]) {
        grid.cells[cellId] = [];
      }
      if (order !== undefined) {
        grid.cells[cellId].splice(order, 0, child);
      } else {
        grid.cells[cellId].push(child);
      }
    }
  }

  /**
   * Utility methods for working with the hierarchy
   */
  getRootNodes(): ComponentNode[] {
    return this.hierarchy.rootNodes
      .map(id => this.hierarchy.nodes.get(id))
      .filter((node): node is ComponentNode => node !== undefined);
  }

  getSelectedNodes(): ComponentNode[] {
    return this.hierarchy.selectedNodes
      .map(id => this.hierarchy.nodes.get(id))
      .filter((node): node is ComponentNode => node !== undefined);
  }

  selectNode(nodeId: string): void {
    if (!this.hierarchy.selectedNodes.includes(nodeId)) {
      this.hierarchy.selectedNodes = [nodeId]; // Single selection for now
    }
  }

  deselectNode(nodeId: string): void {
    this.hierarchy.selectedNodes = this.hierarchy.selectedNodes.filter(id => id !== nodeId);
  }

  clearSelection(): void {
    this.hierarchy.selectedNodes = [];
  }

  /**
   * Convert flat component list to tree hierarchy
   */
  static fromFlatList(components: any[]): ComponentTreeManager {
    const manager = new ComponentTreeManager();
    
    // First pass: add all nodes
    components.forEach(component => {
      const node: ComponentNode = {
        id: component.id,
        type: component.type,
        parentId: component.parentId,
        parentType: component.parentType,
        parentCellId: component.parentCellId,
        config: component.config || {},
        constraints: {
          allowedChildren: component.allowedChildren || [],
          maxChildren: component.maxChildren,
          canContainChildren: component.type === 'container' || component.type === 'grid',
        },
        position: {
          order: component.order || 0,
          nestingLevel: 0, // Will be calculated
        },
      };

      manager.addNode(node);
    });

    // Second pass: update nesting levels
    manager.hierarchy.nodes.forEach((node, nodeId) => {
      node.position.nestingLevel = manager.getNestingLevel(nodeId);
    });

    return manager;
  }

  /**
   * Convert tree hierarchy to flat list
   */
  toFlatList(): any[] {
    const components: any[] = [];
    
    const traverse = (nodeIds: string[]) => {
      nodeIds.forEach(nodeId => {
        const node = this.hierarchy.nodes.get(nodeId);
        if (node) {
          components.push({
            id: node.id,
            type: node.type,
            parentId: node.parentId,
            parentType: node.parentType,
            parentCellId: node.parentCellId,
            config: node.config,
            order: node.position.order,
            nestingLevel: node.position.nestingLevel,
          });

          // Traverse children
          const children = this.getChildren(nodeId);
          traverse(children.map(c => c.id));
        }
      });
    };

    traverse(this.hierarchy.rootNodes);
    return components;
  }
}