import { renderHook, act } from '@testing-library/react-hooks';

import { useWorkerState } from '..';
import { useState } from 'react';

let callbackFn: jest.Mock;
let initialProps: any;
const thrownError = new Error('error');

beforeEach(() => {
  callbackFn = jest.fn();
  initialProps = { worker: callbackFn };
});

const useHookHelper = ({ worker, initialValue }: any) =>
  useWorkerState(worker, [], initialValue);

describe('initial values', () => {
  it('starts without error', async () => {
    const {
      result: {
        current: { error },
      },
      waitForNextUpdate,
    } = renderHook(useHookHelper, { initialProps });

    await waitForNextUpdate();

    expect(error).toBeUndefined();
  });

  it('starts without data', async () => {
    const {
      result: {
        current: { data },
      },
      waitForNextUpdate,
    } = renderHook(useHookHelper, { initialProps });

    await waitForNextUpdate();

    expect(data).toBeUndefined();
  });

  it('starts with loading', async () => {
    const {
      result: {
        current: { isLoading },
      },
      waitForNextUpdate,
    } = renderHook(useHookHelper, { initialProps });

    await waitForNextUpdate();

    expect(isLoading).toBe(true);
  });

  it('starts with initial value', async () => {
    const initialValue = 'foobar';
    const {
      result: {
        current: { data },
      },
      waitForNextUpdate,
    } = renderHook(useHookHelper, {
      initialProps: {
        ...initialProps,
        initialValue,
      },
    });

    await waitForNextUpdate();

    expect(data).toBe(initialValue);
  });

  it('may be passed as a factory', async () => {
    const initialValue = 'foobar';
    const {
      result: {
        current: { data },
      },
      waitForNextUpdate,
    } = renderHook(useHookHelper, {
      initialProps: {
        ...initialProps,
        initialValue: () => initialValue,
      },
    });

    await waitForNextUpdate();

    expect(data).toBe(initialValue);
  });
});

it('stops loading when effect resolves', async () => {
  const { result, waitForNextUpdate } = renderHook(useHookHelper, {
    initialProps,
  });

  await waitForNextUpdate();

  expect(result.current.isLoading).toEqual(false);
});

it('stops loading on failure and returns the error', async () => {
  callbackFn.mockRejectedValue(thrownError);
  const { result, waitForNextUpdate } = renderHook(useHookHelper, {
    initialProps,
  });

  await waitForNextUpdate();

  expect(result.current.error).toBe(thrownError);
  expect(result.current.isLoading).toEqual(false);
});

it('updates data with returned value', async () => {
  const val = 'foobar';
  callbackFn.mockResolvedValue(val);
  const { result, waitForNextUpdate } = renderHook(useHookHelper, {
    initialProps,
  });

  await waitForNextUpdate();

  expect(result.current.data).toEqual(val);
});

it('can set error', async () => {
  const { result, waitForNextUpdate } = renderHook(useHookHelper, {
    initialProps,
  });

  await waitForNextUpdate();
  expect(result.current.error).toBeUndefined();
  act(() => {
    result.current.setError(thrownError);
  });

  expect(result.current.error).toEqual(thrownError);
});

it('can set isLoading', async () => {
  const { result, waitForNextUpdate } = renderHook(useHookHelper, {
    initialProps,
  });

  await waitForNextUpdate();
  expect(result.current.isLoading).toEqual(false);
  act(() => {
    result.current.setIsLoading(true);
  });

  expect(result.current.isLoading).toEqual(true);
});

describe('callback', () => {
  it('sets loading true', async () => {
    callbackFn.mockRejectedValue(thrownError);
    const { result, waitForNextUpdate } = renderHook(useHookHelper, {
      initialProps,
    });

    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.callback();
    });

    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate(); // stops errors from being logged
  });

  it('resets error after promise resolves', async () => {
    callbackFn.mockRejectedValueOnce(thrownError);

    const { result, waitForNextUpdate } = renderHook(useHookHelper, {
      initialProps,
    });

    await waitForNextUpdate();
    expect(result.current.error).toBe(thrownError);

    await act(result.current.callback);

    expect(result.current.error).toBeUndefined();
  });

  it('updates data after retry on error', async () => {
    const val = 'foobar';
    callbackFn.mockResolvedValue(val);
    callbackFn.mockRejectedValueOnce(thrownError);

    const { result, waitForNextUpdate } = renderHook(useHookHelper, {
      initialProps,
    });

    await waitForNextUpdate();
    expect(result.current.error).toBe(thrownError);
    expect(result.current.data).toBeUndefined();

    await act(result.current.callback);

    expect(result.current.data).toBe(val);
    expect(result.current.error).toBeUndefined();
  });

  it('updates the scope of the callback', async () => {
    const useHook = () => {
      const [state, setState] = useState(0);
      const worker = useWorkerState(async () => {
        callbackFn(state);
      }, [state]);
      return { state, setState, ...worker };
    };

    const { result, waitForNextUpdate } = renderHook(useHook);

    expect(callbackFn.mock.calls[0][0]).toBe(0);

    act(() => {
      result.current.setState(1);
    });

    await waitForNextUpdate();

    act(() => {
      result.current.callback();
    });

    await waitForNextUpdate();

    expect(callbackFn.mock.calls[1][0]).toBe(1);
  });
});

