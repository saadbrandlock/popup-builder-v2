export interface ComponentPropSchema {
  name: string;
  label: string;
  type: 'number' | 'text' | 'color' | 'select' | 'toggle' | 'range';
  defaultValue: unknown;
  options?: { label: string; value: unknown }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface CustomComponentDefinition {
  id: string;
  name: string;
  description: string;
  category: 'engagement' | 'commerce' | 'layout';
  icon: string;
  thumbnail?: string;
  props: ComponentPropSchema[];
  defaultProps: Record<string, unknown>;
  render: (props: Record<string, unknown>) => string;
}

export const COMPONENT_REGISTRY: Map<string, CustomComponentDefinition> = new Map();

export function registerComponent(def: CustomComponentDefinition): void {
  COMPONENT_REGISTRY.set(def.id, def);
}

export function getAllComponents(): CustomComponentDefinition[] {
  return Array.from(COMPONENT_REGISTRY.values());
}

export function getComponent(id: string): CustomComponentDefinition | undefined {
  return COMPONENT_REGISTRY.get(id);
}
