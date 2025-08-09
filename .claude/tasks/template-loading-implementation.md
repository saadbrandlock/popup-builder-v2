# Template Loading Implementation Plan

## Current State Analysis

### ✅ What We Have:
1. **TemplatesAPI.getTemplateById()** - Returns CleanTemplateResponse with builder_state_json
2. **useUnlayerEditor Hook** - Has onEditorReady callback with templateId parameter
3. **loadDesign() Function** - Existing method in useUnlayerEditor to load design into editor
4. **Store Integration** - Actions for setCurrentDesign, loadDesign, etc.

### ❌ What's Missing:
- Automatic template loading when editor is ready and templateId is provided
- Population of builder from builder_state_json
- Error handling for failed template loads

## Implementation Plan

### Phase 1: Modify useUnlayerEditor Options
**File**: `src/features/builder/hooks/useUnlayerEditor.ts`

Add loading state and option to enable template loading:
```typescript
export interface UseUnlayerEditorOptions {
  // ... existing options
  loadTemplateOnReady?: boolean; // Enable automatic template loading
  onTemplateLoad?: (template: CleanTemplateResponse) => void;
  onTemplateLoadError?: (error: Error) => void;
}
```

### Phase 2: Add Template Loading Function
**File**: `src/features/builder/hooks/useUnlayerEditor.ts`

Create internal function to load template:
```typescript
const loadTemplateById = useCallback(async (templateId: string) => {
  if (!apiClient) {
    console.warn('Cannot load template - API client not provided');
    return;
  }

  try {
    actions.setLoading(true);
    console.log(`🔄 Loading template ${templateId}...`);
    
    const api = createAPI(apiClient);
    const template = await api.templates.getTemplateById(templateId);
    
    // Check if template has builder state
    if (template.builder_state_json) {
      console.log('📄 Template has builder state, loading design...');
      loadDesign(template.builder_state_json);
    } else {
      console.log('⚠️ Template has no builder state');
    }
    
    // Call success callback
    onTemplateLoad?.(template);
    console.log('✅ Template loaded successfully');
    
  } catch (error) {
    console.error('❌ Failed to load template:', error);
    const err = error instanceof Error ? error : new Error('Failed to load template');
    actions.setError(`Template load failed: ${err.message}`);
    onTemplateLoadError?.(err);
  } finally {
    actions.setLoading(false);
  }
}, [apiClient, loadDesign, actions, onTemplateLoad, onTemplateLoadError]);
```

### Phase 3: Integrate into onEditorReady
**File**: `src/features/builder/hooks/useUnlayerEditor.ts`

Modify onEditorReady callback:
```typescript
const onEditorReady = useCallback((unlayer: any) => {
  console.log('🎉 Unlayer editor is ready');
  
  // ... existing setup code ...
  
  // Load template if templateId provided and loading enabled
  if (loadTemplateOnReady && templateId && apiClient) {
    console.log(`🚀 Auto-loading template ${templateId}...`);
    loadTemplateById(templateId);
  }
  
  // ... rest of existing code ...
}, [/* add loadTemplateById to deps */]);
```

### Phase 4: Add Loading States to Return
**File**: `src/features/builder/hooks/useUnlayerEditor.ts`

Add loading function to return:
```typescript
return {
  // ... existing returns
  loadTemplateById, // New: Manual template loading function
  // Store states already include isLoading from actions.setLoading
};
```

### Phase 5: Update Interface
**File**: `src/features/builder/hooks/useUnlayerEditor.ts`

```typescript
export interface UseUnlayerEditorReturn {
  // ... existing interface
  loadTemplateById: (templateId: string) => Promise<void>;
}
```

## Implementation Steps

### Step 1: Add template loading options to interface ✅
### Step 2: Create loadTemplateById function ✅  
### Step 3: Integrate into onEditorReady callback ✅
### Step 4: Add to return interface and object ✅
### Step 5: Test integration ✅

## Expected Behavior

**When templateId is provided and loadTemplateOnReady = true:**
1. Editor loads normally
2. onEditorReady triggers
3. Automatically calls `api.templates.getTemplateById(templateId)`
4. If `builder_state_json` exists, calls `loadDesign(builder_state_json)`
5. Template design populates in editor
6. Success/error callbacks triggered

**Manual Usage:**
- Component can call `loadTemplateById(templateId)` manually
- Same loading flow as automatic

## Files to Modify

1. `src/features/builder/hooks/useUnlayerEditor.ts` - Add template loading logic
2. No new files needed - using existing API and infrastructure

## API Integration

- Uses existing `TemplatesAPI.getTemplateById()`  
- Uses existing `createAPI()` factory
- Uses existing error handling patterns
- Uses existing loading states in store