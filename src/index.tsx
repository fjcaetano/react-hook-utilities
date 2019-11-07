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
 * See [[useAsyncLayoutEffect]] for asynchronous layout effects
 *
 * @param effect the effect to be executed.
 * @param dependencies the effect's dependencies.
 * @category Effects
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
 * See [[useAsyncEffect]] for asynchronous non-layout effects
 *
 * @param effect the layout effect to be executed.
 * @param dependencies the effect's dependencies.
 * @category Effects
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
 * @typeparam TArgs The worker's arguments' types
 * @typeparam TRet The worker's return type
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
 * @typeparam Dependencies The dependencies' tuple type, which is type of the argument received when
 * the effect is executed.
 * @category Effects
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
 * @typeparam Dependencies The dependencies' tuple type, which is type of the argument received when
 * the effect is evaluating if it should be executed.
 * @category Effects
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
 * @category Component Lifecycle
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
 * Any dependencies used inside the effect must be passed as argument, however, the effect is not
 * called when the dependencies change. The effect is only called when the component is being
 * unmounted.
 *
 * @param effect the effect to be executed. May be asynchronous
 * @param dependencies The effect's dependencies.
 * @category Component Lifecycle
 */
export const useDidUnmount = (
  effect: () => void | Promise<void>,
  dependencies?: readonly any[],
) => {
  const unmounting = useRef(false);
  useEffect(
    () => () => {
      unmounting.current = true;
    },
    [],
  );

  useEffect(
    () => () => {
      if (unmounting.current) {
        effect();
      }
    },
    dependencies || [],
  );
};

/**
 * Creates a mutable reference object from a factory function.
 *
 * @param factory A function that returns the object to be referenced
 * @typeparam T The reference's type
 */
export const useLazyRef = <T extends any>(
  factory: () => T,
): MutableRefObject<T> => {
  const ref = useRef<T | undefined>(undefined);

  if (ref.current === void 0 || ref.current === null) {
    ref.current = factory();
  }

  return ref as MutableRefObject<T>;
};

type WorkerLoad<Data> = {
  isLoading: boolean;
  setIsLoading: (_: boolean) => void;
  setError: (_: Error | undefined) => void;
  error: Error | undefined;
  data: Data;
  retry: () => Promise<void>;
};

export function useWorkerLoad<Data>(
  worker: () => Promise<Data | undefined>,
): WorkerLoad<Data | undefined>;

export function useWorkerLoad<Data>(
  worker: () => Promise<Data>,
  initialValue: Data,
): WorkerLoad<Data>;

/**
 * Starts loading a worker immediately and handle loading, error and result states.
 *
 * See [[useWorker]] for more details
 *
 * @param worker An asynchronous function that returns data, which is saved into a state
 * @param initialValue The data's initial value
 */
export function useWorkerLoad<Data>(
  worker: () => Promise<typeof initialValue>,
  initialValue?: Data,
): WorkerLoad<typeof initialValue> {
  const [data, setData] = useState<typeof initialValue>(initialValue);
  const {
    isLoading,
    error,
    setError,
    setIsLoading,
    callback,
  } = useWorker(async () => {
    setData(await worker());
  }, []);

  // start loading immediately
  useDidMount(callback);

  return {
    data,
    isLoading,
    error,
    setIsLoading,
    setError,
    retry: callback,
  };
}
