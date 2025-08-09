# Custom ID Management Utilities

This directory contains standalone utilities for managing custom IDs in Unlayer designs. These utilities can be used independently of the Zustand store for validation, generation, and management of custom IDs.

## Overview

The `CustomIdManager` utility provides comprehensive validation and management capabilities for custom IDs in Unlayer content elements, following HTML ID standards and project-specific constraints.

## Usage Examples

### Basic Usage with Default Manager

```typescript
import { customIdManager, customIdUtils } from '@/features/builder/utils';

// Quick validation
const validation = customIdUtils.validateId('my-button');
if (!validation.isValid) {
  console.error(`Invalid ID: ${validation.error}`);
  console.log(`Suggestion: ${validation.suggestion}`);
}

// Generate a suggestion
const suggestion = customIdUtils.generateSuggestion('button');
console.log(suggestion); // "button-1"

// Check availability in a design
const isAvailable = customIdUtils.isIdAvailable('my-button', currentDesign);
```

### Custom Configuration

```typescript
import { createCustomIdManager } from '@/features/builder/utils';

const customManager = createCustomIdManager({
  maxLength: 50,
  minLength: 3,
  pattern: /^[a-z][a-z0-9-]*$/,
  reservedKeywords: ['button', 'input', 'form'],
  autoGeneratePrefix: 'elem'
});

const result = customManager.validateId('my-custom-id');
```

### Design-Specific Validation

```typescript
import { customIdManager } from '@/features/builder/utils';

// Validate against existing design
const designValidation = customIdManager.validateIdInDesign(
  'button-1', 
  currentDesign, 
  'exclude-content-123'
);

// Get all existing IDs
const existingIds = customIdManager.getAllCustomIds(currentDesign);

// Generate unique suggestion
const uniqueId = customIdManager.generateUniqueSuggestion('text', currentDesign);
```

### Integration with Components

```typescript
import { customIdUtils } from '@/features/builder/utils';

function CustomIdInput({ contentId, onValidId }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleValidation = (id: string) => {
    const validation = customIdUtils.validateId(id);
    
    if (!validation.isValid) {
      setError(`${validation.error}: ${validation.suggestion}`);
    } else {
      setError(null);
      onValidId(id);
    }
  };

  return (
    <div>
      <input 
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          handleValidation(e.target.value);
        }}
        placeholder={customIdUtils.generateSuggestion('element')}
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

## Features

### Validation Rules

- **Format**: Must start with a letter, followed by letters, numbers, hyphens, or underscores
- **Length**: Configurable minimum and maximum length (default: 1-100 characters)  
- **Reserved Keywords**: Checks against HTML/project reserved words
- **Duplicates**: Prevents duplicate IDs within the same design
- **Empty Values**: Rejects empty or whitespace-only IDs

### Configuration Options

- `maxLength`: Maximum allowed length (default: 100)
- `minLength`: Minimum required length (default: 1)
- `pattern`: Regular expression for valid format (default: HTML ID pattern)
- `reservedKeywords`: Array of forbidden keywords
- `autoGenerate`: Whether to auto-generate suggestions (default: true)
- `autoGeneratePrefix`: Prefix for auto-generated IDs (default: 'element')

### Error Types

- `EMPTY_ID`: ID is empty or whitespace-only
- `INVALID_FORMAT`: ID doesn't match the required pattern
- `DUPLICATE_ID`: ID already exists in the design
- `RESERVED_KEYWORD`: ID uses a reserved keyword
- `TOO_LONG`: ID exceeds maximum length
- `INVALID_CHARACTERS`: ID contains invalid characters

## Architecture

The utilities follow a layered approach:

1. **CustomIdManagerImpl**: Main class implementing the `CustomIdManager` interface
2. **customIdManager**: Default singleton instance with standard configuration  
3. **createCustomIdManager**: Factory function for custom configurations
4. **customIdUtils**: Utility functions for common operations without creating instances

This design allows for both simple usage (via utils) and advanced usage (via manager instances) while maintaining consistency with the existing store implementation.