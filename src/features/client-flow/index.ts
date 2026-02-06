/**
 * Client Flow Feature
 * Export all types, store, hooks, and components for the client flow feature
 */

// Types
export * from './types/clientFlow';

// Store
export { useClientFlowStore } from '../../stores/clientFlowStore';

// Main Unified Component
export { ClientFlow } from './screens/ClientFlow';

// Individual Screen Components (for advanced usage)
export { LandingPreview } from './screens/LandingPreview';
export { DesktopReview } from './screens/DesktopReview';
export { MobileReview } from './screens/MobileReview';
export { CopyReview } from './screens/CopyReview';
export { ReviewScreen } from './screens/ReviewScreen';
export { ClientEditor } from './screens/ClientEditor';
export type { ClientEditorProps } from './screens/ClientEditor';
export { OnboardingPreview } from './screens/OnboardingPreview';

// Reusable Components
export { BrowserPreview } from '../../components/common';
export { ReviewCard } from './components/ReviewCard';
export { NavigationStepper } from './components/NavigationStepper';
export { WebsiteBackground } from './components/WebsiteBackground';
export { ClientEditorStep } from './components/ClientEditorStep';
export type { ClientEditorStepProps } from './components/ClientEditorStep';
export { ClientReminderTabStep } from './components/ClientReminderTabStep';
export type { ClientReminderTabStepProps } from './components/ClientReminderTabStep';
