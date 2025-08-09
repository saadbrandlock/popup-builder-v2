import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  PopupTemplate,
  PopupElement,
  PopupBuilderState as PopupBuilderStateType,
  ComponentConfig,
  ZoneType,
  PopupBuilderStoreState,
  BuilderMode,
  DeviceType,
} from '../types';

// Store state extends the interface from types but adds parsed builder state
interface PopupBuilderState extends Omit<PopupBuilderStoreState, 'mode' | 'previewDevice'> {
  // Additional store-specific fields
  parsedBuilderState: PopupBuilderStateType | null; // Parsed zones from builder_state_json
  selectedZone: ZoneType | null;
  mode: BuilderMode; // Narrowed from the types version
  previewDevice: 'desktop' | 'mobile' | 'tablet'; // Narrowed from the types version
}

// Store actions interface
interface PopupBuilderActions {
  // Template management
  loadTemplate: (template: PopupTemplate) => void;
  saveTemplate: () => Promise<void>;
  resetTemplate: () => void;
  
  // Component management
  loadAvailableComponents: (components: ComponentConfig[]) => void;
  addElement: (componentType: string, zone: ZoneType) => void;
  addElementToContainer: (componentType: string, containerId: string) => void;
  addElementToGridCell: (componentType: string, gridId: string, cellId: string) => void;
  reorderContainerChildren: (containerId: string, newChildrenOrder: PopupElement[]) => void;
  removeElement: (elementId: string) => void;
  removeElementFromContainer: (containerId: string, elementId: string) => void;
  moveElementBetweenContainers: (sourceId: string, targetId: string, elementId: string, position?: number) => void;
  moveElementToContainer: (elementId: string, containerId: string, position?: number) => void;
  moveElementToZone: (elementId: string, zone: ZoneType, position?: number) => void;
  updateElement: (elementId: string, updates: Partial<PopupElement>) => void;
  duplicateElement: (elementId: string) => void;
  
  // Selection and interaction
  selectElement: (elementId: string | null) => void;
  moveElement: (elementId: string, newZone: ZoneType, newOrder?: number) => void;
  reorderElements: (zone: ZoneType, fromIndex: number, toIndex: number) => void;
  resizeElement: (elementId: string, dimensions: { width: number; height: number }) => void;
  
  // Drag and drop
  startDrag: (component: ComponentConfig) => void;
  endDrag: () => void;
  
  // UI state
  setMode: (mode: BuilderMode) => void;
  setPreviewMode: (enabled: boolean) => void;
  setPreviewDevice: (device: DeviceType) => void;
  
  // Template metadata
  updateTemplateMetadata: (metadata: { name?: string; description?: string }) => void;
  
  // Utility functions
  canAddComponent: (componentType: string) => boolean;
  getElementById: (elementId: string) => PopupElement | null;
  clearError: () => void;
}

/**
 * Popup Builder Store - Zustand store with subscribeWithSelector middleware
 * Following the established pattern with actions object
 */
