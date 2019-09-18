import { renderHook } from '@testing-library/react-hooks';

import { useEffectUpdate } from '..';

const deps = [1, 2, 3];

const hook = async ({ dependencies, cleanup }: any) =>
  new Promise<any>(resolve => {
    useEffectUpdate(oldState => {
      resolve(oldState);
      return cleanup;
    }, dependencies);
  });

it('receives empty array as old state', () => {
  const {
    result: { current },
  } = renderHook(hook, {
    initialProps: { deps },
  });

  expect(current).resolves.toEqual([]);
});

it('receives state updates', async () => {
  const { result, rerender } = renderHook(hook, {
    initialProps: { dependencies: deps },
  });

  rerender({ dependencies: [4, 5, 6] });

  const value = await result.current;
  expect(value).toBe(deps);
});

it('cleans up', () => {
  const cleanup = jest.fn();
  const { unmount } = renderHook(hook, {
    initialProps: { dependencies: deps, cleanup },
  });

  unmount();

  expect(cleanup.mock.calls.length).toEqual(1);
});
