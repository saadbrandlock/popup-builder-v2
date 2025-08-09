import React from 'react';

interface DropIndicatorProps {
  position: 'before' | 'after';
  isVisible: boolean;
  targetElementId?: string;
  className?: string;
}

/**
 * DropIndicator - Visual feedback component showing where elements will be dropped
 * Appears as a blue line between elements during drag operations
 */
export const DropIndicator: React.FC<DropIndicatorProps> = ({
  position,
  isVisible,
  targetElementId,
  className = '',
}) => {
  if (!isVisible) {
    return null;
  }

  const indicatorStyle: React.CSSProperties = {
    height: '3px',
    width: '100%',
    backgroundColor: '#1677ff',
    borderRadius: '2px',
    margin: position === 'before' ? '0 0 8px 0' : '8px 0 0 0',
    position: 'relative',
    boxShadow: '0 0 8px rgba(22, 119, 255, 0.4)',
    animation: 'pulse 1.5s ease-in-out infinite',
    zIndex: 1000,
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.2); }
          100% { opacity: 0.6; transform: scaleY(1); }
        }
      `}</style>
      <div 
        className={`drop-indicator drop-indicator-${position} ${className}`}
        style={indicatorStyle}
        data-drop-position={position}
        data-target-element={targetElementId}
      >
        {/* Arrow indicators */}
        <div
          style={{
            position: 'absolute',
            left: '-6px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '0',
            height: '0',
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent',
            borderRight: '6px solid #1677ff',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '-6px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '0',
            height: '0',
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent',
            borderLeft: '6px solid #1677ff',
          }}
        />
      </div>
    </>
  );
};

/**
 * CanvasDropIndicator - Shows drop zones within the canvas
 */
interface CanvasDropIndicatorProps {
  isVisible: boolean;
  className?: string;
}

export const CanvasDropIndicator: React.FC<CanvasDropIndicatorProps> = ({
  isVisible,
  className = '',
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`canvas-drop-indicator ${className}`}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '60px',
        border: '2px dashed #1677ff',
        borderRadius: '8px',
        backgroundColor: 'rgba(22, 119, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#1677ff',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: 1000,
        animation: 'bounce 2s ease-in-out infinite',
      }}
    >
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translate(-50%, -50%) translateY(0); }
          40% { transform: translate(-50%, -50%) translateY(-10px); }
          60% { transform: translate(-50%, -50%) translateY(-5px); }
        }
      `}</style>
      Drop here to add
    </div>
  );
};