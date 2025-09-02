/**
 * Reminder Tab Types
 * TypeScript definitions for reminder tab configuration and components
 */

import type { AxiosInstance } from 'axios';

export interface FloatingButtonConfig {
  enabled: boolean;
  icon: {
    type: 'antd' | 'custom' | 'emoji' | 'fontawesome';
    value: string; // Icon name for antd, FontAwesome class for fontawesome, URL for custom, emoji character for emoji
    size: number;
    color: string;
  };
  position: {
    bottom: number;
    right: number;
  };
  styling: {
    size: number; // Button diameter
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    boxShadow: string;
  };
  animations: {
    entrance: {
      type: string;
      duration: string;
    };
    hover: {
      enabled: boolean;
      scale: number;
    };
  };
}

export interface DesktopTabConfig {
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
  interactions: {
    dragging: {
      enabled: boolean;
    };
    clicking: {
      enabled: boolean;
    };
  };
}

export interface ReminderTabConfig {
  // Global settings
  enabled: boolean;
  animations: {
    entrance: {
      type: string;
      duration: string;
    };
    popupTrigger: {
      type: string;
    };
  };
  
  // Device-specific configurations
  desktop: DesktopTabConfig;
  mobile: FloatingButtonConfig;
}

export interface AnimationType {
  value: string;
  label: string;
}

export interface PopupTriggerType {
  value: string;
  label: string;
}

export interface ReminderTabValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ReminderTabFileSizeEstimate {
  total: number;
  css: number;
  html: number;
  js: number;
}

// Props interfaces for components
export interface ReminderTabStepProps {
  onNext?: () => void;
  onBack?: () => void;
  onSave?: (config: ReminderTabConfig) => Promise<void>;
  apiClient: AxiosInstance;
}

export interface ReminderTabSaveStatus {
  isSaving: boolean;
  lastSave: Date | null;
  hasUnsavedChanges: boolean;
  saveError: string | null;
}

export interface ReminderTabEditorProps {
  config: ReminderTabConfig;
  onConfigChange: (config: ReminderTabConfig) => void;
  saveStatus?: ReminderTabSaveStatus;
}

export interface ReminderTabPreviewProps {
  config: ReminderTabConfig;
  previewDevice: 'desktop' | 'mobile';
}

export interface ConfigTabProps {
  config: ReminderTabConfig;
  updateConfig: (path: string, value: any) => void;
}

// Legacy config type for HTML converter compatibility
export interface ReactBuilderConfig {
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