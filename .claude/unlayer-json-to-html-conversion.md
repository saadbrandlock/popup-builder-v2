# Unlayer JSON to HTML Conversion Research

## Overview

This document provides comprehensive information about Unlayer's JSON to HTML conversion capabilities, including methods, APIs, best practices, and implementation examples for converting design JSON to HTML both client-side and server-side.

## 1. Client-Side JSON to HTML Conversion

### Primary Method: `exportHtml()`

Unlayer provides the `exportHtml()` method as the primary way to convert design JSON to HTML on the client-side.

#### Basic Usage
```javascript
unlayer.exportHtml(function(data) {
    var json = data.design;  // Design JSON structure
    var html = data.html;    // Final HTML output
    var chunks = data.chunks; // Separate HTML components (body, CSS, JS, fonts)
    
    // Use the HTML for display or save both JSON and HTML
});
```

#### Advanced Options
```javascript
unlayer.exportHtml(
    function(data) {
        // Handle export data
        console.log('Design JSON:', data.design);
        console.log('Final HTML:', data.html);
    },
    {
        minify: true,           // Compress HTML (reduces file size up to 25%)
        cleanup: true,          // Remove unused CSS classes/styles (default: true)
        inlineStyles: false,    // Inline global CSS for links (useful for email)
        mergeTags: {           // Replace dynamic content placeholders
            first_name: 'John',
            last_name: 'Doe',
            company: 'Acme Corp'
        }
    }
);
```

### Return Data Structure
The callback receives an object with:
- `design`: Complete JSON representation of the design
- `html`: Final HTML document ready for use
- `chunks`: Separated components (body HTML, CSS, JavaScript, fonts)

## 2. Server-Side JSON to HTML Conversion

### Unlayer Cloud API

For server-side conversion, Unlayer provides a Cloud API that allows JSON to HTML conversion without client-side processing.

#### API Endpoint
```
POST https://api.unlayer.com/v2/export/html
```

#### Authentication
- Uses Basic Authentication
- Username: Your Project API Key
- Password: Empty string
- All requests must use HTTPS

#### Request Format
```bash
curl -u YOUR_API_KEY: \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"design": {...}}' \
  https://api.unlayer.com/v2/export/html
```

#### Supported Languages
The Cloud API can be implemented in any backend language:
- **Node.js**: Recommended for real-time applications with non-blocking I/O
- **PHP**: Suitable for less complex projects and startups
- **Python**: Full support for server-side conversion
- **Other languages**: Any language that supports HTTP requests

### Server-Side Benefits
- **Performance**: Offload HTML generation from client
- **Security**: Keep design data on server
- **Batch Processing**: Convert multiple designs efficiently
- **Caching**: Store generated HTML for faster delivery

## 3. JSON Design Structure

### Loading Designs
```javascript
// Load a saved design into the editor
unlayer.loadDesign(designJSON);

// Example with template
unlayer.loadDesign({
    "body": {
        "rows": [...],
        "values": {...}
    },
    "counters": {...}
});
```

### Saving Designs
```javascript
// Auto-save on design changes
unlayer.addEventListener('design:updated', function(updates) {
    // Save design JSON to database
    saveDesignToDatabase(updates.design);
});

// Manual save
unlayer.exportHtml(function(data) {
    // Save both JSON for editing and HTML for display
    saveToDatabase({
        design_json: data.design,
        final_html: data.html
    });
});
```

## 4. Production Workflow Best Practices

### Recommended Architecture

1. **During Editing Phase**:
   - Store only JSON in database
   - Use `loadDesign()` to reload for editing
   - Implement auto-save with `design:updated` event

2. **During Publishing Phase**:
   - Convert JSON to HTML using `exportHtml()` or Cloud API
   - Store both JSON (for future edits) and HTML (for performance)
   - Apply optimizations (minify, cleanup, inline styles)

### Storage Strategy
```javascript
// Editing workflow
const saveDesign = (designData) => {
    database.save({
        id: templateId,
        design_json: designData.design,
        status: 'draft',
        updated_at: new Date()
    });
};

// Publishing workflow
const publishDesign = (templateId) => {
    unlayer.exportHtml(function(data) {
        database.update(templateId, {
            design_json: data.design,
            published_html: data.html,
            status: 'published',
            published_at: new Date()
        });
    }, {
        minify: true,
        cleanup: true
    });
};
```

### Performance Optimizations

