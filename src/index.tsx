import {
  useEffect,
  useLayoutEffect,
  useCallback,
  useState,
  useRef,
  useMemo,
  MutableRefObject,
} from 'react';

/**
 * The return of a [[useWorkerState]] call.
 *
 * @typeparam Data The worker's return type
 */
export interface WorkerLoad<Data> {
  /** Indicates if the worker is running */
  isLoading: boolean;

  /** The worker's returned value stored in a state */
  data: Data;

  /** The error thrown by the worker's call */
  error?: Error;

  /** Sets [[isLoading]] state manually */
  setIsLoading: (_: boolean) => void;

  /** Sets [[error]] state manually */
  setError: (_: Error | undefined) => void;

  /** Calls the worker again */
  callback: () => Promise<void>;
}

/**
 * A Promise that exposes it's resolvable value as an optional attribute
 *
 * See [[usePromisedState]] for more details.
 *
 * @typeparam T The promise's type
 */
export interface ValuablePromise<T> extends Promise<T> {
  /** The promise's resolved value */
  value?: T;
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
  dependencies: readonly any[] = [],
) => {
  useEffect(() => {
    effect();
  }, [...dependencies, effect]); // eslint-disable-line react-hooks/exhaustive-deps
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
  dependencies: readonly any[] = [],
) => {
  useLayoutEffect(() => {
    effect();
  }, [...dependencies, effect]); // eslint-disable-line react-hooks/exhaustive-deps
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

  const callback = useCallback(
    async (...args: TArgs): Promise<TRet | undefined> => {
      try {
        setIsLoading(true);
        const result = await worker(...args);
        setState({ isLoading: false, error: undefined });

        return result;
      } catch (error) {
        setState({ isLoading: false, error });
      }
    },
    [...dependencies, worker], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return { callback, error, isLoading, setError, setIsLoading };
};

/**
 * Executes a effect and sends to its callback the previous state.
 *
 * @param effect The effect to be executed. Receives the dependencies' previous state as arguments.
 * @param dependencies The effect's dependencies.
 * @hidden
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
 * @hidden
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
 * @hidden
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
 * @hidden
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
 * @hidden
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
 * @hidden
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
 * @hidden
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
 * @hidden
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
 * @hidden
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
 * @hidden
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
  }, [...dependencies, effect]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Conditionally executes an effect.
 *
 * @param evalCondition A function that receives the dependencies' previous state as argument and
 * returns a boolean defining if the effect should be executed.
 * @param effect The effect callback to be executed.
 * @param dependencies The effect's dependencies.
 * @hidden
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
 * @hidden
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
 * @hidden
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
 * @hidden
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
 * @hidden
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
 * @hidden
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
 * @hidden
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
 * @hidden
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
 * @hidden
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
 * @hidden
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
  effect: () => void | (() => void),
  dependencies: Dependencies,
): void;
export function useConditionalEffect<Dependencies extends readonly any[]>(
  evalCondition: (oldState: Dependencies) => boolean,
  effect: () => (() => void) | void,
  dependencies: Dependencies,
): void {
  useEffectUpdate(
    oldState => (evalCondition(oldState) ? effect() : undefined),
    dependencies, // eslint-disable-line @react-hook-utilities/exhaustive-deps
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
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
    dependencies || [], // eslint-disable-line react-hooks/exhaustive-deps
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
  const didInit = useRef(false);
  const ref = useRef<T | undefined>(undefined);

  if (!didInit.current) {
    ref.current = factory();
    didInit.current = true;
  }

  return ref as MutableRefObject<T>;
};

/**
 * Starts loading a worker immediately and handle loading, error and result states.
 *
 * See [[useWorker]] for more details.
 *
 * @param worker An asynchronous function that returns data, which is saved into a state
 * @param dependencies The callback dependencies.
 * @typeparam Data The worker's return type
 * @category Workers
 */
export function useWorkerState<Data>(
  worker: () => Promise<Data | undefined>,
  dependencies: readonly any[],
): WorkerLoad<Data | undefined>;

/**
 * Starts loading a worker immediately and handle loading, error and result states.
 *
 * See [[useWorker]] for more details.
 *
 * @param worker An asynchronous function that returns data, which is saved into a state
 * @param dependencies The callback dependencies.
 * @param initialValue The data's initial value. May be a factory function.
 * @typeparam Data The worker's return type
 * @category Workers
 */
export function useWorkerState<Data>(
  worker: () => Promise<Data>,
  dependencies: readonly any[],
  initialValue: Data | (() => Data),
): WorkerLoad<Data>;

export function useWorkerState<Data>(
  worker: () => Promise<typeof initialValue>,
  dependencies: readonly any[],
  initialValue?: Data | (() => Data),
): WorkerLoad<typeof initialValue> {
  const [data, setData] = useState<typeof initialValue>(initialValue);
  const { isLoading, error, setError, setIsLoading, callback } = useWorker(
    async () => {
      setData(await worker());
    },
    dependencies, // eslint-disable-line @react-hook-utilities/exhaustive-deps
  );

  // start loading immediately
  useDidMount(callback);

  return {
    callback,
    data,
    isLoading,
    setIsLoading,
    setError,
    error,
  };
}

/**
 * A state that only resolves after setting truthy values.
 *
 * If you need to use the promise as a dependency of another hook, use its [[ValuablePromise.value]] attribute as the dependency:
 * ``` ts
 * const [promise] = usePromisedState();
 * useEffect(() => {
 *   ...
 * }, [promise.value]);
 * ```
 *
 * See [[ValuablePromise]] for more details.
 *
 * @returns
 *  0. A [[ValuablePromise]] in the first element of the tuple.
 *  1. A state setter in the second element of the tuple, that will resolve any pending promises.
 * @typeparam T The promise's type
 */
export const usePromisedState = <T,>(): [
  ValuablePromise<T>,
  (_: T) => void,
] => {
  let resolve = useRef<(v: T) => void>();
  const createPromise = useMemo(
    () => (value?: T) => {
      const result: ValuablePromise<T> = new Promise<T>(r => {
        resolve.current = r;
        if (value) {
          r(value);
        }
      });
      result.value = value;
      return result;
    },
    [],
  );

  const [state, setState] = useState(createPromise);
  return [
    state,
    useCallback(
      (newValue: T) => {
        if (!!newValue) {
          resolve.current!(newValue);
          state.value = newValue;
        }

        setState(createPromise(newValue));
      },
      [createPromise, state.value],
    ), // eslint-disable-line @react-hook-utilities/exhaustive-deps
  ];
};
