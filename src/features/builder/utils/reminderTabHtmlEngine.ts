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
      if (!this.validateConfig(config).isValid) {
        throw new Error('Invalid configuration provided');
      }
  
      const css = this.generateCSS(config);
      const html = this.generateHTML(config);
      const js = this.generateJavaScript(config);
  
      return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reminder Tab</title>
      <style>
  ${css}
      </style>
  </head>
  <body>
  ${html}
      <script>
  ${js}
      </script>
  </body>
  </html>`;
    }
  
    /**
     * Generate CSS exactly matching the original structure
     */
    generateCSS(config: ReactBuilderConfig): string {
      const position = config.display.position;
      const borderRadius = position === 'left' ? '0 8px 8px 0' : '8px 0 0 8px';
      const flexDirection = position === 'left' ? 'row-reverse' : 'row';
      const writingMode = position === 'left' ? 'vertical-lr' : 'vertical-rl';
      
      return `
          .reminder-tab {
              position: fixed;
              ${position}: 0;
              top: ${config.display.initialPosition.top};
              transform: ${config.display.initialPosition.transform};
              width: ${config.styling.dimensions.width}px;
              height: ${config.styling.dimensions.height}px;
              color: ${config.styling.colors.textColor};
              border-radius: ${borderRadius};
              display: ${config.enabled ? 'flex' : 'none'};
              align-items: center;
              justify-content: center;
              font-family: ${config.styling.typography.fontFamily};
              font-weight: ${config.styling.typography.fontWeight};
              letter-spacing: ${config.styling.typography.letterSpacing};
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              transition: all 0.3s ease;
              flex-direction: ${flexDirection};
              z-index: 1000;
              user-select: none;
              overflow: hidden;
          }
  
          .reminder-tab:hover {
              box-shadow: 0 6px 20px rgba(0,0,0,0.4);
              opacity: 0.9;
          }
  
          .reminder-tab.dragging {
              box-shadow: 0 6px 20px rgba(0,0,0,0.4);
              opacity: 0.8;
              transition: none;
              z-index: 1001;
          }
  
          .tab-text {
              font-size: ${config.styling.typography.fontSize}px;
              letter-spacing: ${config.styling.typography.letterSpacing};
              white-space: nowrap;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, ${config.styling.colors.primary}, ${config.styling.colors.secondary});
              height: 100%;
              writing-mode: ${writingMode};
              text-orientation: mixed;
          }
  
          .tab-dragger {
              background: ${config.styling.colors.draggerColor};
              height: 100%;
              display: ${config.interactions.dragging.enabled ? 'flex' : 'none'};
              align-items: center;
              justify-content: center;
              padding: 8px 0;
              cursor: move;
          }
  
          .tab-dots {
              display: grid;
              grid-template-columns: repeat(2, 6px);
              gap: 4px;
              cursor: move;
              padding: 0px 6px;
          }
  
          .tab-dot {
              width: 6px;
              height: 6px;
              background: ${config.styling.colors.dotColor};
              border-radius: 50%;
          }
  
          /* Mobile responsive styles */
          @media (max-width: 768px) {
              .reminder-tab {
                  display: ${config.responsive.mobile.hide ? 'none' : (config.enabled ? 'flex' : 'none')};
              }
              
              .tab-text {
                  font-size: ${config.responsive.mobile.fontSize}px;
              }
          }
  
          /* Animation styles */
          .reminder-tab.animate-${config.animations.entrance.type} {
              animation: ${config.animations.entrance.type} ${config.animations.entrance.duration} ease-out;
          }
  
          @keyframes slideIn {
              from {
                  transform: translateX(${position === 'left' ? '-100%' : '100%'});
              }
              to {
                  transform: translateX(0);
              }
          }
  
          @keyframes fadeIn {
              from {
                  opacity: 0;
              }
              to {
                  opacity: 1;
              }
          }
  
          @keyframes bounceIn {
              0% {
                  transform: scale(0.3);
                  opacity: 0;
              }
              50% {
                  transform: scale(1.05);
              }
              70% {
                  transform: scale(0.9);
              }
              100% {
                  transform: scale(1);
                  opacity: 1;
              }
          }
  
          @keyframes zoomIn {
              from {
                  transform: scale(0);
                  opacity: 0;
              }
              to {
                  transform: scale(1);
                  opacity: 1;
              }
          }
      `;
    }
  
    /**
     * Generate HTML structure exactly matching the original
     */
    generateHTML(config: ReactBuilderConfig): string {
      const draggerHTML = config.interactions.dragging.enabled ? this.generateDragger() : '';
      const animationClass = config.animations.entrance.type !== 'none' ? ` animate-${config.animations.entrance.type}` : '';
      
      return `
          <div class="reminder-tab${animationClass}" id="reminderTab">
              <div class="tab-text">
                  ${this.escapeHTML(config.display.text)}
              </div>
              ${draggerHTML}
          </div>
      `;
    }
  
    /**
     * Generate dragger with 6 dots exactly as in original
     */
    generateDragger(): string {
      const dots = Array.from({ length: 6 }, () => '<div class="tab-dot"></div>').join('\n                ');
      
      return `
              <div class="tab-dragger" id="tabDragger">
                  <div class="tab-dots">
                      ${dots}
                  </div>
              </div>
      `;
    }
  
    /**
     * Generate JavaScript exactly matching the original functionality
     */
    generateJavaScript(config: ReactBuilderConfig): string {
      return `
          (function() {
              const reminderTab = document.getElementById('reminderTab');
              const tabDragger = document.getElementById('tabDragger');
              let isDragging = false;
              let startY = 0;
              let startTop = 0;
  
              if (!reminderTab) return;
  
              // Dragging functionality
              if (${config.interactions.dragging.enabled} && tabDragger) {
                  tabDragger.addEventListener('mousedown', function(e) {
                      isDragging = true;
                      startY = e.clientY;
                      startTop = parseInt(window.getComputedStyle(reminderTab).top, 10);
                      reminderTab.classList.add('dragging');
                      e.preventDefault();
                  });
  
                  document.addEventListener('mousemove', function(e) {
                      if (!isDragging) return;
                      
                      const deltaY = e.clientY - startY;
                      const newTop = startTop + deltaY;
                      const maxTop = window.innerHeight - reminderTab.offsetHeight;
                      const constrainedTop = Math.max(0, Math.min(newTop, maxTop));
                      
                      reminderTab.style.top = constrainedTop + 'px';
                      reminderTab.style.transform = 'none';
                  });
  
                  document.addEventListener('mouseup', function() {
                      if (isDragging) {
                          isDragging = false;
                          reminderTab.classList.remove('dragging');
                      }
                  });
              }
  
              // Click functionality
              if (${config.interactions.clicking.enabled}) {
                  reminderTab.addEventListener('click', function(e) {
                      if (isDragging) return;
                      
                      // Trigger popup based on animation type
                      const animationType = '${config.animations.popupTrigger.type}';
                      
                      // Dispatch custom event for popup trigger
                      const event = new CustomEvent('reminderTabClick', {
                          detail: {
                              animationType: animationType,
                              config: ${JSON.stringify(config)}
                          }
                      });
                      
                      document.dispatchEvent(event);
                      
                      // Default behavior - you can customize this
                      console.log('Reminder tab clicked - trigger popup with animation:', animationType);
                  });
              }
  
              // Initialize entrance animation
              if ('${config.animations.entrance.type}' !== 'none') {
                  setTimeout(function() {
                      reminderTab.classList.add('animate-${config.animations.entrance.type}');
                  }, 100);
              }
  
              // Handle window resize for mobile
              window.addEventListener('resize', function() {
                  if (window.innerWidth <= 768 && ${config.responsive.mobile.hide}) {
                      reminderTab.style.display = 'none';
                  } else if (${config.enabled}) {
                      reminderTab.style.display = 'flex';
                  }
              });
          })();
      `;
    }
  
    /**
     * Escape HTML to prevent XSS
     */
    escapeHTML(text: string): string {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  
    /**
     * Validate React builder config
     */
    validateConfig(config: ReactBuilderConfig): { isValid: boolean; errors: string[] } {
      const errors: string[] = [];
  
      if (!config.display?.text?.trim()) {
        errors.push('Display text is required');
      }
  
      if (config.styling?.dimensions?.width < 60 || config.styling?.dimensions?.width > 150) {
        errors.push('Width must be between 60 and 150 pixels');
      }
  
      if (config.styling?.dimensions?.height < 100 || config.styling?.dimensions?.height > 250) {
        errors.push('Height must be between 100 and 250 pixels');
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
      const html = this.convertToHTML(config);
      // Basic minification - remove extra whitespace and comments
      return html
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .trim();
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
      const css = this.generateCSS(config);
      const html = this.generateHTML(config);
      const js = this.generateJavaScript(config);
      
      const cssSize = new Blob([css]).size;
      const htmlSize = new Blob([html]).size;
      const jsSize = new Blob([js]).size;
      
      return {
        css: cssSize,
        html: htmlSize,
        js: jsSize,
        total: cssSize + htmlSize + jsSize
      };
    }
  }
  
  // Export interface and converter
  export type { ReactBuilderConfig };
  export { ReminderTabHTMLConverter };
