# Unlayer Custom Solutions for Free Version

This document provides comprehensive solutions for implementing custom image upload, auto-save functionality, and JSON to HTML conversion with Unlayer in the free version.

## 1. Custom Image Upload Implementation

### Problem
By default, Unlayer uploads images to their S3 storage (`https://unroll-images-production.s3.amazonaws.com`). For full control in the free version, you need to override this behavior to use your own backend API.

### Solution: registerCallback for Image Upload

```typescript
// React/TypeScript implementation
import React, { useRef, useEffect } from 'react';
import EmailEditor, { EditorRef } from 'react-email-editor';

interface CustomImageUploadProps {
  projectId: number;
  uploadEndpoint: string;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: Error) => void;
}

const CustomImageUploadEditor: React.FC<CustomImageUploadProps> = ({
  projectId,
  uploadEndpoint,
  onUploadSuccess,
  onUploadError
}) => {
  const emailEditorRef = useRef<EditorRef>(null);

  const setupCustomImageUpload = (unlayer: any) => {
    // Method 1: Custom File Upload Handler
    unlayer.registerCallback('image', async (file: any, done: any) => {
      try {
        const formData = new FormData();
        formData.append('file', file.attachments[0]);
        formData.append('type', 'image');
        formData.append('folder', 'unlayer-images');

        // Show progress
        done({ progress: 10 });

        const response = await fetch(uploadEndpoint, {
          method: 'POST',
          headers: {
            // Add your auth headers here
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: formData,
        });

        done({ progress: 50 });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Complete the upload
        done({ 
          progress: 100, 
          url: result.fileUrl || result.url || result.data?.url 
        });

        onUploadSuccess?.(result.fileUrl);
      } catch (error) {
        console.error('Image upload failed:', error);
        onUploadError?.(error as Error);
        
        // Signal error to Unlayer
        done({ 
          progress: 0, 
          error: 'Upload failed. Please try again.' 
        });
      }
    });

    // Method 2: Custom Image Selection (Alternative approach)
    unlayer.registerCallback('selectImage', (data: any, done: any) => {
      // Open your custom image gallery/picker
      openCustomImagePicker((selectedImageUrl: string) => {
        done({ url: selectedImageUrl });
      });
    });
  };

  const openCustomImagePicker = (callback: (url: string) => void) => {
    // Implementation for custom image picker modal
    // This could open a modal with your existing images
    // or integrate with your asset management system
  };

  const onReady = (unlayer: any) => {
    setupCustomImageUpload(unlayer);
  };

  return (
    <EmailEditor
      ref={emailEditorRef}
      projectId={projectId}
      onReady={onReady}
      options={{
        version: 'latest', // Use latest version for best compatibility
      }}
    />
  );
};
```

### Backend API Integration

Your backend endpoint should handle:

```javascript
// Express.js example
app.post('/api/upload-image', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    
    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files allowed' });
    }

    // Upload to your storage (S3, Cloudinary, local, etc.)
    const fileUrl = await uploadToYourStorage(file);
    
    // Save to database if needed
    await saveImageRecord({
      url: fileUrl,
      filename: file.originalname,
      size: file.size,
      userId: req.user.id
    });

    res.json({ 
      fileUrl: fileUrl,
      success: true 
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});
```

### Important Considerations

1. **CORS Issue Workaround**: Unlayer may still make API calls to `https://api.tools.unlayer.com/v1/image` for CORS proxy. To prevent this:

```typescript
const editorOptions = {
  version: 'latest',
  env: {
    API_V1_BASE_URL: "http://127.0.0.1", // Redirect to localhost to prevent calls
  }
};
```

2. **File Size Limits**: Implement appropriate file size validation in your backend.

3. **Image Optimization**: Consider implementing image compression/optimization before storage.

## 2. Auto-Save Implementation with Custom API

### Problem
Need to automatically save template designs to your database via your `updateTemplate` API in TemplatesAPI.

### Solution: Event-Driven Auto-Save

