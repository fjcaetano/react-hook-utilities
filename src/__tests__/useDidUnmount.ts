import { renderHook } from '@testing-library/react-hooks';

import { useDidUnmount } from '..';

let cleanup: jest.Mock;
let useHook: any;

beforeEach(() => {
  cleanup = jest.fn();
  useHook = ({ func = cleanup, deps }: any = {}) => {
    useDidUnmount(func, deps);
  };
});

it('does not call the effect if the component is mounted', () => {
  renderHook(useHook);

  expect(cleanup).not.toHaveBeenCalled();
});

it('calls the effect when the component gets unmounted', () => {
  const { unmount } = renderHook(useHook);

  expect(cleanup).not.toHaveBeenCalled();
  unmount();

  expect(cleanup).toHaveBeenCalledTimes(1);
});

it('calls the effect only once', () => {
  const { unmount } = renderHook(useHook);

  expect(cleanup).not.toHaveBeenCalled();
  unmount();
  unmount();
  unmount();

  expect(cleanup).toHaveBeenCalledTimes(1);
});

it('runs an async funciton', async () => {
  let resolve: () => void;
  let finished = false;
  const promise = new Promise<void>(r => {
    resolve = r;
  });

  cleanup.mockImplementation(async () => {
    await promise;
    finished = true;
  });

  const { unmount } = renderHook(useHook);

  unmount();

  expect(cleanup).toHaveBeenCalledTimes(1);
  expect(finished).toBe(false);

  resolve!();

  expect(finished).toBe(false);
});

it('calls the effect with updated dependencies', () => {
  const secondCleanup = jest.fn();
  const { unmount, rerender } = renderHook(useHook, {
    initialProps: { func: cleanup, deps: [cleanup] },
  });

  // updating dependencies
  rerender({ func: secondCleanup, deps: [secondCleanup] });
  unmount();

  expect(cleanup).not.toHaveBeenCalled();
  expect(secondCleanup).toHaveBeenCalledTimes(1);
});

it('does not update the effect when the dependencies have not been updated', () => {
  const secondCleanup = jest.fn();
  const { unmount, rerender } = renderHook(useHook, {
    initialProps: { func: cleanup, deps: [cleanup] },
  });

  // sending a new cleanup func, but keeping the same dependencies
  rerender({ func: secondCleanup, deps: [cleanup] });
  unmount();

  expect(cleanup).toHaveBeenCalledTimes(1);
  expect(secondCleanup).not.toHaveBeenCalled();
});
