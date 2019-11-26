import {
  useEffect,
  useLayoutEffect,
  useCallback,
  useState,
  useRef,
  MutableRefObject,
} from 'react';

/**
 * The return of a [[useWorkerLoad]] call.
 *
 * See [[RetryWorkerError]] for errors.
 *
 * @typeparam Data The worker's return type
 */
interface WorkerLoad<Data> {
  /** Indicates if the worker is running */
  isLoading: boolean;

  /** The worker's returned value stored in a state */
  data: Data;

  /** An optional object that contains any thrown errors, if any, and a retry function */
  error?: RetryWorkerError;

  /** Sets [[isLoading]] state manually */
  setIsLoading: (_: boolean) => void;

  /** Sets [[error]] state manually */
  setError: (_: Error | undefined) => void;
}

/**
 * Encapsulates [[useWorkerLoad]]'s errors and retry function
 */
interface RetryWorkerError {
  /** The error thrown by the worker's call */
  value: Error;

  /** Calls the worker again */
  retry: () => Promise<void>;
}

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
 * @category Workers
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
  const [{ isLoading, error }, setState] = useState({
    isLoading: false,
    error: undefined as Error | undefined,
  });

  const setError = useCallback((error: Error | undefined) => {
    setState(s => ({ ...s, error }));
  }, []);

  const setIsLoading = useCallback((isLoading: boolean) => {
    setState(s => ({ ...s, isLoading }));
  }, []);

  const callback = useCallback(async (...args: TArgs): Promise<
    TRet | undefined
  > => {
    try {
      setIsLoading(true);
      const result = await worker(...args);
      setState({ isLoading: false, error: undefined });

      return result;
    } catch (error) {
      setState({ isLoading: false, error });
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
export function useEffectUpdate<T1>(
  effect: (oldState: [T1]) => void | (() => void),
  dependencies: [T1],
): void;

/**
 * Executes a effect and sends to its callback the previous state.
 *
 * @param effect The effect to be executed. Receives the dependencies' previous state as arguments.
 * @param dependencies The effect's dependencies.
 */
export function useEffectUpdate<T1, T2>(
  effect: (oldState: [T1, T2]) => void | (() => void),
  dependencies: [T1, T2],
): void;

/**
 * Executes a effect and sends to its callback the previous state.
 *
 * @param effect The effect to be executed. Receives the dependencies' previous state as arguments.
 * @param dependencies The effect's dependencies.
 */
export function useEffectUpdate<T1, T2, T3>(
  effect: (oldState: [T1, T2, T3]) => void | (() => void),
  dependencies: [T1, T2, T3],
): void;

/**
 * Executes a effect and sends to its callback the previous state.
 *
 * @param effect The effect to be executed. Receives the dependencies' previous state as arguments.
 * @param dependencies The effect's dependencies.
 * @category Effects
 */
export function useEffectUpdate<T1, T2, T3, T4>(
  effect: (oldState: [T1, T2, T3, T4]) => void | (() => void),
  dependencies: [T1, T2, T3, T4],
): void;

/**
 * Executes a effect and sends to its callback the previous state.
 *
 * @param effect The effect to be executed. Receives the dependencies' previous state as arguments.
 * @param dependencies The effect's dependencies.
 */
export function useEffectUpdate<T1, T2, T3, T4, T5>(
  effect: (oldState: [T1, T2, T3, T4, T5]) => void | (() => void),
  dependencies: [T1, T2, T3, T4, T5],
): void;

/**
 * Executes a effect and sends to its callback the previous state.
 *
 * @param effect The effect to be executed. Receives the dependencies' previous state as arguments.
 * @param dependencies The effect's dependencies.
 */
export function useEffectUpdate<T1, T2, T3, T4, T5, T6>(
  effect: (oldState: [T1, T2, T3, T4, T5, T6]) => void | (() => void),
  dependencies: [T1, T2, T3, T4, T5, T6],
): void;

/**
 * Executes a effect and sends to its callback the previous state.
 *
 * @param effect The effect to be executed. Receives the dependencies' previous state as arguments.
 * @param dependencies The effect's dependencies.
 */
export function useEffectUpdate<T1, T2, T3, T4, T5, T6, T7>(
  effect: (oldState: [T1, T2, T3, T4, T5, T6, T7]) => void | (() => void),
  dependencies: [T1, T2, T3, T4, T5, T6, T7],
): void;

/**
 * Executes a effect and sends to its callback the previous state.
 *
 * @param effect The effect to be executed. Receives the dependencies' previous state as arguments.
 * @param dependencies The effect's dependencies.
 */
export function useEffectUpdate<T1, T2, T3, T4, T5, T6, T7, T8>(
  effect: (oldState: [T1, T2, T3, T4, T5, T6, T7, T8]) => void | (() => void),
  dependencies: [T1, T2, T3, T4, T5, T6, T7, T8],
): void;

/**
 * Executes a effect and sends to its callback the previous state.
 *
 * @param effect The effect to be executed. Receives the dependencies' previous state as arguments.
 * @param dependencies The effect's dependencies.
 */
export function useEffectUpdate<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  effect: (
    oldState: [T1, T2, T3, T4, T5, T6, T7, T8, T9],
  ) => void | (() => void),
  dependencies: [T1, T2, T3, T4, T5, T6, T7, T8, T9],
): void;

/**
 * Executes a effect and sends to its callback the previous state.
 *
 * @param effect The effect to be executed. Receives the dependencies' previous state as arguments.
 * @param dependencies The effect's dependencies.
 */
export function useEffectUpdate<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  effect: (
    oldState: [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10],
  ) => void | (() => void),
  dependencies: [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10],
): void;

/**
 * Executes a effect and sends to its callback the previous state.
 *
 * @param effect The effect to be executed. Receives the dependencies' previous state as arguments.
 * @param dependencies The effect's dependencies.
 * @typeparam Dependencies The dependencies' tuple type, which is type of the argument received when
 * the effect is executed.
 * @category Effects
 */
export function useEffectUpdate<Dependencies extends readonly any[]>(
  effect: (oldState: Dependencies) => void | (() => void),
  dependencies: Dependencies,
): void;

export function useEffectUpdate<Dependencies extends readonly any[]>(
  effect: (oldState: Dependencies) => void | (() => void),
  dependencies: Dependencies,
): void {
  const oldState = useRef<Dependencies>([] as any);
  useEffect(() => {
    try {
      return effect(oldState.current);
    } finally {
      oldState.current = dependencies;
    }
  }, dependencies);
}

/**
 * Conditionally executes an effect.
 *
 * @param evalCondition A function that receives the dependencies' previous state as argument and
 * returns a boolean defining if the effect should be executed.
 * @param effect The effect callback to be executed.
 * @param dependencies The effect's dependencies.
 */
export function useConditionalEffect<T1>(
  evalCondition: (oldState: [T1]) => boolean,
  effect: () => (() => void) | void,
  dependencies: [T1],
): void;

/**
 * Conditionally executes an effect.
 *
 * @param evalCondition A function that receives the dependencies' previous state as argument and
 * returns a boolean defining if the effect should be executed.
 * @param effect The effect callback to be executed.
 * @param dependencies The effect's dependencies.
 */
export function useConditionalEffect<T1, T2>(
  evalCondition: (oldState: [T1, T2]) => boolean,
  effect: () => (() => void) | void,
  dependencies: [T1, T2],
): void;

/**
 * Conditionally executes an effect.
 *
 * @param evalCondition A function that receives the dependencies' previous state as argument and
 * returns a boolean defining if the effect should be executed.
 * @param effect The effect callback to be executed.
 * @param dependencies The effect's dependencies.
 */
export function useConditionalEffect<T1, T2, T3>(
  evalCondition: (oldState: [T1, T2, T3]) => boolean,
  effect: () => (() => void) | void,
  dependencies: [T1, T2, T3],
): void;

/**
 * Conditionally executes an effect.
 *
 * @param evalCondition A function that receives the dependencies' previous state as argument and
 * returns a boolean defining if the effect should be executed.
 * @param effect The effect callback to be executed.
 * @param dependencies The effect's dependencies.
 */
export function useConditionalEffect<T1, T2, T3, T4>(
  evalCondition: (oldState: [T1, T2, T3, T4]) => boolean,
  effect: () => (() => void) | void,
  dependencies: [T1, T2, T3, T4],
): void;

/**
 * Conditionally executes an effect.
 *
 * @param evalCondition A function that receives the dependencies' previous state as argument and
 * returns a boolean defining if the effect should be executed.
 * @param effect The effect callback to be executed.
 * @param dependencies The effect's dependencies.
 */
export function useConditionalEffect<T1, T2, T3, T4, T5>(
  evalCondition: (oldState: [T1, T2, T3, T4, T5]) => boolean,
  effect: () => (() => void) | void,
  dependencies: [T1, T2, T3, T4, T5],
): void;

/**
 * Conditionally executes an effect.
 *
 * @param evalCondition A function that receives the dependencies' previous state as argument and
 * returns a boolean defining if the effect should be executed.
 * @param effect The effect callback to be executed.
 * @param dependencies The effect's dependencies.
 */
export function useConditionalEffect<T1, T2, T3, T4, T5, T6>(
  evalCondition: (oldState: [T1, T2, T3, T4, T5, T6]) => boolean,
  effect: () => (() => void) | void,
  dependencies: [T1, T2, T3, T4, T5, T6],
): void;

/**
 * Conditionally executes an effect.
 *
 * @param evalCondition A function that receives the dependencies' previous state as argument and
 * returns a boolean defining if the effect should be executed.
 * @param effect The effect callback to be executed.
 * @param dependencies The effect's dependencies.
 */
export function useConditionalEffect<T1, T2, T3, T4, T5, T6, T7>(
  evalCondition: (oldState: [T1, T2, T3, T4, T5, T6, T7]) => boolean,
  effect: () => (() => void) | void,
  dependencies: [T1, T2, T3, T4, T5, T6, T7],
): void;

/**
 * Conditionally executes an effect.
 *
 * @param evalCondition A function that receives the dependencies' previous state as argument and
 * returns a boolean defining if the effect should be executed.
 * @param effect The effect callback to be executed.
 * @param dependencies The effect's dependencies.
 */
export function useConditionalEffect<T1, T2, T3, T4, T5, T6, T7, T8>(
  evalCondition: (oldState: [T1, T2, T3, T4, T5, T6, T7, T8]) => boolean,
  effect: () => (() => void) | void,
  dependencies: [T1, T2, T3, T4, T5, T6, T7, T8],
): void;

/**
 * Conditionally executes an effect.
 *
 * @param evalCondition A function that receives the dependencies' previous state as argument and
 * returns a boolean defining if the effect should be executed.
 * @param effect The effect callback to be executed.
 * @param dependencies The effect's dependencies.
 */
export function useConditionalEffect<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  evalCondition: (oldState: [T1, T2, T3, T4, T5, T6, T7, T8, T9]) => boolean,
  effect: () => (() => void) | void,
  dependencies: [T1, T2, T3, T4, T5, T6, T7, T8, T9],
): void;

