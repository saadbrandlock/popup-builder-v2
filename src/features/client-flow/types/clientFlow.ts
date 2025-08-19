// Client Flow Types - API-Ready Architecture

import { ClientFlowData, ShopperDetails } from '@/types';

// Note: DeviceType is re-exported from popup-builder in index.ts
// ============================================================================
// CLIENT DATA TYPES - API READY
// ============================================================================

export interface WebsiteData {
  id: string;
  clientId: string;
  backgroundImage: {
    desktop: string;
    mobile: string;
  };
  companyName: string;
  websiteUrl: string;
  category: string;
}

export interface HTMLContent {
  html: string;
  css: string;
  js?: string;
}

export interface ScreenshotData {
  id: string;
  url: string;
  viewport: 'desktop' | 'mobile' | 'tablet';
  timestamp: string;
}

// ============================================================================
// REVIEW FLOW TYPES
// ============================================================================

export interface ReviewProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  startedAt: string;
  lastUpdatedAt: string;
}

export interface ReviewStatus {
  status: 'pending' | 'approved' | 'rejected' | 'needs_changes';
  reviewedAt?: string;
  reviewerId?: string;
  feedback?: string;
}

export interface Comment {
  id: string;
  step: 'desktop' | 'mobile' | 'final' | 'general';
  message: string;
  author: string;
  createdAt: string;
  resolved: boolean;
}

export interface PreviewSettings {
  scale: number;
  showBrowserChrome: boolean;
  interactive: boolean;
  showDeviceFrame: boolean;
  backgroundOpacity: number;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface BrowserPreviewProps {
  viewport: 'desktop' | 'mobile';
  websiteBackground: WebsiteData;
  popupTemplate: any | null;
  showBrowserChrome?: boolean;
  interactive?: boolean;
  scale?: number;
  onPopupInteraction?: (action: string) => void;
  className?: string;
}

export interface WebsiteBackgroundProps {
  websiteData: WebsiteData;
  viewport: 'desktop' | 'mobile';
  loading?: boolean;
  fallbackImage?: string;
  className?: string;
}

export interface BrowserChromeProps {
  url: string;
  viewport: 'desktop' | 'mobile';
  className?: string;
}

export interface ReviewCardProps {
  title: string;
  status: ReviewStatus;
  onApprove: () => void;
  onReject: () => void;
  onRequestChanges: (feedback: string) => void;
  comments?: Comment[];
  className?: string;
}

export interface NavigationStepperProps {
  currentStep: number;
  totalSteps: number;
  steps: StepConfig[];
  onStepClick?: (step: number) => void;
  className?: string;
}

export interface StepConfig {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  icon?: React.ReactNode;
}

// ============================================================================
// STORE STATE TYPES
// ============================================================================

export interface ClientFlowState {
  // Review Flow State
  currentStep: number;
  reviewProgress: ReviewProgress;

  // Client Data (API-ready)
  clientData: ClientFlowData[] | null;
  websiteData: WebsiteData | null;

  // Template Data (API-ready)
  selectedTemplate: any | null;
  availableTemplates: any[];

  // Review Data
  desktopReview: ReviewStatus;
  mobileReview: ReviewStatus;
  finalReview: ReviewStatus;
  comments: Comment[];

  // Preview Settings
  previewSettings: PreviewSettings;

  // Loading States (following existing pattern)
  loading: {
    clientData: boolean;
    websiteData: boolean;
    templates: boolean;
    reviewSubmission: boolean;
  };

  // Error States
  error: string | null;

  shopperDetails: ShopperDetails | null;
  activeShopper: {
    template: { name: string | null; id: string | null };
    content: { name: string | null; id: string | null };
  };
}

export interface ClientFlowActions {
  actions: {
    // Navigation
    setCurrentStep: (step: number) => void;
    nextStep: () => void;
    previousStep: () => void;

    // Client Data Management (API-ready)
    setClientData: (data: ClientFlowData[]) => void;
    setWebsiteData: (data: WebsiteData) => void;

    // Template Management (API-ready)
    setSelectedTemplate: (template: any) => void;
    setAvailableTemplates: (templates: any[]) => void;

    // Review Management
    updateReview: (
      step: 'desktop' | 'mobile' | 'final',
      status: ReviewStatus
    ) => void;
    addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => void;

    // Preview Settings
    updatePreviewSettings: (settings: Partial<PreviewSettings>) => void;

    // Loading States (following existing pattern)
    setLoading: (key: keyof ClientFlowState['loading'], value: boolean) => void;

    // Error Management
    setError: (error: string | null) => void;
    clearError: () => void;

    // Reset
    resetFlow: () => void;

    // Shopper Details
    setShopperDetails: (details: ShopperDetails) => void;
    setActiveShopper: ({
      template,
      content,
    }: {
      template?: { name: string; id: string };
      content?: { name: string; id: string };
    }) => void;
  };
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ReviewSubmission {
  clientId: string;
  templateId: string;
  desktopReview: ReviewStatus;
  mobileReview: ReviewStatus;
  comments: Comment[];
  submittedAt: string;
}

export interface ClientFlowApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ViewportType = 'desktop' | 'mobile';
export type ReviewStepType = 'desktop' | 'mobile' | 'general';
export type LoadingKey = keyof ClientFlowState['loading'];
