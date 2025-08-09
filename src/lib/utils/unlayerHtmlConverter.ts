/**
 * Utility service for converting Unlayer JSON designs to HTML
 * Uses the existing react-email-editor package instead of dynamic script loading
 */

import { sanitizeHtml } from '@/lib';

export interface UnlayerHtmlConverterOptions {
  projectId?: number;
  timeout?: number; // Timeout in milliseconds
}

/**
 * Convert Unlayer JSON design to HTML using temporary editor instance
 * This leverages the existing Unlayer integration from react-email-editor
 */
export const convertUnlayerJsonToHtml = async (
  designJson: any,
  options: UnlayerHtmlConverterOptions = {}
): Promise<string> => {
  const { projectId = 123, timeout = 15000 } = options;

  if (!designJson) {
    throw new Error('Design JSON is required');
  }

  // Validate design format
  if (!validateUnlayerDesign(designJson)) {
    throw new Error('Invalid Unlayer design format');
  }

  return new Promise<string>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`HTML conversion timed out after ${timeout}ms`));
    }, timeout);

    // Create a temporary container for the editor
    const tempContainer = document.createElement('div');
    tempContainer.id = `unlayer-temp-${Date.now()}`;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '800px';
    tempContainer.style.height = '600px';
    tempContainer.style.visibility = 'hidden';
    document.body.appendChild(tempContainer);

    const cleanup = () => {
      clearTimeout(timeoutId);
      if (tempContainer.parentNode) {
        document.body.removeChild(tempContainer);
      }
    };

    try {
      // Use the global unlayer object (loaded by react-email-editor)
      const unlayer = (window as any).unlayer;
      
      if (!unlayer) {
        cleanup();
        reject(new Error('Unlayer is not available. Make sure react-email-editor is properly loaded.'));
        return;
      }

      console.log('🔄 Initializing temporary Unlayer editor for HTML conversion...');

      // Initialize temporary editor instance
      unlayer.init({
        id: tempContainer.id,
        projectId: projectId,
        displayMode: 'popup', // Use popup display mode for templates
      });

      // Wait for editor to be ready
      unlayer.addEventListener('editor:ready', () => {
        try {
          console.log('✅ Temporary editor ready, loading design...');
          
          // Load the design
          unlayer.loadDesign(designJson);

          // Small delay to ensure design is loaded
          setTimeout(() => {
            // Export HTML
            unlayer.exportHtml((data: any) => {
              try {
                const { html } = data;
                console.log('📄 Raw HTML exported, length:', html?.length);
                
                if (!html) {
                  cleanup();
                  reject(new Error('No HTML content generated from design'));
                  return;
                }

                const sanitizedHtml = sanitizeHtml(html);
                console.log('✅ HTML conversion completed successfully');
                cleanup();
                resolve(sanitizedHtml);
              } catch (error) {
                console.error('❌ HTML export processing failed:', error);
                cleanup();
                reject(new Error(`HTML export failed: ${error}`));
              }
            });
          }, 1000); // 1 second delay to ensure design is fully loaded

        } catch (error) {
          console.error('❌ Failed to process design:', error);
          cleanup();
          reject(new Error(`Failed to process design: ${error}`));
        }
      });

    } catch (error) {
      console.error('❌ Failed to initialize temporary editor:', error);
      cleanup();
      reject(new Error(`Failed to initialize temporary editor: ${error}`));
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

  // Check for basic Unlayer design structure
  // Unlayer designs typically have body, counters, and other metadata
  return !!(
    designJson.body || 
    designJson.counters || 
    designJson.schemaVersion ||
    (designJson.values && typeof designJson.values === 'object')
  );
};