# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development Commands
- `npm run dev` - Start development server on port 3001
- `npm run build` - Full production build (clean + rollup)
- `npm run build:watch` - Watch mode for development
- `npm run build:fast` - Fast watch mode (silent, no type checking)

### Code Quality
- `npm run lint` - ESLint check (--max-warnings 0)
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run typecheck` - TypeScript type checking (--noEmit)

### Library Publishing
- `npm run yalc:publish` - Build and publish to yalc
- `npm run yalc:push` - Build and push updates to linked projects
- `npm run dev:yalc` - Development with auto yalc publishing

## Architecture Overview

This is a **React/TypeScript component library** for building dynamic coupon templates with drag-and-drop functionality and canvas manipulation.

### Core Technologies
- **Bundler**: Rollup (primary), Vite (dev server)
- **State Management**: Zustand with subscribeWithSelector middleware
- **Canvas Engine**: Konva.js with react-konva
- **UI Framework**: Ant Design + Tailwind CSS (preflight disabled)
- **Drag & Drop**: @dnd-kit/core and @dnd-kit/sortable
- **API Layer**: Axios with factory pattern

### Project Structure

```
src/
├── api/                    # API client layer with factory pattern
│   ├── services/          # API service classes (BaseAPI, TemplatesAPI, ComponentsAPI)
│   └── index.ts           # APIFactory with singleton pattern
├── features/              # Feature-based modules
│   ├── template-builder/  # Template listing and management
│   ├── popup-builder/     # Main canvas builder with zones
│   ├── template-designer/ # Template customization
│   ├── canned-content/    # Content management
│   └── asset-manager/     # Asset handling
├── stores/                # Zustand stores
│   ├── generic.store.ts   # Base store patterns
│   └── list/              # List-specific stores
└── types/                 # Global TypeScript definitions
```

### Key Architectural Patterns

#### API Layer
- **Factory Pattern**: `APIFactory` creates service instances with shared axios client
- **Singleton Services**: API services are cached per factory instance
- **Base Class**: `BaseAPI` provides common HTTP methods and error handling

#### State Management
- **Zustand Stores**: All stores follow `actions` object pattern
- **Selectors**: Export specialized hooks for state slices (e.g., `useSelectedElement`)
- **Middleware**: `subscribeWithSelector` for reactive updates

#### Popup Builder Core Architecture
The popup builder uses a **zone-based system**:
- **Zones**: header, content, footer - each contains components array
- **Elements**: Components placed in zones with id, type, zone, config, order
- **Builder State**: JSON structure stored in `builder_state_json` field
- **Instance Limits**: Components can have max_instances (null = unlimited)

### Important Implementation Details

#### Build Configuration
- **Rollup**: Primary bundler with TypeScript, PostCSS, and external peer deps
- **Development Mode**: Skip type checking in watch mode for performance
- **Path Aliases**: `@/*` maps to `src/*` in both TypeScript and bundlers
- **CSS**: Tailwind with `preflight: false` to avoid host app conflicts

#### Store Patterns
All Zustand stores follow this pattern:
```typescript
export const useStore = create<State & { actions: Actions }>((set, get) => ({
  // state properties
  actions: {
    // action methods
  }
}));
```

#### Component Library Integration
- **Peer Dependencies**: React 18+ required in host application
- **External Dependencies**: Core libraries (antd, zustand, @dnd-kit) are externalized
- **Styles**: Single CSS file exported as `./styles` from package

#### Canvas System
- **Konva Integration**: React-konva for canvas manipulation
- **Element Rendering**: Dynamic component rendering based on type
- **Drag & Drop**: Components from library to canvas zones
- **Real-time Updates**: Zustand subscriptions trigger canvas re-renders

### Development Workflow

1. **Local Development**: Use `npm run dev` for hot reload server
2. **Library Testing**: Use yalc for local package linking (`npm run dev:yalc`)
3. **Type Safety**: Always run `npm run typecheck` before commits
4. **Code Quality**: ESLint enforces strict rules with zero warnings policy

### Common Pitfalls

- **State Updates**: Always update through store actions, never mutate state directly
- **Zone System**: Elements must specify correct zone and respect allowed_in_zones
- **Instance Limits**: Check `canAddComponent()` before adding elements
- **CSS Conflicts**: Library uses Tailwind with preflight disabled
- **Peer Dependencies**: Host app must provide React 18+ and other peer deps

### API Integration

The library expects an axios instance for API communication:
```typescript
const api = createAPI(axiosInstance);
// Use api.templates, api.components, etc.
```

Services handle:
- Template CRUD operations
- Component library management  
- Asset uploads and management
- User permissions and roles


## Plan & Review

### Before starting work
Always in plan mode to make a plan
After
get the plan, make sure you Write the plan
to .claude/tasks/TASK NAME.md.

The plan should be a detailed implementation
plan and the reasoning behind them, as well as
tasks broken down.

If the task require external knowledge or
certain package, also research to get latest
knowledge (Use Task tool for research)
Don't over plan it, always think MVP.
Once you write the plan, firstly ask me to
review it. Do not continue until I approve the
plan.

### While implementing

You should update the plan as you work.
After you complete tasks in the plan, you should
update and append detailed descriptions of the
changes you made, so following tasks can be easily
hand over to other engineers.