```typescript
import { useUnlayerStore } from '@/stores/unlayerStore';
import { TemplatesAPI } from '@/api/services/TemplatesAPI';

interface AutoSaveConfig {
  templateId: string;
  debounceMs?: number;
  periodicMs?: number;
  onSaveSuccess?: (data: any) => void;
  onSaveError?: (error: Error) => void;
}

const useUnlayerAutoSave = (unlayer: any, config: AutoSaveConfig) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const templatesAPI = new TemplatesAPI();

  // Debounced save function
  const debouncedSave = useMemo(
    () => debounce(async (designData: any) => {
      if (saveStatus === 'saving') return;
      
      setSaveStatus('saving');
      
      try {
        // Save only JSON during editing (not HTML)
        await templatesAPI.updateTemplate(config.templateId, {
          builder_state_json: designData.design,
          // Don't save HTML during auto-save for performance
          updated_at: new Date().toISOString()
        });
        
        setSaveStatus('saved');
        setLastSaved(new Date());
        config.onSaveSuccess?.(designData);
        
        // Clear saved status after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (error) {
        setSaveStatus('error');
        config.onSaveError?.(error as Error);
        console.error('Auto-save failed:', error);
      }
    }, config.debounceMs || 2000),
    [config.templateId, saveStatus, templatesAPI]
  );

  // Event-driven auto-save
  useEffect(() => {
    if (!unlayer) return;

    const handleDesignUpdate = (data: any) => {
      // Export design for auto-save
      unlayer.exportHtml((exportData: any) => {
        debouncedSave({
          design: exportData.design,
          // Skip HTML export for auto-save performance
          trigger: 'user_action',
          timestamp: new Date().toISOString()
        });
      });
    };

    unlayer.addEventListener('design:updated', handleDesignUpdate);
    
    return () => {
      unlayer.removeEventListener('design:updated', handleDesignUpdate);
    };
  }, [unlayer, debouncedSave]);

  // Periodic backup save (every 30 seconds)
  useEffect(() => {
    if (!unlayer) return;

    const interval = setInterval(() => {
      unlayer.exportHtml((data: any) => {
        debouncedSave({
          design: data.design,
          trigger: 'periodic_backup'
        });
      });
    }, config.periodicMs || 30000);

    return () => clearInterval(interval);
  }, [unlayer, debouncedSave]);

  return {
    saveStatus,
    lastSaved,
    forceSave: () => {
      if (unlayer) {
        unlayer.exportHtml((data: any) => {
          debouncedSave({ design: data.design, trigger: 'manual' });
        });
      }
    }
  };
};
```

### Integration with UnlayerMain Component

```typescript
const UnlayerMainWithAutoSave: React.FC<{
  templateId: string;
  projectId: number;
}> = ({ templateId, projectId }) => {
  const emailEditorRef = useRef<EditorRef>(null);
  const [unlayerInstance, setUnlayerInstance] = useState<any>(null);

  // Auto-save hook
  const { saveStatus, lastSaved, forceSave } = useUnlayerAutoSave(unlayerInstance, {
    templateId,
    onSaveSuccess: (data) => {
      console.log('Auto-save successful:', data);
    },
    onSaveError: (error) => {
      console.error('Auto-save failed:', error);
    }
  });

  const onReady = (unlayer: any) => {
    setUnlayerInstance(unlayer);
    setupCustomImageUpload(unlayer);
  };

  return (
    <div>
      {/* Auto-save status indicator */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2 py-1 rounded text-sm ${
          saveStatus === 'saving' ? 'bg-yellow-100 text-yellow-800' :
          saveStatus === 'saved' ? 'bg-green-100 text-green-800' :
          saveStatus === 'error' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && 'Saved'}
          {saveStatus === 'error' && 'Save failed'}
          {saveStatus === 'idle' && 'Ready'}
        </span>
        
        {lastSaved && (
          <span className="text-sm text-gray-500">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        )}
        
        <button 
          onClick={forceSave}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          disabled={saveStatus === 'saving'}
        >
          Save Now
        </button>
      </div>

      <EmailEditor
        ref={emailEditorRef}
        projectId={projectId}
        onReady={onReady}
        options={{ version: 'latest' }}
      />
    </div>
  );
};
```

## 3. JSON to HTML Conversion

### Problem
Need to convert saved JSON designs to HTML only when publishing (not during auto-save for performance).

### Solution: Separate JSON Storage and HTML Generation

