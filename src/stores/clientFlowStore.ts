import { create } from 'zustand';
import type { PopupTemplate } from '../features/popup-builder/types';
import type { 
  ClientFlowState, 
  ClientFlowActions, 
  ClientData, 
  WebsiteData, 
  ReviewStatus, 
  Comment,
  PreviewSettings,
  ReviewSubmission
} from '../features/client-flow/types/clientFlow';

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
export const useClientFlowStore = create<ClientFlowState & ClientFlowActions>((set, get) => ({
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

    nextStep: () => {
      const { currentStep, reviewProgress } = get();
      const nextStep = Math.min(currentStep + 1, reviewProgress.totalSteps - 1);
      get().actions.setCurrentStep(nextStep);
    },

    previousStep: () => {
      const { currentStep } = get();
      const prevStep = Math.max(currentStep - 1, 0);
      get().actions.setCurrentStep(prevStep);
    },

    // Client Data Management (API-ready)
    setClientData: (data: ClientData) => {
      set({ clientData: data });
    },

    setWebsiteData: (data: WebsiteData) => {
      set({ websiteData: data });
    },

    fetchClientData: async (clientId: string) => {
      get().actions.setLoading('clientData', true);
      get().actions.setError(null);
      
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        // Mock client data for now
        const mockClientData: ClientData = {
          id: clientId,
          companyName: 'Sample E-commerce Store',
          contactEmail: 'contact@sample-store.com',
          industry: 'E-commerce',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        get().actions.setClientData(mockClientData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch client data';
        get().actions.setError(errorMessage);
      } finally {
        get().actions.setLoading('clientData', false);
      }
    },

    // Template Management (API-ready)
    setSelectedTemplate: (template: PopupTemplate) => {
      set({ selectedTemplate: template });
    },

    setAvailableTemplates: (templates: PopupTemplate[]) => {
      set({ availableTemplates: templates });
    },

    fetchTemplates: async (clientId: string) => {
      get().actions.setLoading('templates', true);
      get().actions.setError(null);
      
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        // Mock templates for now - will be replaced with actual API
        const mockTemplates: PopupTemplate[] = [];
        get().actions.setAvailableTemplates(mockTemplates);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch templates';
        get().actions.setError(errorMessage);
      } finally {
        get().actions.setLoading('templates', false);
      }
    },

    // Review Management
    updateReview: (step: 'desktop' | 'mobile' | 'final', status: ReviewStatus) => {
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

    submitReview: async () => {
      get().actions.setLoading('reviewSubmission', true);
      get().actions.setError(null);
      
      try {
        const { clientData, selectedTemplate, desktopReview, mobileReview, comments } = get();
        
        if (!clientData || !selectedTemplate) {
          throw new Error('Missing required data for review submission');
        }
        
        const reviewSubmission: ReviewSubmission = {
          clientId: clientData.id,
          templateId: selectedTemplate.id,
          desktopReview,
          mobileReview,
          comments,
          submittedAt: new Date().toISOString(),
        };
        
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
        
        console.log('Review submitted:', reviewSubmission);
        
        // Update progress to mark as completed
        set((state) => ({
          reviewProgress: {
            ...state.reviewProgress,
            completedSteps: [...state.reviewProgress.completedSteps, 'review-submitted'],
            lastUpdatedAt: new Date().toISOString(),
          },
        }));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit review';
        get().actions.setError(errorMessage);
        throw error; // Re-throw for component error handling
      } finally {
        get().actions.setLoading('reviewSubmission', false);
      }
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
}));

// ============================================================================
// CONVENIENCE HOOKS (following existing pattern)
// ============================================================================

export const useClientFlowActions = () => useClientFlowStore((state) => state.actions);

export const useClientFlowLoading = () => useClientFlowStore((state) => state.loading);

export const useClientFlowError = () => useClientFlowStore((state) => state.error);

export const useReviewProgress = () => useClientFlowStore((state) => state.reviewProgress);

export const usePreviewSettings = () => useClientFlowStore((state) => state.previewSettings);
