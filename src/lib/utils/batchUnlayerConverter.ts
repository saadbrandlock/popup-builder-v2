/**
 * Batch HTML converter for multiple Unlayer templates
 * Uses a single editor instance for efficient processing
 */

import { sanitizeHtml } from './helper';

export interface BatchConversionItem {
  id: string;
  designJson: any;
}

export interface BatchConversionResult {
  id: string;
  html: string | null;
  error?: string;
}

export interface BatchConverterOptions {
  projectId?: number;
  timeout?: number;
  delayBetweenConversions?: number;
}

/**
 * Load Unlayer script dynamically if not already loaded
 */
const loadUnlayerScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).unlayer) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src*="unlayer.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://editor.unlayer.com/embed.js';
    script.async = true;
    
    script.onload = () => {
      setTimeout(() => {
        if ((window as any).unlayer) {
          resolve();
        } else {
          reject(new Error('Unlayer failed to initialize'));
        }
      }, 100);
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Unlayer script'));
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Convert multiple Unlayer designs to HTML using a single editor instance
 */
export const convertMultipleUnlayerDesignsToHtml = async (
  items: BatchConversionItem[],
  options: BatchConverterOptions = {}
): Promise<BatchConversionResult[]> => {
  const { 
    projectId = 123, 
    timeout = 30000, 
    delayBetweenConversions = 1500 
  } = options;

  if (!items || items.length === 0) {
    return [];
  }

  // Ensure Unlayer is loaded
  try {
    await loadUnlayerScript();
  } catch (error) {
    throw new Error(`Failed to load Unlayer: ${error}`);
  }

  const unlayer = (window as any).unlayer;
  if (!unlayer) {
    throw new Error('Unlayer is not available after loading script');
  }

  // Create temporary container for the editor
  const tempContainer = document.createElement('div');
  tempContainer.id = `unlayer-batch-${Date.now()}`;
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '-9999px';
  tempContainer.style.width = '800px';
  tempContainer.style.height = '600px';
  tempContainer.style.visibility = 'hidden';
  document.body.appendChild(tempContainer);

  const results: BatchConversionResult[] = [];
  let editorInitialized = false;

  const cleanup = () => {
    if (tempContainer.parentNode) {
      document.body.removeChild(tempContainer);
    }
  };

  try {
    console.log(`🔄 Starting batch conversion of ${items.length} templates...`);

    // Initialize editor once
    await new Promise<void>((resolve, reject) => {
      const initTimeout = setTimeout(() => {
        reject(new Error('Editor initialization timeout'));
      }, 10000);

      unlayer.init({
        id: tempContainer.id,
        projectId: projectId,
        displayMode: 'popup',
      });

      unlayer.addEventListener('editor:ready', () => {
        clearTimeout(initTimeout);
        editorInitialized = true;
        console.log('✅ Batch editor initialized and ready');
        resolve();
      });
    });

    // Process each template sequentially
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`🔄 Processing template ${i + 1}/${items.length} (ID: ${item.id})`);

      try {
        const html = await convertSingleDesign(unlayer, item.designJson, delayBetweenConversions);
        results.push({
          id: item.id,
          html: html
        });
        console.log(`✅ Template ${item.id} converted successfully`);
      } catch (error) {
        console.warn(`⚠️ Failed to convert template ${item.id}:`, error);
        results.push({
          id: item.id,
          html: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`✅ Batch conversion completed. ${results.filter(r => r.html).length}/${items.length} successful`);
    return results;

  } catch (error) {
    console.error('❌ Batch conversion failed:', error);
    throw error;
  } finally {
    cleanup();
  }
};

/**
 * Convert a single design using the already initialized editor
 */
const convertSingleDesign = (
  unlayer: any, 
  designJson: any, 
  delay: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Load the design
      unlayer.loadDesign(designJson);

      // Wait for design to load, then export
      setTimeout(() => {
        unlayer.exportHtml((data: any) => {
          try {
            const { html } = data;
            if (!html) {
              reject(new Error('No HTML content generated'));
              return;
            }

            const sanitizedHtml = sanitizeHtml(html);
            resolve(sanitizedHtml);
          } catch (error) {
            reject(new Error(`HTML export failed: ${error}`));
          }
        });
      }, delay);

    } catch (error) {
      reject(new Error(`Failed to process design: ${error}`));
    }
  });
};

/**
 * Validate if the design JSON is in correct Unlayer format
 */
export const validateUnlayerDesign = (designJson: any): boolean => {
  if (!designJson || typeof designJson !== 'object') {
    return false;
  }

  return !!(
    designJson.body || 
    designJson.counters || 
    designJson.schemaVersion ||
    (designJson.values && typeof designJson.values === 'object')
  );
};
