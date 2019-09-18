import { DependencyList, useCallback, useState } from 'react';

/**
 * Executes a callback promise worker and handle loading and error states.
 *
 * Errors thrown by the worker are caught and returned as a state.
 *
 * @param worker The callback function that runs a promise.
 * @param deps The callback dependencies.
 *
 * @returns {
 *  callback: The wrapped callback,
 *  error: Any thrown errors (may be undefined)
 *  isLoading: Whether or not the worker is running
 *  setError: `error` state setter
 *  setIsLoading: `isLoading` state setter
 * }
 */
export const useWorker = <TArgs extends any[], TRet>(
  worker: (...args: TArgs) => Promise<TRet>,
  deps: DependencyList,
): {
  isLoading: boolean;
  setIsLoading: (_: boolean) => void;
  setError: (_: Error | undefined) => void;
  error: Error | undefined;
  callback: (...args: TArgs) => Promise<TRet | undefined>;
} => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const callback = useCallback(
    (async (...args: TArgs): Promise<TRet | undefined> => {
      try {
        setIsLoading(true);
        const result = await worker(...args);
        setIsLoading(false);
        setError(undefined);

        return result;
      } catch (e) {
        setIsLoading(false);
        setError(e);
      }
    }) as (...args: any[]) => any,
    deps,
  );

  return { callback, error, isLoading, setError, setIsLoading };
};
