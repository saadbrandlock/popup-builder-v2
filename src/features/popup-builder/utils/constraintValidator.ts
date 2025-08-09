/**
 * Constraint Validation System
 * Handles validation rules for component placement and nesting
 */

import type { ComponentNode, ContainerComponent, GridComponent } from './componentTree';
import type { ComponentConfig } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DropValidationContext {
  draggedComponent: ComponentConfig;
  targetContainer: ComponentNode;
  targetPosition?: number;
  targetCellId?: string; // For grid drops
  existingChildren: ComponentNode[];
}

export interface NestingRule {
  componentType: string;
  maxNestingLevel: number;
  allowedParents: string[];
  disallowedParents: string[];
  maxInstancesPerParent?: number;
}

export class ConstraintValidator {
  private static defaultNestingRules: NestingRule[] = [
    {
      componentType: 'container',
      maxNestingLevel: 5,
      allowedParents: ['canvas', 'container', 'grid'],
      disallowedParents: [],
      maxInstancesPerParent: undefined,
    },
    {
      componentType: 'grid',
      maxNestingLevel: 5,
      allowedParents: ['canvas', 'container', 'grid'],
      disallowedParents: [],
      maxInstancesPerParent: undefined,
    },
    {
      componentType: 'title',
      maxNestingLevel: 10,
      allowedParents: ['canvas', 'container', 'grid'],
      disallowedParents: [],
      maxInstancesPerParent: 1, // Only one title per container
    },
    {
      componentType: 'button',
      maxNestingLevel: 10,
      allowedParents: ['canvas', 'container', 'grid'],
      disallowedParents: ['button'], // Buttons can't contain buttons
      maxInstancesPerParent: undefined,
    },
  ];

