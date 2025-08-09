import type { PopupTemplate, PopupElement } from '../types';

/**
 * HTML Export Utility
 * Generates clean, production-ready HTML/CSS for popup templates
 */

export interface ExportOptions {
  includeCss?: boolean;
  includeJs?: boolean;
  minify?: boolean;
  inlineStyles?: boolean;
}

export class HTMLExporter {
  private template: PopupTemplate | null;
  private canvasSize: { width: number; height: number };

  constructor(template: PopupTemplate | null, canvasSize: { width: number; height: number }) {
    this.template = template;
    this.canvasSize = canvasSize;
  }

  /**
   * Generate complete HTML document
   */
  generateHTML(options: ExportOptions = {}): string {
    const {
      includeCss = true,
      includeJs = true,
      minify = false,
      inlineStyles = true
    } = options;

    if (!this.template?.builder_state_json) return '';

    const zones = this.generateZonesHTML();
    const css = includeCss ? this.generateCSS() : '';
    const js = includeJs ? this.generateJavaScript() : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.template?.name || 'Popup'}</title>
    ${inlineStyles && css ? `<style>\n${css}\n    </style>` : ''}
</head>
<body>
<div class="popup-container">
${zones}
</div>
${includeJs ? `<script>\n${js}\n</script>` : ''}
</body>
</html>`;

    return minify ? this.minifyHTML(html) : html;
  }

  /**
   * Generate zones HTML
   */
  private generateZonesHTML(): string {
    if (!this.template?.builder_state_json) return '';

    const builderState = this.template.builder_state_json as any;
    
    return Object.entries(builderState.zones)
      .map(([zoneName, zone]: [string, any]) => {
        const elements = zone.components
          .map((element: PopupElement) => this.generateElementHTML(element))
          .join('\n    ');
        
        return `  <div class="popup-zone popup-zone-${zoneName}">
    ${elements}
  </div>`;
      })
      .join('\n');
  }

  /**
   * Generate HTML for individual element
   */
  generateElementHTML(element: PopupElement): string {
    const config = element.config || {};
    const elementId = `data-element-id="${element.id}"`;

    switch (element.type) {
      case 'title':
        return `<h1 class="popup-element popup-title" ${elementId}>
      ${config.content || 'Enter Title Here'}
    </h1>`;
      
      case 'subtitle':
        return `<h2 class="popup-element popup-subtitle" ${elementId}>
      ${config.content || 'Enter Subtitle Here'}
    </h2>`;
      
      case 'text':
        return `<p class="popup-element popup-text" ${elementId}>
      ${config.content || 'Enter your text content here.'}
    </p>`;
      
      case 'button':
        const action = config.action || {};
        return `<button class="popup-element popup-button" ${elementId} onclick="handleButtonClick('${action.type || 'close'}', '${action.url || ''}')">
      ${config.content || 'Click Me'}
    </button>`;
      
      case 'image':
        return `<img class="popup-element popup-image" src="${config.src || 'https://via.placeholder.com/200x150'}" alt="${config.alt || 'Image'}" ${elementId} />`;
      
      case 'logo':
        return `<img class="popup-element popup-logo" src="${config.src || 'https://via.placeholder.com/120x80?text=LOGO'}" alt="${config.alt || 'Logo'}" ${elementId} />`;
      
      case 'countdown':
        return `<div class="popup-element popup-countdown" ${elementId} data-end-time="${config.endTime || ''}" data-format="${config.format || 'DD:HH:MM:SS'}">
      <span class="countdown-display">00:00:00:00</span>
    </div>`;
      
      case 'coupon-code':
        return `<div class="popup-element popup-coupon-code" ${elementId} onclick="copyCouponCode('${config.code || 'SAVE20'}')">
      <span class="coupon-text">${config.code || 'SAVE20'}</span>
      <span class="copy-hint">${config.copyText || 'Click to copy'}</span>
    </div>`;
      
      case 'email-input':
        return `<input class="popup-element popup-email-input" type="email" placeholder="${config.placeholder || 'Enter your email'}" ${config.required ? 'required' : ''} ${elementId} />`;
      
      case 'progress-bar':
        return `<div class="popup-element popup-progress-bar" ${elementId}>
      ${config.labelText ? `<div class="progress-label">${config.labelText}</div>` : ''}
      <div class="progress-container">
        <div class="progress-fill" style="width: ${config.progress || 75}%">
          ${config.showPercentage ? `<span class="progress-text">${config.progress || 75}%</span>` : ''}
        </div>
      </div>
    </div>`;
      
      case 'link':
        return `<a class="popup-element popup-link" href="${config.href || 'https://example.com'}" target="${config.target || '_blank'}" ${elementId}>
      ${config.content || 'Click here'}
    </a>`;
      
      case 'divider':
        return `<hr class="popup-element popup-divider" ${elementId} />`;
      
      case 'spacer':
        return `<div class="popup-element popup-spacer" ${elementId}></div>`;
      
      case 'close-button':
        return `<button class="popup-element popup-close-button" onclick="closePopup()" ${elementId}>
      ${config.content || '×'}
    </button>`;
      
      case 'social-links':
        const links = config.links || [];
        const linkElements = links.map((link: any) => 
          `<a href="${link.url}" target="_blank" class="social-link social-${link.platform}">
        <span class="social-icon">${this.getSocialIcon(link.platform)}</span>
      </a>`
        ).join('\n      ');
        return `<div class="popup-element popup-social-links" ${elementId}>
      ${linkElements}
    </div>`;
      
      case 'container':
        return `<div class="popup-element popup-container" ${elementId}>
      <!-- Container content will be populated by child elements -->
    </div>`;
      
      case 'grid':
        const rows = config.rows || 2;
        const columns = config.columns || 2;
        return `<div class="popup-element popup-grid" ${elementId} style="grid-template-columns: repeat(${columns}, 1fr); grid-template-rows: repeat(${rows}, 1fr);">
      <!-- Grid cells will be populated by child elements -->
    </div>`;
      
      default:
        return `<div class="popup-element popup-generic" ${elementId}>
      ${element.type}
    </div>`;
    }
  }

  /**
   * Generate CSS styles
   */
  private generateCSS(): string {
    return `        body {
            margin: 0;
            font-family: Arial, sans-serif;
        }
        
