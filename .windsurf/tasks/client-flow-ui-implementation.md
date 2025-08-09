# Client Flow UI Implementation Plan

## Overview
Implementation plan for creating client-facing screens based on UI references: landing page preview, desktop review (Step 1), mobile review (Step 2), and final review screen. These screens will initially use dummy content with browser mockups and template previews from a central source.

## Tech Stack Analysis
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + Ant Design components  
- **State Management**: Zustand
- **Build System**: Rollup for library bundling
- **Existing Features**: popup-builder, template-builder, template-designer
- **Additional Libraries**: @dnd-kit, Monaco Editor, Lucide React icons

## Architecture & Component Structure

### New Feature Directory Structure
```
src/features/client-flow/
├── components/
│   ├── BrowserPreview.tsx          # Enhanced wrapper around existing PopupPreview
│   ├── BrowserChrome.tsx           # Browser UI chrome (URL bar, tabs, navigation)
│   ├── WebsiteBackground.tsx       # Client website background component
│   ├── DeviceFrame.tsx             # Device frame wrapper (if needed beyond existing)
│   ├── ReviewCard.tsx              # Review step cards with actions
│   ├── NavigationStepper.tsx       # Step navigation component
│   ├── PreviewControls.tsx         # Preview interaction controls
│   └── StatusIndicator.tsx         # Review status indicators
├── screens/
│   ├── LandingPreview.tsx          # Landing page with preview section
│   ├── DesktopReview.tsx           # Step 1 - Desktop review screen
│   ├── MobileReview.tsx            # Step 2 - Mobile review screen
│   └── ReviewScreen.tsx            # Final review screen
├── hooks/
│   ├── useTemplateData.tsx         # Hook for template data (dummy/API)
│   ├── useClientData.tsx           # Hook for client website data (dummy/API)
│   ├── useReviewFlow.tsx           # Hook for review state management
│   └── usePreviewSettings.tsx      # Hook for preview configurations
├── stores/
│   └── clientFlowStore.ts          # Zustand store for client flow state
├── types/
│   └── clientFlow.ts               # TypeScript interfaces
└── index.ts                        # Feature exports
```

## Enhanced Component Architecture - Leveraging Existing Components

### **Existing Components Analysis**
The popup-builder feature already provides excellent preview functionality that we can reuse:

#### **`PopupPreview` Component** (Existing - Reusable)
- **Location**: `src/features/popup-builder/components/PopupPreview.tsx`
- **Current Features**:
  - Device frame rendering with proper dimensions
  - HTML/CSS generation from PopupTemplate
  - Interactive preview with iframe isolation
  - Loading states and error handling
  - Export functionality (HTML, fullscreen)
  - Device switching (desktop/mobile via DeviceType)

#### **`usePopupPreview` Hook** (Existing - Reusable)
- **Location**: `src/features/popup-builder/hooks/usePopupPreview.ts`
- **Current Features**:
  - Template-to-HTML/CSS generation
  - Preview state management
  - Device dimension calculations
  - Error handling and loading states

### **New Components for Client Flow**

#### **`BrowserPreview.tsx` - Enhanced Wrapper Component**
**Purpose**: Wraps existing PopupPreview with website background context

**Props Interface**:
```typescript
interface BrowserPreviewProps {
  viewport: 'desktop' | 'mobile';
  websiteBackground: WebsiteData;
  popupTemplate: PopupTemplate | null;
  showBrowserChrome?: boolean;
  interactive?: boolean;
  scale?: number;
  onPopupInteraction?: (action: string) => void;
}
```

**Implementation Strategy**:
- **Reuse existing `PopupPreview`** component for popup rendering
- **Add website background layer** behind the popup
- **Enhance with browser chrome** (URL bar, tabs, navigation)
- **Maintain device switching** using existing DeviceType system

#### **`WebsiteBackground.tsx` - Background Context Component**
**Purpose**: Renders client website background (dummy now, API-driven later)

**Props Interface**:
```typescript
interface WebsiteBackgroundProps {
  websiteData: WebsiteData;
  viewport: 'desktop' | 'mobile';
  loading?: boolean;
  fallbackImage?: string;
}

interface WebsiteData {
  backgroundImage: string;
  brandColors: {
    primary: string;
    secondary: string;
  };
  logo?: string;
  companyName: string;
  websiteUrl: string;
  // Future API fields
  actualContent?: HTMLContent;
  screenshots?: ScreenshotData[];
}
```

