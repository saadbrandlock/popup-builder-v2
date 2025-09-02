import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Typography } from 'antd';
import * as AntdIcons from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGift, 
  faTags, 
  faPercentage, 
  faCrown, 
  faStar, 
  faFire, 
  faBell, 
  faBolt, 
  faShoppingCart, 
  faBullhorn, 
  faThumbsUp, 
  faHeart 
} from '@fortawesome/free-solid-svg-icons';
import type { ReminderTabPreviewProps } from '@/features/builder/types';

const { Text } = Typography;

const ReminderTabPreview: React.FC<ReminderTabPreviewProps> = memo(({ 
  config, 
  previewDevice 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ 
    top: '50%', 
    transform: 'translateY(-50%)' 
  });

  // Memoized styles to prevent recreation
  const previewStyle = useMemo(() => ({
    width: '100%',
    height: '400px',
    maxWidth: '100%',
    maxHeight: '100%',
    border: '1px solid #d9d9d9',
    borderRadius: '8px',
    position: 'relative' as const,
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }), [previewDevice]);

  // Desktop Tab Styles
  const tabStyle = useMemo(() => {
    const desktopConfig = config.desktop;
    return {
      position: 'absolute' as const,
      [desktopConfig.display.position]: 0,
      top: dragPosition.top,
      transform: dragPosition.transform,
      width: `${desktopConfig.styling.dimensions.width}px`,
      height: `${desktopConfig.styling.dimensions.height}px`,
      color: desktopConfig.styling.colors.textColor,
      borderRadius: desktopConfig.display.position === 'left' ? '0 8px 8px 0' : '8px 0 0 8px',
      display: (config.enabled && desktopConfig.enabled) ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: desktopConfig.styling.typography.fontFamily,
      fontWeight: desktopConfig.styling.typography.fontWeight,
      letterSpacing: desktopConfig.styling.typography.letterSpacing,
      cursor: 'pointer',
      boxShadow: isDragging ? '0 6px 20px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.3)',
      opacity: isDragging ? 0.8 : 1,
      transition: isDragging ? 'none' : 'all 0.3s ease',
      flexDirection: (desktopConfig.display.position === 'left' ? 'row-reverse' : 'row') as 'row' | 'row-reverse',
      zIndex: isDragging ? 1001 : 1000,
      userSelect: 'none' as const,
      overflow: 'hidden'
    };
  }, [config, dragPosition, isDragging]);

  const textStyle = useMemo(() => {
    const desktopConfig = config.desktop;
    return {
      fontSize: `${desktopConfig.styling.typography.fontSize}px`,
      letterSpacing: desktopConfig.styling.typography.letterSpacing,
      whiteSpace: 'nowrap' as const,
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${desktopConfig.styling.colors.primary}, ${desktopConfig.styling.colors.secondary})`,
      height: '100%',
      writingMode: (desktopConfig.display.position === 'left' ? 'vertical-lr' : 'vertical-rl') as 'vertical-lr' | 'vertical-rl',
      textOrientation: 'mixed' as const
    };
  }, [config]);

  const draggerStyle = useMemo(() => {
    const desktopConfig = config.desktop;
    return {
      background: desktopConfig.styling.colors.draggerColor,
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 0',
      cursor: 'move'
    };
  }, [config]);

  const tabDotsStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 6px)',
    gap: '4px',
    cursor: 'move',
    padding: '0px 6px'
  }), []);

  const dotStyle = useMemo(() => {
    const desktopConfig = config.desktop;
    return {
      width: '6px',
      height: '6px',
      background: desktopConfig.styling.colors.dotColor,
      borderRadius: '50%'
    };
  }, [config]);

  // Mobile Floating Button Styles
  const floatingButtonStyle = useMemo(() => {
    const mobileConfig = config.mobile;
    return {
      position: 'absolute' as const,
      bottom: `${mobileConfig.position.bottom}px`,
      right: `${mobileConfig.position.right}px`,
      width: `${mobileConfig.styling.size}px`,
      height: `${mobileConfig.styling.size}px`,
      backgroundColor: mobileConfig.styling.backgroundColor,
      borderRadius: '50%',
      border: `${mobileConfig.styling.borderWidth}px solid ${mobileConfig.styling.borderColor}`,
      boxShadow: mobileConfig.styling.boxShadow,
      display: (config.enabled && mobileConfig.enabled) ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      zIndex: 1000
    };
  }, [config]);

  const floatingButtonIconStyle = useMemo(() => {
    const mobileConfig = config.mobile;
    return {
      fontSize: `${mobileConfig.icon.size}px`,
      color: mobileConfig.icon.color
    };
  }, [config]);

  const renderIcon = useCallback(() => {
    const mobileConfig = config.mobile;

    if (mobileConfig.icon.type === 'antd') {
      const IconComponent = (AntdIcons as any)[mobileConfig.icon.value];
      return IconComponent ? <IconComponent style={floatingButtonIconStyle} /> : null;
    }
    
    if (mobileConfig.icon.type === 'emoji') {
      return <span style={floatingButtonIconStyle}>{mobileConfig.icon.value}</span>;
    }
    
    if (mobileConfig.icon.type === 'fontawesome') {
      // Map FontAwesome class names to actual FontAwesome icons
      const iconMapping: Record<string, any> = {
        'fas fa-gift': faGift,
        'fas fa-tags': faTags,
        'fas fa-percentage': faPercentage,
        'fas fa-crown': faCrown,
        'fas fa-star': faStar,
        'fas fa-fire': faFire,
        'fas fa-bell': faBell,
        'fas fa-bolt': faBolt,
        'fas fa-shopping-cart': faShoppingCart,
        'fas fa-bullhorn': faBullhorn,
        'fas fa-thumbs-up': faThumbsUp,
        'fas fa-heart': faHeart,
      };
      const iconDef = iconMapping[mobileConfig.icon.value] || faGift;
      return <FontAwesomeIcon icon={iconDef} style={floatingButtonIconStyle} />;
    }
    
    return null;
  }, [config.mobile, floatingButtonIconStyle]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const desktopConfig = config.desktop;
    if (!desktopConfig.interactions.dragging.enabled) return;
    setIsDragging(true);
    e.preventDefault();
  }, [config]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global mouse event handlers
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const previewElement = document.querySelector('[data-preview-container]') as HTMLElement;
        if (!previewElement) return;
        
        const rect = previewElement.getBoundingClientRect();
        const desktopConfig = config.desktop;
        const newY = e.clientY - rect.top - (desktopConfig.styling.dimensions.height / 2);
        const constrainedY = Math.max(0, Math.min(newY, rect.height - desktopConfig.styling.dimensions.height));
        
        setDragPosition({
          top: `${constrainedY}px`,
          transform: 'none'
        });
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, config]);

  // Handle mobile disabled state
  if (previewDevice === 'mobile' && !config.mobile.enabled) {
    return (
      <div style={previewStyle} className="flex items-center justify-center">
        <Text type="secondary">Mobile floating button is disabled</Text>
      </div>
    );
  }

  // Handle desktop disabled state
  if (previewDevice === 'desktop' && !config.desktop.enabled) {
    return (
      <div style={previewStyle} className="flex items-center justify-center">
        <Text type="secondary">Desktop tab is disabled</Text>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center w-full h-full min-h-[400px] overflow-auto">
      <div 
        style={previewStyle} 
        data-preview-container
        onMouseUp={handleMouseUp}
      >
      {/* Desktop Tab */}
      {previewDevice === 'desktop' && config.enabled && (
        <div style={tabStyle}>
          <div style={textStyle}>
            {config.desktop.display.text}
          </div>
          {config.desktop.interactions.dragging.enabled && (
            <div 
              style={draggerStyle}
              onMouseDown={handleMouseDown}
            >
              <div style={tabDotsStyle}>
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} style={dotStyle} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Floating Button */}
      {previewDevice === 'mobile' && config.enabled && (
        <div style={floatingButtonStyle}>
          {renderIcon()}
        </div>
      )}
      </div>
    </div>
  );
});

ReminderTabPreview.displayName = 'ReminderTabPreview';

export default ReminderTabPreview;