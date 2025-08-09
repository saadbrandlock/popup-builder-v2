// Popup Builder Utilities Exports
export { HTMLExporter, htmlExportUtils } from './htmlExport';
export { elementRendererUtils } from './elementRenderer';
export { canvasZoneUtils } from './canvasZone';
export { initializeTemplate } from './templateLoader';

// Phase 2: Tree-based utilities
export { ComponentTreeManager } from './componentTree';
export { ContainerManager } from './containerManager';
export { ConstraintValidator } from './constraintValidator';

// Re-export types for convenience
export type {
  ComponentNode,
  ContainerComponent,
  GridComponent,
  ComponentHierarchy,
} from './componentTree';