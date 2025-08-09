# Unlayer Custom Auto-Save Implementation Task

## Current State Analysis

### ✅ What We Already Have:

#### 1. **Complete Auto-Save System** (`useAutosave` hook)
- ✅ Debounced auto-save with configurable intervals
- ✅ Manual save functionality 
- ✅ Auto-save status tracking ('idle', 'saving', 'saved', 'error')
- ✅ Integration with Unlayer store
- ✅ Periodic backup saves every 30 seconds
- ✅ **BUT**: Currently saves to Unlayer store only, not our API

#### 2. **Unlayer Store** (`unlayerStore.ts`)
- ✅ Complete state management for designs, auto-save, exports
- ✅ `saveDesign` action that handles local storage
- ✅ Auto-save status tracking (`autoSaveEnabled`, `lastAutoSave`, `hasUnsavedChanges`)
- ✅ **BUT**: No API integration for persistence

#### 3. **Templates API** (`TemplatesAPI.ts`)
- ✅ `updateTemplate(templateId, templateData)` method available
- ✅ Accepts `Partial<TCBTemplate>` including `builder_state_json`
- ✅ Proper error handling and response processing

#### 4. **Unlayer Editor Integration** (`useUnlayerEditor.ts`)
- ✅ Uses existing `useAutosave` hook
- ✅ `design:updated` listener already implemented
- ✅ **BUT**: Only updates store, doesn't call API

#### 5. **Existing Utilities**
- ✅ `useDebouncedCallback` from `@/lib/hooks/use-debounce`
- ✅ Store integration (`useBuilderStore`, `useGenericStore`)
- ✅ API factory pattern with `createAPI`

### ❌ What's Missing:
- API integration in the auto-save flow
- Unlayer store `saveDesign` action doesn't call TemplatesAPI
- Auto-save to our backend instead of just local store

## Implementation Plan

### 📋 Phase 1: Modify Existing Auto-Save to Use API

#### Task 1.1: Update `useAutosave` Hook
**File**: `src/features/builder/hooks/useAutosave.ts`

**Current Issue**: The `onSave` callback is optional and not consistently used
**Solution**: Make API integration mandatory and built-in

**Changes Needed**:
```typescript
// ADD new required options
export interface UseAutosaveOptions {
  enabled?: boolean;
  interval?: number;
  onSave?: (design: any) => Promise<void>; // Keep for backward compatibility
  onError?: (error: Error) => void;
  // NEW: API integration options
  apiClient?: AxiosInstance;
  templateId?: string;
  accountId?: string;
  saveToAPI?: boolean; // Enable/disable API saves
}

// MODIFY performAutoSave function to include API call
const performAutoSave = useCallback(async () => {
  if (!editorRef.current?.editor || !hasUnsavedChanges) {
    return;
  }

  try {
    console.log('🔄 Performing autosave...');
    
    const unlayer = editorRef.current.editor;
    
    unlayer.saveDesign(async (design: any) => {
      try {
        // Save to store (existing)
        await actions.saveDesign(design);
        
        // NEW: Save to API if enabled
        if (saveToAPI && apiClient && templateId) {
          const api = createAPI(apiClient);
          await api.templates.updateTemplate(templateId, {
            builder_state_json: design,
            updated_at: new Date().toISOString()
          });
          console.log('✅ Auto-saved to API');
        }
        
        // Call external save handler if provided (existing)
        if (onSave) {
          await onSave(design);
        }
        
        console.log('✅ Autosave completed');
      } catch (error) {
        // ... existing error handling
      }
    });
  } catch (error) {
    // ... existing error handling
  }
}, [editorRef, hasUnsavedChanges, actions, onSave, onError, saveToAPI, apiClient, templateId]);
```

#### Task 1.2: Update `useUnlayerEditor` Integration
**File**: `src/features/builder/hooks/useUnlayerEditor.ts`

**Current Code**:
```typescript
const {
  lastSave: lastAutoSave,
  isAutoSaveEnabled,
  // ...
} = useAutosave(editorRef, {
  enabled: autoSave,
  interval: autoSaveInterval,
  onSave,      // This just calls the prop, doesn't save to API
  onError
});
```

**Updated Code**:
```typescript
const {
  lastSave: lastAutoSave,
  isAutoSaveEnabled,
  // ...
} = useAutosave(editorRef, {
  enabled: autoSave,
  interval: autoSaveInterval,
  onSave,
  onError,
  // NEW: Pass API integration options
  apiClient,
  templateId,
  accountId,
  saveToAPI: enableCustomImageUpload && !!apiClient && !!templateId // Use same condition as image upload
});
```

### 📋 Phase 2: Alternative Approach - Enhance Store Integration

#### Task 2.1: Update `unlayerStore.ts` saveDesign Action
**File**: `src/features/builder/stores/unlayerStore.ts`

**Current Issue**: `saveDesign` action only handles local state
**Solution**: Integrate API call directly in the store action