/**
 * Conditionally executes an effect.
 *
 * @param evalCondition A function that receives the dependencies' previous state as argument and
 * returns a boolean defining if the effect should be executed.
 * @param effect The effect callback to be executed.
 * @param dependencies The effect's dependencies.
 */
export function useConditionalEffect<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  evalCondition: (
    oldState: [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10],
  ) => boolean,
  effect: () => (() => void) | void,
  dependencies: [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10],
): void;

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
export function useConditionalEffect<Dependencies extends readonly any[]>(
  evalCondition: (oldState: Dependencies) => boolean,
  effect: () => (() => void) | void,
  dependencies: Dependencies,
): void;
export function useConditionalEffect<Dependencies extends readonly any[]>(
  evalCondition: (oldState: Dependencies) => boolean,
  effect: () => (() => void) | void,
  dependencies: Dependencies,
): void {
  useEffectUpdate(
    oldState => (evalCondition(oldState) ? effect() : undefined),
    dependencies,
  );
}

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

/**
 * Starts loading a worker immediately and handle loading, error and result states.
 *
 * See [[useWorker]] for more details.
 *
 * @param worker An asynchronous function that returns data, which is saved into a state
 * @typeparam Data The worker's return type
 * @category Workers
 */
export function useWorkerLoad<Data>(
  worker: () => Promise<Data | undefined>,
): WorkerLoad<Data | undefined>;

/**
 * Starts loading a worker immediately and handle loading, error and result states.
 *
 * See [[useWorker]] for more details.
 *
 * @param worker An asynchronous function that returns data, which is saved into a state
 * @param initialValue The data's initial value
 * @typeparam Data The worker's return type
 * @category Workers
 */
export function useWorkerLoad<Data>(
  worker: () => Promise<Data>,
  initialValue: Data,
): WorkerLoad<Data>;

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
    setIsLoading,
    setError,
    error: error && {
      value: error,
      retry: callback,
    },
  };
}
