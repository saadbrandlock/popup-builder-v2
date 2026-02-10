/**
 * Helpers for Unlayer editor integration.
 * saveDesignWithTimeout wraps the callback-based saveDesign in a Promise with a timeout.
 */

/**
 * Get current design from Unlayer editor with a timeout to avoid hanging forever.
 * @param editor - Unlayer editor instance (from editorRef.current.editor)
 * @param timeoutMs - Max wait in ms (default 10000)
 * @returns Promise resolving with the design JSON, or rejecting on timeout/error
 */
export function saveDesignWithTimeout(
  editor: { saveDesign: (callback: (design: any) => void) => void },
  timeoutMs = 10000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`saveDesign timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    try {
      editor.saveDesign((design: any) => {
        clearTimeout(timer);
        resolve(design);
      });
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });
}
