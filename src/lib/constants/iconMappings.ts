/**
 * Central icon mappings for converting FontAwesome classes to Unicode characters
 * This avoids duplication across components and ensures consistency
 */

// FontAwesome class names to Unicode emoji mapping
export const FONTAWESOME_TO_UNICODE: Record<string, string> = {
  'fas fa-gift': '🎁',
  'fas fa-tags': '🏷️',
  'fas fa-percentage': '%',
  'fas fa-crown': '👑',
  'fas fa-star': '⭐',
  'fas fa-fire': '🔥',
  'fas fa-bell': '🔔',
  'fas fa-bolt': '⚡',
  'fas fa-shopping-cart': '🛒',
  'fas fa-bullhorn': '📢',
  'fas fa-thumbs-up': '👍',
  'fas fa-heart': '❤️',
};

// Antd icon names to Unicode emoji mapping (for backward compatibility)
export const ANTD_TO_UNICODE: Record<string, string> = {
  'GiftOutlined': '🎁',
  'TagOutlined': '🏷️',
  'PercentageOutlined': '%',
  'CrownOutlined': '👑',
  'StarOutlined': '⭐',
  'FireOutlined': '🔥',
  'BellOutlined': '🔔',
  'ThunderboltOutlined': '⚡',
  'ShoppingCartOutlined': '🛒',
  'SoundOutlined': '📢',
  'LikeOutlined': '👍',
  'HeartOutlined': '❤️',
};

// Default fallback icon
export const DEFAULT_UNICODE_ICON = '🎁';

/**
 * Helper function to get Unicode icon from FontAwesome class
 */
export const getFontAwesomeUnicodeIcon = (fontAwesomeClass: string): string => {
  return FONTAWESOME_TO_UNICODE[fontAwesomeClass] || DEFAULT_UNICODE_ICON;
};

/**
 * Helper function to get Unicode icon from Antd icon name
 */
export const getAntdUnicodeIcon = (antdIconName: string): string => {
  return ANTD_TO_UNICODE[antdIconName] || DEFAULT_UNICODE_ICON;
};