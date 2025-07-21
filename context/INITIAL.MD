## 🚀 Implementation Roadmap

### Phase 1: Core Admin Features (Weeks 1-3)

#### Week 1: Foundation & Template Config
- [ ] Project setup with Vite, TypeScript, Tailwind, Ant Design
- [ ] Routing structure with React Router
- [ ] API client setup with Axios and interceptors
- [ ] Zustand store architecture
- [ ] Template configuration form (Step 1)
- [ ] Basic template listing page

#### Week 2: Template Builder
- [ ] Single-row canvas implementation with @dnd-kit
- [ ] Component library sidebar (Text, Image, Button, Divider)
- [ ] Property panel for component editing
- [ ] Auto-save functionality (5-second debounce)
- [ ] Save status indicator
- [ ] Import/Export JSON functionality

#### Week 3: Publishing & Versioning
- [ ] Publish template workflow
- [ ] Version history tracking
- [ ] Template status management
- [ ] Preview mode implementation
- [ ] View code functionality

### Phase 2: Custom Templates & Canned Content (# Coupon Template Builder - Development Context & PRD

## 🎯 Project Overview

### Vision
Build a modern, scalable coupon template builder that empowers both administrators and clients to create, customize, and manage responsive coupon templates through an intuitive drag-and-drop interface.

### Project Scope
This project consists of two main modules:
1. **Admin Module**: Template creation, customization, and publishing
2. **Client Module**: Template review, customization, and approval

### Core Principles
- **Clean Architecture**: Separation of concerns with clear boundaries
- **Type Safety**: Full TypeScript implementation
- **Performance First**: Optimized rendering with auto-save functionality
- **Developer Experience**: Self-documenting code with comprehensive tooling
- **Accessibility**: WCAG 2.1 AA compliance
- **Scalability**: Modular design supporting future feature expansion

## 🏗️ Technical Architecture

### Tech Stack
```yaml
Core:
  - React 18+ (with concurrent features)
  - TypeScript 5+
  - Vite (build tool)
  - Tailwind CSS 3+ (utility-first styling)
  - Zustand (state management)
  - Ant Design 5+ (UI components)

Canvas & Interaction:
  - @dnd-kit/sortable (drag-and-drop)
  - react-grid-layout (responsive grid system)
  - react-advanced-cropper (image editing)
  - Konva.js (advanced canvas manipulation)

Editor & Preview:
  - Monaco Editor (code editing)
  - PostCSS (CSS processing)
  - iframe-resizer (responsive preview)

API & Data:
  - Axios (HTTP client)
  - React Query v5 (server state management)
  - Zod (runtime validation)
  - date-fns (date manipulation)

Development:
  - ESLint + Prettier (code quality)
  - Vitest (unit testing)
  - Playwright (E2E testing)
  - Storybook (component documentation)
  - Husky (git hooks)
```

### Project Structure
```
src/
├── api/                    # API client layer
│   ├── client/            # Axios instances & interceptors
│   ├── hooks/             # React Query hooks
│   ├── services/          # API service modules
│   └── types/             # API type definitions
├── components/            # Shared components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   └── common/           # Common business components
├── features/             # Feature modules
│   ├── template-builder/
│   │   ├── components/   # Feature-specific components
│   │   ├── hooks/        # Feature-specific hooks
│   │   ├── stores/       # Zustand stores
│   │   ├── types/        # Type definitions
│   │   └── utils/        # Utilities
│   ├── template-designer/
│   ├── canned-content/
│   └── asset-manager/
├── lib/                  # Core libraries
│   ├── canvas/          # Canvas engine
│   ├── validation/      # Validation schemas
│   └── utils/           # Shared utilities
├── styles/              # Global styles
└── types/               # Global type definitions
```

## 📋 Feature Specifications

### Epic 1: Template Management Foundation

#### User Story 1.1: Template Creation Wizard
```typescript
As an admin user,
I want to create a new template through a guided wizard,
So that I can quickly set up templates with proper configuration.

Acceptance Criteria:
- [ ] Step 1: Choose creation method (blank/preset/duplicate)
- [ ] Step 2: Select device type (desktop/mobile/responsive)
- [ ] Step 3: Configure metadata (name, description, tags)
- [ ] Step 4: Select canvas layout (single/two-row/three-row/custom)
- [ ] Validation at each step with clear error messages
- [ ] Progress indicator showing current step
- [ ] Ability to go back and modify previous steps

Technical Implementation:
- Use react-hook-form with Zod validation
- Implement StepWizard component with transition animations
- Store wizard state in Zustand with persistence
```