#### **Enhanced Integration Architecture**
```typescript
// BrowserPreview component structure
const BrowserPreview: React.FC<BrowserPreviewProps> = ({
  viewport,
  websiteBackground,
  popupTemplate,
  showBrowserChrome = true,
  interactive = false,
  scale = 1,
  onPopupInteraction
}) => {
  return (
    <div className="browser-preview-container">
      {showBrowserChrome && (
        <BrowserChrome 
          url={websiteBackground.websiteUrl}
          viewport={viewport}
        />
      )}
      
      <div className="browser-viewport" style={{ transform: `scale(${scale})` }}>
        <WebsiteBackground 
          websiteData={websiteBackground}
          viewport={viewport}
        />
        
        {popupTemplate && (
          <div className="popup-overlay-wrapper">
            <PopupPreview 
              template={popupTemplate}
              device={viewport}
              className="client-flow-popup-preview"
            />
          </div>
        )}
      </div>
    </div>
  );
};
```

## State Management Strategy - Enhanced Zustand Store

### Analysis of Existing Stores
- **`generic.store.ts`**: Handles shoppers, account details, auth provider
- **`devices.store.ts`**: Manages device data with ID and device_type
- **`loading.store.ts`**: Centralized loading states for templates and devices
- **`templateBuilderStore.ts`**: Currently empty, ready for extension

### New `clientFlowStore.ts` - API-Ready Architecture
```typescript
interface ClientFlowState {
  // Review Flow State
  currentStep: number;
  reviewProgress: ReviewProgress;
  
  // Client Data (API-ready)
  clientData: ClientData | null;
  websiteData: WebsiteData | null;
  
  // Template Data (API-ready)
  selectedTemplate: PopupTemplate | null;
  availableTemplates: PopupTemplate[];
  
  // Review Data
  desktopReview: ReviewStatus;
  mobileReview: ReviewStatus;
  comments: Comment[];
  
  // Preview Settings
  previewSettings: PreviewSettings;
  
  // Loading States (following existing pattern)
  loading: {
    clientData: boolean;
    websiteData: boolean;
    templates: boolean;
    reviewSubmission: boolean;
  };
}

interface ClientFlowActions {
  actions: {
    // Navigation
    setCurrentStep: (step: number) => void;
    nextStep: () => void;
    previousStep: () => void;
    
    // Client Data Management (API-ready)
    setClientData: (data: ClientData) => void;
    setWebsiteData: (data: WebsiteData) => void;
    fetchClientData: (clientId: string) => Promise<void>;
    
    // Template Management (API-ready)
    setSelectedTemplate: (template: PopupTemplate) => void;
    setAvailableTemplates: (templates: PopupTemplate[]) => void;
    fetchTemplates: (clientId: string) => Promise<void>;
    
    // Review Management
    updateReview: (step: 'desktop' | 'mobile', status: ReviewStatus) => void;
    addComment: (comment: Comment) => void;
    submitReview: () => Promise<void>;
    
    // Preview Settings
    updatePreviewSettings: (settings: Partial<PreviewSettings>) => void;
    
    // Loading States (following existing pattern)
    setLoading: (key: keyof ClientFlowState['loading'], value: boolean) => void;
    
    // Reset
    resetFlow: () => void;
  };
}
```

## Screen Specifications

### 1. Landing Preview Screen (`LandingPreview.tsx`)
**Purpose**: Initial screen showing template preview in browser context

**Components**:
- Hero section with title and description
- `BrowserPreview` component showing website mockup
- `PopupPreview` component overlaid on browser
- Template selection dropdown (dummy options)
- "Start Review Process" CTA button
- Preview settings panel (optional)

**Dummy Data**:
- Sample website content (generic e-commerce site)
- 3-5 template variations from existing popup-builder
- Mock client branding elements

### 2. Desktop Review Screen (`DesktopReview.tsx`)
**Purpose**: Step 1 - Review popup on desktop viewport

**Components**:
- `NavigationStepper` showing current step (1/2)
- `DeviceFrame` with desktop dimensions (1920x1080)
- `BrowserPreview` with full desktop layout
- `PopupPreview` positioned according to template settings
- `ReviewCard` with approval/rejection controls
- Comments/feedback text area
- Navigation buttons (Back, Next)

**Features**:
- Zoom controls for detailed review
- Position adjustment preview
- Template variant switching
- Review status tracking

### 3. Mobile Review Screen (`MobileReview.tsx`)
**Purpose**: Step 2 - Review popup on mobile viewport

