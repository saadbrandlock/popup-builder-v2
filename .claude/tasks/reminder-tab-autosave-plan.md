# Reminder Tab Autosave Implementation Plan

## Overview
Implement autosave functionality for reminder tab configuration that stores data in the `reminder_tab_state_json` field of the template, similar to how Unlayer autosave works with `builder_state_json`.

## Current Understanding

### API Structure
- **Upsert Endpoint**: `/staging-template/${templateId}` (PUT)
- **Field for Admin**: `reminder_tab_state_json: Record<string, any>`
- **Template Fetch**: `/admin/templates/${templateId}` returns the current `reminder_tab_state_json`

### Existing Autosave Pattern
- `useAutosave` hook handles Unlayer editor autosave
- Saves to `builder_state_json` field via `api.templates.upsertTemplate()`
- Uses intervals and tracks unsaved changes
- Has manual save and auto-save capabilities

## Implementation Strategy

### 1. Create Reminder Tab Autosave Hook
Create `useReminderTabAutosave` hook that:
- Tracks reminder tab config changes in store
- Debounces API calls to avoid excessive requests
- Saves to `reminder_tab_state_json` field
- Provides manual save functionality
- Shows save status (saving, saved, error)

### 2. Store Integration
Extend the builder store to:
- Track unsaved reminder tab changes
- Mark when reminder tab config is dirty
- Store last auto-save timestamp
- Handle save states (saving, error, success)

### 3. Component Integration
Update components to:
- Trigger autosave on config changes
- Show save status in UI
- Load existing config from template on mount
- Handle manual save actions

### 4. Template Loading
When template loads:
- Fetch `reminder_tab_state_json` from template
- Merge with default config if field exists
- Initialize reminder tab store with fetched config

## Technical Implementation

### Files to Create/Modify

1. **New Hook**: `src/features/builder/hooks/useReminderTabAutosave.ts`
2. **Store Update**: `src/stores/builder.store.ts` (add autosave state)
3. **Component Updates**: 
   - `ReminderTabStep.tsx` (integrate autosave)
   - `ReminderTabEditor.tsx` (show save status)
4. **Builder Main Update**: Load existing config on template fetch

### Hook Structure
```typescript
interface UseReminderTabAutosaveOptions {
  enabled?: boolean;
  interval?: number; // default 10 seconds
  debounceDelay?: number; // default 2 seconds
  apiClient?: AxiosInstance;
  templateId?: string;
}

interface UseReminderTabAutosaveReturn {
  isSaving: boolean;
  lastSave: Date | null;
  hasUnsavedChanges: boolean;
  saveError: string | null;
  performManualSave: () => Promise<void>;
  triggerAutoSave: () => void;
}
```

### Store Extensions
```typescript
type BuilderState = {
  // existing fields...
  reminderTabUnsavedChanges: boolean;
  reminderTabLastSave: Date | null;
  reminderTabSaving: boolean;
  reminderTabSaveError: string | null;
}

type BuilderActions = {
  // existing actions...
  markReminderTabUnsaved: (unsaved: boolean) => void;
  setReminderTabSaving: (saving: boolean) => void;
  setReminderTabLastSave: (date: Date) => void;
  setReminderTabSaveError: (error: string | null) => void;
}
```

## Implementation Steps

### Phase 1: Core Autosave Hook
1. Create `useReminderTabAutosave` hook
2. Implement debounced save logic
3. Handle API integration with staging template endpoint
4. Add error handling and retry logic

### Phase 2: Store Integration
1. Extend builder store with autosave state
2. Add actions for managing save states
3. Update config change tracking

### Phase 3: Component Integration
1. Integrate autosave hook in ReminderTabStep
2. Add save status indicators to UI
3. Implement manual save functionality
4. Add unsaved changes warnings

### Phase 4: Template Loading
1. Update BuilderMain to load reminder tab config
2. Handle merging of existing config with defaults
3. Initialize store with fetched data

### Phase 5: Testing & Polish
1. Test autosave functionality
2. Test manual save
3. Test config loading from templates
4. Add proper error handling and user feedback

## API Integration Details

### Save Operation
```typescript
// Save reminder tab config
await api.templates.upsertTemplate(templateId, {
  reminder_tab_state_json: config
});
```

### Load Operation
```typescript
// Load template with reminder tab config
const template = await api.templates.getTemplateById(templateId);
const reminderConfig = template.reminder_tab_state_json || DEFAULT_REMINDER_TAB_CONFIG;
```

## User Experience

### Save Indicators
- Show "Saving..." when auto-save is in progress
- Show "Saved" with timestamp when successful
- Show error message if save fails
- Warn user about unsaved changes before navigation

### Manual Save
- Save button in quick actions panel
- Keyboard shortcut (Ctrl+S)
- Save on step navigation

## Benefits
✅ Automatic data persistence
✅ No data loss on browser crashes/refreshes
✅ Consistent with existing autosave patterns
✅ Real-time collaboration ready
✅ Proper error handling and recovery