#### User Story 1.2: Template List Management
```typescript
As an admin user,
I want to view and manage all templates in a searchable list,
So that I can quickly find and organize templates.

Acceptance Criteria:
- [ ] Paginated table with 20/50/100 items per page
- [ ] Sort by: name, created date, modified date, status
- [ ] Filter by: status, device type, shopper type, tags
- [ ] Search by: name, description, creator
- [ ] Bulk actions: delete, duplicate, change status
- [ ] Quick actions: edit, preview, duplicate, delete
- [ ] Export selected templates as JSON

Technical Implementation:
- Implement VirtualizedTable for performance
- Use React Query with optimistic updates
- Debounced search with highlighting
- Implement undo/redo for bulk actions
```

## 🔄 Detailed Workflow Specifications

### Admin Workflow

#### 1. Template Configuration Step
**Route**: `/coupon-builder/generator`

**Components Required**:
- `TemplateConfigForm`: Main form component
- `DeviceTypeSelector`: Multi-select for device types
- `AccountSelector`: Multi-select with search for accounts
- `ShopperSelector`: Multi-select with search for shoppers
- `GenericTemplateToggle`: Checkbox for generic templates

**API Integration**:
```typescript
// POST /template-builder/config/templates
interface CreateTemplatePayload {
  name: string
  description?: string
  device_ids: number[]
  account_ids: number[]
  shopper_ids?: number[]
  is_generic: boolean
  status: 'draft'
  canvas_type: 'single_row' // Currently only single row
}

// Response includes template ID for navigation
interface CreateTemplateResponse {
  id: string // UUID for routing to edit page
  // ... other fields
}
```

**Navigation Flow**:
1. Form submission triggers API call
2. On success, navigate to `/coupon-builder/generator/{templateId}/edit`
3. Show success toast with template creation confirmation

#### 2. Template Builder/Designer Step
**Route**: `/coupon-builder/generator/{templateId}/edit`

**Key Features**:
- **Single Row Canvas**: Only content row (no header/footer)
- **Auto-Save**: Debounced save every 5 seconds on changes
- **Builder Actions Menu**:
  - Import JSON
  - Export JSON
  - View Code
- **Preview Mode**: Live preview in iframe
- **Save Status Indicator**: Shows "Saving..." / "Saved" states

**Components Required**:
```typescript
// Main Components
- TemplateBuilder: Root component
- Canvas: Drag-and-drop area (single row only)
- ComponentLibrary: Sidebar with draggable components
- PropertyPanel: Component property editor
- BuilderToolbar: Actions and preview toggle
- SaveStatusIndicator: Auto-save status
```

**Auto-Save Implementation**:
```typescript
// Zustand store slice
interface AutoSaveSlice {
  lastSaved: Date | null
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  debouncedSave: DebouncedFunc<() => Promise<void>>
}

// Auto-save hook
const useAutoSave = (templateId: string) => {
  const { builderState, saveStatus } = useTemplateStore()
  
  const debouncedSave = useMemo(
    () => debounce(async () => {
      await updateTemplate(templateId, { builder_state_json: builderState })
    }, 5000),
    [templateId, builderState]
  )
  
  useEffect(() => {
    debouncedSave()
  }, [builderState])
}
```

#### 3. Template Listing Page
**Route**: `/coupon-builder/templates`

**Features**:
- Table with templates (as shown in screenshot)
- Status badges (Dummy, Published, Draft)
- Shopper segments display
- Device type icons
- Action buttons: Edit, Publish, Delete
- Filters: Device type, Status, Search
- Pagination controls

**API Calls**:
```typescript
// GET /template-builder/templates
// With query params: deviceId, status, search, page, limit

// POST /template-builder/config/templates/:templateId/publish
// Publishes template, hides all actions after publishing
```

#### 4. Custom Template Creation
**Route**: `/coupon-builder/custom-templates/new`

**Template Selection Page**:
- Pre-made templates grid (frontend only)
- Template preview on hover
- Categories: Blank, Minimalist, Voucher Offer, Geometric, Sleek Dark

**Custom Code Editor**:
**Route**: `/coupon-builder/generator/{templateId}/custom-edit`

