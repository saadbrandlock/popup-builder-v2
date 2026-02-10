import { create } from 'zustand';
import type {
  ClientFlowState,
  ClientFlowActions,
  ReviewStatus,
} from '../features/client-flow/types/clientFlow';
import {
  CBTemplateFieldContentIdMapping,
  CBTemplateFieldContentIdMappingWithContent,
  ClientFlowData,
  ShopperDetails,
} from '@/types';

// Default state values
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

    // Client Data (API-ready)
    clientData: null,

    // Template Data (API-ready)
    selectedTemplate: null,

    // Review Data
    desktopReview: defaultReviewStatus,
    mobileReview: defaultReviewStatus,
    finalReview: defaultReviewStatus,
    comments: [],

    // Error States
    error: null,

    // custom
    shopperDetails: null,
    activeContentShopper: {
      template: { name: null, id: null },
      content: { name: null, id: null },
    },

    //content step
    contentFields: [],
    contentFormData: {} as { [key: string]: string },
    selectedDeviceId: null as number | null,

    // feedback state
    feedbackData: {
      desktop: '',
      mobile: '',
    } as { [key: string]: string },

    // field highlighting state
    activeHighlightedField: null as string | null,
    highlightedFieldName: null as string | null,

    selectedReviewShopperId: null as number | null,
    selectedReviewTemplateId: null as string | null,

    // ============================================================================
    // ACTIONS (following existing store pattern)
    // ============================================================================

    actions: {
      // Navigation
      setCurrentStep: (step: number) => {
        set({ currentStep: step });
      },

      setShopperDetails: (details: ShopperDetails) => {
        set({ shopperDetails: details });
      },

      setActiveContentShopper: (shopper: {
        template?: { name: string; id: string };
        content?: { name: string; id: string };
      }) => {
        set((state) => ({
          activeContentShopper: {
            ...state.activeContentShopper,
            template: shopper.template || get().activeContentShopper.template,
            content: shopper.content || get().activeContentShopper.content,
          },
        }));
      },

      setClientData: (data: ClientFlowData[]) => {
        set({ clientData: data });
      },

      // Template Management (API-ready)
      setSelectedTemplate: (template: any) => {
        set({ selectedTemplate: template });
      },

      setSelectedReviewShopperId: (id: number | null) => {
        set({ selectedReviewShopperId: id });
      },

      setSelectedReviewTemplateId: (id: string | null) => {
        set({ selectedReviewTemplateId: id });
      },

      // content step
      setContentFields: (fields: CBTemplateFieldContentIdMappingWithContent[]) => {
        set({ contentFields: fields });
      },


      setContentFormData: (data: { [key: string]: string }) => {
        set({ contentFormData: data });
      },

      setSelectedDeviceId: (deviceId: number | null) => {
        set({ selectedDeviceId: deviceId });
      },

      // feedback management
      updateFeedbackData: (type: string, value: string) => {
        set((state) => ({
          feedbackData: {
            ...state.feedbackData,
            [type]: value,
          },
        }));
      },

      // field highlighting management
      setHighlightedField: (fieldId: string | null, fieldName?: string | null) => {
        set({ 
          activeHighlightedField: fieldId,
          highlightedFieldName: fieldName || null,
        });
      },

      // Error Management
      clearError: () => {
        set({ error: null });
      },
    },
  })
);

// ============================================================================
// CONVENIENCE HOOKS (following existing pattern)
// ============================================================================

export const useClientFlowActions = () =>
  useClientFlowStore((state) => state.actions);

export const useClientFlowError = () =>
  useClientFlowStore((state) => state.error);
