"use client";

/**
 * hooks/use-debounce.ts
 *
 * Debounces a value by the given delay (ms).
 * Use for search inputs to avoid firing on every keystroke.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchValue, 400);
 */

import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}