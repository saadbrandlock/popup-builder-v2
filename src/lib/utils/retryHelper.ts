/**
 * Retry an async function with exponential backoff.
 */

/**
 * Run an async function, retrying on failure with exponential backoff.
 * @param fn - Async function to run (no args)
 * @param maxRetries - Number of retries after the first attempt (default 3)
 * @param baseDelayMs - Base delay in ms for backoff (default 1000)
 * @returns Promise resolving with the function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError;
}