  /**
   * Validate if a component can be dropped in a target location
   */
  static validateDrop(context: DropValidationContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if target container exists
    if (!context.targetContainer) {
      errors.push('Invalid drop target');
      return { isValid: false, errors, warnings };
    }

    // Check if target can contain children
    if (!context.targetContainer.constraints.canContainChildren) {
      errors.push(`${context.targetContainer.type} components cannot contain children`);
      return { isValid: false, errors, warnings };
    }

    // Validate allowed children types
    const allowedChildrenResult = this.validateAllowedChildren(context);
    errors.push(...allowedChildrenResult.errors);
    warnings.push(...allowedChildrenResult.warnings);

    // Validate maximum children limit
    const maxChildrenResult = this.validateMaxChildren(context);
    errors.push(...maxChildrenResult.errors);
    warnings.push(...maxChildrenResult.warnings);

    // Validate nesting level
    const nestingResult = this.validateNestingLevel(context);
    errors.push(...nestingResult.errors);
    warnings.push(...nestingResult.warnings);

    // Validate component-specific rules
    const componentRulesResult = this.validateComponentRules(context);
    errors.push(...componentRulesResult.errors);
    warnings.push(...componentRulesResult.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate allowed children types
   */
  private static validateAllowedChildren(context: DropValidationContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const { draggedComponent, targetContainer } = context;
    const allowedChildren = targetContainer.constraints.allowedChildren;

    // If no restrictions specified, allow all
    if (!allowedChildren || allowedChildren.length === 0) {
      return { isValid: true, errors, warnings };
    }

    // Check if the dragged component type is allowed
    if (!allowedChildren.includes(draggedComponent.type)) {
      errors.push(
        `Component '${draggedComponent.name || draggedComponent.type}' is not allowed in ${targetContainer.type}`
      );
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate maximum children limit
   */
  private static validateMaxChildren(context: DropValidationContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const { targetContainer, existingChildren } = context;
    const maxChildren = targetContainer.constraints.maxChildren;

    if (maxChildren !== undefined && existingChildren.length >= maxChildren) {
      errors.push(
        `Maximum children limit (${maxChildren}) reached for ${targetContainer.type}`
      );
    }

    // Warning when approaching limit
    if (maxChildren !== undefined && existingChildren.length >= maxChildren * 0.8) {
      warnings.push(
        `Approaching maximum children limit (${existingChildren.length}/${maxChildren})`
      );
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate nesting level constraints
   */
  private static validateNestingLevel(context: DropValidationContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const { draggedComponent, targetContainer } = context;
    const targetNestingLevel = targetContainer.position.nestingLevel + 1;

    // Find nesting rule for the dragged component
    const nestingRule = this.defaultNestingRules.find(
      rule => rule.componentType === draggedComponent.type
    );

    if (nestingRule && targetNestingLevel > nestingRule.maxNestingLevel) {
      errors.push(
        `Component '${draggedComponent.name || draggedComponent.type}' cannot be nested deeper than ${nestingRule.maxNestingLevel} levels`
      );
    }

    // Check parent type restrictions
    if (nestingRule) {
      if (nestingRule.disallowedParents.includes(targetContainer.type)) {
        errors.push(
          `Component '${draggedComponent.name || draggedComponent.type}' cannot be placed inside ${targetContainer.type}`
        );
      }

      if (nestingRule.allowedParents.length > 0 && 
          !nestingRule.allowedParents.includes(targetContainer.type)) {
        errors.push(
          `Component '${draggedComponent.name || draggedComponent.type}' can only be placed inside: ${nestingRule.allowedParents.join(', ')}`
        );
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate component-specific rules
   */
  private static validateComponentRules(context: DropValidationContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const { draggedComponent, targetContainer, existingChildren } = context;

    // Find nesting rule for instances per parent limit
    const nestingRule = this.defaultNestingRules.find(
      rule => rule.componentType === draggedComponent.type
    );

    if (nestingRule?.maxInstancesPerParent !== undefined) {
      const existingInstancesOfType = existingChildren.filter(
        child => child.type === draggedComponent.type
      ).length;

      if (existingInstancesOfType >= nestingRule.maxInstancesPerParent) {
        errors.push(
          `Maximum ${nestingRule.maxInstancesPerParent} instance(s) of '${draggedComponent.name || draggedComponent.type}' allowed per ${targetContainer.type}`
        );
      }
    }

    // Component-specific validation rules
    switch (draggedComponent.type) {
      case 'container':
        // Containers should not be too deeply nested
        if (targetContainer.position.nestingLevel >= 3) {
          warnings.push('Deep container nesting may affect performance and usability');
        }
        break;

      case 'grid':
        // Grids inside grids warning
        if (targetContainer.type === 'grid') {
          warnings.push('Nesting grids inside grids may create complex layouts');
        }
        break;

      case 'title':
        // Only one title per container recommendation
        const existingTitles = existingChildren.filter(child => child.type === 'title').length;
        if (existingTitles >= 1) {
          warnings.push('Multiple titles in the same container may confuse users');
        }
        break;
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate circular reference (prevent dropping container into its own children)
   */
  static validateCircularReference(
    draggedNodeId: string,
    targetContainerId: string,
    getDescendants: (nodeId: string) => ComponentNode[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const descendants = getDescendants(draggedNodeId);
    const isCircular = descendants.some(descendant => descendant.id === targetContainerId);

    if (isCircular) {
      errors.push('Cannot move component into one of its own children (circular reference)');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Get visual feedback class for validation state
   */
  static getValidationFeedbackClass(validation: ValidationResult): string {
    if (!validation.isValid) {
      return 'drop-invalid';
    }
    if (validation.warnings.length > 0) {
      return 'drop-warning';
    }
    return 'drop-valid';
  }

  /**
   * Parse allowed_children_types from API component definition
   */
  static parseAllowedChildrenFromAPI(component: ComponentConfig): string[] {
    // Check if the component has allowed_children_types in its properties
    if (component.properties?.allowed_children_types) {
      return component.properties.allowed_children_types;
    }

    // Check if it's in the component's constraints
    if (component.constraints?.allowed_children_types) {
      return component.constraints.allowed_children_types;
    }

    // Default based on component type
    switch (component.type) {
      case 'container':
        return ['title', 'text', 'button', 'image', 'grid']; // Allow most components except other containers
      case 'grid':
        return ['title', 'text', 'button', 'image', 'container']; // Allow most components including containers
      default:
        return []; // Non-container components cannot contain children
    }
  }

  /**
   * Parse max_children from API component definition
   */
  static parseMaxChildrenFromAPI(component: ComponentConfig): number | undefined {
    if (component.properties?.max_children !== undefined) {
      return component.properties.max_children;
    }

    if (component.constraints?.max_children !== undefined) {
      return component.constraints.max_children;
    }

    // Default based on component type
    switch (component.type) {
      case 'container':
        return undefined; // No limit for containers
      case 'grid':
        return undefined; // Limit based on grid size
      default:
        return 0; // Non-container components cannot contain children
    }
  }

  /**
   * Update nesting rules (for customization)
   */
  static updateNestingRules(rules: NestingRule[]): void {
    this.defaultNestingRules.length = 0;
    this.defaultNestingRules.push(...rules);
  }

  /**
   * Get current nesting rules
   */
  static getNestingRules(): NestingRule[] {
    return [...this.defaultNestingRules];
  }
}