**Option A - Add API parameters to store**:
```typescript
interface UnlayerState {
  // ... existing state
  // NEW: API integration
  apiClient: AxiosInstance | null;
  templateId: string | null;
  accountId: string | null;
}

interface UnlayerActions {
  // ... existing actions
  // NEW: API configuration
  setApiConfig: (config: { apiClient: AxiosInstance; templateId: string; accountId: string }) => void;
  
  // MODIFY existing saveDesign to include API call
  saveDesign: (design: any) => Promise<void>;
}

// UPDATED saveDesign implementation
saveDesign: async (design: any): Promise<void> => {
  set({ isSaving: true, error: null });
  
  try {
    const state = get();
    
    // Add to history before saving (existing)
    if (state.currentDesign) {
      state.actions.addToHistory(state.currentDesign);
    }
    
    // NEW: Save to API if configured
    if (state.apiClient && state.templateId) {
      const api = createAPI(state.apiClient);
      await api.templates.updateTemplate(state.templateId, {
        builder_state_json: design,
        updated_at: new Date().toISOString()
      });
      console.log('✅ Saved to API via store');
    }
    
    // Update store state (existing)
    set({ 
      savedDesign: design,
      currentDesign: design,
      hasUnsavedChanges: false,
      isSaving: false,
      lastAutoSave: new Date(),
      error: null 
    });
  } catch (error) {
    // ... existing error handling
  }
},
```

#### Task 2.2: Initialize Store with API Config
**File**: `src/features/builder/hooks/useUnlayerEditor.ts`

**Add in onEditorReady**:
```typescript
const onEditorReady = useCallback((unlayer: any) => {
  console.log('🎉 Unlayer editor is ready');
  
  // ... existing setup
  
  // NEW: Configure store with API details
  if (apiClient && templateId && accountId) {
    actions.setApiConfig({ apiClient, templateId, accountId });
    console.log('💾 Store configured with API integration');
  }
  
  // ... rest of existing setup
}, [/* ... existing deps */, actions]);
```

### 📋 Phase 3: UI Updates (Minimal Changes Needed)

#### Task 3.1: UnlayerMain Component
**File**: `src/features/builder/components/UnlayerMain.tsx`

**Current State**: Already shows auto-save status from `useUnlayerEditor`
**Changes**: Add API save status indicators

```typescript
// Existing status indicator works, just update text
{autoSaveStatus === 'saving' && (
  <Badge status="processing" text="Saving to API..." />
)}
{autoSaveStatus === 'saved' && (
  <Badge status="success" text="Saved to API" />
)}
{autoSaveStatus === 'error' && (
  <Badge status="error" text="API save failed" />
)}
```

## Recommended Approach: **Option A - Modify useAutosave Hook**

### Why This Approach:
1. ✅ **Minimal Changes**: Only modify existing `useAutosave` hook
2. ✅ **Backward Compatible**: Existing functionality preserved
3. ✅ **Clean Separation**: API logic separate from store logic
4. ✅ **Reusable**: Other components can use API-enabled auto-save
5. ✅ **Consistent**: Uses same pattern as image upload integration

### Implementation Steps:

#### Step 1: Modify `useAutosave.ts`
```typescript
// Add API options to interface
// Add createAPI import
// Modify performAutoSave to include API call
// Modify performManualSave to include API call
```

#### Step 2: Update `useUnlayerEditor.ts`
```typescript
// Pass apiClient, templateId, accountId to useAutosave
// Enable saveToAPI flag based on availability
```

#### Step 3: Test Integration
```typescript
// Verify auto-save calls API
// Verify manual save calls API  
// Verify error handling works
// Verify UI status updates correctly
```

## Files to Modify

### Modified Files:
1. `src/features/builder/hooks/useAutosave.ts` - Add API integration
2. `src/features/builder/hooks/useUnlayerEditor.ts` - Pass API options
3. `src/features/builder/components/UnlayerMain.tsx` - Update status text (optional)

### No New Files Needed:
- ✅ All required infrastructure exists
- ✅ API methods already available
- ✅ Store integration already working
- ✅ UI components already show status

## Expected Outcome

After implementation:
- ✅ Auto-save continues working exactly as before
- ✅ **NEW**: Auto-save now persists to our API via `TemplatesAPI.updateTemplate`
- ✅ **NEW**: Manual save also persists to our API
- ✅ Existing UI status indicators work with API saves
- ✅ Error handling includes API failures
- ✅ No breaking changes to existing functionality
- ✅ Follows same pattern as image upload integration

## Implementation Priority

**High Priority**: Task 1.1 and 1.2 (Modify useAutosave hook)
**Medium Priority**: Task 3.1 (UI updates)
**Low Priority**: Alternative approaches (only if primary approach fails)

This approach leverages our existing, well-tested auto-save system and simply adds API persistence to it, which is exactly what we need.