import { useState, useEffect } from 'react';
import type { ClientData, WebsiteData } from '../types/clientFlow';

// ============================================================================
// DUMMY DATA - API READY STRUCTURE
// ============================================================================

const dummyWebsiteData: WebsiteData[] = [
  {
    id: 'website-ecommerce-1',
    clientId: 'client-001',
    backgroundImage: '/dummy-assets/ecommerce-homepage.jpg',
    brandColors: {
      primary: '#007bff',
      secondary: '#6c757d',
      accent: '#28a745',
    },
    logo: '/dummy-assets/ecommerce-logo.png',
    companyName: 'Fashion Store',
    websiteUrl: 'https://fashion-store.com',
    category: 'E-commerce',
  },
  {
    id: 'website-saas-1',
    clientId: 'client-002',
    backgroundImage: '/dummy-assets/saas-homepage.jpg',
    brandColors: {
      primary: '#28a745',
      secondary: '#17a2b8',
      accent: '#ffc107',
    },
    logo: '/dummy-assets/saas-logo.png',
    companyName: 'ProductivityApp',
    websiteUrl: 'https://productivity-app.com',
    category: 'SaaS',
  },
  {
    id: 'website-blog-1',
    clientId: 'client-003',
    backgroundImage: '/dummy-assets/blog-homepage.jpg',
    brandColors: {
      primary: '#6f42c1',
      secondary: '#e83e8c',
      accent: '#fd7e14',
    },
    logo: '/dummy-assets/blog-logo.png',
    companyName: 'TechBlog',
    websiteUrl: 'https://tech-blog.com',
    category: 'Blog',
  },
];

const dummyClientData: ClientData[] = [
  {
    id: 'client-001',
    companyName: 'Fashion Store',
    contactEmail: 'contact@fashion-store.com',
    industry: 'E-commerce',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'client-002',
    companyName: 'ProductivityApp',
    contactEmail: 'hello@productivity-app.com',
    industry: 'SaaS',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
  },
  {
    id: 'client-003',
    companyName: 'TechBlog',
    contactEmail: 'editor@tech-blog.com',
    industry: 'Media',
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-22T13:15:00Z',
  },
];

// ============================================================================
// HOOKS - API READY
// ============================================================================

/**
 * Hook for managing client data (dummy now, API-driven later)
 */
export const useClientData = (clientId?: string) => {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate API call for client data
  const fetchClientData = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const client = dummyClientData.find(c => c.id === id);
      const website = dummyWebsiteData.find(w => w.clientId === id);
      
      if (!client) {
        throw new Error(`Client with ID ${id} not found`);
      }
      
      setClientData(client);
      setWebsiteData(website || null);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch client data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch if clientId is provided
  useEffect(() => {
    if (clientId) {
      fetchClientData(clientId);
    }
  }, [clientId]);

  // Get random client data for demo purposes
  const getRandomClientData = () => {
    const randomIndex = Math.floor(Math.random() * dummyClientData.length);
    const client = dummyClientData[randomIndex];
    const website = dummyWebsiteData.find(w => w.clientId === client.id);
    
    setClientData(client);
    setWebsiteData(website || null);
  };

  // Get all available clients (for selection)
  const getAllClients = () => {
    return dummyClientData.map(client => ({
      id: client.id,
      companyName: client.companyName,
      industry: client.industry,
    }));
  };

  return {
    clientData,
    websiteData,
    loading,
    error,
    fetchClientData,
    getRandomClientData,
    getAllClients,
    setError,
  };
};

/**
 * Hook for managing website background data specifically
 */
export const useWebsiteData = (clientId?: string) => {
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWebsiteData = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const website = dummyWebsiteData.find(w => w.clientId === id);
      
      if (!website) {
        throw new Error(`Website data for client ${id} not found`);
      }
      
      setWebsiteData(website);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch website data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchWebsiteData(clientId);
    }
  }, [clientId]);

  return {
    websiteData,
    loading,
    error,
    fetchWebsiteData,
    setError,
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get fallback website data for when client data is not available
 */
export const getFallbackWebsiteData = (): WebsiteData => {
  return {
    id: 'fallback-website',
    clientId: 'fallback-client',
    backgroundImage: '/dummy-assets/generic-website.jpg',
    brandColors: {
      primary: '#6c757d',
      secondary: '#adb5bd',
    },
    companyName: 'Sample Website',
    websiteUrl: 'https://example.com',
    category: 'Other',
  };
};

/**
 * Generate CSS custom properties from brand colors
 */
export const generateBrandColorCSS = (brandColors: WebsiteData['brandColors']): string => {
  return `
    --brand-primary: ${brandColors.primary};
    --brand-secondary: ${brandColors.secondary};
    ${brandColors.accent ? `--brand-accent: ${brandColors.accent};` : ''}
  `;
};

/**
 * Get website data by category for filtering
 */
export const getWebsiteDataByCategory = (category: WebsiteData['category']): WebsiteData[] => {
  return dummyWebsiteData.filter(website => website.category === category);
};