**Components**:
- `NavigationStepper` showing current step (2/2)
- `DeviceFrame` with mobile dimensions (375x812 iPhone)
- Mobile-optimized `BrowserPreview`
- Responsive `PopupPreview`
- Touch-friendly `ReviewCard`
- Mobile-specific feedback controls

**Features**:
- Device rotation simulation
- Touch interaction preview
- Mobile-specific positioning
- Responsive behavior validation

### 4. Review Screen (`ReviewScreen.tsx`)
**Purpose**: Final review with side-by-side comparison

**Components**:
- Summary header with review progress
- Split-screen layout:
  - Left: Desktop preview
  - Right: Mobile preview
- `StatusIndicator` for each review step
- Final approval workflow
- Export/publish options (dummy)
- Review history timeline

**Features**:
- Synchronized scrolling between previews
- Review summary with timestamps
- Approval workflow simulation
- Export options preparation

## Reusable Components Detail

### `BrowserPreview.tsx`
- Chrome-like browser frame with URL bar, tabs
- Configurable viewport dimensions
- Scrollable content area
- Loading states and animations
- Props: `width`, `height`, `url`, `content`, `showControls`

### `PopupPreview.tsx`
- Renders popup using existing popup-builder components
- Configurable positioning and animations
- Template switching capability
- Interactive preview modes
- Props: `template`, `position`, `animation`, `interactive`

### `DeviceFrame.tsx`
- Device mockup frames (desktop monitor, mobile phone)
- Responsive scaling
- Device-specific styling (bezels, buttons)
- Props: `device`, `orientation`, `scale`, `children`

### `ReviewCard.tsx`
- Consistent review interface
- Approval/rejection buttons
- Comment input field
- Status indicators
- Props: `title`, `status`, `onApprove`, `onReject`, `comments`

## State Management Strategy

### Zustand Store (`reviewFlowStore.ts`)
```typescript
interface ReviewFlowState {
  currentStep: number;
  templateId: string;
  desktopReview: ReviewStatus;
  mobileReview: ReviewStatus;
  comments: Comment[];
  previewSettings: PreviewSettings;
  // Actions
  setCurrentStep: (step: number) => void;
  updateReview: (step: string, status: ReviewStatus) => void;
  addComment: (comment: Comment) => void;
  updatePreviewSettings: (settings: PreviewSettings) => void;
}
```

### Custom Hooks
- `useTemplateData()`: Manages dummy template data and variations
- `useReviewFlow()`: Handles review state transitions and validation
- `usePreviewSettings()`: Manages preview configurations and preferences

## Dummy Data Strategy

### Template Data Source
- Leverage existing popup-builder template system
- Create 5-7 sample templates with different styles:
  - E-commerce discount popup
  - Newsletter signup
  - Exit-intent offer
  - Mobile app download
  - Event promotion
- Use real-looking but generic content

### Browser Content Mockup
- Generic e-commerce website layout
- Placeholder product images and text
- Realistic navigation and footer
- Responsive design elements
- Configurable branding colors

### Client Branding
- [x] Set up feature directory structure
- [x] Create enhanced TypeScript interfaces with API provisions
- [x] Implement `clientFlowStore.ts` with existing store pattern compatibility
- [x] Set up dummy data services with API-ready structure
- [x] Create service layer abstraction for future API integration
- [x] **Import and test existing `PopupPreview` and `usePopupPreview`** in client-flow context

### Phase 2: Enhanced Wrapper Components (Days 3-4) ✅ COMPLETED
- [x] **Reuse existing `PopupPreview`** - no modifications needed initially
- [x] Create `BrowserChrome` component (URL bar, tabs, navigation)
- [x] Implement `WebsiteBackground` component with dynamic loading
- [x] Build `BrowserPreview` wrapper that combines:
  - WebsiteBackground as base layer
  - Existing PopupPreview as overlay
  - BrowserChrome as UI frame
- [x] Create `ReviewCard` component with API-ready submission
- [x] Develop other supporting components (NavigationStepper, etc.)

### Phase 3: Screen Implementation - Leveraging Existing Preview (Days 5-7) ✅ COMPLETED
- [x] Build `LandingPreview` using BrowserPreview wrapper
- [x] Implement `DesktopReview` with existing PopupPreview (device='desktop')
- [x] Create `MobileReview` with existing PopupPreview (device='mobile')
- [x] Develop `ReviewScreen` with dual BrowserPreview instances
- [x] Create screens index file with routing configuration
- [x] **Test existing PopupPreview features** (export, fullscreen, interactivity)

