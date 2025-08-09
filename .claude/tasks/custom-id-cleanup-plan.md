# Custom ID Feature Cleanup Plan

## Overview
**Date**: 2025-08-05  
**Task**: Systematically remove all custom ID feature code from the project  
**Reason**: Feature causing compilation errors and infinite loops, needs complete removal

## Files to Remove/Modify

### 🗑️ **Files to Delete Completely**
1. `src/features/builder/components/CustomPropertyPanel.tsx`
2. `src/features/builder/components/SelectionDebugger.tsx`  
3. `src/features/builder/utils/customIdManager.ts`
4. `src/features/builder/utils/htmlProcessor.ts`
5. `.claude/tasks/custom-component-ids.md`
6. `.claude/tasks/custom-id-implementation-audit.md`
7. `.claude/tasks/fix-unlayer-selection-integration.md`
8. `.claude/tasks/optimize-component-selection.md`
9. `.claude/unlayer-event-debugging.md`

### ✂️ **Files to Modify (Remove Custom ID Code)**

#### 1. `src/features/builder/types/unlayer.d.ts`
**Remove**:
- `customId?: string` from UnlayerContent interface
- `CustomIdManager` interface
- `CustomIdValidationResult` interface  
- `CustomIdError` type
- `UnlayerColumn` interface (revert to original structure)
- All custom ID related types

#### 2. `src/features/builder/stores/unlayerStore.ts`
**Remove**:
- `setContentCustomId` action
- `removeContentCustomId` action
- `validateCustomId` action
- `getAllCustomIds` action
- `generateCustomIdSuggestion` action
- `isCustomIdAvailable` action
- `selectedElementId` state
- All custom ID related imports

#### 3. `src/features/builder/hooks/useUnlayerEditor.ts`
**Remove**:
- All selection event listeners
- `setSelectedElement` calls
- Custom ID HTML processing
- Event debugging code
- Selection state management

#### 4. `src/features/builder/components/UnlayerMain.tsx`
**Remove**:
- `CustomPropertyPanel` import and usage
- Any remaining selection debugging code

#### 5. `src/features/builder/components/index.ts`
**Remove**:
- `CustomPropertyPanel` exports
- `SelectionDebugger` exports

#### 6. `src/features/builder/utils/index.ts`
**Remove**:
- `customIdManager` exports
- `htmlProcessor` exports

## Cleanup Process

### Phase 1: Delete Standalone Files
- [x] Remove CustomPropertyPanel.tsx
- [x] Remove SelectionDebugger.tsx
- [x] Remove customIdManager.ts
- [x] Remove htmlProcessor.ts
- [x] Remove documentation files

### Phase 2: Clean Type Definitions
- [x] Revert unlayer.d.ts to original state
- [x] Remove all custom ID interfaces and types

### Phase 3: Clean Store
- [x] Remove custom ID actions from unlayerStore.ts
- [x] Remove selection state management
- [x] Remove custom ID imports

### Phase 4: Clean Hooks
- [x] Remove selection event listeners from useUnlayerEditor.ts
- [x] Remove custom ID processing code
- [x] Remove event debugging

### Phase 5: Clean Integrations
- [x] Remove CustomPropertyPanel from UnlayerMain.tsx
- [x] Clean up component exports

### Phase 6: Verification
- [x] Run TypeScript type checking
- [x] Test app functionality
- [x] Fix any breaking changes

## Expected Result

After cleanup:
- ✅ No TypeScript compilation errors
- ✅ No infinite loops
- ✅ App runs cleanly without custom ID code
- ✅ Original Unlayer functionality preserved
- ✅ Clean codebase ready for future development

## Rollback Strategy

If needed, custom ID code can be restored from:
- Git history
- Backup task documents
- Implementation audit document

---

**Status**: In Progress  
**Next**: Execute cleanup phases systematically