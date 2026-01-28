/**
 * Template Content Parser
 * Handles real-time content replacement in HTML templates based on field IDs
 */

export interface ContentMapping {
  [fieldId: string]: string;
}

export class TemplateContentParser {
  private parser: DOMParser;
  private serializer: XMLSerializer;

  constructor() {
    this.parser = new DOMParser();
    this.serializer = new XMLSerializer();
  }

  /**
   * Parse and update template HTML with new content
   * @param templateHtml - The original template HTML
   * @param contentMapping - Object mapping field IDs to their values
   * @returns Updated HTML string
   */
  public updateContent(templateHtml: string, contentMapping: ContentMapping): string {
    try {
      // Parse the HTML
      const doc = this.parser.parseFromString(templateHtml, 'text/html');
      
      // Update each field in the content mapping
      Object.entries(contentMapping).forEach(([fieldId, value]) => {
        this.updateElementContent(doc, fieldId, value);
      });

      // Return the updated HTML
      return this.serializeDocument(doc);
    } catch (error) {
      console.error('Error updating template content:', error);
      return templateHtml; // Return original on error
    }
  }

  /**
   * Update a specific element's content by field ID
   * @param doc - The parsed document
   * @param fieldId - The field ID to search for
   * @param value - The new value to set
   */
  private updateElementContent(doc: Document, fieldId: string, value: string): void {
    // Escape fieldId for use in CSS selectors (handles IDs starting with numbers or special chars)
    const escapedFieldId = CSS.escape(fieldId);
    
    // Try different selectors to find the element
    const selectors = [
      `#${escapedFieldId}`,                    // Direct ID match
      `[data-field-id="${fieldId}"]`,   // Data attribute
      `[data-field="${fieldId}"]`,      // Alternative data attribute
      `[data-id="${fieldId}"]`,         // Generic data-id
      `.field-${escapedFieldId}`,              // Class-based selector
      `[name="${fieldId}"]`,            // Name attribute (for inputs)
    ];

    let element: Element | null = null;

    // Try each selector until we find an element
    for (const selector of selectors) {
      try {
        element = doc.querySelector(selector);
        if (element) break;
      } catch (error) {
        // Skip invalid selectors and continue
        continue;
      }
    }

    if (!element) {
      // If no direct match, try to find elements containing the fieldId in text content
      element = this.findElementByTextContent(doc, fieldId);
    }

    if (element) {
      this.setElementValue(element, value);
    }
  }

  /**
   * Find element by searching for fieldId in text content or placeholders
   * @param doc - The parsed document
   * @param fieldId - The field ID to search for
   * @returns Found element or null
   */
  private findElementByTextContent(doc: Document, fieldId: string): Element | null {
    // Common patterns to search for
    const patterns = [
      `{{${fieldId}}}`,           // Handlebars style
      `{${fieldId}}`,             // Simple curly braces
      `[${fieldId}]`,             // Square brackets
      `%${fieldId}%`,             // Percentage style
      `$${fieldId}$`,             // Dollar style
      fieldId,                    // Direct text match
    ];

    // Search through all text nodes
    const walker = doc.createTreeWalker(
      doc.body || doc.documentElement,
      NodeFilter.SHOW_TEXT,
      null
    );

    let textNode;
    while (textNode = walker.nextNode()) {
      const textContent = textNode.textContent || '';
      
      for (const pattern of patterns) {
        if (textContent.includes(pattern)) {
          return textNode.parentElement;
        }
      }
    }

    return null;
  }

  /**
   * Set the value of an element based on its type
   * @param element - The element to update
   * @param value - The new value
   */
  private setElementValue(element: Element, value: string): void {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'input') {
      (element as HTMLInputElement).value = value;
      element.setAttribute('value', value);
    } else if (tagName === 'textarea') {
      (element as HTMLTextAreaElement).value = value;
      element.textContent = value;
    } else if (tagName === 'select') {
      (element as HTMLSelectElement).value = value;
    } else if (tagName === 'img') {
      // For images, assume value is a URL
      element.setAttribute('src', value);
      element.setAttribute('alt', value);
    } else {
      // For other elements, update text content and handle common patterns
      const currentContent = element.innerHTML;
      let updatedContent = currentContent;

      // Replace common template patterns
      const patterns = [
        /\{\{[^}]*\}\}/g,           // {{fieldId}} or {{anything}}
        /\{[^}]*\}/g,              // {fieldId} or {anything}
        /\[[^\]]*\]/g,             // [fieldId] or [anything]
        /%[^%]*%/g,                // %fieldId% or %anything%
        /\$[^$]*\$/g,              // $fieldId$ or $anything$
      ];

      // Try to replace patterns, otherwise replace entire content
      let patternReplaced = false;
      patterns.forEach(pattern => {
        if (pattern.test(currentContent)) {
          updatedContent = currentContent.replace(pattern, value);
          patternReplaced = true;
        }
      });

      if (!patternReplaced) {
        // If no patterns found, replace the entire text content
        updatedContent = value;
      }

      element.innerHTML = updatedContent;
    }
  }

  /**
   * Serialize document back to HTML string
   * @param doc - The document to serialize
   * @returns HTML string
   */
  private serializeDocument(doc: Document): string {
    // Return just the body content for embedding
    if (doc.body) {
      return doc.body.innerHTML;
    }
    
    // Fallback to full document
    return this.serializer.serializeToString(doc);
  }

  /**
   * Extract all potential field IDs from template HTML
   * @param templateHtml - The template HTML to analyze
   * @returns Array of found field IDs
   */
  public extractFieldIds(templateHtml: string): string[] {
    const fieldIds = new Set<string>();
    
    try {
      const doc = this.parser.parseFromString(templateHtml, 'text/html');
      
      // Find elements with ID attributes
      doc.querySelectorAll('[id]').forEach(el => {
        const id = el.getAttribute('id');
        if (id) fieldIds.add(id);
      });

      // Find elements with data-field-id attributes
      doc.querySelectorAll('[data-field-id]').forEach(el => {
        const fieldId = el.getAttribute('data-field-id');
        if (fieldId) fieldIds.add(fieldId);
      });

      // Find template patterns in text content
      const textContent = doc.body?.textContent || '';
      const patterns = [
        /\{\{([^}]+)\}\}/g,        // {{fieldId}}
        /\{([^}]+)\}/g,           // {fieldId}
        /\[([^\]]+)\]/g,          // [fieldId]
        /%([^%]+)%/g,             // %fieldId%
        /\$([^$]+)\$/g,           // $fieldId$
      ];

      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(textContent)) !== null) {
          fieldIds.add(match[1].trim());
        }
      });

    } catch (error) {
      console.error('Error extracting field IDs:', error);
    }

    return Array.from(fieldIds);
  }
}

// Export a singleton instance for convenience
export const templateContentParser = new TemplateContentParser();
