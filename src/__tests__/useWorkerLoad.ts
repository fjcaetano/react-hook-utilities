import { renderHook, act } from '@testing-library/react-hooks';

import { useWorkerLoad } from '..';

let callbackFn: jest.Mock;
let initialProps: any;
const thrownError = new Error('error');

beforeEach(() => {
  callbackFn = jest.fn();
  initialProps = { worker: callbackFn };
});

const useHookHelper = ({ worker, initialValue }: any) =>
  useWorkerLoad(worker, initialValue);

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

  expect(result.current.error?.value).toBe(thrownError);
  expect(result.current.error?.retry).not.toBeUndefined();
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

  expect(result.current.error?.value).toEqual(thrownError);
  expect(result.current.error?.retry).not.toBeUndefined();
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

describe('retry', () => {
  it('sets loading true', async () => {
    callbackFn.mockRejectedValue(thrownError);
    const { result, waitForNextUpdate } = renderHook(useHookHelper, {
      initialProps,
    });

    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.error!.retry();
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
    expect(result.current.error?.value).toBe(thrownError);

    await act(result.current.error!.retry);

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
    expect(result.current.error?.value).toBe(thrownError);
    expect(result.current.data).toBeUndefined();

    await act(result.current.error!.retry);

    expect(result.current.data).toBe(val);
    expect(result.current.error).toBeUndefined();
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
      } = renderHook(() => useWorkerLoad(worker));
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
      } = renderHook(() => useWorkerLoad(worker));
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
      } = renderHook(() => useWorkerLoad<number>(worker));
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
      } = renderHook(() => useWorkerLoad(worker, -1));
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
      } = renderHook(() => useWorkerLoad(worker, -1 as number));
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
      } = renderHook(() => useWorkerLoad(worker, undefined));
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
      } = renderHook(() => useWorkerLoad<number | undefined>(worker, -1));
      await waitForNextUpdate();

      const assert1: Assert<ReturnType<typeof worker>, Promise<number>> = true;
      expect(assert1).toBe(true);

      const assert2: Assert<typeof data, number | undefined> = true;
      expect(assert2).toBe(true);
    });
  });
});
