import {
  useEffect,
  useLayoutEffect,
  useCallback,
  useState,
  useRef,
  MutableRefObject,
} from 'react';

/**
 * Executes an asynchronous effect
 *
 * @param effect the effect to be executed.
 * @param dependencies the effect's dependencies.
 */
export const useAsyncEffect = (
  effect: () => Promise<void>,
  dependencies?: readonly any[],
) => {
  useEffect(() => {
    effect();
  }, dependencies);
};

/**
 * Executes a layout effect asynchronously.
 *
 * @param effect the layout effect to be executed.
 * @param dependencies the effect's dependencies.
 */
export const useAsyncLayoutEffect = (
  effect: () => Promise<void>,
  dependencies?: readonly any[],
) => {
  useLayoutEffect(() => {
    effect();
  }, dependencies);
};

/**
 * Executes a callback promise worker and handle loading and error states.
 *
 * Errors thrown by the worker are caught and returned as a state.
 *
 * @param worker The callback function that runs a promise.
 * @param dependencies The callback dependencies.
 */
export const useWorker = <TArgs extends readonly any[], TRet>(
  worker: (...args: TArgs) => Promise<TRet>,
  dependencies: readonly any[],
): {
  isLoading: boolean;
  setIsLoading: (_: boolean) => void;
  setError: (_: Error | undefined) => void;
  error: Error | undefined;
  callback: (...args: TArgs) => Promise<TRet | undefined>;
} => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const callback = useCallback(async (...args: TArgs): Promise<
    TRet | undefined
  > => {
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
  }, dependencies);

  return { callback, error, isLoading, setError, setIsLoading };
};

/**
 * Executes a effect and sends to its callback the previous state.
 *
 * @param effect The effect to be executed. Receives the dependencies' previous state as arguments.
 * @param dependencies The effect's dependencies.
 */
export const useEffectUpdate = <Dependencies extends readonly any[]>(
  effect: (oldState: Dependencies) => void | (() => void),
  dependencies: Dependencies,
) => {
  const oldState = useRef<Dependencies>([] as any);
  useEffect(() => {
    try {
      return effect(oldState.current);
    } finally {
      oldState.current = dependencies;
    }
  }, dependencies);
};

/**
 * Conditionally executes an effect.
 *
 * @param evalCondition A function that receives the dependencies' previous state as argument and
 * returns a boolean defining if the effect should be executed.
 * @param effect The effect callback to be executed.
 * @param dependencies The effect's dependencies.
 */
export const useConditionalEffect = <Dependencies extends readonly any[]>(
  evalCondition: (oldState: Dependencies) => boolean,
  effect: () => (() => void) | void,
  dependencies: Dependencies,
) => {
  useEffectUpdate(
    oldState => (evalCondition(oldState) ? effect() : undefined),
    dependencies,
  );
};

/**
 * Runs an effect when the component gets mounted.
 *
 * @param effect the effect to be executed. May be asynchronous
 */
export const useDidMount = (
  effect: () => (() => void) | void | Promise<void>,
) => {
  useEffect(() => {
    const result = effect();
    if (typeof result === 'function') {
      return result;
    }
  }, []);
};

/**
 * Runs an effect when the component gets unmounted
 *
 * @param effect the effect to be executed. May be asynchronous
 */
export const useDidUnmount = (effect: () => void | Promise<void>) => {
  useEffect(
    () => () => {
      effect();
    },
    [],
  );
};

/**
 * Creates a mutable reference object from a factory function.
 *
 * @param factory A function that returns the object to be referenced
 */
export const useLazyRef = <T extends any, Dependencies extends readonly any[]>(
  factory: () => T,
): MutableRefObject<T> => {
  const initialValue = useRef<MutableRefObject<T> | undefined>(undefined);
  return initialValue.current || (initialValue.current = useRef(factory()));
};
