// Task T036: Create reusable useAsync hook (@specs/002-landing-page-ui/tasks.md §Phase 7, US5)
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseAsyncState<T> {
  isLoading: boolean;
  error: Error | null;
  data: T | null;
}

interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * useAsync Hook
 * Manages async operation state: loading, error, and data
 * Prevents race conditions and handles cleanup
 * 
 * @param asyncFunction - Async function to execute
 * @param options - Optional callbacks for success/error
 * @returns Current state with isLoading, error, and data
 */
export function useAsync<T = void>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    isLoading: false,
    error: null,
    data: null,
  });

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(async () => {
    // Reset state
    setState({ isLoading: true, error: null, data: null });

    try {
      const result = await asyncFunction();

      if (isMountedRef.current) {
        setState({ isLoading: false, error: null, data: result });
        options.onSuccess?.(result);
      }

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      if (isMountedRef.current) {
        setState({ isLoading: false, error: err, data: null });
        options.onError?.(err);
      }

      throw err;
    }
  }, [asyncFunction, options]);

  return {
    ...state,
    execute,
  };
}

/**
 * Hook variant that automatically executes on mount
 */
export function useAsyncEffect<T = void>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList,
  options: UseAsyncOptions = {}
) {
  const { execute, ...state } = useAsync(asyncFunction, options);

  useEffect(() => {
    execute();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
