import { renderHook, act } from '@testing-library/react-hooks';

import { usePromisedState } from '..';

describe('non-nullable, non-undefined state type', () => {
  const useHookHelper = () => usePromisedState<number>();

  it("does not resolve promise if set isn't called", () => {
    let resolved = false;
    const {
      result: {
        current: [promise],
      },
    } = renderHook(useHookHelper);

    promise.then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);
    expect(promise.value).toBeUndefined();
  });

  it('resolves an existing promise when the state is set', async () => {
    let resolved = false;
    const {
      result: {
        current: [promise, set],
      },
    } = renderHook(useHookHelper);

    promise.then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);
    expect(promise.value).toBeUndefined();

    // act
    act(() => {
      set(1);
    });
    const result = await promise;

    expect(result).toBe(1);
    expect(promise.value).toBe(1);
  });

  it('resolves a new promise when the state is set', async () => {
    let resolved = false;
    const { result } = renderHook(useHookHelper);

    result.current[0].then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);
    expect(result.current[0].value).toBeUndefined();

    // act
    act(() => {
      result.current[1](1);
    });
    const finalState = await result.current[0];

    expect(finalState).toBe(1);
    expect(result.current[0].value).toBe(1);
  });
});

describe('nullable state type', () => {
  const useHookHelper = () => usePromisedState<number | undefined>();

  it("does not resolve promise if set isn't called", () => {
    let resolved = false;
    const {
      result: {
        current: [promise],
      },
    } = renderHook(useHookHelper);

    promise.then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);
    expect(promise.value).toBeUndefined();
  });

  it('does not resolve promise if set is called with undefined', () => {
    let resolved = false;
    const {
      result: {
        current: [promise, set],
      },
    } = renderHook(useHookHelper);

    promise.then(() => {
      resolved = true;
    });

    act(() => {
      set(undefined);
    });

    expect(resolved).toBe(false);
    expect(promise.value).toBeUndefined();
  });

  it('waits on a new state after setting undefined', async () => {
    const { result } = renderHook(useHookHelper);

    act(() => {
      result.current[1](0);
      result.current[1](undefined);
    });

    let resolved = false;
    result.current[0].then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);
    expect(result.current[0].value).toBeUndefined();
  });

  it('resolves a new promise when the state is set', async () => {
    let resolved = false;
    const { result } = renderHook(useHookHelper);

    result.current[0].then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);
    expect(result.current[0].value).toBeUndefined();

    // act
    act(() => {
      result.current[1](1);
    });
    const finalState = await result.current[0];

    expect(finalState).toBe(1);
    expect(result.current[0].value).toBe(1);
  });
});
