# Coupon Template Builder – User-Story Feature Map

This document breaks the full product flow into **actionable user stories** with acceptance criteria.  Each story will later be linked to a task ID in `context/PROGRESS.md` and owned by an AI agent inside a PRP loop.

> Legend  
> **A/C** – Acceptance Criteria  
> **API** – Expected endpoint from `context/API_SPEC.md`  
> **🔧** – Missing API (document in `REQUIREMENTS.md`)

---
## 1. Admin – Base Template Workflow

### Epic 1.1  Create & Configure Template *(Config Step)*
| ID | User Story | A/C | API |
|----|------------|-----|-----|
| ADM-01 | *As an **Admin**, I can open a **“New Template”* form to input name, description, devices, accounts and canvas type (single-row only) so that I can initialise a template.* | • “Create Template” button navigates to `/generator`  <br>• Form fields validate (required name & devices)  <br>• **Success** ⇒ receives **templateId** and redirects to `/generator/{templateId}/edit` | `POST /template-builder/config/templates` |

### Epic 1.2  Design / Builder *(Drag-and-Drop)*
| ID | User Story | A/C | API |
|----|------------|-----|-----|
| ADM-02 | *As an Admin, I can drag predefined components into the single content row so that I can design the template.* | • Component palette visible  <br>• Canvas uses one content zone  <br>• Adding/removing components updates local builder state | Local state only |
| ADM-03 | *The builder **autosaves** every 5 s or on change.* | • Autosave triggers `PUT /template-builder/config/templates/{id}` with latest `builder_state_json`  <br>• Success toast “Saved” | same as above |
| ADM-04 | *I can toggle **Preview Mode** to view a read-only render.* | • Preview button toggles canvas to non-editable view | n/a |
| ADM-05 | *I can view **version history** of a template.* | • Sidebar lists versions (v1…vN) with timestamps | 🔧 `/template-builder/config/templates/{id}/versions` (missing) |

### Epic 1.3  Publish & Listing
| ID | User Story | A/C | API |
|----|------------|-----|-----|
| ADM-06 | *I can see a list of all templates with filters (status, device, search).* | • Table paginated & searchable  | `GET /template-builder/templates` |
| ADM-07 | *I can **publish** a template.* | • Publish button calls API  <br>• Status → “published”, actions disabled  | `POST /template-builder/config/templates/{id}/publish` |
| ADM-08 | *Published templates **cannot be deleted**; delete hidden.* | • Delete icon hidden when status = published | UI only |

---
## 2. Admin – Custom-Coded Templates

### Epic 2.1  Select Premade Code Template
| ID | Story | A/C | API |
|----|-------|-----|-----|
| ADM-09 | *Admin can browse premade HTML/CSS templates.* | • Grid shows cards (title, thumbnail)  | Frontend assets |
| ADM-10 | *On select, reuse Config Step (ADM-01).* | • Prefills canvas_type = `custom` | same as ADM-01 |

### Epic 2.2  Code Editor Screen
| ID | Story | A/C | API |
|----|-------|-----|-----|
| ADM-11 | *Admin views split-pane code editor + live preview.* | • Monaco editor left, iframe right | UI |
| ADM-12 | *Code autosaves every 5 s.* | • `PUT /template-builder/custom-templates/{id}` | Provided |
| ADM-13 | *Validation API shows errors before save.* | • On blur or Ctrl+S call validation  | `POST /template-builder/custom-templates/validate` |

---
## 3. Admin – Canned Content Management

| ID | Story | A/C | API |
|----|-------|-----|-----|
| ADM-14 | *Admin can list, search, filter canned contents.* | Table with pagination | `GET /template-builder/canned-content` |
| ADM-15 | *Admin can add / edit / delete canned content.* | CRUD dialogs validate fields | POST / PUT / DELETE endpoints |

---
## 4. Client – Template Landing & Review

### Epic 4.1  Landing Preview
| ID | Story | A/C | API |
|----|-------|-----|-----|
| CLI-01 | *As a **Client**, I see a landing page with previews of my assigned published templates.* | • Thumbnails show latest version  | `GET /template-designer/templates/{shopperId}?device={id}` |

### Epic 4.2  Three-Step Review Wizard
| ID | Story | A/C | API |
|----|-------|-----|-----|
| CLI-02 | *Step 1 – Review Desktop layout* | • Render desktop preview  | n/a |
| CLI-03 | *Step 2 – Review Mobile layout* | • Render mobile preview  | n/a |
| CLI-04 | *Step 3 – Content editing form populated from canned content fields* | • Inputs bound to customization config  | `/template-designer/customization` |
| CLI-05 | *Client can leave notes / approval status.* | • Submit button saves status+notes  | 🔧 `POST /template-designer/customization/{id}/review` |

### Epic 4.3  Designer-Limited Edit Mode
| ID | Story | A/C | API |
|----|-------|-----|-----|
| CLI-06 | *Client can change design properties (colours, font sizes) but **not** structure.* | • Property panel only shows customizable props | Frontend rule |
| CLI-07 | *Edits autosave to customization.* | • `PUT /template-designer/customization/{id}`  | Provided |

---
## 5. Admin – Approve Client Changes
| ID | Story | A/C | API |
|----|-------|-----|-----|
| ADM-16 | *Admin reviews client customization in an approval queue.* | • List shows pending items | 🔧 `GET /template-builder/customization-approvals` |
| ADM-17 | *Admin can approve or request changes.* | • Approve persists status; request changes notifies client | 🔧 `POST /template-builder/customization-approvals/{id}/action` |

---
## 6. Cross-Cutting Stories

| ID | Story | A/C | API |
|----|-------|-----|-----|
| SYS-01 | *Authentication required for every request.* | • 401 when token missing/expired | Existing |
| SYS-02 | *Role-based permissions (admin, client).* | • UI & API enforce RBAC | Existing |
| SYS-03 | *Global error & success toasts.* | • Standardised toast component | Frontend |
| SYS-04 | *Loading indicators (spinners) follow uploader progress fix (see memories).* | • Spinner hides on `uploadProgress.uploading == 0` | n/a |

---
### 📋  Next Steps
1. Link each story to a task in `context/PROGRESS.md` (`[ ] ADM-01 – Scaffold template config form` …).  
2. Add missing API definitions to `context/REQUIREMENTS.md`.
3. Implement stories in priority order.

*Last updated: 2025-07-20*