        .popup-container {
            width: ${this.canvasSize.width}px;
            height: ${this.canvasSize.height}px;
            background: white;
            border: 1px solid #d9d9d9;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
        }
        
        .popup-zone {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 16px;
            gap: 12px;
            position: relative;
        }
        
        .popup-zone-header {
            border-bottom: 1px solid #f0f0f0;
        }
        
        .popup-zone-footer {
            border-top: 1px solid #f0f0f0;
        }
        
        .popup-element {
            font-family: Arial, sans-serif;
            margin: 0;
        }
        
        /* Title Styles */
        .popup-title {
            font-size: 24px;
            font-weight: bold;
            color: #333333;
            text-align: center;
            margin: 10px 5px;
            line-height: 1.2;
        }
        
        /* Subtitle Styles */
        .popup-subtitle {
            font-size: 18px;
            font-weight: normal;
            color: #666666;
            text-align: center;
            margin: 5px 5px 10px 5px;
            line-height: 1.4;
        }
        
        /* Text Styles */
        .popup-text {
            font-size: 14px;
            color: #444444;
            text-align: left;
            margin: 10px 5px;
            line-height: 1.5;
        }
        
        /* Button Styles */
        .popup-button {
            background: #1677ff;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.3s;
            margin: 10px auto;
            display: block;
            text-align: center;
        }
        
        .popup-button:hover {
            background: #0e5bcc;
        }
        
        /* Image Styles */
        .popup-image {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin: 10px 0;
            object-fit: cover;
            max-height: 300px;
        }
        
        /* Logo Styles */
        .popup-logo {
            width: 120px;
            height: auto;
            max-height: 80px;
            margin: 10px auto;
            display: block;
        }
        
        /* Countdown Styles */
        .popup-countdown {
            margin: 15px 0;
            text-align: center;
        }
        
        .countdown-display {
            font-size: 24px;
            font-weight: bold;
            color: #ff4d4f;
            font-family: monospace;
        }
        
        /* Coupon Code Styles */
        .popup-coupon-code {
            background: #f0f5ff;
            color: #1677ff;
            border: 2px dashed #1677ff;
            border-radius: 4px;
            padding: 12px 20px;
            margin: 15px 10px;
            text-align: center;
            cursor: pointer;
            user-select: all;
            font-size: 20px;
            font-weight: bold;
            position: relative;
        }
        
        .popup-coupon-code:hover {
            background: #e6f4ff;
        }
        
        .copy-hint {
            display: none;
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-top: 4px;
        }
        
        .popup-coupon-code:hover .copy-hint {
            display: block;
        }
        
        /* Email Input Styles */
        .popup-email-input {
            width: 100%;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
            padding: 10px 15px;
            font-size: 14px;
            background: #ffffff;
            margin: 10px 0;
            box-sizing: border-box;
        }
        
        .popup-email-input:focus {
            outline: none;
            border-color: #1677ff;
            box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
        }
        
        /* Progress Bar Styles */
        .popup-progress-bar {
            margin: 15px 0;
        }
        
        .progress-label {
            font-size: 14px;
            margin-bottom: 8px;
            color: #333;
        }
        
        .progress-container {
            width: 100%;
            height: 20px;
            background: #f0f0f0;
            border-radius: 10px;
            overflow: hidden;
            position: relative;
        }
        
        .progress-fill {
            height: 100%;
            background: #1677ff;
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
        }
        
        /* Link Styles */
        .popup-link {
            color: #1677ff;
            text-decoration: underline;
            cursor: pointer;
            margin: 5px;
            display: inline-block;
            font-size: 14px;
        }
        
        .popup-link:hover {
            color: #0e5bcc;
        }
        
        /* Divider Styles */
        .popup-divider {
            width: 100%;
            height: 1px;
            border: none;
            background-color: #d9d9d9;
            margin: 15px 0;
        }
        