**Features**:
- Monaco Editor for HTML/CSS/JS
- Live preview panel (right side)
- Auto-save functionality
- Code validation before save
- Syntax highlighting

**API Integration**:
```typescript
// POST /template-builder/custom-templates/validate
interface ValidateCodePayload {
  raw_code: string
  code_type: 'html'
}

// PUT /template-builder/custom-templates/:templateId
interface UpdateCustomTemplatePayload {
  raw_code: string
  // Auto-save every 10 seconds
}
```

#### 5. Canned Content Management
**Route**: `/coupon-builder/canned-content`

**Features**:
- CRUD operations for pre-filled content
- Categorized by: Industry, Field, Shopper Segments
- Modal for add/edit with fields:
  - Industry (dropdown)
  - Field (dropdown)
  - Shopper Segments (multi-select)
  - Content (textarea)
- Filter by: Industry, Field, Shopper Segments

### Client Workflow

#### 1. Client Landing Page
**Route**: `/coupon-builder/client/templates`

**Features**:
- Grid view of available templates
- Template preview cards
- "Customize" button on each template
- Filter by template type

#### 2. Three-Step Review Process

**Step 1: Desktop Module Review**
**Route**: `/coupon-builder/client/review/{publishedTemplateId}/desktop`

**Features**:
- Live preview of desktop version
- Shopper segment selection for content
- Editable content fields from canned content
- Options: "Approve Design", "Edit Design", "Add Notes"

**Step 2: Mobile Module Review**
**Route**: `/coupon-builder/client/review/{publishedTemplateId}/mobile`

**Features**:
- Mobile device preview frame
- Same editing capabilities as desktop
- Responsive design validation

**Step 3: Content Customization**
**Route**: `/coupon-builder/client/review/{publishedTemplateId}/content`

**Features**:
- All editable content fields in one view
- Canned content suggestions
- Custom content input
- Final review before submission

**Client Editor Limitations**:
- No structural changes allowed
- Only content and style properties editable
- Limited to pre-defined customizable fields

#### 3. Client Approval Screen
**Route**: `/coupon-builder/client/approval/{customizationId}`

**Features**:
- Summary of all changes
- Preview of final design
- Submit for admin approval button
- Status tracking

## 📝 API Requirements Documentation

### Missing APIs to Document

```markdown
# Missing API Requirements

## 1. Client Template APIs

### Get Available Templates for Client
- Endpoint: `GET /template-designer/client/templates`
- Query params: accountId, deviceTypeId
- Returns: Published templates available to the client

### Get Template Preview Data
- Endpoint: `GET /template-designer/client/templates/:publishedTemplateId/preview`
- Returns: Template with canned content pre-filled based on shopper segments

## 2. Client Review APIs

### Save Client Review Notes
- Endpoint: `POST /template-designer/client/review/:publishedTemplateId/notes`
- Payload: { notes: string, reviewStep: 'desktop' | 'mobile' | 'content' }

### Submit for Admin Approval
- Endpoint: `POST /template-designer/client/customizations/:customizationId/submit-approval`
- Payload: { clientNotes?: string }

### Get Approval Status
- Endpoint: `GET /template-designer/client/approvals/:customizationId/status`
- Returns: { status: 'pending' | 'approved' | 'rejected', adminNotes?: string }

## 3. Admin Approval APIs

### Get Pending Client Approvals
- Endpoint: `GET /template-builder/admin/pending-approvals`
- Query params: page, limit, accountId
- Returns: List of customizations pending approval

### Approve/Reject Client Changes
- Endpoint: `PUT /template-builder/admin/approvals/:customizationId`
- Payload: { status: 'approved' | 'rejected', notes?: string }

## 4. Version Management APIs

### Get Template Versions
- Endpoint: `GET /template-builder/templates/:templateId/versions`
- Returns: List of all versions with metadata

### Create Version Checkpoint
- Endpoint: `POST /template-builder/templates/:templateId/versions/checkpoint`
- Payload: { notes?: string }

### Rollback to Version
- Endpoint: `POST /template-builder/templates/:templateId/versions/:versionId/rollback`

## 5. Auto-save APIs

### Auto-save Template State
- Endpoint: `PUT /template-builder/templates/:templateId/autosave`
- Payload: { builder_state_json: object }
- Note: Should be lightweight, only save state diff

### Get Auto-save State
- Endpoint: `GET /template-builder/templates/:templateId/autosave`
- Returns: Latest auto-saved state with timestamp
```

