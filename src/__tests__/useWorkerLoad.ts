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

describe('retry', () => {
  it('sets loading true', async () => {
    const { result, waitForNextUpdate } = renderHook(useHookHelper, {
      initialProps,
    });

    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.retry();
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

    await act(result.current.retry);

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

    await act(result.current.retry);

    expect(result.current.data).toBe(val);
  });
});
