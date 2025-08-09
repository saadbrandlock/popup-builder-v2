// Popup Builder Feature - Main Export File
// Following the established pattern for feature exports

// Main component
export { PopupBuilder } from './components/PopupBuilder';

// Individual components for advanced usage
export {
  DraggableComponent,
  SimpleCanvas,
  DOMElementRenderer,
  ComponentLibrary,
  PropertyPanel,
  ActionBar,
  PopupPreview,
} from './components';

// Hooks for custom implementations
export {
  useComponentLibrary,
  useDragAndDrop,
  usePopupPreview,
  usePopupBuilderStore,
  usePopupTemplate,
  useSelectedElement,
  useBuilderMode,
  useBuilderLoading,
  useBuilderError,
  useBuilderActions,
  useSelectedElementData,
  useCanAddComponent,
  useInstanceCount,
} from './hooks';

// Store for direct access
export {
  usePopupBuilderStore as popupBuilderStore,
} from './stores';

// Types for TypeScript users
export type {
  PopupTemplate,
  PopupElement,
  PopupBuilderState,
  PopupBuilderActions,
  ComponentConfig,
  ComponentType,
  ComponentCategory,
  ElementPosition,
  ElementStyle,
  PopupBuilderProps,
  PopupCanvasProps,
  ComponentLibraryProps,
  PropertyPanelProps,
  PopupPreviewProps,
  ActionBarProps,
  BuilderMode,
  DeviceType,
  UserRole,
  DragData,
  DropResult,
  PopupBuilderError,
  ValidationResult,
  ExportOptions,
} from './types';
