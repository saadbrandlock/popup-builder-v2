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

// Default configuration
export const DEFAULT_REMINDER_TAB_CONFIG: ReminderTabConfig = {
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
  animations: {
    entrance: {
      type: 'slideIn',
      duration: '0.3s'
    },
    popupTrigger: {
      type: 'modal'
    }
  },
  interactions: {
    dragging: {
      enabled: true
    },
    clicking: {
      enabled: true
    }
  },
  responsive: {
    mobile: {
      fontSize: 12,
      hide: false
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