        /* Spacer Styles */
        .popup-spacer {
            width: 100%;
            height: 20px;
        }
        
        /* Close Button Styles */
        .popup-close-button {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            border: none;
            background: transparent;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: #000000;
            border-radius: 50%;
            padding: 5px 8px;
            margin: 5px;
        }
        
        .popup-close-button:hover {
            background: rgba(0, 0, 0, 0.1);
        }
        
        /* Social Links Styles */
        .popup-social-links {
            display: flex;
            gap: 15px;
            margin: 15px 0;
            justify-content: center;
        }
        
        .social-link {
            display: inline-block;
            font-size: 24px;
            text-decoration: none;
            transition: transform 0.2s;
        }
        
        .social-link:hover {
            transform: scale(1.2);
        }
        
        /* Container Styles */
        .popup-container {
            width: 100%;
            padding: 10px;
            margin: 0;
            border: none;
            border-radius: 4px;
            background: transparent;
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: stretch;
        }
        
        /* Grid Styles */
        .popup-grid {
            display: grid;
            gap: 10px;
            width: 100%;
            border: none;
            margin: 0;
            padding: 10px;
        }`;
  }

  /**
   * Generate JavaScript functionality
   */
  private generateJavaScript(): string {
    return `        // Button click handler
        function handleButtonClick(actionType, url) {
            if (actionType === 'close') {
                closePopup();
            } else if (actionType === 'link' && url) {
                window.open(url, '_blank');
            } else if (actionType === 'copy-code') {
                // Copy functionality would be implemented here
            }
        }
        
        // Copy coupon code
        function copyCouponCode(code) {
            navigator.clipboard.writeText(code).then(() => {
                alert('Coupon code copied: ' + code);
            });
        }
        
        // Close popup
        function closePopup() {
            if (window.parent !== window) {
                window.parent.postMessage('closePopup', '*');
            } else {
                window.close();
            }
        }
        
        // Initialize countdown timers
        document.addEventListener('DOMContentLoaded', function() {
            const countdowns = document.querySelectorAll('.popup-countdown');
            countdowns.forEach(countdown => {
                const endTime = countdown.dataset.endTime;
                const format = countdown.dataset.format;
                if (endTime) {
                    startCountdown(countdown.querySelector('.countdown-display'), endTime, format);
                }
            });
        });
        
        // Countdown timer function
        function startCountdown(element, endTime, format) {
            const timer = setInterval(() => {
                const now = new Date().getTime();
                const end = new Date(endTime).getTime();
                const distance = end - now;
                
                if (distance < 0) {
                    clearInterval(timer);
                    element.textContent = 'Offer Expired!';
                    return;
                }
                
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
                let display = '';
                if (format === 'DD:HH:MM:SS') {
                    display = days.toString().padStart(2, '0') + ':' + 
                             hours.toString().padStart(2, '0') + ':' + 
                             minutes.toString().padStart(2, '0') + ':' + 
                             seconds.toString().padStart(2, '0');
                } else if (format === 'HH:MM:SS') {
                    display = hours.toString().padStart(2, '0') + ':' + 
                             minutes.toString().padStart(2, '0') + ':' + 
                             seconds.toString().padStart(2, '0');
                } else if (format === 'MM:SS') {
                    display = minutes.toString().padStart(2, '0') + ':' + 
                             seconds.toString().padStart(2, '0');
                }
                
                element.textContent = display;
            }, 1000);
        }`;
  }

  /**
   * Get social media icon
   */
  private getSocialIcon(platform: string): string {
    const icons: Record<string, string> = {
      facebook: '📘',
      twitter: '🐦',
      instagram: '📷',
      linkedin: '💼',
      youtube: '📺',
      tiktok: '🎵',
    };
    return icons[platform] || '🔗';
  }

  /**
   * Minify HTML (basic implementation)
   */
  private minifyHTML(html: string): string {
    return html
      .replace(/\n\s+/g, '\n')
      .replace(/\n+/g, '\n')
      .replace(/>\s+</g, '><')
      .trim();
  }
}

/**
 * Utility functions for HTML export
 */
export const htmlExportUtils = {
  /**
   * Export template as HTML file
   */
  exportAsFile(template: PopupTemplate | null, canvasSize: { width: number; height: number }, filename?: string) {
    const exporter = new HTMLExporter(template, canvasSize);
    const html = exporter.generateHTML();
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = filename || `popup-${template?.name || 'design'}.html`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  },

  /**
   * Generate preview HTML string
   */
  generatePreview(template: PopupTemplate | null, canvasSize: { width: number; height: number }): string {
    const exporter = new HTMLExporter(template, canvasSize);
    return exporter.generateHTML();
  },

  /**
   * Generate only the popup content (without full HTML document)
   */
  generatePopupContent(template: PopupTemplate | null): string {
    const exporter = new HTMLExporter(template, { width: 400, height: 600 });
    return exporter.generateHTML({ includeCss: false, includeJs: false });
  }
};