```typescript
interface PublishTemplateData {
  templateId: string;
  publishSettings?: {
    minify?: boolean;
    cleanup?: boolean;
    inlineStyles?: boolean;
  };
}

const useTemplatePublishing = () => {
  const templatesAPI = new TemplatesAPI();

  const publishTemplate = async (data: PublishTemplateData) => {
    try {
      // 1. Get current template with JSON design
      const template = await templatesAPI.getTemplate(data.templateId);
      
      if (!template.builder_state_json) {
        throw new Error('No design data found for template');
      }

      // 2. Convert JSON to HTML using Unlayer
      const html = await convertDesignToHtml(
        template.builder_state_json, 
        data.publishSettings
      );

      // 3. Update template with both JSON and HTML
      await templatesAPI.updateTemplate(data.templateId, {
        builder_state_json: template.builder_state_json, // Keep JSON for editing
        html_content: html, // Add HTML for production use
        published_at: new Date().toISOString(),
        status: 'published'
      });

      return { success: true, html };
    } catch (error) {
      console.error('Publishing failed:', error);
      throw error;
    }
  };

  return { publishTemplate };
};

// Helper function to convert JSON to HTML
const convertDesignToHtml = async (
  designJson: any, 
  options: { minify?: boolean; cleanup?: boolean; inlineStyles?: boolean } = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create temporary Unlayer instance for conversion
    const tempContainer = document.createElement('div');
    tempContainer.style.display = 'none';
    document.body.appendChild(tempContainer);

    // Initialize Unlayer for conversion
    window.unlayer.init({
      id: 'temp-converter',
      displayMode: 'email',
      appearance: {
        theme: 'light'
      }
    });

    const unlayer = window.unlayer;

    unlayer.addEventListener('design:loaded', () => {
      // Export HTML with options
      unlayer.exportHtml((data: any) => {
        document.body.removeChild(tempContainer);
        
        let html = data.html;
        
        // Apply post-processing options
        if (options.minify) {
          html = minifyHtml(html);
        }
        
        if (options.cleanup) {
          html = cleanupHtml(html);
        }
        
        if (options.inlineStyles) {
          html = inlineStyles(html);
        }
        
        resolve(html);
      }, {
        minify: options.minify || false,
        cleanup: options.cleanup || true
      });
    });

    // Load design and trigger conversion
    unlayer.loadDesign(designJson);
  });
};
```

### Server-Side Conversion Alternative

For better performance and security, you can also use Unlayer's server-side API:

```typescript
const convertJsonToHtmlServerSide = async (designJson: any) => {
  const response = await fetch('https://api.unlayer.com/v2/export/html', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(projectApiKey + ':')}`
    },
    body: JSON.stringify({
      displayMode: 'popup', // or 'email'
      design: designJson,
      options: {
        minify: true,
        cleanup: true
      }
    })
  });

  if (!response.ok) {
    throw new Error('Server-side conversion failed');
  }

  const result = await response.json();
  return result.data.html;
};
```

## Implementation Summary

### Architecture Overview

1. **During Editing Phase**:
   - Auto-save only JSON to database every 30 seconds
   - Use custom image upload to your backend
   - Minimal performance impact

2. **During Publishing Phase**:
   - Convert JSON to optimized HTML
   - Save both JSON (for future edits) and HTML (for production)
   - Apply optimizations (minify, cleanup, inline styles)

### Integration with Existing TemplatesAPI

```typescript
// Update your TemplatesAPI.ts
export class TemplatesAPI extends BaseAPI {
  // Existing methods...

  async autoSaveTemplate(id: string, designJson: any) {
    return this.put(`/templates/${id}/autosave`, {
      builder_state_json: designJson,
      auto_saved_at: new Date().toISOString()
    });
  }

  async publishTemplate(id: string, designJson: any, html: string) {
    return this.put(`/templates/${id}/publish`, {
      builder_state_json: designJson,
      html_content: html,
      published_at: new Date().toISOString(),
      status: 'published'
    });
  }
}
```

### Key Benefits

1. **Full Control**: Complete ownership of image uploads and storage
2. **Performance**: JSON-only auto-saves, HTML only when needed
3. **Cost Effective**: Works with Unlayer free version
4. **Scalable**: Separates editing and publishing concerns
5. **Flexible**: Easy to extend with additional features

This implementation gives you complete control over the Unlayer integration while maintaining optimal performance and staying within the free version limitations.