export const usePopupBuilderStore = create(
  subscribeWithSelector<PopupBuilderState & { actions: PopupBuilderActions }>((set, get) => ({
    // Initial state
    template: null,
    parsedBuilderState: null,
    availableComponents: [],
    instanceCounts: {},
    
    // UI state
    mode: 'builder',
    selectedElement: null,
    selectedZone: null,
    draggedComponent: null,
    
    // User permissions
    userRole: 'admin',
    canEdit: true,
    canPublish: true,
    
    // Loading and error states
    loading: false,
    saving: false,
    error: null,
    isDirty: false,
    
    // Preview state
    previewMode: false,
    previewDevice: 'desktop',
    
    actions: {
      // Template management
      loadTemplate: (template: PopupTemplate) => {
        // Parse builder_state_json into zones structure
        let parsedBuilderState: PopupBuilderStateType | null = null;
        try {
          if (template.builder_state_json && typeof template.builder_state_json === 'object') {
            parsedBuilderState = template.builder_state_json as PopupBuilderStateType;
          } else {
            // Initialize empty zones if no builder state exists
            parsedBuilderState = {
              zones: {
                header: { components: [] },
                content: { components: [] },
                footer: { components: [] },
              },
            };
          }
        } catch (error) {
          console.error('Failed to parse builder_state_json:', error);
          parsedBuilderState = {
            zones: {
              header: { components: [] },
              content: { components: [] },
              footer: { components: [] },
            },
          };
        }
        
        set({
          template,
          parsedBuilderState,
          isDirty: false,
          error: null,
        });
        
        // Count instances of each component type across all zones
        const instanceCounts: Record<string, number> = {};
        if (parsedBuilderState) {
          Object.values(parsedBuilderState.zones).forEach((zone) => {
            zone.components.forEach((element) => {
              const type = element.type;
              instanceCounts[type] = (instanceCounts[type] || 0) + 1;
            });
          });
        }
        
        set({ instanceCounts });
      },

      saveTemplate: async () => {
        const state = get();
        if (!state.template) return;

        set({ saving: true, error: null });
        
        try {
          // This will be called by the component with the API client
          // The actual API call will be handled in the component layer
          set({ 
            saving: false, 
            isDirty: false,
            error: null 
          });
        } catch (error) {
          set({ 
            saving: false, 
            error: error instanceof Error ? error.message : 'Failed to save template' 
          });
        }
      },

      resetTemplate: () => {
        set({
          template: null,
          instanceCounts: {},
          selectedElement: null,
          isDirty: false,
          error: null,
        });
      },

      // Component management
      loadAvailableComponents: (components: ComponentConfig[]) => {
        set({ availableComponents: components });
      },

      addElementToContainer: (componentType: string, containerId: string) => {
        console.log('🏗️ addElementToContainer called:', { componentType, containerId });
        
        const state = get();
        if (!state.template || !state.parsedBuilderState) {
          console.log('❌ Missing template or parsedBuilderState');
          return;
        }

        const component = state.availableComponents.find(c => c.type === componentType);
        if (!component) {
          console.log('❌ Component not found:', componentType);
          set({ error: `Component type '${componentType}' not found` });
          return;
        }

        // Find the container element
        let containerElement: PopupElement | null = null;
        let containerZone: ZoneType | null = null;

        for (const [zoneName, zone] of Object.entries(state.parsedBuilderState.zones)) {
          const found = zone.components.find(el => el.id === containerId && el.type === 'container');
          if (found) {
            containerElement = found;
            containerZone = zoneName as ZoneType;
            break;
          }
        }

        if (!containerElement || !containerZone) {
          console.log('❌ Container not found:', containerId);
          set({ error: `Container '${containerId}' not found` });
          return;
        }

        console.log('✅ Container found in zone:', containerZone);

        // Create new element as child of the container
        const newElement: PopupElement = {
          id: `${componentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: componentType,
          zone: containerZone, // Inherit zone from parent container
          config: { ...component.default_config_json },
          parentId: containerId, // Set parent relationship
          order: (containerElement.children || []).length, // Order within container
        };

        console.log('🆕 Created new element as child of container:', newElement);

        // Deep clone the zones to avoid mutation
        const updatedZones = JSON.parse(JSON.stringify(state.parsedBuilderState.zones));

        // Find and update the container element to add the child
        for (const [zoneName, zone] of Object.entries(updatedZones)) {
          const containerIndex = zone.components.findIndex((el: PopupElement) => el.id === containerId);
          if (containerIndex !== -1) {
            // Initialize children array if it doesn't exist
            if (!updatedZones[zoneName].components[containerIndex].children) {
              updatedZones[zoneName].components[containerIndex].children = [];
            }
            // Add the new element as a child
            updatedZones[zoneName].components[containerIndex].children.push(newElement);
            console.log('✅ Added element to container children:', {
              containerId,
              childId: newElement.id,
              totalChildren: updatedZones[zoneName].components[containerIndex].children.length
            });
            break;
          }
        }

        const updatedBuilderState = {
          ...state.parsedBuilderState,
          zones: updatedZones,
        };

        const updatedTemplate = {
          ...state.template,
          builder_state_json: updatedBuilderState,
        };

        // Update instance count
        const newInstanceCounts = {
          ...state.instanceCounts,
          [componentType]: (state.instanceCounts[componentType] || 0) + 1,
        };

        set({
          template: updatedTemplate,
          parsedBuilderState: updatedBuilderState,
          instanceCounts: newInstanceCounts,
          selectedElement: newElement.id,
          isDirty: true,
          error: null,
        });

        console.log('✅ Element successfully added as child of container!');
      },

      addElementToGridCell: (componentType: string, gridId: string, cellId: string) => {
        console.log('🏗️ addElementToGridCell called:', { componentType, gridId, cellId });
        
        const state = get();
        if (!state.template || !state.parsedBuilderState) {
          console.log('❌ Missing template or parsedBuilderState');
          return;
        }

        const component = state.availableComponents.find(c => c.type === componentType);
        if (!component) {
          console.log('❌ Component not found:', componentType);
          set({ error: `Component type '${componentType}' not found` });
          return;
        }

        // Find the grid element
        let gridElement: any = null;
        let gridZone: ZoneType | null = null;

        for (const [zoneName, zone] of Object.entries(state.parsedBuilderState.zones)) {
          const found = zone.components.find(el => el.id === gridId && el.type === 'grid');
          if (found) {
            gridElement = found;
            gridZone = zoneName as ZoneType;
            break;
          }
        }

        if (!gridElement || !gridZone) {
          console.log('❌ Grid not found:', gridId);
          set({ error: `Grid '${gridId}' not found` });
          return;
        }

        console.log('✅ Grid found in zone:', gridZone);

        // Create new element for the grid cell
        const newElement: PopupElement = {
          id: `${componentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: componentType,
          zone: gridZone, // Inherit zone from parent grid
          config: { ...component.default_config_json },
          parentId: gridId, // Set parent relationship to grid
          order: 0, // Order within grid cell
        };

        console.log('🆕 Created new element for grid cell:', newElement);

        // Deep clone the zones to avoid mutation
        const updatedZones = JSON.parse(JSON.stringify(state.parsedBuilderState.zones));

        // Find and update the grid element to add the element to the specific cell
        for (const [zoneName, zone] of Object.entries(updatedZones)) {
          const gridIndex = zone.components.findIndex((el: PopupElement) => el.id === gridId);
          if (gridIndex !== -1) {
            // Initialize cells if they don't exist
            if (!updatedZones[zoneName].components[gridIndex].cells) {
              updatedZones[zoneName].components[gridIndex].cells = {};
            }
            
            // Initialize the specific cell array if it doesn't exist
            if (!updatedZones[zoneName].components[gridIndex].cells[cellId]) {
              updatedZones[zoneName].components[gridIndex].cells[cellId] = [];
            }
            
            // Add the new element to the grid cell
            updatedZones[zoneName].components[gridIndex].cells[cellId].push(newElement);
            
            console.log('✅ Added element to grid cell:', {
              gridId,
              cellId,
              childId: newElement.id,
              totalCellComponents: updatedZones[zoneName].components[gridIndex].cells[cellId].length
            });
            break;
          }
        }

        const updatedBuilderState = {
          ...state.parsedBuilderState,
          zones: updatedZones,
        };

        const updatedTemplate = {
          ...state.template,
          builder_state_json: updatedBuilderState,
        };

        // Update instance count
        const newInstanceCounts = {
          ...state.instanceCounts,
          [componentType]: (state.instanceCounts[componentType] || 0) + 1,
        };

        set({
          template: updatedTemplate,
          parsedBuilderState: updatedBuilderState,
          instanceCounts: newInstanceCounts,
          selectedElement: newElement.id,
          isDirty: true,
          error: null,
        });

        console.log('✅ Element successfully added to grid cell!');
      },

      reorderContainerChildren: (containerId: string, newChildrenOrder: PopupElement[]) => {
        console.log('🔄 reorderContainerChildren called:', { containerId, childrenCount: newChildrenOrder.length });
        
        const state = get();
        if (!state.template || !state.parsedBuilderState) {
          console.log('❌ Missing template or parsedBuilderState');
          return;
        }

        // Find the container and update its children
        const updatedZones = JSON.parse(JSON.stringify(state.parsedBuilderState.zones));
        let containerFound = false;

        for (const [zoneName, zone] of Object.entries(updatedZones)) {
          const containerIndex = zone.components.findIndex((c: PopupElement) => c.id === containerId);
          if (containerIndex !== -1) {
            updatedZones[zoneName].components[containerIndex].children = newChildrenOrder.map((child, index) => ({
              ...child,
              order: index
            }));
            containerFound = true;
            console.log('✅ Updated container children order');
            break;
          }
        }

        if (!containerFound) {
          console.log('❌ Container not found:', containerId);
          return;
        }

        const updatedBuilderState = {
          ...state.parsedBuilderState,
          zones: updatedZones,
        };

        const updatedTemplate = {
          ...state.template,
          builder_state_json: updatedBuilderState,
        };

        set({
          template: updatedTemplate,
          parsedBuilderState: updatedBuilderState,
          isDirty: true,
        });

        console.log('✅ Container children reordered successfully!');
      },

      removeElementFromContainer: (containerId: string, elementId: string) => {
        console.log('🗑️ removeElementFromContainer called:', { containerId, elementId });
        
        const state = get();
        if (!state.template || !state.parsedBuilderState) {
          console.log('❌ Missing template or parsedBuilderState');
          return;
        }

        // Find and update the container
        const updatedZones = JSON.parse(JSON.stringify(state.parsedBuilderState.zones));
        let elementFound = false;

        for (const [zoneName, zone] of Object.entries(updatedZones)) {
          const containerIndex = zone.components.findIndex((c: PopupElement) => c.id === containerId);
          if (containerIndex !== -1 && updatedZones[zoneName].components[containerIndex].children) {
            const originalChildrenLength = updatedZones[zoneName].components[containerIndex].children.length;
            updatedZones[zoneName].components[containerIndex].children = 
              updatedZones[zoneName].components[containerIndex].children.filter((child: PopupElement) => child.id !== elementId);
            
            if (updatedZones[zoneName].components[containerIndex].children.length < originalChildrenLength) {
              elementFound = true;
              console.log('✅ Removed element from container');
              break;
            }
          }
        }

        if (!elementFound) {
          console.log('❌ Element not found in container:', { containerId, elementId });
          return;
        }

        const updatedBuilderState = {
          ...state.parsedBuilderState,
          zones: updatedZones,
        };

        const updatedTemplate = {
          ...state.template,
          builder_state_json: updatedBuilderState,
        };

        set({
          template: updatedTemplate,
          parsedBuilderState: updatedBuilderState,
          isDirty: true,
        });

        console.log('✅ Element removed from container successfully!');
      },

      moveElementBetweenContainers: (sourceId: string, targetId: string, elementId: string, position = 0) => {
        console.log('🔄 moveElementBetweenContainers called:', { sourceId, targetId, elementId, position });
        
        const state = get();
        if (!state.template || !state.parsedBuilderState) {
          console.log('❌ Missing template or parsedBuilderState');
          return;
        }

        // Find the element to move
        const element = state.actions.getElementById(elementId);
        if (!element) {
          console.log('❌ Element not found:', elementId);
          return;
        }

        // Remove from source container
        if (sourceId) {
          state.actions.removeElementFromContainer(sourceId, elementId);
        } else {
          // Remove from root zone
          state.actions.removeElement(elementId);
        }

        // Add to target container
        if (targetId) {
          const updatedElement = { ...element, parentId: targetId };
          const state = get();
          if (!state.template || !state.parsedBuilderState) return;

          // Find target container and add element
          const updatedZones = JSON.parse(JSON.stringify(state.parsedBuilderState.zones));
          let containerFound = false;

          for (const [zoneName, zone] of Object.entries(updatedZones)) {
            const containerIndex = zone.components.findIndex((c: PopupElement) => c.id === targetId);
            if (containerIndex !== -1) {
              if (!updatedZones[zoneName].components[containerIndex].children) {
                updatedZones[zoneName].components[containerIndex].children = [];
              }
              updatedZones[zoneName].components[containerIndex].children.splice(position, 0, updatedElement);
              containerFound = true;
              break;
            }
          }

          if (containerFound) {
            const updatedBuilderState = {
              ...state.parsedBuilderState,
              zones: updatedZones,
            };

            const updatedTemplate = {
              ...state.template,
              builder_state_json: updatedBuilderState,
            };

            set({
              template: updatedTemplate,
              parsedBuilderState: updatedBuilderState,
              isDirty: true,
            });
          }
        }

        console.log('✅ Element moved between containers successfully!');
      },

      moveElementToContainer: (elementId: string, containerId: string, position = 0) => {
        console.log('🏗️ moveElementToContainer called:', { elementId, containerId, position });
        
        const state = get();
        if (!state.template || !state.parsedBuilderState) {
          console.log('❌ Missing template or parsedBuilderState');
          return;
        }

        // Find the element
        const element = state.actions.getElementById(elementId);
        if (!element) {
          console.log('❌ Element not found:', elementId);
          return;
        }

        // Remove from current location
        if (element.parentId) {
          state.actions.removeElementFromContainer(element.parentId, elementId);
        } else {
          state.actions.removeElement(elementId);
        }

        // Add to target container
        const updatedElement = { ...element, parentId: containerId };
        const currentState = get();
        if (!currentState.template || !currentState.parsedBuilderState) return;

        const updatedZones = JSON.parse(JSON.stringify(currentState.parsedBuilderState.zones));
        let containerFound = false;

        for (const [zoneName, zone] of Object.entries(updatedZones)) {
          const containerIndex = zone.components.findIndex((c: PopupElement) => c.id === containerId);
          if (containerIndex !== -1) {
            if (!updatedZones[zoneName].components[containerIndex].children) {
              updatedZones[zoneName].components[containerIndex].children = [];
            }
            updatedZones[zoneName].components[containerIndex].children.splice(position, 0, updatedElement);
            containerFound = true;
            break;
          }
        }

        if (containerFound) {
          const updatedBuilderState = {
            ...currentState.parsedBuilderState,
            zones: updatedZones,
          };

          const updatedTemplate = {
            ...currentState.template,
            builder_state_json: updatedBuilderState,
          };

          set({
            template: updatedTemplate,
            parsedBuilderState: updatedBuilderState,
            isDirty: true,
            selectedElement: elementId,
          });

          console.log('✅ Element moved to container successfully!');
        } else {
          console.log('❌ Target container not found:', containerId);
        }
      },

      moveElementToZone: (elementId: string, zone: ZoneType, position = 0) => {
        console.log('🌍 moveElementToZone called:', { elementId, zone, position });
        
        const state = get();
        if (!state.template || !state.parsedBuilderState) {
          console.log('❌ Missing template or parsedBuilderState');
          return;
        }

        // Find the element
        const element = state.actions.getElementById(elementId);
        if (!element) {
          console.log('❌ Element not found:', elementId);
          return;
        }

        // Remove from current location
        if (element.parentId) {
          state.actions.removeElementFromContainer(element.parentId, elementId);
        } else {
          state.actions.removeElement(elementId);
        }

        // Add to target zone
        const updatedElement = { ...element, zone, parentId: undefined, order: position };
        const currentState = get();
        if (!currentState.template || !currentState.parsedBuilderState) return;

        const updatedZones = {
          ...currentState.parsedBuilderState.zones,
          [zone]: {
            ...currentState.parsedBuilderState.zones[zone],
            components: [
              ...currentState.parsedBuilderState.zones[zone].components.slice(0, position),
              updatedElement,
              ...currentState.parsedBuilderState.zones[zone].components.slice(position)
            ]
          },
        };

        const updatedBuilderState = {
          ...currentState.parsedBuilderState,
          zones: updatedZones,
        };

        const updatedTemplate = {
          ...currentState.template,
          builder_state_json: updatedBuilderState,
        };

        set({
          template: updatedTemplate,
          parsedBuilderState: updatedBuilderState,
          isDirty: true,
          selectedElement: elementId,
        });

        console.log('✅ Element moved to zone successfully!');
      },

      addElement: (componentType: string, zone: ZoneType) => {
        console.log('🏗️ addElement called:', { componentType, zone });
        
        const state = get();
        if (!state.template || !state.parsedBuilderState) {
          console.log('❌ Missing template or parsedBuilderState:', {
            hasTemplate: !!state.template,
            hasParsedBuilderState: !!state.parsedBuilderState
          });
          return;
        }

        const component = state.availableComponents.find(c => c.type === componentType);
        if (!component) {
          console.log('❌ Component not found:', componentType);
          set({ error: `Component type '${componentType}' not found` });
          return;
        }

        console.log('✅ Component found:', component.name);

        // Check if component is allowed in this zone
        if (!component.allowed_in_zones.includes(zone)) {
          console.log('❌ Component not allowed in zone:', {
            componentName: component.name,
            zone,
            allowedZones: component.allowed_in_zones
          });
          set({ error: `Component '${component.name}' is not allowed in ${zone} zone` });
          return;
        }

        console.log('✅ Component allowed in zone');

        // Check if we can add this component (instance limits)
        if (!get().actions.canAddComponent(componentType)) {
          console.log('❌ Cannot add component - instance limit reached');
          set({ error: `Maximum instances of ${component.name} reached` });
          return;
        }

        console.log('✅ Can add component - instance limit OK');

        // Create new element with zone-based structure
        const newElement: PopupElement = {
          id: `${componentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: componentType,
          zone,
          config: { ...component.default_config_json },
          order: state.parsedBuilderState.zones[zone].components.length,
        };

        console.log('🆕 Created new element:', newElement);

        // Add element to the appropriate zone
        const updatedZones = {
          ...state.parsedBuilderState.zones,
          [zone]: {
            ...state.parsedBuilderState.zones[zone],
            components: [...state.parsedBuilderState.zones[zone].components, newElement],
          },
        };

        console.log('📍 Updated zones:', updatedZones);

        const updatedBuilderState = {
          ...state.parsedBuilderState,
          zones: updatedZones,
        };

        console.log('🔄 Updated builder state:', updatedBuilderState);

        // Update template with new builder state
        const updatedTemplate = {
          ...state.template,
          builder_state_json: updatedBuilderState,
        };

        // Update instance count
        const newInstanceCounts = {
          ...state.instanceCounts,
          [componentType]: (state.instanceCounts[componentType] || 0) + 1,
        };

        console.log('📊 Updated instance counts:', newInstanceCounts);

        set({
          template: updatedTemplate,
          parsedBuilderState: updatedBuilderState,
          instanceCounts: newInstanceCounts,
          selectedElement: newElement.id,
          isDirty: true,
          error: null,
        });

        console.log('✅ Element successfully added to store!');
      },

      removeElement: (elementId: string) => {
        const state = get();
        if (!state.template || !state.parsedBuilderState) return;

        // Find element across all zones
        let elementToRemove: PopupElement | null = null;
        let sourceZone: ZoneType | null = null;

        for (const [zoneName, zone] of Object.entries(state.parsedBuilderState.zones)) {
          const element = zone.components.find(el => el.id === elementId);
          if (element) {
            elementToRemove = element;
            sourceZone = zoneName as ZoneType;
            break;
          }
        }

        if (!elementToRemove || !sourceZone) return;

        // Remove element from its zone
        const updatedZones = {
          ...state.parsedBuilderState.zones,
          [sourceZone]: {
            ...state.parsedBuilderState.zones[sourceZone],
            components: state.parsedBuilderState.zones[sourceZone].components.filter(el => el.id !== elementId),
          },
        };

        const updatedBuilderState = {
          ...state.parsedBuilderState,
          zones: updatedZones,
        };

        // Update template with new builder state
        const updatedTemplate = {
          ...state.template,
          builder_state_json: updatedBuilderState,
        };

        // Update instance count
        const newInstanceCounts = {
          ...state.instanceCounts,
          [elementToRemove.type]: Math.max(0, (state.instanceCounts[elementToRemove.type] || 0) - 1),
        };

        set({
          template: updatedTemplate,
          parsedBuilderState: updatedBuilderState,
          instanceCounts: newInstanceCounts,
          selectedElement: state.selectedElement === elementId ? null : state.selectedElement,
          isDirty: true,
        });
      },

      updateElement: (elementId: string, updates: Partial<PopupElement>) => {
        const state = get();
        if (!state.template || !state.parsedBuilderState) return;

        // Find element across all zones and update it
        let elementFound = false;
        const updatedZones = { ...state.parsedBuilderState.zones };

        for (const [zoneName, zone] of Object.entries(updatedZones)) {
          const elementIndex = zone.components.findIndex(el => el.id === elementId);
          if (elementIndex !== -1) {
            updatedZones[zoneName as ZoneType] = {
              ...zone,
              components: zone.components.map((element, index) =>
                index === elementIndex ? { ...element, ...updates } : element
              ),
            };
            elementFound = true;
            break;
          }
        }

        if (!elementFound) return;

        const updatedBuilderState = {
          ...state.parsedBuilderState,
          zones: updatedZones,
        };

        const updatedTemplate = {
          ...state.template,
          builder_state_json: updatedBuilderState,
        };

        set({
          template: updatedTemplate,
          parsedBuilderState: updatedBuilderState,
          isDirty: true,
        });
      },

      duplicateElement: (elementId: string) => {
        const state = get();
        if (!state.template || !state.parsedBuilderState) return;

        // Find element across all zones
        let elementToDuplicate: PopupElement | null = null;
        let sourceZone: ZoneType | null = null;

        for (const [zoneName, zone] of Object.entries(state.parsedBuilderState.zones)) {
          const element = zone.components.find(el => el.id === elementId);
          if (element) {
            elementToDuplicate = element;
            sourceZone = zoneName as ZoneType;
            break;
          }
        }

        if (!elementToDuplicate || !sourceZone) return;

        // Check if we can add another instance
        if (!get().actions.canAddComponent(elementToDuplicate.type)) {
          const component = state.availableComponents.find(c => c.type === elementToDuplicate.type);
          set({ error: `Maximum instances of ${component?.name || elementToDuplicate.type} reached` });
          return;
        }

        const duplicatedElement: PopupElement = {
          ...elementToDuplicate,
          id: `${elementToDuplicate.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          order: state.parsedBuilderState.zones[sourceZone].components.length, // Add at end
        };

        // Add duplicated element to the same zone
        const updatedZones = {
          ...state.parsedBuilderState.zones,
          [sourceZone]: {
            ...state.parsedBuilderState.zones[sourceZone],
            components: [...state.parsedBuilderState.zones[sourceZone].components, duplicatedElement],
          },
        };

        const updatedBuilderState = {
          ...state.parsedBuilderState,
          zones: updatedZones,
        };

        const updatedTemplate = {
          ...state.template,
          builder_state_json: updatedBuilderState,
        };

        // Update instance count
        const newInstanceCounts = {
          ...state.instanceCounts,
          [elementToDuplicate.type]: (state.instanceCounts[elementToDuplicate.type] || 0) + 1,
        };

        set({
          template: updatedTemplate,
          parsedBuilderState: updatedBuilderState,
          instanceCounts: newInstanceCounts,
          selectedElement: duplicatedElement.id,
          isDirty: true,
        });
      },

      // Selection and interaction
      selectElement: (elementId: string | null) => {
        set({ selectedElement: elementId });
      },
      
      reorderElements: (zone: ZoneType, fromIndex: number, toIndex: number) => {
        console.log('🏪 reorderElements called:', { zone, fromIndex, toIndex });
        
        const state = get();
        if (!state.template || !state.parsedBuilderState) {
          console.log('❌ No template or parsed state');
          return;
        }
        
        const zoneComponents = [...state.parsedBuilderState.zones[zone].components];
        console.log('📋 Original components:', zoneComponents.map(c => ({ id: c.id, type: c.type })));
        
        // Move element from fromIndex to toIndex
        const [movedElement] = zoneComponents.splice(fromIndex, 1);
        zoneComponents.splice(toIndex, 0, movedElement);
        
        console.log('📋 Reordered components:', zoneComponents.map(c => ({ id: c.id, type: c.type })));
        
        // Update order property for all elements
        const updatedComponents = zoneComponents.map((element, index) => ({
          ...element,
          order: index,
        }));
        
        const updatedZones = {
          ...state.parsedBuilderState.zones,
          [zone]: {
            ...state.parsedBuilderState.zones[zone],
            components: updatedComponents,
          },
        };
        
        const updatedBuilderState = {
          ...state.parsedBuilderState,
          zones: updatedZones,
        };
        
        const updatedTemplate = {
          ...state.template,
          builder_state_json: updatedBuilderState,
        };
        
        console.log('✅ Setting new state');
        set({
          template: updatedTemplate,
          parsedBuilderState: updatedBuilderState,
          isDirty: true,
        });
      },

      moveElement: (elementId: string, newZone: ZoneType, newOrder?: number) => {
        const state = get();
        if (!state.parsedBuilderState) return;

        // Find current element and its zone
        let currentElement: PopupElement | null = null;
        let currentZone: ZoneType | null = null;

        for (const [zoneName, zone] of Object.entries(state.parsedBuilderState.zones)) {
          const element = zone.components.find(el => el.id === elementId);
          if (element) {
            currentElement = element;
            currentZone = zoneName as ZoneType;
            break;
          }
        }

        if (!currentElement || !currentZone) return;

        // Remove from current zone
        const updatedZones = { ...state.parsedBuilderState.zones };
        updatedZones[currentZone] = {
          ...updatedZones[currentZone],
          components: updatedZones[currentZone].components.filter(el => el.id !== elementId),
        };

        // Add to new zone
        const updatedElement = {
          ...currentElement,
          zone: newZone,
          order: newOrder ?? updatedZones[newZone].components.length,
        };

        updatedZones[newZone] = {
          ...updatedZones[newZone],
          components: [...updatedZones[newZone].components, updatedElement],
        };

        const updatedBuilderState = {
          ...state.parsedBuilderState,
          zones: updatedZones,
        };

        const updatedTemplate = {
          ...state.template!,
          builder_state_json: updatedBuilderState,
        };

        set({
          template: updatedTemplate,
          parsedBuilderState: updatedBuilderState,
          isDirty: true,
        });
      },

      resizeElement: (elementId: string, dimensions: { width: number; height: number }) => {
        // Update element config with new dimensions
        get().actions.updateElement(elementId, {
          config: {
            ...get().actions.getElementById(elementId)?.config,
            width: dimensions.width,
            height: dimensions.height,
          },
        });
      },

      // Drag and drop
      startDrag: (component: ComponentConfig) => {
        set({ draggedComponent: component });
      },

      endDrag: () => {
        set({ draggedComponent: null });
      },

      // UI state
      setMode: (mode: BuilderMode) => {
        set({ mode });
      },

      setPreviewMode: (enabled: boolean) => {
        set({ previewMode: enabled });
      },

      setPreviewDevice: (device: DeviceType) => {
        set({ previewDevice: device });
      },

      // Template metadata updates (if needed)
      updateTemplateMetadata: (metadata: { name?: string; description?: string }) => {
        const state = get();
        if (!state.template) return;

        const updatedTemplate = {
          ...state.template,
          ...metadata,
        };

        set({
          template: updatedTemplate,
          isDirty: true,
        });
      },

      // Utility functions
      canAddComponent: (componentType: string) => {
        const state = get();
        const component = state.availableComponents.find(c => c.type === componentType);
        if (!component) return false;
        
        // If max_instances is null, allow infinite instances
        if (component.max_instances === null) return true;
        
        const currentCount = state.instanceCounts[componentType] || 0;
        return currentCount < component.max_instances;
      },

      getElementById: (elementId: string) => {
        const state = get();
        if (!state.parsedBuilderState) return null;
        
        // Recursive search function to traverse nested elements
        const searchRecursive = (elements: PopupElement[]): PopupElement | null => {
          for (const element of elements) {
            if (element.id === elementId) return element;
            
            // Search in container children
            if (element.children && element.children.length > 0) {
              const found = searchRecursive(element.children);
              if (found) return found;
            }
            
            // Search in grid cells (for future grid implementation)
            if (element.type === 'grid' && (element as any).cells) {
              const gridElement = element as any;
              for (const cellComponents of Object.values(gridElement.cells)) {
                if (Array.isArray(cellComponents)) {
                  const found = searchRecursive(cellComponents);
                  if (found) return found;
                }
              }
            }
          }
          return null;
        };
        
        // Search all zones recursively
        for (const zone of Object.values(state.parsedBuilderState.zones)) {
          const found = searchRecursive(zone.components);
          if (found) return found;
        }
        return null;
      },

      clearError: () => {
        set({ error: null });
      },
    },
  }))
);

// Selector hooks for specific state slices (following Zustand best practices)
export const usePopupTemplate = () => usePopupBuilderStore(state => state.template);
export const useSelectedElement = () => usePopupBuilderStore(state => state.selectedElement);
export const useBuilderMode = () => usePopupBuilderStore(state => state.mode);
export const useBuilderLoading = () => usePopupBuilderStore(state => state.loading);
export const useBuilderError = () => usePopupBuilderStore(state => state.error);
export const useBuilderActions = () => usePopupBuilderStore(state => state.actions);

// Computed selectors
export const useSelectedElementData = () => 
  usePopupBuilderStore(state => {
    if (!state.selectedElement || !state.parsedBuilderState) return null;
    return state.actions.getElementById(state.selectedElement);
  });

export const useCanAddComponent = (componentType: string) =>
  usePopupBuilderStore(state => state.actions.canAddComponent(componentType));

export const useInstanceCount = (componentType: string) =>
  usePopupBuilderStore(state => state.instanceCounts[componentType] || 0);