## 🎨 Component Library

### Core Components Hierarchy

```typescript
// Admin Components
- TemplateConfig
  - ConfigForm
  - DeviceSelector
  - AccountSelector
  - ShopperSelector
  
- TemplateBuilder
  - BuilderToolbar
    - SaveStatusIndicator
    - PreviewToggle
    - ActionsMenu (Import/Export/Code)
  - Canvas (Single Row)
    - DropZone
    - SortableComponent
    - SelectionBox
  - ComponentLibrary
    - ComponentCategory
    - DraggableComponent
  - PropertyPanel
    - PropertyGroup
    - PropertyField
    
- TemplateList
  - TemplateTable
    - StatusBadge
    - DeviceIcons
    - ActionButtons
  - FilterPanel
    - DeviceFilter
    - StatusFilter
    - SearchInput
    
- CustomTemplateCreator
  - TemplateGallery
    - TemplateCard
    - PreviewModal
  - CodeEditor
    - MonacoWrapper
    - ValidationStatus
  - LivePreview
    - IframeWrapper
    - ErrorBoundary
    
- CannedContentManager
  - ContentTable
  - ContentModal
    - IndustrySelect
    - FieldSelect
    - ShopperMultiSelect
  - ContentFilters

// Client Components  
- ClientTemplateGallery
  - TemplatePreviewCard
  - CustomizeButton
  
- ReviewWizard
  - StepIndicator
  - DesktopReview
    - PreviewFrame
    - ContentEditor
    - NotesPanel
  - MobileReview
    - DeviceFrame
    - ContentEditor
  - ContentReview
    - EditableFields
    - CannedSuggestions
    
- ClientEditor
  - RestrictedPropertyPanel
  - ContentOnlyCanvas
  - PreviewToggle
  
- ApprovalScreen
  - ChangeSummary
  - FinalPreview
  - SubmitButton
```

### Shared Component Patterns

```typescript
// components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

// components/ui/StatusBadge.tsx
interface StatusBadgeProps {
  status: 'draft' | 'published' | 'dummy'
  size?: 'sm' | 'md'
}

// components/ui/SaveIndicator.tsx
interface SaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved?: Date
  className?: string
}
```

## 🔌 API Integration Pattern

### API Client Setup
```typescript
// api/client/index.ts
import axios from 'axios'
import { setupInterceptors } from './interceptors'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

setupInterceptors(apiClient)

export default apiClient
```

### React Query Hooks Pattern
```typescript
// api/hooks/useTemplates.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { templateService } from '../services/templateService'

export const useTemplates = (filters?: TemplateFilters) => {
  return useQuery({
    queryKey: ['templates', filters],
    queryFn: () => templateService.getTemplates(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: templateService.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

// Optimistic updates example
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: templateService.updateTemplate,
    onMutate: async (newTemplate) => {
      await queryClient.cancelQueries({ queryKey: ['templates', newTemplate.id] })
      const previousTemplate = queryClient.getQueryData(['templates', newTemplate.id])
      queryClient.setQueryData(['templates', newTemplate.id], newTemplate)
      return { previousTemplate }
    },
    onError: (err, newTemplate, context) => {
      queryClient.setQueryData(['templates', newTemplate.id], context.previousTemplate)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}
```

## 🧪 Testing Strategy

### Testing Pyramid
```yaml
Unit Tests (70%):
  - Components: Isolated with React Testing Library
  - Hooks: Using renderHook from RTL
  - Utils: Pure functions with Vitest
  - Stores: Zustand store actions

Integration Tests (20%):
  - API Integration: MSW for mocking
  - Feature Flows: Testing complete user journeys
  - State Management: Store interactions

E2E Tests (10%):
  - Critical Paths: Template creation, editing, publishing
  - Cross-browser: Chrome, Firefox, Safari
  - Responsive: Desktop, tablet, mobile views
```

## 📐 Design System

### Design Tokens
```scss
// styles/tokens.scss
:root {
  // Colors
  --color-primary: #1890ff;
  --color-secondary: #52c41a;
  --color-danger: #ff4d4f;
  --color-warning: #faad14;
  
  // Spacing
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  // Typography
  --font-family: 'Inter', system-ui, sans-serif;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;
  
  // Shadows
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  // Animation
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
}
```

## 🚀 Development Workflow

