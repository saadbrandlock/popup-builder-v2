# Fix Infinite Loop and TypeScript Errors

## Problem Analysis
1. **Infinite Loop Error**: SelectionDebugger causing "Maximum update depth exceeded" in UnlayerMain.tsx line 313
2. **TypeScript Error**: `Property 'columns' does not exist on type 'UnlayerRow'` in CustomPropertyPanel.tsx line 289

## Implementation Plan

### Phase 1: Fix Infinite Loop (Critical Priority)
**Task 1.1**: Remove SelectionDebugger from UnlayerMain.tsx
- Read `src/features/builder/components/UnlayerMain.tsx`
- Locate SelectionDebugger import and usage around line 313
- Remove both import statement and component usage
- Ensure no other dependencies on SelectionDebugger remain

**Reasoning**: The infinite loop is preventing the app from running at all. This must be fixed first to restore basic functionality.

### Phase 2: Fix TypeScript Types
**Task 2.1**: Read current type definitions
- Read `src/features/builder/types/unlayer.d.ts`
- Read `src/features/builder/components/CustomPropertyPanel.tsx` line 289
- Understand current UnlayerRow interface structure

**Task 2.2**: Update UnlayerRow interface
- Add missing `columns` property to UnlayerRow interface
- Create UnlayerColumn interface with proper structure
- Ensure types match actual data structure from debugging

**Expected Data Structure**:
```typescript
interface UnlayerRow {
  id: string;
  cells: number[];
  columns: UnlayerColumn[];  // ← Add this
  values: Record<string, any>;
}

interface UnlayerColumn {
  id: string;
  contents: UnlayerContent[];
  values: Record<string, any>;
}
```

### Phase 3: Verification
**Task 3.1**: Verify fixes
- Ensure TypeScript compilation succeeds
- Verify no infinite loop errors
- Confirm CustomPropertyPanel can access row.columns
- Test app runs without crashes

## Success Criteria
- [ ] No infinite loop error in console
- [ ] TypeScript compilation passes
- [ ] CustomPropertyPanel.tsx can access `row.columns` without errors
- [ ] App runs and loads without crashes
- [ ] No broken imports or missing dependencies

## Risk Assessment
- **Low Risk**: Removing SelectionDebugger (debug-only component)
- **Low Risk**: Adding missing type properties (non-breaking change)
- **Minimal Impact**: Changes are isolated to specific files