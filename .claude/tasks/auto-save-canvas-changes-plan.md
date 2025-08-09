# Auto-Save Canvas Changes Implementation Plan

## Problem Analysis

### Current State:
- Auto-save only triggers on manual "save design" action
- Auto-save NOT triggering on:
  - Drag & drop elements to canvas
  - Delete elements from canvas
  - Edit element properties
  - Resize elements
  - Move elements
  - Add new elements from toolbar

### Root Cause:
Auto-save depends on `hasUnsavedChanges` state, which is only updated by the `design:updated` event listener in `useUnlayerEditor`. This event may not be firing for all canvas operations, or we're not detecting all the changes properly.

## Current Implementation Analysis

### In `useUnlayerEditor.ts`:
```typescript
// Set up design change listener for autosave
unlayer.addEventListener('design:updated', (updatedDesign: any) => {
  console.log('🔄 Design updated');
  actions.setCurrentDesign(updatedDesign);
  actions.markUnsavedChanges(true);
  onDesignChange?.(updatedDesign);
});
```

### In `useAutosave.ts`:
```typescript
// Auto-save only triggers when hasUnsavedChanges = true
if (autoSaveEnabled && hasUnsavedChanges) {
  performAutoSave();
}
```

## Potential Issues:

1. **Limited Event Listening**: Only listening to `design:updated` - may not cover all canvas operations
2. **Event Timing**: Events might fire before we set up listeners
3. **Event Granularity**: Some operations might not trigger `design:updated`
4. **State Synchronization**: Store state might not reflect actual canvas changes

## Research: Unlayer Events

According to Unlayer documentation, available events include:
- `design:loaded` - When design is loaded
- `design:updated` - When design is modified (should cover most changes)
- `editor:ready` - When editor is ready
- `image:uploaded` - When image is uploaded

**Key Finding**: `design:updated` should cover all design modifications, but may have timing or setup issues.

## Investigation Plan

### Phase 1: Comprehensive Event Debugging
Add detailed logging to understand:
1. When `design:updated` events fire
2. What operations trigger the event
3. Timing of event vs auto-save check
4. State synchronization issues

### Phase 2: Additional Event Listeners
Research and implement additional event listeners:
1. Element-specific events (if available)
2. Canvas interaction events
3. Toolbar action events

### Phase 3: Manual Change Detection
Implement polling or alternative change detection:
1. Compare current design with saved design
2. Hash-based change detection
3. Deep equality checks

## Implementation Strategy

### Strategy A: Enhanced Event Listening (Recommended)
1. **Debug current events** - Add comprehensive logging
2. **Research Unlayer API** - Find all available events
3. **Add multiple event listeners** - Cover all possible change scenarios
4. **Improve event timing** - Ensure listeners are set up before any operations

### Strategy B: Polling-Based Detection
1. **Periodic design comparison** - Check for changes every few seconds
2. **Hash-based detection** - Generate design fingerprint for comparison
3. **Debounced change detection** - Avoid excessive API calls

### Strategy C: Hybrid Approach
1. **Primary**: Enhanced event listening
2. **Fallback**: Periodic change detection
3. **Validation**: Cross-check both methods

## Detailed Implementation Plan

### Step 1: Debug Current Event System
```typescript
// Enhanced debugging in useUnlayerEditor.ts
unlayer.addEventListener('design:updated', (updatedDesign: any) => {
  console.log('🔄 design:updated event fired');
  console.log('📊 Event data:', updatedDesign);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('🎯 Current hasUnsavedChanges:', hasUnsavedChanges);
  
  actions.setCurrentDesign(updatedDesign);
  actions.markUnsavedChanges(true);
  onDesignChange?.(updatedDesign);
  
  // Force auto-save check
  console.log('🚀 Triggering immediate auto-save check...');
});
```

### Step 2: Research Additional Events
```typescript
// Test all possible Unlayer events
const events = [
  'design:loaded',
  'design:updated', 
  'editor:ready',
  'image:uploaded',
  'element:added',
  'element:removed',
  'element:modified',
  // ... any other events
];

events.forEach(eventName => {
  unlayer.addEventListener(eventName, (data) => {
    console.log(`📡 Event: ${eventName}`, data);
  });
});
```

### Step 3: Enhanced Auto-Save Triggering
```typescript
// In useAutosave.ts - Add manual trigger capability
export interface UseAutosaveReturn {
  // ... existing
  triggerAutoSave: () => void; // Manual trigger
  forceAutoSaveCheck: () => void; // Force state check
}

// Add immediate auto-save trigger
const triggerAutoSave = useCallback(() => {
  console.log('🎯 Manual auto-save triggered');
  performAutoSave();
}, [performAutoSave]);
```

### Step 4: Fallback Change Detection
```typescript
// Periodic design comparison
useEffect(() => {
  if (!autoSaveEnabled) return;
  
  const checkForChanges = () => {
    if (!editorRef.current?.editor) return;
    
    const unlayer = editorRef.current.editor;
    unlayer.saveDesign((currentDesign: any) => {
      const designChanged = JSON.stringify(currentDesign) !== JSON.stringify(store.savedDesign);
      
      if (designChanged && !store.hasUnsavedChanges) {
        console.log('🔍 Change detected via polling');
        actions.markUnsavedChanges(true);
      }
    });
  };
  
  const interval = setInterval(checkForChanges, 5000); // Check every 5 seconds
  return () => clearInterval(interval);
}, [autoSaveEnabled, store.savedDesign, store.hasUnsavedChanges]);
```

## Testing Plan

### Test Scenarios:
1. **Drag & Drop**: Add element from toolbar to canvas
2. **Delete**: Remove element from canvas
3. **Edit**: Modify element properties (text, color, etc.)
4. **Move**: Drag element to different position
5. **Resize**: Change element dimensions
6. **Copy/Paste**: Duplicate elements
7. **Undo/Redo**: Revert changes

### Success Criteria:
- Auto-save triggers within 30 seconds of ANY canvas change
- `hasUnsavedChanges` updates immediately after change
- Console logs show proper event detection
- API calls happen for all change types

## Implementation Priority

1. **High**: Step 1 - Debug current events
2. **High**: Step 2 - Research additional events  
3. **Medium**: Step 3 - Enhanced triggering
4. **Low**: Step 4 - Fallback detection (only if needed)

## Expected Outcome

After implementation:
- ✅ Auto-save triggers on ALL canvas operations
- ✅ Immediate change detection (< 1 second)
- ✅ Robust fallback mechanisms
- ✅ Comprehensive event coverage
- ✅ Better user experience with reliable auto-save