### Git Branch Strategy
```yaml
main:
  - Production-ready code
  - Protected branch with PR reviews

develop:
  - Integration branch
  - Feature branches merge here first

feature/*:
  - Individual features
  - Named: feature/TICKET-description

hotfix/*:
  - Emergency fixes
  - Merge to main and develop

release/*:
  - Release preparation
  - Version bumps and final testing
```

### Commit Convention
```
type(scope): subject

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Code style
- refactor: Code refactoring
- perf: Performance improvement
- test: Testing
- chore: Build/tool changes

Example:
feat(canvas): add multi-select functionality
```

## 📊 Performance Optimization

### Key Metrics
```yaml
Target Metrics:
  - First Contentful Paint: < 1.5s
  - Time to Interactive: < 3.5s
  - Canvas FPS: > 30fps with 100+ components
  - Bundle Size: < 500KB (gzipped)

Optimization Strategies:
  - Code splitting by route
  - Lazy loading for heavy components
  - Virtual scrolling for lists
  - Canvas virtualization for off-screen components
  - Debounced API calls
  - Optimistic UI updates
  - Service Worker for offline support
```

## 🔒 Security Considerations

### Security Checklist
```yaml
Authentication:
  - JWT token management
  - Refresh token rotation
  - Session timeout handling

Authorization:
  - Role-based access control
  - Feature flag permissions
  - API endpoint protection

Data Protection:
  - Input sanitization
  - XSS prevention
  - CSRF protection
  - Content Security Policy

File Uploads:
  - File type validation
  - Size limits
  - Virus scanning
  - Secure S3 presigned URLs
```

## 📝 Development Guidelines

### Code Quality Standards
```typescript
// ✅ Good: Clear, typed, and testable
interface TemplateCardProps {
  template: Template
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  // Component implementation
}

// ❌ Bad: Unclear props, no types
export const TemplateCard = (props) => {
  // Avoid this pattern
}
```

### Error Handling Pattern
```typescript
// Global error boundary
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Component error:', { error, errorInfo })
    // Send to error tracking service
  }
}

// API error handling
const handleApiError = (error: AxiosError) => {
  if (error.response?.status === 401) {
    // Handle unauthorized
    authStore.logout()
  } else if (error.response?.status === 429) {
    // Handle rate limiting
    toast.error('Too many requests. Please try again later.')
  } else {
    // Generic error
    toast.error(error.message || 'An unexpected error occurred')
  }
}
```

## 🎯 Next Steps & Iterations

### Phase 1 (MVP - Weeks 1-4)
- [ ] Basic template CRUD
- [ ] Simple drag-and-drop canvas
- [ ] Text and image components
- [ ] Basic preview functionality
- [ ] Simple publish mechanism

### Phase 2 (Enhanced - Weeks 5-8)
- [ ] Advanced components (buttons, dividers, etc.)
- [ ] Responsive design tools
- [ ] Version history
- [ ] Canned content integration
- [ ] Improved asset management

### Phase 3 (Advanced - Weeks 9-12)
- [ ] Custom code injection
- [ ] A/B testing support
- [ ] Analytics integration
- [ ] Workflow automation
- [ ] API for external integrations

### Phase 4 (Scale - Ongoing)
- [ ] Multi-tenant architecture
- [ ] White-label support
- [ ] Advanced permissions
- [ ] Performance optimizations
- [ ] Mobile app companion

## 📚 Resources & Documentation

### Key Documentation
- [Template Builder API Docs](./api-docs.md)
- [Component Storybook](http://localhost:6006)
- [Architecture Decision Records](./docs/adr)
- [Troubleshooting Guide](./docs/troubleshooting.md)

### External Resources
- [React Patterns](https://reactpatterns.com)
- [TypeScript Best Practices](https://typescript.style)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Ant Design Components](https://ant.design/components)

---

## 🤝 Contribution Guidelines

### For AI Agents
When implementing features:
1. Always check existing patterns in the codebase
2. Follow the established file structure
3. Write tests alongside implementation
4. Document complex logic with comments
5. Use TypeScript strictly (no `any` types)
6. Optimize for readability over cleverness
7. Consider accessibility in all UI components
8. Profile performance for canvas operations

### Code Review Checklist
- [ ] Types are properly defined
- [ ] Error handling is comprehensive
- [ ] Tests cover happy and edge cases
- [ ] Documentation is updated
- [ ] Performance impact is acceptable
- [ ] Security considerations addressed
- [ ] Accessibility standards met
- [ ] Code follows project conventions