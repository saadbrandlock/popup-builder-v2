# Custom ID Type Definitions Implementation Plan

## Overview
Extend the Unlayer type definitions to support custom IDs in component values, enabling better component identification and management within the popup builder.

## Current State Analysis
- `unlayer.d.ts` contains comprehensive type definitions for Unlayer API integration
- `UnlayerContent` interface currently has generic `values: Record<string, any>`
- No existing custom ID management utilities or validation types
- Type definitions follow consistent pattern with optional properties

## Implementation Tasks

### Task 1: Extend UnlayerContent Interface
**File**: `src/features/builder/types/unlayer.d.ts`
**Changes**:
- Extend `UnlayerContent.values` to include optional `customId?: string`
- Maintain backward compatibility by keeping all new fields optional
- Follow existing code patterns and TypeScript conventions

### Task 2: Add CustomIdManager Interface
**Purpose**: Provide utility methods for custom ID management
**Methods to include**:
- `generateId(prefix?: string): string` - Generate unique IDs
- `validateId(id: string): CustomIdValidationResult` - Validate ID format and uniqueness  
- `suggestId(baseName: string): string` - Suggest available ID based on base name
- `isIdUnique(id: string, design: UnlayerDesign): boolean` - Check ID uniqueness in design
- `getAllCustomIds(design: UnlayerDesign): string[]` - Extract all custom IDs from design

### Task 3: Add Validation Types
**Types to add**:
- `CustomIdValidationResult` - Result of ID validation with success/error details
- `CustomIdError` - Error types for validation failures
- `CustomIdConfig` - Configuration options for ID management

### Task 4: Extend Design Management Types
**Extensions**:
- Add utility types for working with custom IDs in design structure
- Type-safe helpers for traversing design hierarchy to find/update custom IDs

## Implementation Details

### Type Safety Considerations
- All new properties should be optional to maintain backward compatibility
- Use union types for validation results to ensure type safety
- Provide generic types where appropriate for flexibility

### Integration Points
- Custom IDs will be stored in component `values` object
- ID validation should work with existing `UnlayerDesign` structure
- Manager interface should be implementation-agnostic (can be implemented by different classes)

### Code Patterns to Follow
- Use existing interface naming conventions (`Unlayer*` prefix)
- Follow optional property patterns from existing interfaces
- Use `Record<string, any>` pattern for extensible value objects
- Maintain consistent JSDoc comments

## Deliverables
1. Extended `UnlayerContent` interface with custom ID support
2. `CustomIdManager` interface with validation and utility methods
3. Supporting validation and error types
4. Comprehensive type definitions for custom ID functionality
5. Maintained backward compatibility with existing code

## Success Criteria
- All existing code continues to work without changes
- New custom ID functionality is fully typed
- Type definitions provide IntelliSense and compile-time validation
- Integration points are clearly defined and type-safe

## Next Steps After Implementation
This phase focuses only on type definitions. Subsequent phases will:
- Implement the CustomIdManager utility class
- Add custom ID management to Unlayer store
- Integrate custom ID functionality into builder components
- Add validation and UI components for custom ID management