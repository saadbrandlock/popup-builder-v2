# Custom Property Panel Implementation Plan

## Task Overview
Create a CustomPropertyPanel component that works alongside Unlayer's existing property panel using a two-panel approach. This panel will focus specifically on custom ID management for selected components.

## Technical Context

### Existing Architecture Analysis
- **Unlayer Store**: Already has comprehensive custom ID management with `useUnlayerStore`
- **Custom ID Manager**: Robust validation and utility system in `customIdManager.ts`
- **Debounce Hook**: Available `useDebouncedCallback` for auto-save implementation
- **Ant Design**: v5 components available with Tailwind CSS (preflight disabled)

### Store Integration Points
- `useUnlayerStore` - Main state management
- `actions.setContentCustomId()` - Update custom IDs
- `actions.validateCustomId()` - Real-time validation  
- `actions.generateCustomIdSuggestion()` - Auto-suggestions
- Component selection state needs to be tracked/listened to

## Implementation Plan

### Phase 1: Core Component Structure
**Task 1**: Create base CustomPropertyPanel component
- Ant Design Card as main container
- Conditional rendering based on component selection
- TypeScript interfaces for props and state
- Integration with useUnlayerStore

### Phase 2: Component Selection Detection  
**Task 2**: Implement selection state management
- Listen for Unlayer component selection events
- Track selected element ID and type
- Show/hide panel based on selection state
- Display current custom ID when available

### Phase 3: Custom ID Input & Validation
**Task 3**: Build custom ID management UI
- Ant Form with Input component
- Real-time validation with visual feedback
- Error/success states with appropriate colors
- Display validation messages and suggestions

### Phase 4: Auto-Save & Suggestions
**Task 4**: Add advanced functionality
- Debounced auto-save (300ms delay)
- Component type-based suggestions (button-1, countdown-timer, etc.)
- Integration with customIdManager for validation
- Save status indicators

### Phase 5: UI Polish & Accessibility
**Task 5-8**: Final refinements
- Compact design to complement Unlayer panel
- Responsive layout for builder interface
- Accessibility features (ARIA labels, keyboard nav)
- Error handling and edge cases

## Component Requirements

### Props Interface
```typescript
interface CustomPropertyPanelProps {
  className?: string;
  style?: React.CSSProperties;
  position?: 'fixed' | 'absolute' | 'relative';
}
```

### State Requirements
- Selected component ID and type
- Current custom ID value
- Validation state (loading, error, success)
- Auto-save status

### Key Features
1. **Two-Panel Approach**: Separate from Unlayer's property panel
2. **Smart Positioning**: Positioned to complement existing layout
3. **Real-Time Validation**: Immediate feedback on input changes
4. **Auto-Save**: Debounced saving with visual indicators
5. **Type-Based Suggestions**: Context-aware ID recommendations
6. **Accessibility**: Full keyboard navigation and screen reader support

## Integration Strategy

### Store Connection
- Use `useUnlayerStore` for all state operations
- Connect to existing custom ID management actions
- Leverage `customIdManager` for validation logic

### Event Handling
- Listen for Unlayer editor selection events
- Handle input changes with debounced validation
- Manage auto-save with success/error feedback

### Styling Approach
- Ant Design components with custom Tailwind utilities
- Compact Card design with minimal footprint
- Consistent with existing builder UI patterns

## Technical Considerations

### Performance
- Debounced input handling to prevent excessive API calls
- Efficient re-rendering with proper React patterns
- Minimal bundle impact with selective Ant Design imports

### Error Handling
- Graceful degradation when Unlayer not ready
- Validation error display with helpful messages
- Auto-recovery from temporary failures

### TypeScript
- Full type safety with existing interfaces
- Proper event handler typing
- Store integration with correct selectors

## Success Criteria ✅
1. ✅ Panel appears/disappears based on component selection
2. ✅ Real-time validation with visual feedback
3. ✅ Auto-save functionality working smoothly
4. ✅ Type-based suggestions generating correctly
5. ✅ Compact UI that doesn't interfere with existing panels
6. ✅ Full accessibility compliance
7. ✅ Zero breaking changes to existing functionality

## Implementation Completed

### Files Created/Modified
```
src/features/builder/components/
├── CustomPropertyPanel.tsx (NEW) - Main component implementation
└── index.ts (UPDATED) - Added component exports
```

### Key Features Implemented

#### ✅ Two-Panel Approach
- Separate panel that works alongside Unlayer's property panel
- Conditional rendering based on component selection
- Compact Card design with minimal footprint

#### ✅ Component Selection Detection
- Tracks selected element ID, type, and current custom ID
- Shows/hides panel based on selection state
- Displays component type context

#### ✅ Real-Time Validation
- Immediate feedback on input changes
- Visual status indicators (success, error, validating)
- Integration with existing customIdManager validation

#### ✅ Auto-Save Functionality
- 300ms debounced saving to prevent excessive operations
- Visual indicators for save status
- Error handling with retry capability

#### ✅ Type-Based Suggestions
- Context-aware suggestions based on component type:
  - button → 'cta-button', 'submit-btn', 'close-btn'
  - text → 'headline', 'description', 'subtitle'
  - image → 'hero-image', 'logo', 'product-image'
  - countdown → 'countdown-timer', 'sale-timer'
- Clickable suggestions for easy selection
- Numbered fallbacks (button-1, button-2, etc.)

#### ✅ Ant Design Integration
- Card component for clean container
- Form and Input with status indicators
- Alert components for validation messages
- Typography components for consistent styling
- Icons for visual feedback (CheckCircle, ExclamationCircle, etc.)

#### ✅ TypeScript Implementation
- Full type safety with custom interfaces
- Integration with existing Unlayer type definitions
- Proper event handler typing

#### ✅ Store Integration
- Connected to useUnlayerStore for state management
- Uses existing custom ID management actions
- Proper error handling and state updates

### Component Usage

```typescript
import { CustomPropertyPanel } from '../features/builder/components';

// Basic usage
<CustomPropertyPanel />

// With custom positioning
<CustomPropertyPanel 
  position="fixed" 
  style={{ top: 20, right: 20 }}
/>
```

### Technical Implementation Notes

#### State Management
- Uses local state for UI concerns (validation, input value)
- Connects to Zustand store for persistent data
- Proper separation of concerns

#### Performance Optimizations
- Debounced auto-save prevents excessive operations
- Memoized validation function to prevent re-computation
- Efficient re-rendering with proper React patterns

#### Accessibility Features
- ARIA labels and tooltips for screen readers
- Keyboard navigation support
- Clear visual feedback for all states

This implementation enhances the builder experience by providing focused custom ID management without disrupting the existing Unlayer workflow.