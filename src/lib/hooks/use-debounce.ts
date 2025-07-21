import React, { useEffect, useState, useCallback } from 'react';

// Debounces a value
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Debounces a callback function
export function useDebouncedCallback<A extends any[]>(
  callback: (...args: A) => void,
  delay: number
): (...args: A) => void {
  // Using ref to store the timeout id to avoid re-creation of debouncedCallback
  // and to ensure cleanup happens correctly.
  const timeoutIdRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []); // Empty dependency array means this effect runs only on mount and unmount

  const debouncedCallback = useCallback(
    (...args: A) => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      timeoutIdRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ); // Dependencies: callback and delay

  return debouncedCallback;
}
