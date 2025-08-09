import React, { useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { PopupElement, PopupElementEnhanced, ContainerElement, GridElement } from '../types';
import { elementRendererUtils } from '../utils/elementRenderer';
import { DragHandle } from './DragHandle';
import { ContainerComponentWrapper } from './ContainerDropZone';
import { GridRenderer } from './GridRenderer';
import { usePopupBuilderStore, useBuilderActions } from '../stores/popupBuilderStore';
import ContainerRenderer from './ContainerRenderer';

interface DOMElementRendererProps {
  element: PopupElement | PopupElementEnhanced;
  isSelected?: boolean;
  onSelect?: (e?: React.MouseEvent) => void;
  style?: React.CSSProperties;
  className?: string;
  parentContainer?: string; // For nested rendering context
  parentCell?: string; // For grid cell context (e.g., 'row-0-col-1')
  nestingLevel?: number; // Track nesting depth
}

/**
 * DOMElementRenderer - Renders popup elements as native DOM elements
 * Uses the modular element renderer utilities for styling and content generation
 */
export const DOMElementRenderer: React.FC<DOMElementRendererProps> = ({
  element,
  isSelected = false,
  onSelect,
  style,
  className,
  parentContainer: _parentContainer,
  nestingLevel = 0,
}) => {
  const { props, content } = elementRendererUtils.getElementConfig(element, {
    isSelected,
    onSelect,
    style,
    className,
  });

  // Make each element a droppable zone for reordering
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `canvas-element-${element.id}`,
    data: {
      type: 'canvas-element-drop',
      elementId: element.id,
    },
  });

  // Create a wrapper that includes drag handle and droppable functionality
  const renderElementWithDragHandle = (elementJSX: React.ReactElement) => {
    return (
      <div 
        ref={setDroppableRef}
        className={`relative block w-full transition-all ${
          isOver ? 'scale-105 shadow-md' : ''
        }`} 
        data-element-wrapper={element.id}
        data-element-id={element.id}
        style={{
          position: 'relative',
          ...style,
        }}
      >
        {elementJSX}
        <DragHandle 
          element={element} 
          isSelected={isSelected} 
        />
      </div>
    );
  };

  // Render based on element type
  let elementJSX: React.ReactElement;

  switch (element.type) {
    case 'title':
      elementJSX = <h1 {...props}>{content}</h1>;
      break;
    
    case 'subtitle':
      elementJSX = <h2 {...props}>{content}</h2>;
      break;
    
    case 'text':
      elementJSX = <p {...props}>{content}</p>;
      break;
    
    case 'button':
      elementJSX = <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{content}</button>;
      break;
    
    case 'image':
    case 'logo':
      elementJSX = <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
      break;
    
    case 'email-input':
      elementJSX = <input {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />;
      break;
    
    case 'link':
      elementJSX = <a {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>{content}</a>;
      break;
    
    case 'divider':
      // @ts-ignore
      elementJSX = <hr {...props} />;
      break;
    
    case 'spacer':
      elementJSX = <div {...props} />;
      break;
    
    case 'close-button':
      elementJSX = <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{content}</button>;
      break;
    
    case 'countdown':
      elementJSX = (
        <div {...props}>
          <CountdownDisplay element={element} />
        </div>
      );
      break;
    
    case 'coupon-code':
      elementJSX = (
        <div {...props}>
          <CouponCodeDisplay element={element} />
        </div>
      );
      break;
    
    case 'progress-bar':
      elementJSX = (
        <div {...props}>
          <ProgressBarDisplay element={element} />
        </div>
      );
      break;
    
    case 'social-links':
      elementJSX = (
        <div {...props}>
          <SocialLinksDisplay element={element} />
        </div>
      );
      break;
    
    case 'container':
      elementJSX = (
        <ContainerRenderer
          element={element as ContainerElement} 
          isSelected={isSelected}
          onSelect={onSelect}
          nestingLevel={nestingLevel}
          {...props}
        />
      );
      break;
    
    case 'grid':
      elementJSX = (
        <GridRenderer
          element={element as GridElement}
          isSelected={isSelected}
          onSelect={onSelect}
          nestingLevel={nestingLevel}
        />
      );
      break;
    
    default:
      elementJSX = (
        <div {...props}>
          <span style={{ fontSize: '12px', color: '#999' }}>
            Unknown element: {element.type}
          </span>
        </div>
      );
      break;
  }

  // Return the element wrapped with drag handle
  return renderElementWithDragHandle(elementJSX);
};

/**
 * Countdown display component
 */
const CountdownDisplay: React.FC<{ element: PopupElement }> = ({ element }) => {
  const config = element.config || {};
  const [timeLeft, setTimeLeft] = React.useState('00:00:00:00');

  React.useEffect(() => {
    if (!config.endTime) {
      setTimeLeft('00:00:00:00');
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(config.endTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft(config.expiredText || 'Offer Expired!');
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const format = config.format || 'DD:HH:MM:SS';
      let display = '';

      if (format === 'DD:HH:MM:SS') {
        display = `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else if (format === 'HH:MM:SS') {
        display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else if (format === 'MM:SS') {
        display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }

      setTimeLeft(display);
    }, 1000);

    return () => clearInterval(timer);
  }, [config.endTime, config.format, config.expiredText]);

  return (
    <span className="countdown-display" style={{ fontFamily: 'monospace' }}>
      {timeLeft}
    </span>
  );
};

/**
 * Coupon code display component
 */
const CouponCodeDisplay: React.FC<{ element: PopupElement }> = ({ element }) => {
  const config = element.config || {};
  const [showCopied, setShowCopied] = React.useState(false);

  const handleCopy = async () => {
    const code = config.code || 'SAVE20';
    try {
      await navigator.clipboard.writeText(code);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return (
    <>
      <span className="coupon-text" onClick={handleCopy} style={{ cursor: 'pointer' }}>
        {config.code || 'SAVE20'}
      </span>
      {showCopied && (
        <span 
          className="copy-feedback"
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#333',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            marginTop: '4px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
          }}
        >
          Copied!
        </span>
      )}
      <span 
        className="copy-hint"
        style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#666',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '11px',
          marginTop: '2px',
          opacity: 0,
          transition: 'opacity 0.2s',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {config.copyText || 'Click to copy'}
      </span>
    </>
  );
};

/**
 * Progress bar display component
 */
const ProgressBarDisplay: React.FC<{ element: PopupElement }> = ({ element }) => {
  const config = element.config || {};
  const progress = config.progress || 75;
  const showPercentage = config.showPercentage !== false;

  return (
    <>
      {config.labelText && (
        <div className="progress-label" style={{ fontSize: '14px', marginBottom: '8px', color: '#333' }}>
          {config.labelText}
        </div>
      )}
      <div 
        className="progress-container"
        style={{
          width: '100%',
          height: '20px',
          background: config.style?.backgroundColor || '#f0f0f0',
          borderRadius: '10px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div 
          className="progress-fill"
          style={{
            width: `${progress}%`,
            height: '100%',
            background: config.barStyle?.backgroundColor || '#1677ff',
            transition: 'width 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {showPercentage ? `${progress}%` : null}
        </div>
      </div>
    </>
  );
};

/**
 * Social links display component
 */
const SocialLinksDisplay: React.FC<{ element: PopupElement }> = ({ element }) => {
  const config = element.config || {};
  const links = config.links || [];

  const getSocialIcon = (platform: string): string => {
    const icons: Record<string, string> = {
      facebook: '📘',
      twitter: '🐦',
      instagram: '📷',
      linkedin: '💼',
      youtube: '📺',
      tiktok: '🎵',
    };
    return icons[platform] || '🔗';
  };

  if (links.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#999', fontSize: '14px' }}>
        No social links configured
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
      {links.map((link: any, index: number) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`social-link social-${link.platform}`}
          style={{
            display: 'inline-block',
            fontSize: '24px',
            textDecoration: 'none',
            transition: 'transform 0.2s',
            color: config.iconColor || '#333',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span className="social-icon">{getSocialIcon(link.platform)}</span>
        </a>
      ))}
    </div>
  );
};

