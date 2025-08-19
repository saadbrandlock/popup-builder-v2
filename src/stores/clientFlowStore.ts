import { create } from 'zustand';
import type {
  ClientFlowState,
  ClientFlowActions,
  WebsiteData,
  ReviewStatus,
  Comment,
  PreviewSettings,
} from '../features/client-flow/types/clientFlow';
import { ClientFlowData, ShopperDetails } from '@/types';

// Default state values
const defaultPreviewSettings: PreviewSettings = {
  scale: 1,
  showBrowserChrome: true,
  interactive: false,
  showDeviceFrame: true,
  backgroundOpacity: 1,
};

const defaultReviewStatus: ReviewStatus = {
  status: 'pending',
};

// Store implementation following existing pattern
export const useClientFlowStore = create<ClientFlowState & ClientFlowActions>(
  (set, get) => ({
    // ============================================================================
    // STATE
    // ============================================================================

    // Review Flow State
    currentStep: 0,
    reviewProgress: {
      currentStep: 0,
      totalSteps: 4,
      completedSteps: [],
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    },

    // Client Data (API-ready)
    clientData: null,
    websiteData: null,

    // Template Data (API-ready)
    selectedTemplate: null,
    availableTemplates: [],

    // Review Data
    desktopReview: defaultReviewStatus,
    mobileReview: defaultReviewStatus,
    finalReview: defaultReviewStatus,
    comments: [],

    // Preview Settings
    previewSettings: defaultPreviewSettings,

    // Loading States (following existing pattern)
    loading: {
      clientData: false,
      websiteData: false,
      templates: false,
      reviewSubmission: false,
    },

    // Error States
    error: null,

    // custom
    shopperDetails: null,
    activeShopper: {
      template: { name: null, id: null },
      content: { name: null, id: null },
    },

    // ============================================================================
    // ACTIONS (following existing store pattern)
    // ============================================================================

    actions: {
      // Navigation
      setCurrentStep: (step: number) => {
        set((state) => ({
          currentStep: step,
          reviewProgress: {
            ...state.reviewProgress,
            currentStep: step,
            lastUpdatedAt: new Date().toISOString(),
          },
        }));
      },

      setShopperDetails: (details: ShopperDetails) => {
        set({ shopperDetails: details });
      },

      setActiveShopper: (shopper: {
        template?: { name: string; id: string };
        content?: { name: string; id: string };
      }) => {
        set((state) => ({
          activeShopper: {
            ...state.activeShopper,
            template: shopper.template || state.activeShopper.template,
            content: shopper.content || state.activeShopper.content,
          },
        }));
      },

      setClientData: (data: ClientFlowData[]) => {
        set({ clientData: data });
      },

      nextStep: () => {
        const { currentStep, reviewProgress } = get();
        const nextStep = Math.min(
          currentStep + 1,
          reviewProgress.totalSteps - 1
        );
        get().actions.setCurrentStep(nextStep);
      },

      previousStep: () => {
        const { currentStep } = get();
        const prevStep = Math.max(currentStep - 1, 0);
        get().actions.setCurrentStep(prevStep);
      },

      setWebsiteData: (data: WebsiteData) => {
        set({ websiteData: data });
      },

      // Template Management (API-ready)
      setSelectedTemplate: (template: any) => {
        set({ selectedTemplate: template });
      },

      setAvailableTemplates: (templates: any[]) => {
        set({ availableTemplates: templates });
      },

      // Review Management
      updateReview: (
        step: 'desktop' | 'mobile' | 'final',
        status: ReviewStatus
      ) => {
        set((state) => ({
          [step === 'desktop' ? 'desktopReview' : 'mobileReview']: status,
          reviewProgress: {
            ...state.reviewProgress,
            lastUpdatedAt: new Date().toISOString(),
          },
        }));
      },

      addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => {
        const newComment: Comment = {
          ...comment,
          id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          comments: [...state.comments, newComment],
        }));
      },

      // Preview Settings
      updatePreviewSettings: (settings: Partial<PreviewSettings>) => {
        set((state) => ({
          previewSettings: {
            ...state.previewSettings,
            ...settings,
          },
        }));
      },

      // Loading States (following existing pattern)
      setLoading: (key: keyof ClientFlowState['loading'], value: boolean) => {
        set((state) => ({
          loading: {
            ...state.loading,
            [key]: value,
          },
        }));
      },

      // Error Management
      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Reset
      resetFlow: () => {
        set({
          currentStep: 0,
          reviewProgress: {
            currentStep: 0,
            totalSteps: 4,
            completedSteps: [],
            startedAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
          },
          clientData: null,
          websiteData: null,
          selectedTemplate: null,
          availableTemplates: [],
          desktopReview: defaultReviewStatus,
          mobileReview: defaultReviewStatus,
          comments: [],
          previewSettings: defaultPreviewSettings,
          loading: {
            clientData: false,
            websiteData: false,
            templates: false,
            reviewSubmission: false,
          },
          error: null,
        });
      },
    },
  })
);

// ============================================================================
// CONVENIENCE HOOKS (following existing pattern)
// ============================================================================

export const useClientFlowActions = () =>
  useClientFlowStore((state) => state.actions);

export const useClientFlowLoading = () =>
  useClientFlowStore((state) => state.loading);

export const useClientFlowError = () =>
  useClientFlowStore((state) => state.error);

export const useReviewProgress = () =>
  useClientFlowStore((state) => state.reviewProgress);

export const usePreviewSettings = () =>
  useClientFlowStore((state) => state.previewSettings);
