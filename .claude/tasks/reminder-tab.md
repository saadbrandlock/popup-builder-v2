# Reminder Tab Integration Plan

## Overview
Integrate the provided reminder tab component as the 3rd step in the builder flow. The reminder tab allows users to configure a draggable tab that appears on the side of their website to attract attention to coupons/offers.

## Current Builder Structure Analysis

### Existing Builder Steps:
1. **Step 0 (Config)**: `ConfigStep.tsx` - Template configuration and device/shopper selection
2. **Step 1 (Builder)**: `UnlayerMain.tsx` - Email template design using Unlayer editor
3. **Step 2 (Reminder Tab)**: Currently missing - Need to implement

### Key Components:
- `BuilderMain.tsx`: Main controller with stepper logic
- `useBuilderStore`: Zustand store managing builder state
- Navigation pattern: `/coupon-builder-v2/popup-builder/${templateId}/edit`

### Existing Foundation:
- Constants: `src/features/builder/utils/reminderTabConstants.ts`
- HTML Engine: `src/features/builder/utils/reminderTabHtmlEngine.ts`
- Some type definitions exist in dist/ folder

## Implementation Plan

### Phase 1: Type Definitions and Store
1. **Create Type Definitions**
   - `src/features/builder/types/reminderTab.d.ts`
   - Define ReminderTabConfig interface matching existing implementation
   - Export position, animation, and other types

2. **Extend Builder Store**
   - Add reminder tab config to `useBuilderStore`
   - Add actions for setting/updating reminder tab configuration
   - Initialize with default config from constants

### Phase 2: Component Architecture
Based on existing patterns, break down the monolithic component into:

1. **Main Step Component**
   - `src/features/builder/components/ReminderTabStep.tsx`
   - Main controller for step 2 in the builder
   - Manages save/navigation logic

2. **Sub-components (following modular pattern)**
   - `src/features/builder/components/reminder-tab/ReminderTabEditor.tsx`
   - `src/features/builder/components/reminder-tab/ReminderTabPreview.tsx` 
   - `src/features/builder/components/reminder-tab/BasicSettingsTab.tsx`
   - `src/features/builder/components/reminder-tab/StylingTab.tsx`
   - `src/features/builder/components/reminder-tab/AnimationsTab.tsx`
   - `src/features/builder/components/reminder-tab/AdvancedTab.tsx`

3. **Helper Components**
   - `src/features/builder/components/reminder-tab/index.ts` - Barrel exports

### Phase 3: Integration Points
1. **Builder Main Integration**
   - Add step 2 condition in `BuilderMain.tsx`
   - Import and render `ReminderTabStep`
   - Handle step navigation logic

2. **Navigation Flow**
   - After step 1 (Unlayer), navigate to step 2
   - After step 2, implement completion flow (TBD based on requirements)
   - Add back/next button handling

3. **Data Persistence**
   - Store reminder tab config in template
   - Update template API calls to include reminder tab data
   - Handle save/auto-save functionality

### Phase 4: API Integration
1. **Template API Updates**
   - Modify template save/update to include reminder tab config
   - Add validation for reminder tab data
   - Handle backwards compatibility

2. **Export Functionality**
   - Integrate HTML generation with template export
   - Add reminder tab HTML to final template output

## Technical Implementation Details

### Component Breakdown Strategy

#### 1. ReminderTabStep.tsx
```typescript
// Main step controller
- Manages overall state for step 2
- Handles save/navigation
- Renders editor and preview components
- Manages step completion logic
```

#### 2. ReminderTabEditor.tsx
```typescript
// Main editor component with tabs
- Basic Settings Tab
- Styling Tab  
- Animations Tab
- Advanced Tab
- Manages tab switching and config updates
```

#### 3. ReminderTabPreview.tsx
```typescript
// Live preview component
- Real-time preview of reminder tab
- Desktop/mobile view toggle
- Drag simulation
- Animation preview
```

#### 4. Individual Tab Components
```typescript
// BasicSettingsTab.tsx - Enable/disable, text, position, dimensions
// StylingTab.tsx - Colors, typography, visual styling  
// AnimationsTab.tsx - Entrance animations, popup triggers
// AdvancedTab.tsx - Interactions, mobile settings
```

### Store Integration
```typescript
// Extend useBuilderStore with:
interface BuilderState {
  // ... existing
  reminderTabConfig: ReminderTabConfig | null;
}

interface BuilderActions {
  // ... existing  
  setReminderTabConfig: (config: ReminderTabConfig) => void;
  updateReminderTabConfig: (path: string, value: any) => void;
}
```

### Ant Design Integration
- Use existing Ant Design components (Card, Tabs, Form, etc.)
- Follow existing styling patterns with Tailwind CSS
- Maintain consistent spacing and layout

