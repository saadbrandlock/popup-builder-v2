import { getComponent } from '../registry';

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Walk through the Unlayer design JSON and update a specific HTML block's content.
 * Returns a new design object (does not mutate the original).
 */
export function updateComponentInDesign(
  design: unknown,
  htmlBlockId: string,
  newHtml: string
): unknown {
  const updatedDesign = JSON.parse(JSON.stringify(design)) as {
    body?: { rows?: Array<{ columns?: Array<{ contents?: unknown[] }> }> };
  };

  const rows = updatedDesign?.body?.rows;
  if (!Array.isArray(rows)) return updatedDesign;

  for (const row of rows) {
    const columns = row.columns;
    if (!Array.isArray(columns)) continue;
    for (const col of columns) {
      const contents = col.contents;
      if (!Array.isArray(contents)) continue;
      for (const content of contents) {
        const c = content as { id?: string; type?: string; values?: { html?: string } };
        if (c.id === htmlBlockId && c.type === 'html' && c.values) {
          c.values.html = newHtml;
          return updatedDesign;
        }
      }
    }
  }

  console.warn(`HTML block with ID ${htmlBlockId} not found in design`);
  return updatedDesign;
}

/**
 * Inject a new custom component as a new row at the end of the design.
 */
export function injectComponentRow(design: unknown, componentId: string): unknown {
  const comp = getComponent(componentId);
  if (!comp) return design;

  const updatedDesign = JSON.parse(JSON.stringify(design)) as {
    body?: { rows?: unknown[]; id?: string };
  };

  const html = comp.render(comp.defaultProps as Record<string, unknown>);
  const contentId = `cust_${Date.now()}_${randomId()}`;
  const columnId = `cust_col_${Date.now()}_${randomId()}`;
  const rowId = `cust_row_${Date.now()}_${randomId()}`;

  const newRow = {
    id: rowId,
    cells: [1],
    columns: [
      {
        id: columnId,
        contents: [
          {
            id: contentId,
            type: 'html',
            values: {
              html,
              containerPadding: '10px',
              _meta: { htmlID: contentId, htmlClassNames: '' },
            },
          },
        ],
        values: {},
      },
    ],
    values: {
      displayCondition: null,
      columns: false,
      backgroundColor: '',
      columnsBackgroundColor: '',
      backgroundImage: {
        url: '',
        fullWidth: true,
        repeat: false,
        center: true,
        cover: false,
      },
      padding: '0px',
      anchor: '',
      hideDesktop: false,
      _meta: { htmlID: rowId, htmlClassNames: 'u_row' },
      selectable: true,
      draggable: true,
      duplicatable: true,
      deletable: true,
      hideable: true,
    },
  };

  const d = updatedDesign as { body?: { id?: string; rows?: unknown[] } };
  if (!d.body) d.body = { id: 'body', rows: [] };
  if (!d.body.rows) d.body.rows = [];
  d.body.rows.push(newRow);

  return updatedDesign;
}
