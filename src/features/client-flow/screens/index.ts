/**
 * Client Flow Screens
 * Export all screens for the client flow feature
 */

export { LandingPreview } from './LandingPreview';
export { DesktopReview } from './DesktopReview';
export { MobileReview } from './MobileReview';
export { ReviewScreen } from './ReviewScreen';

// Screen types for routing
export type ClientFlowScreen = 'landing' | 'desktop' | 'mobile' | 'final';