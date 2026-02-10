import React from 'react';
import type { DetectedComponent } from '../utils/detection';

export interface ActiveComponentsListProps {
  components: DetectedComponent[];
  selectedComponent: DetectedComponent | null;
  onSelect: (comp: DetectedComponent) => void;
}

export const ActiveComponentsList: React.FC<ActiveComponentsListProps> = ({
  components,
  selectedComponent,
  onSelect,
}) => {
  if (components.length === 0) return null;

  return (
    <div style={{ padding: '8px', minWidth: '200px' }}>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px',
        }}
      >
        Components in design
      </div>
      {components.map((comp) => (
        <button
          type="button"
          key={comp.htmlBlockId}
          onClick={() => onSelect(comp)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            border:
              selectedComponent?.htmlBlockId === comp.htmlBlockId
                ? '2px solid #6366F1'
                : '1px solid #E5E7EB',
            borderRadius: '6px',
            background: 'white',
            cursor: 'pointer',
            width: '100%',
            marginBottom: '4px',
            textAlign: 'left',
          }}
        >
          <span>{comp.componentDef.icon}</span>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>{comp.componentDef.name}</span>
        </button>
      ))}
    </div>
  );
};
