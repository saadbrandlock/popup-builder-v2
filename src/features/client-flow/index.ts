/**
 * Client Flow Feature
 * Export all types, store, hooks, and components for the client flow feature
 */

// Types
export * from './types/clientFlow';

// Store
export { useClientFlowStore } from '../../stores/clientFlowStore';

// Hooks
export * from './hooks/useClientData';
export * from './hooks/useTemplateData';

// Main Unified Component
export { ClientFlow } from './components/ClientFlow';

// Individual Screen Components (for advanced usage)
export { LandingPreview } from './screens/LandingPreview';
export { DesktopReview } from './screens/DesktopReview';
export { MobileReview } from './screens/MobileReview';
export { CopyReview } from './screens/CopyReview';
export { ReviewScreen } from './screens/ReviewScreen';

// Reusable Components
export { BrowserPreview } from './components/BrowserPreview';
export { ReviewCard } from './components/ReviewCard';
export { NavigationStepper } from './components/NavigationStepper';
export { BrowserChrome } from './components/BrowserChrome';
export { WebsiteBackground } from './components/WebsiteBackground';

// Re-export popup-builder components and types for client flow use
export { PopupPreview } from '../popup-builder/components/PopupPreview';
export { usePopupPreview } from '../popup-builder/hooks/usePopupPreview';
export type { PopupPreviewProps } from '../popup-builder/types';
