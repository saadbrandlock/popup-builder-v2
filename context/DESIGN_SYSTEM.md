# Coupon Template Builder - Design System

## Overview
This document outlines the UI/UX design principles and component standards for the Coupon Template Builder application. All components should follow these guidelines for consistency and maintainability.

## Design Principles

### 1. Clean & Modern Interface
- **Minimal design** with plenty of white space
- **Card-based layouts** for content organization
- **Subtle shadows** and borders for visual hierarchy
- **Consistent spacing** using 8px grid system

### 2. Typography Scale
- **Headings**: Inter/System font family
- **H1**: 24px, font-weight: 600
- **H2**: 20px, font-weight: 600  
- **H3**: 16px, font-weight: 600
- **Body**: 14px, font-weight: 400
- **Small**: 12px, font-weight: 400

### 3. Color Palette
```css
/* Primary */
--primary-50: #f0f9ff
--primary-100: #e0f2fe
--primary-500: #0ea5e9
--primary-600: #0284c7
--primary-700: #0369a1

/* Neutral */
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-500: #6b7280
--gray-600: #4b5563
--gray-700: #374151
--gray-900: #111827

/* Status Colors */
--success-50: #f0fdf4
--success-500: #22c55e
--warning-50: #fffbeb
--warning-500: #f59e0b
--error-50: #fef2f2
--error-500: #ef4444
```

### 4. Spacing System (8px grid)
- **xs**: 4px
- **sm**: 8px  
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

### 5. Component Standards

#### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--primary-600);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  padding: 8px 16px;
  border-radius: 6px;
}
```

#### Cards
```css
.card {
  background: white;
  border-radius: 8px;
  border: 1px solid var(--gray-200);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}
```

#### Status Badges
```css
.badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge-published { background: var(--success-50); color: var(--success-700); }
.badge-draft { background: var(--gray-50); color: var(--gray-700); }
.badge-archived { background: var(--warning-50); color: var(--warning-700); }
```

## Component Architecture

### Templates Listing Component

**Requirements from Epic 1.3:**
- ADM-06: List all templates with filters (status, device, search)
- ADM-07: Publish template functionality
- ADM-08: Hide delete for published templates

**Design Decisions:**

1. **Layout**: Card-based grid layout instead of traditional table for better visual appeal
2. **Filters**: Top bar with search, status filter, device filter, and sort options
3. **Actions**: Contextual action buttons based on template status
4. **Responsive**: Mobile-first design with responsive grid
5. **Status Indicators**: Color-coded badges for quick status recognition

**Key Features:**
- **Search**: Real-time search by template name
- **Filters**: Status (All, Draft, Published, Archived), Device type
- **Sorting**: By name, last updated, status
- **Pagination**: Load more or traditional pagination
- **Bulk Actions**: Select multiple templates for batch operations
- **Preview**: Quick preview thumbnail
- **Contextual Actions**: Edit, Publish, Archive, Delete (based on status)

**Information Architecture:**
```
Templates Listing
├── Header
│   ├── Page Title
│   ├── Create Template Button
│   └── View Options (Grid/List)
├── Filters Bar
│   ├── Search Input
│   ├── Status Filter
│   ├── Device Filter
│   └── Sort Dropdown
├── Templates Grid
│   └── Template Card
│       ├── Preview Thumbnail
│       ├── Template Info
│       │   ├── Name
│       │   ├── Description
│       │   ├── Status Badge
│       │   ├── Device Tags
│       │   └── Last Updated
│       └── Actions Menu
│           ├── Edit
│           ├── Preview
│           ├── Publish/Unpublish
│           ├── Archive
│           └── Delete (if not published)
└── Pagination
```

**Interactive States:**
- **Hover**: Subtle elevation and border color change
- **Loading**: Skeleton loading for cards
- **Empty State**: Helpful message with CTA to create first template
- **Error State**: Error message with retry option

## Implementation Guidelines

### 1. Component Structure
Each component should have:
- TypeScript interfaces for props
- Proper error boundaries
- Loading states
- Accessibility attributes
- Mobile responsiveness

### 2. State Management
- Use Zustand for global state
- Local state for component-specific UI state
- React Query for server state management

### 3. Styling Approach
- Tailwind CSS for utility-first styling
- Component-specific CSS modules when needed
- CSS custom properties for theme variables

### 4. Accessibility
- Semantic HTML elements
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance (WCAG AA)

### 5. Performance
- Lazy loading for images
- Virtual scrolling for large lists
- Optimized re-renders with React.memo
- Code splitting for feature components

## Future Considerations

1. **Dark Mode**: Design tokens ready for dark theme
2. **Internationalization**: Text externalization for i18n
3. **Animation**: Subtle micro-interactions for better UX
4. **Advanced Filtering**: Date ranges, custom filters
5. **Bulk Operations**: Multi-select with batch actions

---

*Last updated: 2025-07-20*
*Version: 1.0*