/**
 * Reminder Tab Constants
 * Static data and configuration options for reminder tab editor
 */

import { AnimationType, PopupTriggerType, ReminderTabConfig } from '../types/reminderTab.d';

// Font family options
export const FONT_FAMILIES = [
  'Arial, sans-serif',
  'Helvetica, sans-serif', 
  'Times New Roman, serif',
  'Georgia, serif',
  'Verdana, sans-serif',
  'Courier New, monospace'
] as const;

// Animation type options
export const ANIMATION_TYPES: AnimationType[] = [
  { value: 'slideIn', label: 'Slide In' },
  { value: 'fadeIn', label: 'Fade In' },
  { value: 'bounceIn', label: 'Bounce In' },
  { value: 'zoomIn', label: 'Zoom In' },
  { value: 'none', label: 'No Animation' }
];

// Popup trigger type options
export const POPUP_TRIGGER_TYPES: PopupTriggerType[] = [
  { value: 'modal', label: 'Modal Overlay' },
  { value: 'slide', label: 'Slide Panel' },
  { value: 'fade', label: 'Fade Transition' },
  { value: 'zoom', label: 'Zoom Effect' }
];

// Slider marks for font sizes
export const FONT_SIZE_MARKS = { 10: '10px', 15: '15px', 20: '20px' };
export const MOBILE_FONT_SIZE_MARKS = { 8: '8px', 12: '12px', 16: '16px' };

// Icon options for mobile floating button
export const FLOATING_BUTTON_ICONS = [
  { type: 'fontawesome', value: 'fas fa-gift', label: 'Gift' },
  { type: 'fontawesome', value: 'fas fa-tags', label: 'Tag' },
  { type: 'fontawesome', value: 'fas fa-percentage', label: 'Percentage' },
  { type: 'fontawesome', value: 'fas fa-crown', label: 'Crown' },
  { type: 'fontawesome', value: 'fas fa-star', label: 'Star' },
  { type: 'fontawesome', value: 'fas fa-fire', label: 'Fire' },
  { type: 'fontawesome', value: 'fas fa-bell', label: 'Bell' },
  { type: 'fontawesome', value: 'fas fa-bolt', label: 'Lightning' },
  { type: 'fontawesome', value: 'fas fa-shopping-cart', label: 'Shopping Cart' },
  { type: 'fontawesome', value: 'fas fa-bullhorn', label: 'Announcement' },
  { type: 'fontawesome', value: 'fas fa-thumbs-up', label: 'Thumbs Up' },
  { type: 'fontawesome', value: 'fas fa-heart', label: 'Heart' },
  { type: 'emoji', value: '🎁', label: 'Gift Emoji' },
  { type: 'emoji', value: '🏷️', label: 'Tag Emoji' },
  { type: 'emoji', value: '💰', label: 'Money Emoji' },
  { type: 'emoji', value: '⭐', label: 'Star Emoji' },
  { type: 'emoji', value: '🔥', label: 'Fire Emoji' },
  { type: 'emoji', value: '🛍️', label: 'Shopping Emoji' }
] as const;

// Default configuration
export const DEFAULT_REMINDER_TAB_CONFIG: ReminderTabConfig = {
  enabled: true,
  animations: {
    entrance: {
      type: 'slideIn',
      duration: '0.3s'
    },
    popupTrigger: {
      type: 'modal'
    }
  },
  desktop: {
    enabled: true,
    display: {
      text: 'Special Offer!',
      position: 'left',
      initialPosition: {
        top: '50%',
        transform: 'translateY(-50%)'
      }
    },
    styling: {
      dimensions: {
        width: 80,
        height: 160
      },
      colors: {
        primary: '#8B0000',
        secondary: '#DC143C',
        textColor: '#FFFFFF',
        draggerColor: '#666666',
        dotColor: 'rgba(255, 255, 255, 0.8)'
      },
      typography: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: '1px'
      }
    },
    interactions: {
      dragging: {
        enabled: true
      },
      clicking: {
        enabled: true
      }
    }
  },
  mobile: {
    enabled: true,
    icon: {
      type: 'fontawesome',
      value: 'fas fa-gift',
      size: 24,
      color: '#FFFFFF'
    },
    position: {
      bottom: 24,
      right: 24
    },
    styling: {
      size: 56,
      backgroundColor: '#8B0000',
      borderColor: '#DC143C',
      borderWidth: 2,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    },
    animations: {
      entrance: {
        type: 'slideIn',
        duration: '0.3s'
      },
      hover: {
        enabled: true,
        scale: 1.1
      }
    }
  }
};

// Validation constraints
export const VALIDATION_CONSTRAINTS = {
  dimensions: {
    width: { min: 60, max: 150 },
    height: { min: 100, max: 250 }
  },
  typography: {
    fontSize: { min: 10, max: 20 },
    mobileFontSize: { min: 8, max: 16 }
  },
  text: {
    maxLength: 50
  }
} as const;