/// These tests won't fail their execution, but the type-checking instead.
describe('test types', () => {
  type Assert<T, Expected> = T extends Expected
    ? Expected extends T
      ? true
      : never
    : never;

  describe('`initialValue` is unset', () => {
    it('infers `data` may be undefined when `worker` returns mandatory type', async () => {
      const worker = async () => 'string';
      const {
        result: {
          current: { data },
        },
        waitForNextUpdate,
      } = renderHook(() => useWorkerState(worker, []));
      await waitForNextUpdate();

      const assert1: Assert<ReturnType<typeof worker>, Promise<string>> = true;
      expect(assert1).toBe(true);

      const assert2: Assert<typeof data, string | undefined> = true;
      expect(assert2).toBe(true);
    });

    it('infers `data` is undefined when `worker` returns undefined type', async () => {
      const worker = async () => undefined;
      const {
        result: {
          current: { data },
        },
        waitForNextUpdate,
      } = renderHook(() => useWorkerState(worker, []));
      await waitForNextUpdate();

      const assert1: Assert<
        ReturnType<typeof worker>,
        Promise<undefined>
      > = true;
      expect(assert1).toBe(true);

      const assert2: Assert<typeof data, undefined> = true;
      expect(assert2).toBe(true);
    });

    it('forces `data` to be undefined even when type is explicitly set', async () => {
      const worker = async () => undefined;
      const {
        result: {
          current: { data },
        },
        waitForNextUpdate,
      } = renderHook(() => useWorkerState<number>(worker, []));
      await waitForNextUpdate();

      const assert1: Assert<
        ReturnType<typeof worker>,
        Promise<undefined>
      > = true;
      expect(assert1).toBe(true);

      const assert2: Assert<typeof data, undefined> = true;
      expect(assert2).toBe(true);
    });
  });

  describe('has `initialValue`', () => {
    it('infers `data` from `initialValue', async () => {
      const worker = async () => 0;
      const {
        result: {
          current: { data },
        },
        waitForNextUpdate,
      } = renderHook(() => useWorkerState(worker, [], -1));
      await waitForNextUpdate();

      const assert1: Assert<ReturnType<typeof worker>, Promise<number>> = true;
      expect(assert1).toBe(true);

      const assert2: Assert<typeof data, number> = true;
      expect(assert2).toBe(true);
    });

    it("infers `data` may be undefined from `worker`'s return type", async () => {
      const worker = async () => undefined;
      const {
        result: {
          current: { data },
        },
        waitForNextUpdate,
      } = renderHook(() => useWorkerState(worker, [], -1 as number));
      await waitForNextUpdate();

      const assert1: Assert<
        ReturnType<typeof worker>,
        Promise<undefined>
      > = true;
      expect(assert1).toBe(true);

      const assert2: Assert<typeof data, number | undefined> = true;
      expect(assert2).toBe(true);
    });

    it('infers `data` might be undefined from `initialValue`s type', async () => {
      const worker = async () => 1;
      const {
        result: {
          current: { data },
        },
        waitForNextUpdate,
      } = renderHook(() => useWorkerState(worker, [], undefined));
      await waitForNextUpdate();

      const assert1: Assert<ReturnType<typeof worker>, Promise<number>> = true;
      expect(assert1).toBe(true);

      const assert2: Assert<typeof data, number | undefined> = true;
      expect(assert2).toBe(true);
    });

    it('allows `data` to be undefined when type is explicitly set', async () => {
      const worker = async () => 0;
      const {
        result: {
          current: { data },
        },
        waitForNextUpdate,
      } = renderHook(() => useWorkerState<number | undefined>(worker, [], -1));
      await waitForNextUpdate();

      const assert1: Assert<ReturnType<typeof worker>, Promise<number>> = true;
      expect(assert1).toBe(true);

      const assert2: Assert<typeof data, number | undefined> = true;
      expect(assert2).toBe(true);
    });
  });
});
