# Coupon Template Builder – Context-Based Development Guide

This guide defines **how we will build and maintain the new Coupon Template Builder** using the PRP (Plan → Reason → Propose) agentic workflow.  The aim is a *clean, scalable, and well-architected* TypeScript/React + NodeJS monorepo as an npm package that follows domain-driven design (DDD) principles while enabling multiple AI agents (windows) to collaborate safely.

---
## 1. Foundations

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
  - Axios (HTTP client) this reference will come the main project as prop where we might it use it
  - Zod (runtime validation)
  - date-fns (date manipulation)

Development:
  - ESLint + Prettier (code quality)
  - Husky (git hooks)
```

3. **Clean-Architecture Layers**
   1. **Domain** – pure business logic, entities, value objects
   2. **Application** – use-cases, service interfaces
   3. **Infrastructure** – API adapters, persistence, external SDKs
   4. **Presentation** – React components, pages, hooks

---
## 2. PRP Workflow for Agents

| Phase | Description | Artifacts |
|-------|-------------|-----------|
| **Plan** | Define intent, success criteria, sub-tasks. Update `plan.md`. | `context/PROGRESS.md` & tool `update_plan` |
| **Reason** | Investigate code, run commands, inspect—without changing code.  Use `find_by_name`, `view_file`, etc. | Comments in chat |
| **Propose** | Make concrete code / doc edits via `write_to_file` or `replace_file_content`.  Summarise impact. | Pull-request or direct edit |

Guidelines:
* **One atomic PRP loop per cohesive task** (e.g., create hook, fix bug).
* **Never couple reasoning & editing**: always explain *why* before a tool call.
* **Keep edits small (<300 LOC)**; large work = split into multiple PRP loops.
* **Sync docs**: after any major change update relevant `.md` in `context/`.

---
## 3. Document Ownership & Sync Rules

Document | Purpose | Maintainer
---------|---------|-----------
`API_SPEC.md` | Swagger-level contract (mirrors backend) | API agent
`PROGRESS.md` | Daily changelog, sprint board, next steps | Scrum-master agent
`DEVELOPMENT_GUIDE.md` | *This file*: working agreement | All agents

* **Editing protocol**: only *one* agent edits a file at a time; acquire a logical lock by adding `<!-- editing: <agent-name> -->` at top, remove when done.
* **Versioning**: Important milestones are copied to `context/history/YYYY-MM-DD-hhmm-<file>.md` by a helper script.

## 4. Coding Standards & Best Practices

* Strong typing; no implicit `any`.
* Use `async/await`; catch & handle errors gracefully.
* Keep components presentational; side-effects live in hooks/services.
* Avoid prop-drilling: use context or hook pagination.
* Prefer functional, pure utilities.
* Write descriptive commit / PR titles following Conventional Commits.

## 5. Glossary

* **PRP** – Plan, Reason, Propose workflow loop.
* **Agent** – A dedicated Cascade window (human or AI) owning a task.
* **Context folder** – Single source of truth documentation inside repo.
* **DDD** – Domain-Driven Design.

---
*Last updated: <!-- auto-update timestamp script -->*
