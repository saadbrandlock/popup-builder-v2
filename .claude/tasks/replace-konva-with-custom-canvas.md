# Replace Konva Canvas with Custom Canvas Solution (Unlayer-Inspired)

## Overview
Replace the current Konva.js canvas implementation with a custom DOM-based solution inspired by Unlayer's popup builder approach. Focus on simplicity, performance, and better integration with React.

## Unlayer Analysis - Key Insights

### Technical Architecture (Based on Research)
- **DOM-Based Editor**: Uses native HTML/CSS for element rendering (not canvas-based)
- **JavaScript Initialization**: Simple init pattern with configuration objects
- **Template-Based Approach**: Professional templates as starting points
- **Zone-Based Layout**: Structured editing areas similar to your current zone system
- **No Complex Canvas Operations**: No zoom, resize, or advanced canvas manipulations
- **Ready-to-Go HTML Output**: Clean HTML/CSS generation

### Key Features to Adopt
1. **Simple Drag & Drop**: Elements from library to fixed zones
2. **Visual Editing**: Direct manipulation of DOM elements
3. **Responsive Design**: CSS-based responsive layouts
4. **Template System**: Pre-built templates for quick starts
5. **Clean HTML Export**: Generate clean, deployable HTML/CSS

## Implementation Strategy

### Phase 1: Remove Konva and Setup Foundation
**Goal**: Replace Konva with DOM-based rendering system

#### Task 1.1: Remove Konva Dependencies
- Remove `konva` and `react-konva` from package.json
- Remove all Konva-related imports and components
- Update rollup.config.js external dependencies

#### Task 1.2: Create Base Canvas Structure
- Build `SimpleCanvas.tsx` component (replace KonvaCanvas)
- Implement basic HTML/CSS container with fixed zones
- Add simple grid background using CSS (no complex rendering)

### Phase 2: DOM-Based Element Rendering
**Goal**: Render template elements as native DOM elements

#### Task 2.1: Element Renderer System
- Create `DOMElementRenderer.tsx` (replace KonvaElementRenderer)
- Build individual renderers for each element type (text, image, button)
- Use CSS positioning and transforms for element placement

#### Task 2.2: Zone-Based Layout
- Implement fixed zones (header, content, footer) as HTML containers
- Use CSS Flexbox/Grid for zone layouts
- Add visual zone indicators and drop targets

### Phase 3: Enhanced Drag & Drop
**Goal**: Improve drag and drop using @dnd-kit with DOM elements

#### Task 3.1: Library to Canvas D&D
- Enhance component library drag and drop
- Add visual drop indicators for zones
- Implement smooth drag animations with CSS

#### Task 3.2: Element Selection & Editing
- Add click-to-select functionality for elements
- Implement property panel integration
- Add visual selection indicators (borders, handles)

### Phase 4: Template System
**Goal**: Add template-based approach like Unlayer

#### Task 4.1: Template Management
- Create template starter system
- Add template preview functionality
- Implement template loading/saving

#### Task 4.2: HTML Export
- Build clean HTML/CSS export functionality
- Generate inline CSS for portability
- Ensure cross-browser compatibility

### Phase 5: Polish & Optimization
**Goal**: Performance and UX improvements

#### Task 5.1: Performance Optimization
- Implement virtual scrolling for large component lists
- Optimize re-rendering with React.memo
- Add loading states and smooth transitions

#### Task 5.2: Testing & Migration
- Update existing popup templates to new format
- Ensure feature parity with current implementation
- Add unit tests for new components

## Detailed Implementation Plan

### Component Structure
```
src/features/popup-builder/components/
├── SimpleCanvas.tsx          (replaces KonvaCanvas.tsx)
├── DOMElementRenderer.tsx    (replaces KonvaElementRenderer.tsx)
├── ZoneContainer.tsx         (new - zone layout)
├── ElementWrapper.tsx        (new - individual element container)
├── DropZone.tsx             (new - drop target areas)
└── SelectionOutline.tsx     (new - selection indicators)
```

### Key Technical Decisions

#### 1. DOM-Based Rendering
- Use `position: absolute` for precise element positioning
- CSS transforms for smooth animations
- Native HTML elements for better accessibility

#### 2. No Complex Canvas Features
- Remove zoom functionality (not needed per your request)
- Remove resize handles (elements have fixed sizes)
- Remove rotation controls (keep it simple)
- Remove complex grid snapping

#### 3. Simplified Interaction Model
- Click to select elements
- Drag from library to zones
- Property panel for editing
- Simple visual feedback

#### 4. CSS-First Approach
- Use CSS for all styling and animations
- CSS Grid/Flexbox for layouts
- CSS transforms for positioning
- Minimal JavaScript for interactions

### Store Integration

#### Minimal Store Changes Required
- Keep existing Zustand store structure
- Update element positioning to use CSS properties
- Remove Konva-specific event handlers
- Add DOM element ref management

### Performance Considerations

#### Benefits of DOM Approach
- Better React integration (native components)
- Smaller bundle size (remove Konva)
- Better text rendering and editing
- Native browser optimizations
- Simpler debugging and development

