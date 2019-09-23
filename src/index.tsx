import {
  DependencyList,
  useEffect,
  useLayoutEffect,
  useCallback,
  useState,
  useRef,
} from 'react';

/**
 * Executes an asynchronous effect
 *
 * @param effect the effect to be executed.
 * @param deps the effect's dependencies.
 */
export const useAsyncEffect = (
  effect: () => Promise<void>,
  deps?: DependencyList,
) => {
  useEffect(() => {
    effect();
  }, deps);
};

/**
 * Executes a layout effect asynchronously.
 *
 * @param effect the layout effect to be executed.
 * @param deps the effect's dependencies.
 */
export const useAsyncLayoutEffect = (
  effect: () => Promise<void>,
  deps?: DependencyList,
) => {
  useLayoutEffect(() => {
    effect();
  }, deps);
};

/**
 * Executes a callback promise worker and handle loading and error states.
 *
 * Errors thrown by the worker are caught and returned as a state.
 *
 * @param worker The callback function that runs a promise.
 * @param deps The callback dependencies.
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

/**
 * Executes a effect and sends to its callback the previous state.
 *
 * @param effect The effect to be executed. Receives the dependencies' previous state as arguments.
 * @param dependencies The effect's dependencies.
 */
export const useEffectUpdate = <Deps extends ReadonlyArray<any>>(
  effect: (oldState: Deps) => void | (() => void),
  dependencies: Deps,
) => {
  const oldState = useRef<Deps>([] as any);
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
export const useConditionalEffect = <Deps extends ReadonlyArray<any>>(
  evalCondition: (oldState: Deps) => boolean,
  effect: () => (() => void) | void,
  dependencies: Deps,
) => {
  useEffectUpdate(
    oldState => (evalCondition(oldState) ? effect() : undefined),
    dependencies,
  );
};

/**
 * Runs an effect when the component gets mounted.
 *
 * @param effect the effect to be executed.
 */
export const useDidMount = (effect: () => (() => void) | void) => {
  useEffect(effect, []);
};

/**
 * Runs an effect when the component gets unmounted
 *
 * @param effect the effect to be executed.
 */
export const useDidUnmount = (effect: () => void) => {
  useEffect(() => effect, []);
};
