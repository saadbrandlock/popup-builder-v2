import React, { useState } from 'react';
import { getAllComponents, type CustomComponentDefinition } from '../registry';

export interface ComponentGalleryProps {
  onUseComponent: (componentId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  /** When false, no floating trigger button is rendered when closed (parent provides its own trigger, e.g. beside Save) */
  renderTriggerButton?: boolean;
}

export const ComponentGallery: React.FC<ComponentGalleryProps> = ({
  onUseComponent,
  isOpen,
  onToggle,
  renderTriggerButton = true,
}) => {
  const components = getAllComponents();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleUse = (comp: CustomComponentDefinition) => {
    const html = comp.render(comp.defaultProps as Record<string, unknown>);
    navigator.clipboard.writeText(html).then(() => {
      setCopiedId(comp.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
    onUseComponent(comp.id);
  };

  if (!isOpen) {
    if (!renderTriggerButton) return null;
    return (
      <button
        type="button"
        onClick={onToggle}
        style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
          zIndex: 10000,
          padding: '8px 16px',
          background: '#6366F1',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        🧩 Components
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '320px',
        height: '100vh',
        background: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        zIndex: 10000,
        overflowY: 'auto',
        boxShadow: '4px 0 16px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>🧩 Custom Components</h3>
        <button
          type="button"
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#6B7280',
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: '12px' }}>
        {components.map((comp) => (
          <div
            key={comp.id}
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              marginBottom: '12px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '12px',
                background: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
                maxHeight: '150px',
                overflow: 'hidden',
                transform: 'scale(0.85)',
                transformOrigin: 'top left',
              }}
              dangerouslySetInnerHTML={{
                __html: comp.render(comp.defaultProps as Record<string, unknown>),
              }}
            />

            <div style={{ padding: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '4px',
                }}
              >
                <span style={{ fontSize: '18px' }}>{comp.icon}</span>
                <strong style={{ fontSize: '14px' }}>{comp.name}</strong>
              </div>
              <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#6B7280' }}>
                {comp.description}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleUse(comp)}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    background: '#6366F1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {copiedId === comp.id ? '✓ Copied HTML' : '+ Add to Design'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
