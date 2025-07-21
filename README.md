# Coupon Template Builder

A React/TypeScript component library for building dynamic coupon templates with drag-and-drop functionality, canvas manipulation, and real-time preview.

## 🚀 Quick Start

### Installation

For npm package usage:
```bash
npm install @brandlock/coupon-template-builder
```

For local development:
```bash
git clone <repository-url>
cd coupon-template-builder
npm install
```

### Basic Usage

```tsx
import { CouponTemplateBuilder } from '@brandlock/coupon-template-builder';
import '@brandlock/coupon-template-builder/styles';

function App() {
  return (
    <CouponTemplateBuilder
      onSave={(template) => console.log('Template saved:', template)}
      apiClient={yourAxiosInstance} // Optional: pass your API client
    />
  );
}
```

## 🛠️ Local Development

### Development Server
```bash
npm run dev
```
Starts the development server on `http://localhost:3001`

### Building the Library
```bash
npm run build
```
Builds the library using Rollup for distribution in `dist/` folder

```bash
npm run build:watch
```
Builds in watch mode for development

### Code Quality
```bash
npm run lint        # Check linting
npm run lint:fix    # Fix linting issues
npm run typecheck   # TypeScript type checking
```

## 🔗 Integration with Main Project

### Using Yalc (Recommended for Development)

**Initial Setup:**
```bash
# In coupon-template-builder directory
npm run yalc:publish

# In your main project directory
yalc add @brandlock/coupon-template-builder
npm install
```

**Development Workflow with Auto-Updates:**
```bash
# In coupon-template-builder directory
npm run dev:yalc
```
This will watch for changes and automatically push updates to all linked projects.

**Manual Updates:**
```bash
# When you make changes, push to all linked projects
npm run yalc:push

# Or in your main project, pull latest changes
yalc update @brandlock/coupon-template-builder
```

### Alternative: npm Link

1. **Build and link locally:**
   ```bash
   # In coupon-template-builder directory
   npm run build
   npm link
   
   # In your main project directory
   npm link @brandlock/coupon-template-builder
   ```

2. **Auto-rebuild on changes:**
   ```bash
   # In coupon-template-builder directory
   npm run build:watch
   ```

### Usage in React App
```tsx
import { CouponTemplateBuilder } from '@brandlock/coupon-template-builder';
import '@brandlock/coupon-template-builder/styles';
```

## 📁 Project Structure

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

## 🎯 Features

- **Drag & Drop Interface** - Built with @dnd-kit
- **Canvas Manipulation** - Powered by Konva.js
- **Responsive Grid Layout** - React Grid Layout
- **Image Editing** - Advanced cropper integration
- **Real-time Preview** - Live template rendering
- **TypeScript Support** - Full type safety
- **Ant Design Components** - Professional UI components
- **State Management** - Zustand for optimal performance

## 🔧 Configuration

### Tailwind CSS
The library uses Tailwind with `preflight: false` to avoid conflicts with your main application styles.

### TypeScript
Path aliases are configured:
- `@/*` maps to `src/*`

### Build Modes
- `npm run dev` - Development with hot reload
- `npm run build:lib` - Library build for distribution
- `npm run build` - Demo build

## 📚 API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSave` | `(template: CouponTemplate) => void` | - | Callback when template is saved |
| `onPreview` | `(template: CouponTemplate) => void` | - | Callback for template preview |
| `apiClient` | `AxiosInstance` | - | Optional API client for backend integration |
| `initialTemplate` | `CouponTemplate` | - | Initial template data |

### Types

```typescript
interface CouponTemplate {
  id: string;
  name: string;
  elements: TemplateElement[];
  dimensions: { width: number; height: number; };
}

interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'barcode';
  position: { x: number; y: number; };
  size: { width: number; height: number; };
  properties: Record<string, any>;
}
```

## 🤝 Development Guidelines

- Follow the **PRP (Plan → Reason → Propose)** workflow
- Use **Domain-Driven Design** principles
- Maintain **clean architecture** with clear separation of concerns
- Write **TypeScript** with strict typing
- Follow **ESLint** and **Prettier** configurations
- Keep components **functional** and **pure**

## 🚨 Troubleshooting

### Common Issues

1. **Module not found errors:**
   ```bash
   npm run build:lib && npm link
   ```

2. **Style conflicts:**
   Import styles after your main application styles:
   ```tsx
   import '@brandlock/coupon-template-builder/styles';
   ```

3. **TypeScript errors:**
   ```bash
   npm run typecheck
   ```

4. **Peer dependency warnings:**
   Ensure React 18+ is installed in your main project.

## 📄 License

MIT License - see LICENSE file for details.