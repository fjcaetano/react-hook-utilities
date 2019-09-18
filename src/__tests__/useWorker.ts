import { renderHook, act } from '@testing-library/react-hooks';

import { useWorker } from '..';

let callbackFn: jest.Mock;
let initialProps: any;
const thrownError = new Error('error');

beforeEach(() => {
  callbackFn = jest.fn();
  initialProps = { worker: callbackFn };
});

const useHookHelper = <TArgs extends any[], TRet>({ worker }: any) =>
  useWorker<TArgs, TRet>(worker, []);

it('starts without error and loading', () => {
  const {
    result: {
      current: { error, isLoading },
    },
  } = renderHook(useHookHelper, { initialProps });

  expect(error).toEqual(undefined);
  expect(isLoading).toEqual(false);
});

it('sets loading to true when called', async () => {
  const { result } = renderHook(useHookHelper, {
    initialProps,
  });

  const cleanup = act(async () => {
    await result.current.callback();
  });

  expect(result.current.isLoading).toEqual(true);
  await cleanup;
});

it('stops loading at the end', async () => {
  const { result } = renderHook(useHookHelper, { initialProps });

  const prom = act(async () => {
    await result.current.callback();
  });
  expect(result.current.isLoading).toEqual(true);

  await prom;
  expect(result.current.isLoading).toEqual(false);
});

it('stops loading on failure and returns the error', async () => {
  callbackFn.mockRejectedValue(thrownError);
  const { result } = renderHook(useHookHelper, { initialProps });

  await act(async () => {
    await result.current.callback();
  });

  expect(result.current.error).toBe(thrownError);
  expect(result.current.isLoading).toEqual(false);
});

it('sets the error on failure and resets on the second call', async () => {
  callbackFn.mockRejectedValueOnce(thrownError);

  const { result } = renderHook(useHookHelper, { initialProps });

  await act(async () => {
    await result.current.callback();
  });

  expect(result.current.error).toBe(thrownError);

  await act(async () => {
    await result.current.callback();
  });

  expect(result.current.error).toBe(undefined);
});

it('can set error', () => {
  const { result } = renderHook(useHookHelper, { initialProps });

  expect(result.current.error).toBeUndefined();
  act(() => {
    result.current.setError(thrownError);
  });

  expect(result.current.error).toEqual(thrownError);
});

it('can set isLoading', () => {
  const { result } = renderHook(useHookHelper, { initialProps });

  expect(result.current.isLoading).toEqual(false);
  act(() => {
    result.current.setIsLoading(true);
  });

  expect(result.current.isLoading).toEqual(true);
});

it('forwards arguments', async () => {
  const a = 'foobar';
  const b = 'xpto';

  const {
    result: {
      current: { callback },
    },
  } = renderHook(useHookHelper, { initialProps });

  await act(async () => {
    await callback(a, b);
  });

  expect(callbackFn.mock.calls[0]).toEqual([a, b]);
});

it('forwards the returned value', async () => {
  const val = 'foobar';
  callbackFn.mockResolvedValue(val);
  const { result } = renderHook(useHookHelper, { initialProps });

  let dataResult;
  await act(async () => {
    dataResult = await result.current.callback();
  });

  expect(dataResult).toEqual(val);
});