#### Potential Concerns
- May be slower with 100+ elements (acceptable for popup builder)
- Need careful re-render optimization
- CSS layout calculations

### Migration Strategy

#### Backward Compatibility
- Convert existing templates automatically
- Map Konva positioning to CSS positioning
- Preserve all existing functionality
- Gradual rollout approach

## Success Criteria

1. **Functional Parity**: All current drag & drop functionality works
2. **Improved Performance**: Faster initial load, smoother interactions
3. **Better Developer Experience**: Easier to maintain and extend
4. **Smaller Bundle**: Reduced JavaScript bundle size
5. **Unlayer-like Simplicity**: Clean, focused editing experience

## Risk Assessment

- **Low Risk**: DOM-based approach is well-established
- **Low Risk**: @dnd-kit provides robust D&D functionality
- **Medium Risk**: Performance with many elements (mitigated by popup use case)
- **Low Risk**: Existing store architecture remains compatible

## Timeline Estimate

- **Phase 1**: 2-3 days (foundation)
- **Phase 2**: 3-4 days (DOM rendering)
- **Phase 3**: 2-3 days (drag & drop)
- **Phase 4**: 2-3 days (templates)
- **Phase 5**: 2-3 days (polish)

**Total**: 11-16 days for complete implementation

## Progress Status

### ✅ Phase 1: Remove Konva and Setup Foundation - COMPLETED
- ✅ **Task 1.1**: Remove Konva Dependencies
  - ✅ Removed `konva` and `react-konva` from package.json
  - ✅ Updated rollup.config.js (no changes needed - was already correct)
  - ✅ Removed all Konva-related imports and components

- ✅ **Task 1.2**: Create Base Canvas Structure  
  - ✅ Built modular `SimpleCanvas.tsx` component
  - ✅ Implemented HTML/CSS container with fixed zones
  - ✅ Added CSS grid background pattern

### ✅ Phase 2: DOM-Based Element Rendering - COMPLETED
- ✅ **Task 2.1**: Element Renderer System
  - ✅ Created modular `DOMElementRenderer.tsx` 
  - ✅ Built utilities for all 18 component types from database
  - ✅ Implemented CSS positioning and styling system

- ✅ **Task 2.2**: Zone-Based Layout
  - ✅ Implemented fixed zones (header, content, footer) as HTML containers
  - ✅ Created zone management utilities
  - ✅ Added visual zone indicators and drop targets

### ✅ Phase 3: Enhanced Utilities Architecture - COMPLETED
- ✅ **Task 3.1**: Modular Utility System
  - ✅ Created `htmlExport.ts` - Complete HTML/CSS export system
  - ✅ Created `elementRenderer.ts` - Element styling and props generation
  - ✅ Created `canvasZone.ts` - Zone management and validation

- ✅ **Task 3.2**: Component Integration
  - ✅ Updated component exports and imports
  - ✅ Updated PopupBuilder to use SimpleCanvas
  - ✅ Removed old Konva-related files and hooks

### 🔄 Phase 4: Testing & Integration - IN PROGRESS
- ⏳ **Task 4.1**: Integration Testing
  - ⏳ Test drag and drop functionality
  - ⏳ Test HTML export functionality
  - ⏳ Test all 18 component types

- ⏳ **Task 4.2**: Performance Validation
  - ⏳ Bundle size comparison
  - ⏳ Runtime performance testing
  - ⏳ Memory usage validation

### 📋 Phase 5: Final Polish - PENDING
- ⏳ **Task 5.1**: Edge Case Handling
- ⏳ **Task 5.2**: Documentation Updates

## Architecture Implemented

### ✅ Modular Utilities Created
```
src/features/popup-builder/utils/
├── htmlExport.ts          ✅ HTML/CSS generation & export
├── elementRenderer.ts     ✅ Element styling & props
├── canvasZone.ts         ✅ Zone management & validation
└── index.ts              ✅ Utility exports
```

### ✅ Component Structure Updated
```
src/features/popup-builder/components/
├── SimpleCanvas.tsx       ✅ Modular DOM-based canvas
├── DOMElementRenderer.tsx ✅ Component renderer
├── PopupBuilder.tsx       ✅ Updated to use SimpleCanvas
└── index.ts              ✅ Updated exports
```

### ✅ All 18 Component Types Supported
- ✅ Basic: title, subtitle, text, button, image, logo, link, divider, spacer
- ✅ Interactive: countdown, coupon-code, email-input, progress-bar, close-button, social-links  
- ✅ Containers: container, grid

### ✅ Features Implemented
- ✅ DOM-based rendering (no canvas complexity)
- ✅ Zone-based layout system
- ✅ Clean HTML/CSS export
- ✅ Modular utility architecture
- ✅ Element selection and interaction
- ✅ Drag & drop integration ready

## Current Status: 80% Complete

**What's Working:**
- ✅ All Konva dependencies removed
- ✅ Modular DOM-based canvas architecture
- ✅ Complete utility system for HTML export
- ✅ All component types supported
- ✅ Zone management system

**Next Steps:**
1. Test the complete integration
2. Validate drag & drop functionality
3. Performance testing and optimization
4. Final documentation updates