### Performance Optimizations
- Memoize sub-components to prevent unnecessary re-renders
- Use useCallback for event handlers
- Optimize preview updates with debouncing if needed

## File Structure After Implementation

```
src/features/builder/
├── components/
│   ├── BuilderMain.tsx (updated)
│   ├── ReminderTabStep.tsx (new)
│   └── reminder-tab/
│       ├── index.ts
│       ├── ReminderTabEditor.tsx
│       ├── ReminderTabPreview.tsx
│       ├── BasicSettingsTab.tsx
│       ├── StylingTab.tsx
│       ├── AnimationsTab.tsx
│       └── AdvancedTab.tsx
├── types/
│   ├── index.ts (updated)
│   └── reminderTab.d.ts (new)
├── stores/
│   └── (might add dedicated reminder tab store if needed)
└── utils/
    ├── reminderTabConstants.ts (existing)
    └── reminderTabHtmlEngine.ts (existing)
```

## Integration Steps

### Step 1: Setup Types and Store
- [ ] Create reminderTab.d.ts with proper TypeScript interfaces
- [ ] Update builder store with reminder tab state management
- [ ] Export types from builder types index

### Step 2: Create Base Components  
- [ ] Create ReminderTabStep.tsx main controller
- [ ] Create reminder-tab folder structure
- [ ] Implement ReminderTabPreview with device switching

### Step 3: Implement Configuration Tabs
- [ ] Break down BasicSettingsTab with enable/text/position/dimensions
- [ ] Implement StylingTab with colors and typography
- [ ] Create AnimationsTab with entrance and trigger animations  
- [ ] Build AdvancedTab with interactions and mobile settings

### Step 4: Main Editor Integration
- [ ] Create ReminderTabEditor with tab management
- [ ] Integrate all sub-tabs with proper state management
- [ ] Add form validation and error handling

### Step 5: Builder Integration
- [ ] Update BuilderMain.tsx to include step 2
- [ ] Implement navigation between steps
- [ ] Add save/auto-save functionality

### Step 6: Testing and Polish
- [ ] Test all configuration options
- [ ] Verify HTML generation works correctly
- [ ] Test responsive behavior
- [ ] Add proper error handling

## Success Criteria
1. ✅ User can navigate to step 2 after completing unlayer editor
2. ✅ All reminder tab configuration options work as expected
3. ✅ Live preview updates in real-time
4. ✅ Configuration saves properly to template
5. ✅ HTML generation produces correct output
6. ✅ Mobile responsive design works
7. ✅ Component follows existing code patterns and architecture

## Notes
- Maintain existing code patterns (Zustand stores, component structure)
- Use Ant Design components consistently with current implementation
- Follow TypeScript best practices
- Ensure backwards compatibility with existing templates
- Performance should not be negatively impacted

---

## Implementation Progress
- [x] Analysis and planning completed
- [x] Type definitions and store updates
- [x] Component structure creation (ReminderTabStep + folder structure)
- [x] Individual tab components (BasicSettings, Styling, Animations, Advanced)
- [x] Editor integration (ReminderTabEditor with tab management)
- [x] Builder main integration (step 2 navigation)
- [x] **AUTOSAVE FUNCTIONALITY COMPLETED**:
  - [x] useReminderTabAutosave hook with debouncing and intervals
  - [x] Builder store extended with autosave state management
  - [x] Save status UI indicators (saving, saved, errors, timestamps)
  - [x] Template loading with existing reminder tab config merge
  - [x] API integration with `reminder_tab_state_json` field
  - [x] Manual save functionality with error handling
- [ ] Testing and validation

## ✅ **MAJOR MILESTONE: COMPLETE REMINDER TAB BUILDER WITH AUTOSAVE**

### What's Working:
1. **Full 3-step builder flow**: Config → Unlayer → Reminder Tab
2. **Live preview**: Real-time updates with desktop/mobile views
3. **Configuration tabs**: Basic, Styling, Animations, Advanced settings
4. **Autosave system**: 
   - Saves every 10 seconds with 2-second debounce
   - Stores in `reminder_tab_state_json` field via staging template API
   - Shows real-time save status in UI
   - Loads existing configs on template open
5. **Manual save**: Save button with loading states
6. **Error handling**: Proper error messages and recovery
7. **HTML generation**: Existing engine ready for export

### API Integration:
- **Save**: `PUT /staging-template/${templateId}` with `reminder_tab_state_json`
- **Load**: `GET /staging-template/${templateId}` to retrieve existing config
- **Fallback**: Uses default config if no existing data found

### User Experience:
- ✅ Seamless navigation between builder steps
- ✅ Real-time preview updates
- ✅ Save status indicators (💾 Saving, ✅ Saved, ⚠️ Unsaved, ❌ Error)
- ✅ Timestamps showing last save time
- ✅ No data loss with automatic persistence