### Phase 3.5: Issue Resolution & Store Updates ✅ COMPLETED
- [x] **Fixed missing `finalReview` property** in Zustand store and ClientFlowState interface
- [x] **Updated Comment step types** to include 'final' for final review comments
- [x] **Resolved TestPopupPreview type issues** with proper type assertions and error handling
- [x] **Verified all import paths** after store relocation to `src/stores/clientFlowStore.ts`
- [x] **Store structure finalized** with all required review states and actions
- [x] **Type safety improvements** for template data access and zone handling

### Phase 4: Unified Screen Implementation (Days 8-9) 🚧 IN PROGRESS
- [ ] **Create unified `ClientFlow` component** combining all screens with stepper navigation
- [ ] **Implement BaseProps pattern** - All main screen components extend BaseProps (apiClient, navigate, shoppers, accountDetails, authProvider)
- [ ] **Multi-step form pattern** - Single screen with step-by-step navigation using Ant Design Steps
- [ ] **Refactor individual screens** to work as steps within unified component
- [ ] Implement loading states following existing pattern
- [ ] Add error handling and fallback mechanisms
- [ ] Create API service layer with mock implementations
- [ ] Optimize performance for dynamic content loading
- [x] **Ensure compatibility** with existing popup-builder store and types

### Phase 5: Testing & Documentation (Day 10)
- [ ] Component unit testing with API mocking
- [ ] Integration testing for review flow and data management
- [ ] **Test existing PopupPreview functionality** within client flow context
- [ ] Cross-browser compatibility testing
- [ ] API integration documentation
- [ ] Migration guide for dummy-to-API transition

## Component Reuse Benefits

### **Immediate Advantages**
- ✅ **Proven popup rendering**: Existing PopupPreview handles all template-to-HTML/CSS conversion
- ✅ **Device compatibility**: Built-in desktop/mobile switching via DeviceType
- ✅ **Interactive features**: Export, fullscreen, iframe isolation already implemented
- ✅ **Error handling**: Loading states and error management already built
- ✅ **Performance**: Optimized preview generation and caching
- Integrate with current asset management system
- Maintain compatibility with existing build process

### Future API Integration Points
- Template fetching from backend
- Review submission endpoints
- Client feedback collection
- Export/publish functionality
- Real-time collaboration features

### Performance Considerations
- Lazy loading for preview components
- Optimized image loading for mockups
- Efficient state management with Zustand
- Code splitting for different screens
- Minimal bundle size impact

## Design System Compliance

### TailwindCSS Usage
- Consistent spacing using Tailwind scale
- Responsive design with Tailwind breakpoints
- Custom component classes for reusability
- Dark mode support preparation

### Ant Design Integration
- Use Ant Design components for form elements
- Consistent button styles and interactions
- Modal and drawer components for overlays
- Icon system integration with Lucide React

### Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Focus management in review flow

## Success Criteria

### Functional Requirements
- [ ] All four screens render correctly with dummy data
- [ ] Review flow navigation works seamlessly
- [ ] Preview components display templates accurately
- [ ] Responsive design works on all target devices
- [ ] State management maintains review progress

### Technical Requirements
- [ ] TypeScript strict mode compliance
- [ ] No console errors or warnings
- [ ] Bundle size impact < 100KB
- [ ] Component reusability > 80%
- [ ] Test coverage > 90%

### User Experience
- [ ] Intuitive navigation between screens
- [ ] Fast loading times (< 2s initial load)
- [ ] Smooth animations and transitions
- [ ] Clear visual feedback for all actions
- [ ] Professional, polished appearance

## 🎯 Current Implementation Status

### ✅ **COMPLETED PHASES (1-3.5)**

**Phase 1: Infrastructure & Store Setup**
- Complete feature directory structure in `src/features/client-flow/`
- Zustand store with full review flow state management
- API-ready dummy data services and hooks
- TypeScript interfaces for all client flow types
- Integration with existing popup-builder components

**Phase 2: Reusable Components**
- `BrowserChrome` - Desktop and mobile browser UI simulation
- `WebsiteBackground` - Dynamic client website mockups with branding
- `BrowserPreview` - Wrapper combining website + popup + browser chrome
- `ReviewCard` - Review controls with approve/reject/request changes
- `NavigationStepper` - Progress tracking across review steps

**Phase 3: All Main Screens**
- `LandingPreview` - Template selection with live preview and settings
- `DesktopReview` - Step 1 desktop review with zoom and navigation
- `MobileReview` - Step 2 mobile review with touch mode and guidelines
- `ReviewScreen` - Final side-by-side comparison with submission workflow
- Screens index file with routing configuration

