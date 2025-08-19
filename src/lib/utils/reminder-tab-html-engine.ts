// Interface matching your React component exactly
interface ReactBuilderConfig {
    enabled: boolean;
    display: {
      text: string;
      position: 'left' | 'right';
      initialPosition: {
        top: string;
        transform: string;
      };
    };
    styling: {
      dimensions: {
        width: number;
        height: number;
      };
      colors: {
        primary: string;
        secondary: string;
        textColor: string;
        draggerColor: string;
        dotColor: string;
      };
      typography: {
        fontFamily: string;
        fontSize: number;
        fontWeight: string;
        letterSpacing: string;
      };
    };
    animations: {
      entrance: {
        type: string;
        duration: string;
      };
      popupTrigger: {
        type: string;
      };
    };
    interactions: {
      dragging: {
        enabled: boolean;
      };
      clicking: {
        enabled: boolean;
      };
    };
    responsive: {
      mobile: {
        fontSize: number;
        hide: boolean;
      };
    };
  }
  
  /**
   * HTML Converter Engine
   * Converts React builder config to exact HTML structure as provided in the original
   */
  class ReminderTabHTMLConverter {
  
    /**
     * Main conversion method - takes React config and outputs exact HTML
     */
    convertToHTML(config: ReactBuilderConfig): string {
      return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reminder Tab</title>
      ${this.generateCSS(config)}
  </head>
  <body>
      ${this.generateHTML(config)}
      ${this.generateJavaScript(config)}
  </body>
  </html>`;
    }
  
    /**
     * Generate CSS exactly matching the original structure
     */
    private generateCSS(config: ReactBuilderConfig): string {
      return `<style>
          .reminder-tab {
              position: fixed;
              z-index: 1000;
              color: ${config.styling.colors.textColor};
              cursor: pointer;
              user-select: none;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              transition: all 0.3s ease;
              font-family: ${config.styling.typography.fontFamily};
              font-weight: ${config.styling.typography.fontWeight};
              display: ${config.enabled ? 'flex' : 'none'};
              align-items: center;
              justify-content: center;
              width: ${config.styling.dimensions.width}px;
              height: ${config.styling.dimensions.height}px;
              overflow: hidden;
          }
  
          .reminder-tab-text {
              font-size: ${config.styling.typography.fontSize}px;
              letter-spacing: ${config.styling.typography.letterSpacing};
              white-space: nowrap;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, ${config.styling.colors.primary}, ${config.styling.colors.secondary});
              height: 100%;
          }
  
          .reminder-tab-dragger {
              background: ${config.styling.colors.draggerColor};
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 8px 0;
          }
  
          .reminder-tab.position-left {
              left: 0;
              border-radius: 0 8px 8px 0;
              flex-direction: row-reverse;
          }
  
          .reminder-tab.position-left .reminder-tab-text {
              writing-mode: vertical-lr;
              text-orientation: mixed;
          }
  
          .reminder-tab.position-right {
              right: 0;
              border-radius: 8px 0 0 8px;
          }
  
          .reminder-tab.position-right .reminder-tab-text {
              writing-mode: vertical-rl;
              text-orientation: mixed;
          }
  
          .tab-dots {
              display: grid;
              grid-template-columns: repeat(2, 6px);
              gap: 4px;
              cursor: move;
            padding: 0px 6px;
          }
  
          .dot {
              width: 6px;
              height: 6px;
              background: ${config.styling.colors.dotColor};
              border-radius: 50%;
          }
  
          .reminder-tab:hover {
              box-shadow: 0 6px 20px rgba(0,0,0,0.4);
              transform: scale(1.05);
          }
  
          .reminder-tab.dragging {
              opacity: 0.8;
              z-index: 1001;
          }
  
          .reminder-tab.dragging:hover {
              transform: scale(1.1);
          }
  
          @media (max-width: 768px) {
              .reminder-tab {
                  ${config.responsive.mobile.hide ? 'display: none !important;' : ''}
              }
              
              .reminder-tab-text {
                  font-size: ${config.responsive.mobile.fontSize}px;
              }
          }
      </style>`;
    }
  
    /**
     * Generate HTML structure exactly matching the original
     */
    private generateHTML(config: ReactBuilderConfig): string {
      return `    <div id="reminderTab" class="reminder-tab position-${config.display.position}" style="top: ${config.display.initialPosition.top}; transform: ${config.display.initialPosition.transform};">
          <div class="reminder-tab-text">${this.escapeHTML(config.display.text)}</div>
          ${config.interactions.dragging.enabled ? this.generateDragger() : ''}
      </div>`;
    }
  
    /**
     * Generate dragger with 6 dots exactly as in original
     */
    private generateDragger(): string {
      return `<div class="reminder-tab-dragger">
              <div class="tab-dots">
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
              </div>
          </div>`;
    }
  
    /**
     * Generate JavaScript exactly matching the original functionality
     */
    private generateJavaScript(config: ReactBuilderConfig): string {
      return `    <script>
          class ReminderTab {
              constructor() {
                  this.tab = document.getElementById('reminderTab');
                  this.dragger = this.tab.querySelector('.reminder-tab-dragger');
                  this.isDragging = false;
                  this.currentPosition = '${config.display.position}';
                  this.dragTimeout = null;
                  
                  this.init();
              }
  
              init() {${config.interactions.clicking.enabled ? `
                  this.tab.addEventListener('click', (e) => {
                      if (!this.isDragging && e.target !== this.dragger) {
                          this.openPopup();
                      }
                  });` : ''}${config.interactions.dragging.enabled ? `
  
                  this.addDragListeners();` : ''}
              }${config.interactions.dragging.enabled ? `
  
              addDragListeners() {
                  this.dragger.addEventListener('mousedown', (e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      this.startDrag();
                  });
  
                  this.dragger.addEventListener('touchstart', (e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      this.startDrag();
                  }, { passive: false });
  
                  document.addEventListener('mousemove', (e) => this.drag(e));
                  document.addEventListener('mouseup', () => this.endDrag());
                  document.addEventListener('touchmove', (e) => this.drag(e.touches[0]), { passive: false });
                  document.addEventListener('touchend', () => this.endDrag());
              }
  
              startDrag() {
                  this.isDragging = true;
                  this.tab.classList.add('dragging');
                  document.body.style.userSelect = 'none';
              }
  
              drag(e) {
                  if (!this.isDragging) return;
  
                  const mouseX = e.clientX;
                  const mouseY = e.clientY;
                  const windowWidth = window.innerWidth;
                  const windowHeight = window.innerHeight;
                  const tabHeight = this.tab.offsetHeight;
                  
                  // Constrain vertical position within viewport
                  let newY = mouseY - (tabHeight / 2);
                  newY = Math.max(0, Math.min(newY, windowHeight - tabHeight));
                  
                  // Determine which side based on horizontal position
                  const newPosition = mouseX < windowWidth / 2 ? 'left' : 'right';
                  
                  // Update position and vertical placement
                  if (newPosition !== this.currentPosition) {
                      this.updatePosition(newPosition);
                  }
                  
                  // Set vertical position
                  this.tab.style.top = newY + 'px';
                  this.tab.style.transform = 'none';
              }
  
              endDrag() {
                  if (!this.isDragging) return;
                  
                  this.isDragging = false;
                  this.tab.classList.remove('dragging');
                  document.body.style.userSelect = '';
                  
                  clearTimeout(this.dragTimeout);
                  this.dragTimeout = setTimeout(() => {
                      this.isDragging = false;
                  }, 150);
              }
  
              updatePosition(position) {
                  this.tab.classList.remove('position-left', 'position-right');
                  this.tab.classList.add(\`position-\${position}\`);
                  this.currentPosition = position;
              }` : ''}
  
              openPopup() {
                  const event = new CustomEvent('openReminderPopup', {
                      detail: { source: 'reminderTab' }
                  });
                  document.dispatchEvent(event);
                  
                  if (typeof window.openReminderPopup === 'function') {
                      window.openReminderPopup();
                  }
              }
  
              setText(text) {
                  const textElement = this.tab.querySelector('.reminder-tab-text');
                  if (textElement) {
                      textElement.textContent = text;
                  }
              }
  
              setPosition(position) {
                  if (position === 'left' || position === 'right') {
                      this.updatePosition(position);
                  }
              }
  
              show() {
                  this.tab.style.display = 'flex';
              }
  
              hide() {
                  this.tab.style.display = 'none';
              }
  
              getPosition() {
                  return this.currentPosition;
              }
          }
  
          document.addEventListener('DOMContentLoaded', function() {
              window.reminderTab = new ReminderTab();
          });
      </script>`;
    }
  
    /**
     * Escape HTML to prevent XSS
     */
    private escapeHTML(text: string): string {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  
    /**
     * Validate React builder config
     */
    validateConfig(config: ReactBuilderConfig): { isValid: boolean; errors: string[] } {
      const errors: string[] = [];
  
      if (!config.display?.text) {
        errors.push('Display text is required');
      }
  
      if (!['left', 'right'].includes(config.display?.position)) {
        errors.push('Position must be "left" or "right"');
      }
  
      if (!config.styling?.dimensions?.width || config.styling.dimensions.width < 50) {
        errors.push('Width must be at least 50px');
      }
  
      if (!config.styling?.dimensions?.height || config.styling.dimensions.height < 100) {
        errors.push('Height must be at least 100px');
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    /**
     * Generate only CSS (for separate usage)
     */
    getCSSOnly(config: ReactBuilderConfig): string {
      return this.generateCSS(config);
    }
  
    /**
     * Generate only HTML structure (for separate usage)
     */
    getHTMLOnly(config: ReactBuilderConfig): string {
      return this.generateHTML(config);
    }
  
    /**
     * Generate only JavaScript (for separate usage)
     */
    getJSOnly(config: ReactBuilderConfig): string {
      return this.generateJavaScript(config);
    }
  
    /**
     * Create optimized version with minified CSS
     */
    convertToOptimizedHTML(config: ReactBuilderConfig): string {
      const minifiedCSS = this.generateCSS(config)
        .replace(/\s+/g, ' ')
        .replace(/;\s/g, ';')
        .replace(/:\s/g, ':')
        .replace(/,\s/g, ',')
        .replace(/{\s/g, '{')
        .replace(/}\s/g, '}');
  
      return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reminder Tab</title>
      ${minifiedCSS}
  </head>
  <body>
      ${this.generateHTML(config)}
      ${this.generateJavaScript(config)}
  </body>
  </html>`;
    }
  
    /**
     * Export config as JSON
     */
    exportConfig(config: ReactBuilderConfig): string {
      return JSON.stringify(config, null, 2);
    }
  
    /**
     * Get file size estimate
     */
    getFileSizeEstimate(config: ReactBuilderConfig): { 
      total: number; 
      css: number; 
      html: number; 
      js: number; 
    } {
      const html = this.convertToHTML(config);
      const css = this.getCSSOnly(config);
      const htmlOnly = this.getHTMLOnly(config);
      const js = this.getJSOnly(config);
  
      return {
        total: new Blob([html]).size,
        css: new Blob([css]).size,
        html: new Blob([htmlOnly]).size,
        js: new Blob([js]).size
      };
    }
  }
  
  // Export interface and converter
  export type { ReactBuilderConfig };
  export { ReminderTabHTMLConverter };
  
  // Usage example:
  /*
  const converter = new ReminderTabHTMLConverter();
  
  // From your React component config
  const reactConfig: ReactBuilderConfig = {
    enabled: true,
    display: {
      text: "Limited Time Offer!",
      position: "left",
      initialPosition: {
        top: "50%",
        transform: "translateY(-50%)"
      }
    },
    styling: {
      dimensions: { width: 85, height: 170 },
      colors: {
        primary: "#FF6B6B",
        secondary: "#4ECDC4", 
        textColor: "#FFFFFF",
        draggerColor: "#555555",
        dotColor: "rgba(255, 255, 255, 0.9)"
      },
      typography: {
        fontFamily: "Helvetica, sans-serif",
        fontSize: 16,
        fontWeight: "600", 
        letterSpacing: "0.5px"
      }
    },
    animations: {
      entrance: { type: "slideIn", duration: "0.3s" },
      popupTrigger: { type: "modal" }
    },
    interactions: {
      dragging: { enabled: true },
      clicking: { enabled: true }
    },
    responsive: {
      mobile: { fontSize: 14, hide: false }
    }
  };
  
  // Convert to exact HTML structure
  const finalHTML = converter.convertToHTML(reactConfig);
  console.log(finalHTML);
  
  // Validate before conversion
  const validation = converter.validateConfig(reactConfig);
  if (validation.isValid) {
    const html = converter.convertToHTML(reactConfig);
    // Save to database/S3
  } else {
    console.error('Config errors:', validation.errors);
  }
  */