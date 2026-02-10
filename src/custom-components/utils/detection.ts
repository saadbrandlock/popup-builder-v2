import { getComponent, type CustomComponentDefinition } from '../registry';

export interface DetectedComponent {
  componentId: string;
  componentDef: CustomComponentDefinition;
  currentProps: Record<string, unknown>;
  htmlBlockId: string;
  rawHtml: string;
}

/**
 * Parse an HTML string to detect if it contains a custom component.
 * Returns null if not a custom component.
 */
export function detectCustomComponent(html: string): { componentId: string; props: Record<string, unknown> } | null {
  if (!html) return null;

  const componentMatch = html.match(/data-component="([^"]+)"/);
  if (!componentMatch) return null;

  const componentId = componentMatch[1];

  const propsMatch = html.match(/data-props='([^']*(?:\\'[^']*)*)'/);
  let props: Record<string, unknown> = {};

  if (propsMatch) {
    try {
      const unescaped = propsMatch[1].replace(/\\'/g, "'");
      props = JSON.parse(unescaped) as Record<string, unknown>;
    } catch {
      console.warn('Failed to parse component props:', propsMatch[1]);
    }
  }

  return { componentId, props };
}

/**
 * Scan entire design JSON to find all custom components.
 */
export function findAllCustomComponentsInDesign(design: unknown): DetectedComponent[] {
  const results: DetectedComponent[] = [];
  const body = (design as { body?: { rows?: unknown[] } })?.body;
  const rows = body?.rows;
  if (!Array.isArray(rows)) return results;

  for (const row of rows) {
    const columns = (row as { columns?: unknown[] }).columns;
    if (!Array.isArray(columns)) continue;
    for (const col of columns) {
      const contents = (col as { contents?: unknown[] }).contents;
      if (!Array.isArray(contents)) continue;
      for (const content of contents) {
        const c = content as { id?: string; type?: string; values?: { html?: string } };
        if (c.type === 'html' && c.values?.html) {
          const detected = detectCustomComponent(c.values.html);
          if (detected) {
            const compDef = getComponent(detected.componentId);
            if (compDef) {
              results.push({
                componentId: detected.componentId,
                componentDef: compDef,
                currentProps: detected.props,
                htmlBlockId: c.id ?? '',
                rawHtml: c.values.html,
              });
            }
          }
        }
      }
    }
  }

  return results;
}
