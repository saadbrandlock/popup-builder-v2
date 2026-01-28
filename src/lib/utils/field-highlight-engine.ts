/**
 * Field Highlight Engine
 * Core utility for managing field-to-template highlighting with iframe communication
 * 
 * USAGE:
 * This engine is automatically integrated into PopupOnlyView components via the useFieldHighlight hook.
 * When a user focuses on or clicks the eye icon next to a form field in ContentForm,
 * the corresponding element in the template preview will be highlighted with a pulsing outline.
 * 
 * TESTING:
 * 1. Navigate to the Copy Review screen (Step 3 of client flow)
 * 2. Select a shopper segment to load content fields
 * 3. Focus on any form field (click into it) - the corresponding template element should highlight
 * 4. Click the eye icon next to a field label - triggers manual highlighting
 * 5. Switch between desktop/mobile tabs - highlighting should work on both
 * 6. Blur the field - highlighting should clear after 300ms
 * 
 * FIELD MATCHING:
 * The engine finds template elements using multiple strategies:
 * - Direct ID match: <element id="field-id">
 * - Data attributes: <element data-field-id="field-id">
 * - Class names: <element class="field-field-id">
 * - Name attributes: <input name="field-id">
 * 
 * CUSTOMIZATION:
 * Highlight colors, animation, and behavior can be configured via HighlightConfig in highlight-styles.ts
 */

import { HighlightConfig, DEFAULT_HIGHLIGHT_CONFIG, generateHighlightCSS, createTooltipElement } from './highlight-styles';

export interface FieldElement {
  element: Element;
  fieldId: string;
}

export interface HighlightMessage {
  type: 'HIGHLIGHT_FIELD' | 'CLEAR_HIGHLIGHT' | 'FIELD_CLICKED';
  fieldId?: string;
  config?: HighlightConfig;
  fieldName?: string;
}

/**
 * Field Highlight Engine
 * Manages highlighting of template elements based on form field interactions
 */
export class FieldHighlightEngine {
  private config: HighlightConfig;
  private activeFieldId: string | null = null;
  private highlightedElements: Map<string, Element> = new Map();
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_DELAY = 150;

  constructor(config: HighlightConfig = DEFAULT_HIGHLIGHT_CONFIG) {
    this.config = config;
  }

