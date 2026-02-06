/**
 * Tries to select the first block/content in the Unlayer editor so the property panel
 * shows edit options by default (client edit mode). Uses Unlayer API if available,
 * otherwise falls back to simulating a click on the first content element in the iframe.
 */

const EDITOR_CONTAINER_ID_CLIENT = 'bl-client-editor';

/** Walk rows/columns|cells/contents and return the first content id found. */
function getFirstContentIdFromSection(section: { rows?: any[] }): string | null {
  const rows = section?.rows;
  if (!Array.isArray(rows)) return null;
  for (const row of rows) {
    const cellsOrColumns = row.cells ?? row.columns;
    if (!Array.isArray(cellsOrColumns)) continue;
    for (const cell of cellsOrColumns) {
      const contents = cell?.contents;
      if (!Array.isArray(contents) || contents.length === 0) continue;
      const id = contents[0]?.id;
      if (id) return id;
    }
  }
  return null;
}

/** Same for header/footer-style sections that have columns directly. */
function getFirstContentIdFromColumns(section: { columns?: any[] }): string | null {
  const columns = section?.columns;
  if (!Array.isArray(columns)) return null;
  for (const col of columns) {
    const contents = col?.contents;
    if (!Array.isArray(contents) || contents.length === 0) continue;
    const id = contents[0]?.id;
    if (id) return id;
  }
  return null;
}

/**
 * Get the first selectable content id from Unlayer design JSON.
 * Supports body.rows[].cells|columns[].contents[] and body.headers/footers[].columns[].contents[].
 */
function getFirstContentId(design: any): string | null {
  if (!design?.body) return null;
  const body = design.body;
  const fromRows = getFirstContentIdFromSection(body);
  if (fromRows) return fromRows;
  const headers = body.headers;
  if (Array.isArray(headers)) {
    for (const h of headers) {
      const id = getFirstContentIdFromColumns(h);
      if (id) return id;
    }
  }
  const footers = body.footers;
  if (Array.isArray(footers)) {
    for (const f of footers) {
      const id = getFirstContentIdFromColumns(f);
      if (id) return id;
    }
  }
  return null;
}

/** Try common Unlayer-style select API names. */
const SELECT_API_NAMES = [
  'selectBlock',
  'selectContent',
  'setSelected',
  'selectElement',
  'setSelectedBlock',
  'selectById',
  'selectContentBlock',
];

/**
 * Try to select the first content block via Unlayer API (if exposed).
 */
function trySelectViaApi(unlayer: any, contentId: string): boolean {
  for (const name of SELECT_API_NAMES) {
    const fn = unlayer[name];
    if (typeof fn !== 'function') continue;
    try {
      fn.call(unlayer, contentId);
      return true;
    } catch {
      // try next
    }
  }
  return false;
}

/**
 * Fallback: simulate click on first content in the editor iframe so the property panel opens.
 * If contentId is provided, tries to find an element with that id (data-id, data-block-id, etc.) first.
 */
function tryClickFirstContentInEditor(editorId: string, contentId?: string | null): void {
  try {
    const container = document.getElementById(editorId);
    if (!container) return;
    const iframe = container.querySelector('iframe');
    if (!iframe?.contentDocument) return;
    const doc = iframe.contentDocument;

    const clickEl = (el: Element) => {
      if (el instanceof HTMLElement) {
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, view: doc.defaultView ?? window }));
      }
    };

    if (contentId) {
      const byIdSelectors = [
        `[data-id="${contentId}"]`,
        `[data-block-id="${contentId}"]`,
        `[data-content-id="${contentId}"]`,
        `[id="${contentId}"]`,
      ];
      for (const sel of byIdSelectors) {
        const el = doc.querySelector(sel);
        if (el) {
          clickEl(el);
          return;
        }
      }
      const byIdContains = doc.querySelectorAll('[data-id], [data-block-id], [data-content-id]');
      for (const el of byIdContains) {
        const id = el.getAttribute('data-id') ?? el.getAttribute('data-block-id') ?? el.getAttribute('data-content-id');
        if (id === contentId) {
          clickEl(el);
          return;
        }
      }
    }

    const selectors = [
      '[data-block-id]',
      '[data-id]',
      '.unlayer-block',
      '[data-type="image"]',
      '[data-type="text"]',
      '[class*="content-block"]',
      '[class*="block-wrapper"]',
      '.unlayer-edit-mode [class*="content"]',
      '[class*="row"] [class*="cell"]',
      '[class*="row"] [class*="column"]',
      'div[contenteditable="true"]',
    ];
    for (const sel of selectors) {
      const el = doc.querySelector(sel);
      if (el && el instanceof HTMLElement) {
        clickEl(el);
        return;
      }
    }
    const canvas = doc.querySelector('[class*="canvas"]') ?? doc.body;
    const firstBlock = canvas?.querySelector('[class*="block"], [class*="content"], [class*="row"] div');
    if (firstBlock) clickEl(firstBlock);
  } catch {
    // avoid breaking the editor
  }
}

/**
 * Registers a one-time design:loaded listener and tries to select the first block
 * so the left property panel shows edit options. Call from onEditorReady in client edit flow.
 * Retries at longer intervals so selection runs after async template load (loadTemplateById).
 */
export function selectFirstBlockWhenReady(unlayer: any, editorId: string = EDITOR_CONTAINER_ID_CLIENT): void {
  let didSelect = false;

  const run = () => {
    if (didSelect) return;
    try {
      unlayer.saveDesign((design: any) => {
        if (didSelect) return;
        const hasBody = design?.body?.rows?.length > 0 || design?.body?.columns?.length > 0;
        if (!hasBody && !design?.body?.headers?.length && !design?.body?.footers?.length) return;
        const firstId = getFirstContentId(design);
        if (firstId && trySelectViaApi(unlayer, firstId)) {
          didSelect = true;
          return;
        }
        tryClickFirstContentInEditor(editorId, firstId ?? undefined);
        didSelect = true;
      });
    } catch {
      // ignore
    }
  };

  try {
    unlayer.addEventListener('design:loaded', () => {
      setTimeout(run, 150);
      setTimeout(run, 500);
    });
    // Retry at intervals so we catch when design is ready (template loads async after onReady)
    [600, 1200, 2000, 3200, 4800, 6500].forEach((ms) => setTimeout(run, ms));
  } catch {
    // avoid breaking the editor
  }
}

/**
 * Hide the Popup tab in the editor sidebar (fallback when tabs.popup.enabled: false is ignored).
 * Call after editor is ready. Looks for tab-like elements with "Popup" text in the editor iframe.
 */
export function hidePopupTabInEditor(editorId: string = EDITOR_CONTAINER_ID_CLIENT): void {
  const hide = () => {
    try {
      const container = document.getElementById(editorId);
      const iframe = container?.querySelector('iframe');
      const doc = iframe?.contentDocument;
      if (!doc) return;
      const all = doc.querySelectorAll('[role="tab"], [class*="tab"], [data-tab]');
      all.forEach((el) => {
        if (el.textContent?.trim().toLowerCase() === 'popup') {
          (el as HTMLElement).style.setProperty('display', 'none', 'important');
        }
      });
    } catch {
      // ignore
    }
  };
  hide();
  setTimeout(hide, 500);
  setTimeout(hide, 1500);
}