**Phase 3.5: Critical Issue Resolution**
- Fixed missing `finalReview` property in store and types
- Updated comment step types to support 'final' review comments
- Resolved all TypeScript type safety issues
- Verified import paths after store relocation
- Enhanced error handling and type assertions

### 🚀 **KEY ACHIEVEMENTS**

**Successful PopupPreview Integration**
- ✅ Reused existing `PopupPreview` component without modifications
- ✅ Leveraged `usePopupPreview` hook for template rendering
- ✅ Maintained compatibility with existing popup-builder types
- ✅ Preserved all existing features (export, fullscreen, interactivity)

**API-Ready Architecture**
- ✅ Service layer abstraction for seamless API transition
- ✅ Dummy data structures matching expected API responses
- ✅ Loading states and error handling following project patterns
- ✅ Zustand store compatible with existing store architecture

**Complete Review Workflow**
- ✅ Progressive approval system with validation between steps
- ✅ Comment system supporting all review stages
- ✅ Navigation with step completion requirements
- ✅ Final submission workflow with confirmation modal

**Responsive & Interactive Design**
- ✅ Desktop and mobile viewport support
- ✅ Interactive preview settings (scale, chrome, touch mode)
- ✅ Realistic browser simulation with proper device frames
- ✅ Client branding integration with dynamic colors and logos

### 📁 **File Structure Created**

```
src/
├── stores/clientFlowStore.ts (moved from features/client-flow/stores/)
└── features/client-flow/
    ├── types/clientFlow.ts
    ├── hooks/
    │   ├── useClientData.tsx
    │   └── useTemplateData.tsx
    ├── components/
    │   ├── BrowserChrome.tsx
    │   ├── WebsiteBackground.tsx
    │   ├── BrowserPreview.tsx
    │   ├── ReviewCard.tsx
    │   ├── NavigationStepper.tsx
    │   └── TestPopupPreview.tsx
    ├── screens/
    │   ├── LandingPreview.tsx
    │   ├── DesktopReview.tsx
    │   ├── MobileReview.tsx
    │   ├── ReviewScreen.tsx
    │   └── index.ts
    └── index.ts
```

### 🎯 **Ready for Phase 4 - Unified Screen Architecture**

**New Approach: Single Multi-Step Component**
Instead of separate routed screens, create a unified `ClientFlow` component that:
1. **Combines all screens** into a single component with step-based navigation
2. **Uses Ant Design Steps** for visual progress indication
3. **Follows BaseProps pattern** used throughout the project
4. **Maintains all existing functionality** while providing better UX

**Unified Component Structure:**
```typescript
interface ClientFlowProps extends BaseProps {
  // Additional client-flow specific props
}

const ClientFlow: React.FC<ClientFlowProps> = ({
  apiClient,
  navigate, 
  shoppers,
  accountDetails,
  authProvider,
  ...additionalProps
}) => {
  // Stepper-based navigation between:
  // Step 0: LandingPreview (Template Selection)
  // Step 1: DesktopReview 
  // Step 2: MobileReview
  // Step 3: ReviewScreen (Final Review)
}
```

**Benefits of Unified Approach:**
- ✅ **Better UX** - No page reloads, smoother transitions
- ✅ **State persistence** - All data stays in memory during flow
- ✅ **Consistent with project patterns** - Follows BaseProps convention
- ✅ **Easier integration** - Single component to embed anywhere
- ✅ **Better performance** - No route changes, faster navigation

---

## Risk Mitigation

### Technical Risks
- **Risk**: Integration complexity with existing popup-builder
- **Mitigation**: Create abstraction layer and thorough testing

- **Risk**: Performance impact from multiple preview renders
- **Mitigation**: Implement virtualization and lazy loading

- **Risk**: Responsive design complexity
- **Mitigation**: Mobile-first approach with systematic testing

### Timeline Risks
- **Risk**: Underestimated component complexity
- **Mitigation**: Break down into smaller, testable units

- **Risk**: Integration issues discovered late
- **Mitigation**: Early integration testing in Phase 2

## Next Steps

1. **Immediate**: Create feature directory structure and base files
2. **Week 1**: Implement core components and first screen
3. **Week 2**: Complete all screens and integration
4. **Week 3**: Testing, polish, and documentation

This plan provides a comprehensive roadmap for implementing the client flow UI screens while maintaining code quality, reusability, and alignment with the existing system architecture.
