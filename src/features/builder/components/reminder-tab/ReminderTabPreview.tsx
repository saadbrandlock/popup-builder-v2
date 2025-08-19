import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Typography } from 'antd';
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
    width: previewDevice === 'mobile' ? '375px' : '100%',
    height: previewDevice === 'mobile' ? '667px' : '400px',
    border: '1px solid #d9d9d9',
    borderRadius: '8px',
    position: 'relative' as const,
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }), [previewDevice]);

  const tabStyle = useMemo(() => ({
    position: 'absolute' as const,
    [config.display.position]: 0,
    top: dragPosition.top,
    transform: dragPosition.transform,
    width: `${config.styling.dimensions.width}px`,
    height: `${config.styling.dimensions.height}px`,
    color: config.styling.colors.textColor,
    borderRadius: config.display.position === 'left' ? '0 8px 8px 0' : '8px 0 0 8px',
    display: config.enabled ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: config.styling.typography.fontFamily,
    fontWeight: config.styling.typography.fontWeight,
    letterSpacing: config.styling.typography.letterSpacing,
    cursor: 'pointer',
    boxShadow: isDragging ? '0 6px 20px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.3)',
    opacity: isDragging ? 0.8 : 1,
    transition: isDragging ? 'none' : 'all 0.3s ease',
    flexDirection: config.display.position === 'left' ? 'row-reverse' : 'row',
    zIndex: isDragging ? 1001 : 1000,
    userSelect: 'none' as const,
    overflow: 'hidden'
  }), [config, dragPosition, isDragging]);

  const textStyle = useMemo(() => ({
    fontSize: previewDevice === 'mobile' ? `${config.responsive.mobile.fontSize}px` : `${config.styling.typography.fontSize}px`,
    letterSpacing: config.styling.typography.letterSpacing,
    whiteSpace: 'nowrap' as const,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${config.styling.colors.primary}, ${config.styling.colors.secondary})`,
    height: '100%',
    writingMode: config.display.position === 'left' ? 'vertical-lr' : 'vertical-rl' as const,
    textOrientation: 'mixed' as const
  }), [config, previewDevice]);

  const draggerStyle = useMemo(() => ({
    background: config.styling.colors.draggerColor,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 0',
    cursor: 'move'
  }), [config.styling.colors.draggerColor]);

  const tabDotsStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 6px)',
    gap: '4px',
    cursor: 'move',
    padding: '0px 6px'
  }), []);

  const dotStyle = useMemo(() => ({
    width: '6px',
    height: '6px',
    background: config.styling.colors.dotColor,
    borderRadius: '50%'
  }), [config.styling.colors.dotColor]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!config.interactions.dragging.enabled) return;
    setIsDragging(true);
    e.preventDefault();
  }, [config.interactions.dragging.enabled]);

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
        const newY = e.clientY - rect.top - (config.styling.dimensions.height / 2);
        const constrainedY = Math.max(0, Math.min(newY, rect.height - config.styling.dimensions.height));
        
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
  }, [isDragging, config.styling.dimensions.height]);

  if (previewDevice === 'mobile' && config.responsive.mobile.hide) {
    return (
      <div style={previewStyle} className="flex items-center justify-center">
        <Text type="secondary">Hidden on mobile devices</Text>
      </div>
    );
  }

  return (
    <div 
      style={previewStyle} 
      data-preview-container
      onMouseUp={handleMouseUp}
    >
      {config.enabled && (
        <div style={tabStyle}>
          <div style={textStyle}>
            {config.display.text}
          </div>
          {config.interactions.dragging.enabled && (
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
    </div>
  );
});

ReminderTabPreview.displayName = 'ReminderTabPreview';

export default ReminderTabPreview;