1. **HTML Minification**: Reduces file size by up to 25%
2. **CSS Cleanup**: Removes unused styles automatically
3. **Inline Styles**: For email compatibility (Gmail, Outlook)
4. **Merge Tags**: Dynamic content replacement
5. **Caching**: Store generated HTML for faster delivery

## 5. Error Handling and Edge Cases

### Client-Side Error Handling
```javascript
unlayer.exportHtml(function(data) {
    try {
        if (!data.html) {
            throw new Error('HTML generation failed');
        }
        
        // Process successful export
        handleSuccessfulExport(data);
        
    } catch (error) {
        console.error('Export failed:', error);
        showUserError('Failed to generate HTML');
    }
});
```

### Server-Side Error Handling
```javascript
// Node.js example
const convertToHTML = async (designJSON) => {
    try {
        const response = await axios.post('https://api.unlayer.com/v2/export/html', 
            { design: designJSON },
            {
                auth: {
                    username: process.env.UNLAYER_API_KEY,
                    password: ''
                }
            }
        );
        
        return response.data.html;
        
    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error('Invalid API key');
        } else if (error.response?.status === 400) {
            throw new Error('Invalid design JSON format');
        }
        throw error;
    }
};
```

## 6. Integration Examples

### React Component Integration
```jsx
import { useRef } from 'react';
import EmailEditor from 'react-email-editor';

const EmailBuilder = () => {
    const emailEditorRef = useRef(null);
    
    const saveDesign = () => {
        emailEditorRef.current.editor.exportHtml((data) => {
            // Save to backend
            fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    design: data.design,
                    html: data.html
                })
            });
        });
    };
    
    const loadDesign = (designJSON) => {
        emailEditorRef.current.editor.loadDesign(designJSON);
    };
    
    return (
        <EmailEditor
            ref={emailEditorRef}
            onLoad={() => console.log('Editor loaded')}
            onReady={() => console.log('Editor ready')}
        />
    );
};
```

### Vue.js Integration
```vue
<template>
    <email-editor ref="emailEditor" />
</template>

<script>
import EmailEditor from 'vue-email-editor';

export default {
    components: { EmailEditor },
    methods: {
        saveDesign() {
            this.$refs.emailEditor.editor.exportHtml((data) => {
                // Handle save
                this.saveToBackend(data);
            });
        },
        
        loadDesign(designJSON) {
            this.$refs.emailEditor.editor.loadDesign(designJSON);
        }
    }
};
</script>
```

## 7. Migration and Legacy Support

### HTML to JSON Conversion
- Standard Unlayer editor only accepts JSON format
- For existing HTML templates, use Unlayer Classic (Legacy) editor
- No direct HTML-to-JSON conversion in current API

### Template Migration Strategy
1. Use Classic editor to import existing HTML
2. Export as JSON from Classic editor
3. Use JSON in standard Unlayer editor
4. Gradually migrate templates to native JSON format

## 8. Current Limitations (2025)

1. **HTML Import**: Standard editor doesn't accept raw HTML input
2. **Document Structure**: Full HTML documents (with `<html>`, `<body>` tags) not supported since v1.249.0
3. **Custom Blocks**: Requires additional configuration for complex custom elements
4. **Real-time Collaboration**: Limited support for simultaneous editing

## 9. Security Considerations

### API Key Management
- Store API keys securely in environment variables
- Use different keys for development/production
- Rotate keys regularly
- Never expose keys in client-side code

### Input Validation
```javascript
const validateDesignJSON = (design) => {
    if (!design || typeof design !== 'object') {
        throw new Error('Invalid design format');
    }
    
    if (!design.body || !design.body.rows) {
        throw new Error('Design missing required structure');
    }
    
    return true;
};
```

## 10. Future Considerations

### Upcoming Features (Based on 2025 Trends)
- Enhanced real-time collaboration
- Improved custom block system
- Better mobile editing experience
- Advanced template versioning
- Enhanced API rate limiting

### Recommended Architecture Evolution
- Implement proper caching layers
- Consider CDN for HTML delivery
- Plan for horizontal scaling
- Implement proper monitoring and analytics

## Conclusion

Unlayer provides robust JSON to HTML conversion capabilities both client-side and server-side. The recommended approach is to store JSON during editing phases and convert to HTML only during publishing, with proper error handling, optimization, and security measures in place.

For production applications, consider using the Cloud API for server-side conversion to improve performance and security, while maintaining the flexibility to edit designs using the JSON format.