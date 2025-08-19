import { ReminderTabConfig } from '@/features/builder/types';
import { MergeOptions, TemplateData } from '@/types';

class DynamicHTMLMerger {
  generateHTML(config: ReminderTabConfig): string {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reminder Tab</title>
      ${this.generateCSS(config)}
  </head>
  <body>
      ${this.generateHTMLStructure(config)}
      ${this.generateJavaScript(config)}
  </body>
  </html>`;
  }

  private generateCSS(config: ReminderTabConfig): string {
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
              padding: 0 6px;
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
  
          @media (max-width: 768px) {
              .reminder-tab-text {
                  font-size: ${config.responsive?.mobile?.fontSize || 12}px;
              }
              ${config.responsive?.mobile?.hide ? '.reminder-tab { display: none !important; }' : ''}
          }
      </style>`;
  }

  private generateHTMLStructure(config: ReminderTabConfig): string {
    return `<div id="reminderTab" class="reminder-tab position-${config.display.position}" style="top: ${config.display.initialPosition.top}; transform: ${config.display.initialPosition.transform};">
          <div class="reminder-tab-text">${this.escapeHTML(config.display.text)}</div>
          ${config.interactions.dragging.enabled ? this.generateDragger() : ''}
      </div>`;
  }

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

  private generateJavaScript(config: ReminderTabConfig): string {
    // Minified version of the ReminderTab class
    return `<script>
  class ReminderTab{constructor(){this.tab=document.getElementById("reminderTab"),this.dragger=this.tab.querySelector(".reminder-tab-dragger"),this.isDragging=!1,this.currentPosition="${config.display.position}",this.dragTimeout=null,this.init()}init(){${config.interactions.clicking.enabled ? 'this.tab.addEventListener("click",t=>{this.isDragging||t.target===this.dragger||this.openPopup()}),' : ''}${config.interactions.dragging.enabled ? 'this.addDragListeners()' : ''}}${config.interactions.dragging.enabled ? `addDragListeners(){this.dragger.addEventListener("mousedown",t=>{t.stopPropagation(),t.preventDefault(),this.startDrag()}),this.dragger.addEventListener("touchstart",t=>{t.stopPropagation(),t.preventDefault(),this.startDrag()},{passive:!1}),document.addEventListener("mousemove",t=>this.drag(t)),document.addEventListener("mouseup",()=>this.endDrag()),document.addEventListener("touchmove",t=>this.drag(t.touches[0]),{passive:!1}),document.addEventListener("touchend",()=>this.endDrag())}startDrag(){this.isDragging=!0,this.tab.classList.add("dragging"),document.body.style.userSelect="none"}drag(t){if(!this.isDragging)return;const e=t.clientX,i=t.clientY,s=window.innerWidth,n=window.innerHeight,r=this.tab.offsetHeight;let o=i-r/2;o=Math.max(0,Math.min(o,n-r));const a=e<s/2?"left":"right";a!==this.currentPosition&&this.updatePosition(a),this.tab.style.top=o+"px",this.tab.style.transform="none"}endDrag(){this.isDragging&&(this.isDragging=!1,this.tab.classList.remove("dragging"),document.body.style.userSelect="",clearTimeout(this.dragTimeout),this.dragTimeout=setTimeout(()=>{this.isDragging=!1},150))}updatePosition(t){this.tab.classList.remove("position-left","position-right"),this.tab.classList.add(\`position-\${t}\`),this.currentPosition=t}` : ''}openPopup(){const t=new CustomEvent("openReminderPopup",{detail:{source:"reminderTab"}});document.dispatchEvent(t),"function"==typeof window.openReminderPopup&&window.openReminderPopup()}setText(t){const e=this.tab.querySelector(".reminder-tab-text");e&&(e.textContent=t)}setPosition(t){"left"!==t&&"right"!==t||this.updatePosition(t)}show(){this.tab.style.display="flex"}hide(){this.tab.style.display="none"}getPosition(){return this.currentPosition}}document.addEventListener("DOMContentLoaded",function(){window.reminderTab=new ReminderTab})
  </script>`;
  }

  private escapeHTML(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
    };
    return String(text).replace(/[&<>"'\/]/g, (char) => map[char]);
  }
}

/**
 * Optimized HTML Merger
 * Merges template HTML with dynamically generated reminder tab
 */
export class OptimizedHTMLMerger {
  private reminderGenerator: DynamicHTMLMerger;
  private parser: DOMParser;

  constructor() {
    this.reminderGenerator = new DynamicHTMLMerger();
    this.parser = new DOMParser();
  }

  /**
   * Main merge method - accepts either JSON config or HTML for reminder tab
   */
  public merge(
    reminderInput: ReminderTabConfig | string,
    templateHtml: string,
    options: MergeOptions = {}
  ): string {
    // Generate reminder HTML from JSON if config provided
    const reminderHtml =
      typeof reminderInput === 'string'
        ? reminderInput
        : this.reminderGenerator.generateHTML(reminderInput);

    const config: Required<MergeOptions> = {
      popupSelector: '.u-popup-container',
      triggerSelector: '#reminderTab',
      closeSelectors: [
        '.u-close-button',
        '.u-popup-overlay',
        '[data-close]',
        '.close',
        '.btn-close',
      ],
      enableAnimations: true,
      animationDuration: '0.3s',
      ...options,
    };

    return this.buildMergedHTML(reminderHtml, templateHtml, config);
  }

  /**
   * Merge from database record
   */
  public mergeFromRecord(
    record: TemplateData,
    options: MergeOptions = {}
  ): string {
    // Prefer JSON config over HTML
    if (record.reminder_tab_state_json) {
      return this.merge(
        record.reminder_tab_state_json,
        record.template_html,
        options
      );
    } else if (record.reminder_tab_html) {
      return this.merge(
        record.reminder_tab_html,
        record.template_html,
        options
      );
    } else {
      throw new Error('No reminder tab data found in record');
    }
  }

  private buildMergedHTML(
    reminderHtml: string,
    templateHtml: string,
    config: Required<MergeOptions>
  ): string {
    // Parse reminder HTML to extract components
    const reminderDoc = this.parser.parseFromString(reminderHtml, 'text/html');

    // Extract styles, body, and scripts
    const reminderStyles = Array.from(reminderDoc.querySelectorAll('style'))
      .map((style) => style.outerHTML)
      .join('\n');

    const reminderBody = reminderDoc.body ? reminderDoc.body.innerHTML : '';

    const reminderScripts = Array.from(reminderDoc.querySelectorAll('script'))
      .map((script) => script.outerHTML)
      .join('\n');

    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Popup Preview</title>
      
      <!-- Reminder Tab Styles -->
      ${reminderStyles}
      
      <!-- Popup Animation Styles -->
      <style>
          /* Popup container initial state */
          .u-popup-container {
              display: none !important;
              position: fixed !important;
              left: 0;
              right: 0;
              bottom: 0;
              top: 0;
              z-index: 9999;
              opacity: 0;
              transition: opacity ${config.animationDuration} ease;
          }
          
          /* Active state with animation */
          .u-popup-container.active {
              display: flex !important;
              opacity: 1;
          }
          
          /* Popup main content animation */
          .u-popup-main {
              transform: scale(0.7);
              opacity: 0;
              transition: all ${config.animationDuration} cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
          
          .u-popup-container.active .u-popup-main {
              transform: scale(1);
              opacity: 1;
          }
          
          /* Overlay fade animation */
          .u-popup-overlay {
              opacity: 0;
              transition: opacity ${config.animationDuration} ease;
          }
          
          .u-popup-container.active .u-popup-overlay {
              opacity: 1;
          }
          
          /* Ensure reminder tab is visible */
          #reminderTab {
              display: flex !important;
              z-index: 1000;
              opacity: 1 !important;
              visibility: visible !important;
          }
          
          body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
          }
          
          /* Optional: Add bounce effect to reminder tab on load */
          @keyframes bounceIn {
              0% { transform: translateX(100px); opacity: 0; }
              60% { transform: translateX(-10px); opacity: 1; }
              100% { transform: translateX(0); }
          }
          
          .reminder-tab.position-right {
              animation: bounceIn 0.6s ease-out;
          }
          
          .reminder-tab.position-left {
              animation: bounceIn 0.6s ease-out;
          }
      </style>
  </head>
  <body>
      <!-- Reminder Tab -->
      ${reminderBody}
      
      <!-- Popup Template -->
      ${templateHtml}
      
      <!-- Reminder Tab Scripts -->
      ${reminderScripts}
      
      <!-- Connection Script with Animation Support -->
      <script>
      (function() {
          let popupElement = null;
          let triggerElement = null;
          let isAnimating = false;
          
          function findElements() {
              popupElement = document.querySelector('${config.popupSelector}');
              triggerElement = document.querySelector('${config.triggerSelector}');
          }
          
          function showPopup() {
              if (!popupElement || isAnimating) return;
              
              isAnimating = true;
              popupElement.style.display = 'flex';
              
              // Force reflow for animation
              void popupElement.offsetWidth;
              
              popupElement.classList.add('active');
              popupElement.setAttribute('aria-hidden', 'false');
              
              setTimeout(() => {
                  isAnimating = false;
                  popupElement.dispatchEvent(new CustomEvent('popup:shown'));
              }, ${parseFloat(config.animationDuration) * 1000});
          }
          
          function hidePopup() {
              if (!popupElement || isAnimating) return;
              
              isAnimating = true;
              popupElement.classList.remove('active');
              popupElement.setAttribute('aria-hidden', 'true');
              
              setTimeout(() => {
                  popupElement.style.display = 'none';
                  isAnimating = false;
                  popupElement.dispatchEvent(new CustomEvent('popup:hidden'));
              }, ${parseFloat(config.animationDuration) * 1000});
          }
          
          function connectElements() {
              findElements();
              
              if (triggerElement) {
                  triggerElement.addEventListener('click', function(e) {
                      if (e.target.closest('.reminder-tab-dragger, .drag-handle, [data-drag]')) {
                          return;
                      }
                      showPopup();
                  });
              }
              
              // Connect close buttons
              const closeSelectors = ${JSON.stringify(config.closeSelectors)};
              closeSelectors.forEach(selector => {
                  document.querySelectorAll(selector).forEach(btn => {
                      btn.addEventListener('click', function(e) {
                          e.preventDefault();
                          e.stopPropagation();
                          hidePopup();
                      });
                  });
              });
              
              // Overlay click to close
              if (popupElement) {
                  const overlay = popupElement.querySelector('.u-popup-overlay');
                  if (overlay) {
                      overlay.addEventListener('click', hidePopup);
                  }
                  
                  // Click outside content to close
                  popupElement.addEventListener('click', function(e) {
                      if (e.target === popupElement) {
                          hidePopup();
                      }
                  });
              }
              
              // ESC key to close
              document.addEventListener('keydown', function(e) {
                  if (e.key === 'Escape' && popupElement && popupElement.classList.contains('active')) {
                      hidePopup();
                  }
              });
              
              // Expose API
              window.openReminderPopup = showPopup;
              window.closeReminderPopup = hidePopup;
              
              // Listen for custom events
              document.addEventListener('openReminderPopup', showPopup);
              document.addEventListener('closeReminderPopup', hidePopup);
          }
          
          // Initialize
          if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', connectElements);
          } else {
              connectElements();
          }
          
          // Expose merger API
          window.popupMerger = {
              show: showPopup,
              hide: hidePopup,
              toggle: function() {
                  if (popupElement && popupElement.classList.contains('active')) {
                      hidePopup();
                  } else {
                      showPopup();
                  }
              },
              refresh: connectElements
          };
      })();
      </script>
  </body>
  </html>`;
  }
}