  /**
   * Update highlight configuration
   */
  public setConfig(config: Partial<HighlightConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Find element in document by field ID using multiple selector strategies
   * Reuses logic from template-content-parser.ts
   */
  private findElementByFieldId(doc: Document, fieldId: string): Element | null {
    // Escape fieldId for use in CSS selectors
    let escapedFieldId: string;
    try {
      escapedFieldId = CSS.escape(fieldId);
    } catch (error) {
      console.warn(`Could not escape field ID: ${fieldId}`, error);
      escapedFieldId = fieldId.replace(/[^a-zA-Z0-9-_]/g, '');
    }

    // Try different selectors to find the element
    const selectors = [
      `#${escapedFieldId}`,                    // Direct ID match
      `[data-field-id="${fieldId}"]`,          // Data attribute
      `[data-field="${fieldId}"]`,             // Alternative data attribute
      `[data-id="${fieldId}"]`,                // Generic data-id
      `.field-${escapedFieldId}`,              // Class-based selector
      `[name="${fieldId}"]`,                   // Name attribute (for inputs)
    ];

    for (const selector of selectors) {
      try {
        const element = doc.querySelector(selector);
        if (element) {
          return element;
        }
      } catch (error) {
        // Skip invalid selectors and continue
        continue;
      }
    }

    return null;
  }

  /**
   * Highlight a field in the iframe
   * @param iframeRef - Reference to the iframe element
   * @param fieldId - The field ID to highlight
   * @param fieldName - Optional display name for tooltip
   */
  public highlightField(
    iframeRef: HTMLIFrameElement | null,
    fieldId: string,
    fieldName?: string
  ): void {
    if (!iframeRef) return;

    // Debounce to prevent rapid flickering
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.executeHighlight(iframeRef, fieldId, fieldName);
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Execute the highlight operation
   */
  private executeHighlight(
    iframeRef: HTMLIFrameElement,
    fieldId: string,
    fieldName?: string
  ): void {
    const iframeDoc = iframeRef.contentDocument || iframeRef.contentWindow?.document;
    if (!iframeDoc) return;

    // Clear previous highlight
    this.clearHighlight(iframeRef);

    // Find the element
    const element = this.findElementByFieldId(iframeDoc, fieldId);
    
    if (!element) {
      console.warn(`[Field Highlight] Could not find element for field ID: ${fieldId}`);
      return;
    }
    
    console.log(`[Field Highlight] Highlighting field: ${fieldId}`, element);

    // Apply highlight class
    requestAnimationFrame(() => {
      element.classList.add('field-highlighted');
      this.highlightedElements.set(fieldId, element);
      this.activeFieldId = fieldId;

      // Add tooltip if enabled
      if (this.config.showTooltip && fieldName) {
        const tooltip = createTooltipElement(fieldName);
        const parent = element.parentElement || element;
        
        // Check if parent has relative/absolute positioning, if not set it
        const position = window.getComputedStyle(parent as HTMLElement).position;
        if (position === 'static') {
          (parent as HTMLElement).style.position = 'relative';
        }
        
        parent.appendChild(tooltip);
        
        // Store tooltip reference for cleanup
        element.setAttribute('data-tooltip-id', 'field-tooltip');
      }

      // Scroll element into view
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    });
  }

  /**
   * Clear all highlights in the iframe
   * @param iframeRef - Reference to the iframe element
   */
  public clearHighlight(iframeRef: HTMLIFrameElement | null): void {
    if (!iframeRef) return;

    const iframeDoc = iframeRef.contentDocument || iframeRef.contentWindow?.document;
    if (!iframeDoc) return;

    requestAnimationFrame(() => {
      // Remove highlight class from all highlighted elements
      this.highlightedElements.forEach((element) => {
        element.classList.remove('field-highlighted');
        
        // Remove tooltip if exists
        const tooltips = element.parentElement?.querySelectorAll('.field-highlight-tooltip');
        tooltips?.forEach(tooltip => tooltip.remove());
      });

      this.highlightedElements.clear();
      this.activeFieldId = null;
    });
  }

  /**
   * Inject highlight styles into iframe
   * @param iframeRef - Reference to the iframe element
   */
  public injectStyles(iframeRef: HTMLIFrameElement | null): void {
    if (!iframeRef) return;

    const iframeDoc = iframeRef.contentDocument || iframeRef.contentWindow?.document;
    if (!iframeDoc) return;

    // Remove existing styles if present
    const existingStyle = iframeDoc.getElementById('field-highlight-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Inject new styles
    const style = iframeDoc.createElement('style');
    style.id = 'field-highlight-styles';
    style.textContent = generateHighlightCSS(this.config);
    iframeDoc.head.appendChild(style);
  }

  /**
   * Setup bidirectional sync - clicking template elements focuses form fields
   * @param iframeRef - Reference to the iframe element
   * @param onFieldClick - Callback when a field is clicked in the template
   */
  public setupBidirectionalSync(
    iframeRef: HTMLIFrameElement | null,
    onFieldClick: (fieldId: string) => void
  ): () => void {
    if (!iframeRef) return () => {};

    const iframeDoc = iframeRef.contentDocument || iframeRef.contentWindow?.document;
    if (!iframeDoc) return () => {};

    // Click handler for iframe content
    const clickHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Try to find field ID from various attributes
      const fieldId = 
        target.id ||
        target.getAttribute('data-field-id') ||
        target.getAttribute('data-field') ||
        target.getAttribute('data-id') ||
        target.getAttribute('name');

      if (fieldId) {
        event.preventDefault();
        event.stopPropagation();
        onFieldClick(fieldId);
      }
    };

    // Add click listener to iframe body
    iframeDoc.body?.addEventListener('click', clickHandler);

    // Add visual indicator for clickable fields
    this.markClickableFields(iframeDoc);

    // Return cleanup function
    return () => {
      iframeDoc.body?.removeEventListener('click', clickHandler);
    };
  }

  /**
   * Mark fields as clickable with visual indicator
   */
  private markClickableFields(doc: Document): void {
    // Find all elements with field identifiers
    const selectors = [
      '[id]',
      '[data-field-id]',
      '[data-field]',
      '[data-id]',
      '[name]',
    ];

    selectors.forEach(selector => {
      try {
        const elements = doc.querySelectorAll(selector);
        elements.forEach(element => {
          // Only mark elements that are visible and interactive
          const computed = window.getComputedStyle(element as HTMLElement);
          if (computed.display !== 'none' && computed.visibility !== 'hidden') {
            element.classList.add('field-clickable');
          }
        });
      } catch (error) {
        // Skip invalid selectors
      }
    });
  }

  /**
   * Get currently highlighted field ID
   */
  public getActiveFieldId(): string | null {
    return this.activeFieldId;
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.highlightedElements.clear();
    this.activeFieldId = null;
  }
}

// Export singleton instance for convenience
export const fieldHighlightEngine = new FieldHighlightEngine();
