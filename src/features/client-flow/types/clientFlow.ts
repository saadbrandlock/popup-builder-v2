// Client Flow Types - API-Ready Architecture

import {
  CBTemplateFieldContentIdMapping,
  CBTemplateFieldContentIdMappingWithContent,
  ClientFlowData,
  ShopperDetails,
} from '@/types';

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

// ============================================================================
// REVIEW FLOW TYPES
// ============================================================================


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

  // Client Data (API-ready)
  clientData: ClientFlowData[] | null;

  // Template Data (API-ready)
  selectedTemplate: any | null;

  // Review Data
  desktopReview: ReviewStatus;
  mobileReview: ReviewStatus;
  finalReview: ReviewStatus;
  comments: Comment[];

  // Error States
  error: string | null;

  shopperDetails: ShopperDetails | null;
  activeContentShopper: {
    template: { name: string | null; id: string | null };
    content: { name: string | null; id: string | null };
  };

  // content step
  contentFields: CBTemplateFieldContentIdMappingWithContent[];
  contentFormData: { [key: string]: string };
  selectedDeviceId: number | null;

  // feedback state
  feedbackData: { [key: string]: string };

  // field highlighting state
  activeHighlightedField: string | null;
  highlightedFieldName: string | null;

  // selected shopper for content step (CopyReview) and fallback
  selectedReviewShopperId: number | null;

  // selected template for design review (steps 1, 2, 4) when multiple templates per device — template-based as admin grouped
  selectedReviewTemplateId: string | null;
}

export interface ClientFlowActions {
  actions: {
    // Navigation
    setCurrentStep: (step: number) => void;

    // Client Data Management (API-ready)
    setClientData: (data: ClientFlowData[]) => void;

    // Template Management (API-ready)
    setSelectedTemplate: (template: any) => void;
    setSelectedReviewShopperId: (id: number | null) => void;
    setSelectedReviewTemplateId: (id: string | null) => void;

    // Error Management
    clearError: () => void;

    // Shopper Details
    setShopperDetails: (details: ShopperDetails) => void;
    setActiveContentShopper: ({
      template,
      content,
    }: {
      template?: { name: string; id: string };
      content?: { name: string; id: string };
    }) => void;

    // content step
    setContentFields: (fields: CBTemplateFieldContentIdMappingWithContent[]) => void;
    setContentFormData: (data: { [key: string]: string }) => void;
    setSelectedDeviceId: (deviceId: number | null) => void;

    // field highlighting
    setHighlightedField: (fieldId: string | null, fieldName?: string | null) => void;

    // feedback management
    updateFeedbackData: (type: string, value: string) => void;
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
