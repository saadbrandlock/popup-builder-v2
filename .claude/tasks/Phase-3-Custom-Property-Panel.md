# Phase 3: Custom Property Panel Implementation Plan

## Overview
Create a custom property panel overlay component using Ant Design v5 components that allows users to input and manage custom IDs for Unlayer components with real-time validation and auto-save functionality.

## Technical Requirements

### 1. Component Structure
- **File**: `src/features/builder/components/CustomPropertyPanel.tsx`
- **Framework**: React with TypeScript
- **UI Library**: Ant Design v5 (already installed: ^5.15.0)
- **State Management**: Zustand store integration via `useUnlayerStore`
- **Validation**: Custom ID Manager utility integration

### 2. Core Features

#### 2.1 Component Selection Detection
- Listen for Unlayer selection events
- Track currently selected component
- Show/hide panel based on selection state
- Handle multiple selection scenarios

#### 2.2 Custom ID Input & Validation
- Real-time validation using `customIdManager`
- Visual feedback for validation states (success, error, warning)
- Auto-suggestions based on component type
- Prevention of duplicate IDs across the design

#### 2.3 Auto-save Functionality
- Save changes automatically when valid ID is entered
- Debounced input to prevent excessive updates
- Integration with Unlayer store actions
- Visual feedback for save states

#### 2.4 User Experience Enhancements
- Contextual help tooltips
- Clear error messages with actionable suggestions
- Responsive design for different screen sizes
- Smooth animations and transitions

### 3. Ant Design v5 Components Usage

#### 3.1 Primary Components
- `Form` & `Form.Item` - Form handling and validation
- `Input` - Custom ID input field with status feedback
- `Card` - Main container with header and body
- `Space` - Layout spacing and alignment
- `Alert` - Validation error/success messages
- `Tooltip` - Help text and guidance
- `Button` - Action buttons (optional manual save)
- `Typography.Text` - Labels and descriptions

#### 3.2 Design System Integration
- Use Ant Design's design tokens and theme
- Consistent spacing and typography
- Proper color usage for status indicators
- Responsive behavior following Ant Design patterns

### 4. Integration Points

#### 4.1 Store Integration
```typescript
// Hooks to use
- useUnlayerStore() // Main store access
- useUnlayerActions() // Action methods
- useUnlayerDesign() // Current design selector
```

#### 4.2 Validation Integration
```typescript
// customIdManager methods to use
- validateIdInDesign() // Full validation with design context
- generateUniqueSuggestion() // Generate suggestions
- getContentCustomId() // Get current custom ID
```

#### 4.3 Unlayer Events Integration
- Listen for `design:updated` events
- Handle component selection changes
- Track design modifications

### 5. Component Architecture

#### 5.1 State Management
```typescript
interface CustomPropertyPanelState {
  selectedContentId: string | null;
  currentCustomId: string;
  inputValue: string;
  validationState: CustomIdValidationResult | null;
  isLoading: boolean;
  showSuggestions: boolean;
}
```

#### 5.2 Event Handlers
- `handleInputChange` - Input change with debouncing
- `handleSave` - Manual save action
- `handleSuggestionSelect` - Apply suggested ID
- `handleSelectionChange` - Component selection events

#### 5.3 Validation Logic
- Real-time validation on input change
- Context-aware duplicate checking
- Format validation (HTML ID rules)
- Reserved keyword checking

### 6. Implementation Steps

#### Step 1: Basic Component Structure
- Create component file with TypeScript interfaces
- Set up Ant Design Form with basic layout
- Implement store integration hooks
- Add basic input field with validation

#### Step 2: Validation Integration
- Integrate customIdManager for validation
- Implement real-time validation feedback
- Add error states and success indicators
- Create suggestion generation logic

#### Step 3: Unlayer Integration
- Add event listeners for component selection
- Implement auto-save functionality
- Handle design update events
- Add loading states for async operations

#### Step 4: User Experience Enhancements
- Add tooltips and help text
- Implement suggestion dropdown
- Add smooth transitions and animations
- Optimize for responsive design

#### Step 5: Testing & Polish
- Test with various component types
- Validate edge cases (duplicates, format errors)
- Ensure proper cleanup of event listeners
- Performance optimization

### 7. Success Criteria

#### 7.1 Functional Requirements
- ✅ Show panel when component is selected in Unlayer
- ✅ Display current custom ID if exists
- ✅ Real-time validation with visual feedback
- ✅ Auto-save valid changes to store
- ✅ Generate intelligent suggestions
- ✅ Handle all validation error types

#### 7.2 UI/UX Requirements
- ✅ Consistent with Ant Design v5 design system
- ✅ Responsive design for different screen sizes
- ✅ Clear error messages with actionable suggestions
- ✅ Smooth user interactions and feedback
- ✅ Accessibility compliance (ARIA attributes)

#### 7.3 Technical Requirements
- ✅ TypeScript compliance with proper typing
- ✅ Integration with existing Zustand store
- ✅ Proper cleanup of resources and listeners
- ✅ Performance optimization (debouncing, memoization)
- ✅ Error boundary handling

### 8. File Organization

```
src/features/builder/components/
├── CustomPropertyPanel.tsx          # Main component
├── index.ts                        # Export updates
```

### 9. Dependencies Required
- All dependencies already available in package.json:
  - `antd: ^5.15.0` - UI components
  - `react: ^18.0.0` - React framework
  - `zustand: ^4.5.2` - State management
  - `typescript: ^5.2.2` - Type safety

### 10. Considerations

#### 10.1 Performance
- Debounce input changes to prevent excessive validation
- Memoize validation results when possible
- Optimize re-renders with proper dependency arrays

#### 10.2 Accessibility
- Proper ARIA labels for form fields
- Keyboard navigation support
- Screen reader compatibility
- Focus management

#### 10.3 Error Handling
- Graceful handling of validation failures
- Network error handling for save operations
- Fallback states for missing data

### 11. Next Steps After Implementation
1. Integration testing with existing builder components
2. User acceptance testing with design scenarios
3. Performance monitoring and optimization
4. Documentation updates
5. Potential future enhancements (bulk editing, import/export)

## Implementation Priority
**High Priority** - Critical feature for custom ID management in the builder interface.

## Estimated Effort
**Medium** - Well-defined requirements with existing infrastructure support.