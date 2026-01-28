/**
 * Client Flow Screens
 * Export all screens for the client flow feature
 */

export { LandingPreview } from './LandingPreview';
export { DesktopReview } from './DesktopReview';
export { MobileReview } from './MobileReview';
export { ReviewScreen } from './ReviewScreen';
export { ClientEditor } from './ClientEditor';
export type { ClientEditorProps } from './ClientEditor';
export { OnboardingPreview } from './OnboardingPreview';

// Screen types for routing
export type ClientFlowScreen = 'landing' | 'desktop' | 'mobile' | 'final' | 'editor' | 'onboarding';