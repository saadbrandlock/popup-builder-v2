import { useState, useEffect } from 'react';
import type { PopupTemplate } from '../../popup-builder/types';

// ============================================================================
// DUMMY TEMPLATE DATA - API READY STRUCTURE
// ============================================================================

const dummyTemplates: PopupTemplate[] = [
  {
    id: 'template-discount-001',
    name: 'E-commerce Discount Popup',
    description: 'A conversion-focused discount popup for e-commerce stores',
    device_type_id: 1,
    device_ids: [1, 2],
    devices: [
      { id: 1, device_type: 'desktop' },
      { id: 2, device_type: 'mobile' }
    ],
    is_custom_coded: false,
    is_generic: true,
    account_ids: [1],
    canvas_type: 'popup',
    latest_published_version_id: null,
    ip_address: null,
    user_agent: null,
    remarks: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    created_by: 1,
    updated_by: 1,
    deleted_by: undefined,
    deleted_at: undefined,
    status: 'active',
    shopper_ids: [],
    builder_state_json: {
      zones: {
        header: {
          components: [
            {
              id: 'header-text-1',
              type: 'text',
              config: {
                content: '🎉 Special Offer!',
                style: {
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  textAlign: 'center',
                  padding: '16px',
                  backgroundColor: '#007bff',
                },
              },
              zone: 'header',
              order: 0,
            },
          ],
        },
        content: {
          components: [
            {
              id: 'content-text-1',
              type: 'text',
              config: {
                content: 'Get 20% off your first order!',
                style: {
                  fontSize: '18px',
                  color: '#333333',
                  textAlign: 'center',
                  padding: '20px',
                },
              },
              zone: 'content',
              order: 0,
            },
            {
              id: 'content-button-1',
              type: 'button',
              config: {
                text: 'Claim Discount',
                action: 'redirect',
                url: '#discount',
                style: {
                  backgroundColor: '#28a745',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                },
              },
              zone: 'content',
              order: 1,
            },
          ],
        },
        footer: {
          components: [
            {
              id: 'footer-text-1',
              type: 'text',
              config: {
                content: '*Offer valid for new customers only',
                style: {
                  fontSize: '12px',
                  color: '#666666',
                  textAlign: 'center',
                  padding: '8px',
                },
              },
              zone: 'footer',
              order: 0,
            },
          ],
        },
      },
    },
  },
];

// ============================================================================
// HOOKS - API READY
// ============================================================================

/**
 * Hook for managing template data (dummy now, API-driven later)
 */
export const useTemplateData = (clientId?: string) => {
  const [templates, setTemplates] = useState<PopupTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PopupTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate API call for templates
  const fetchTemplates = async (id?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, return all dummy templates
      // In the future, this would filter by clientId or other criteria
      setTemplates(dummyTemplates);
      
      // Auto-select first template if none selected
      if (!selectedTemplate && dummyTemplates.length > 0) {
        setSelectedTemplate(dummyTemplates[0]);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch templates on mount or when clientId changes
  useEffect(() => {
    fetchTemplates(clientId);
  }, [clientId]);

  // Select a specific template
  const selectTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
    }
  };

  // Get templates by category/type (for filtering)
  const getTemplatesByType = (type: string) => {
    // This would be enhanced with actual categorization
    return templates.filter(template => 
      template.name.toLowerCase().includes(type.toLowerCase())
    );
  };

  // Get random template for demo purposes
  const getRandomTemplate = () => {
    if (templates.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * templates.length);
    const template = templates[randomIndex];
    setSelectedTemplate(template);
    return template;
  };

  return {
    templates,
    selectedTemplate,
    loading,
    error,
    fetchTemplates,
    selectTemplate,
    setSelectedTemplate,
    getTemplatesByType,
    getRandomTemplate,
    setError,
  };
};

/**
 * Hook for template preview functionality
 */
export const useTemplatePreview = (template: PopupTemplate | null) => {
  const [previewReady, setPreviewReady] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      // Validate template structure
      try {
        if (!template.builder_state_json || !template.builder_state_json.zones) {
          throw new Error('Invalid template structure');
        }
        setPreviewReady(true);
        setPreviewError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Template preview error';
        setPreviewError(errorMessage);
        setPreviewReady(false);
      }
    } else {
      setPreviewReady(false);
      setPreviewError(null);
    }
  }, [template]);

  return {
    previewReady,
    previewError,
    setPreviewError,
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get template by ID
 */
export const getTemplateById = (templateId: string): PopupTemplate | null => {
  return dummyTemplates.find(template => template.id === templateId) || null;
};

/**
 * Get all available template categories
 */
export const getTemplateCategories = (): string[] => {
  const categories = new Set<string>();
  dummyTemplates.forEach(template => {
    // Extract category from template name (simplified)
    if (template.name.includes('Discount')) categories.add('Discount');
    if (template.name.includes('Newsletter')) categories.add('Newsletter');
    if (template.name.includes('Exit')) categories.add('Exit Intent');
  });
  return Array.from(categories);
};

/**
 * Validate template structure
 */
export const validateTemplate = (template: PopupTemplate): boolean => {
  try {
    return !!(
      template.id &&
      template.name &&
      template.builder_state_json &&
      template.builder_state_json.zones
    );
  } catch {
    return false;
  }
};
