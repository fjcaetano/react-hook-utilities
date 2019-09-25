import { renderHook } from '@testing-library/react-hooks';

import { useDidMount } from '..';

let effect: jest.Mock;
let cleanup: jest.Mock;
let hook: any;

beforeEach(() => {
  cleanup = jest.fn();
  effect = jest.fn();
  hook = useDidMount.bind(null, effect);
});

it('calls the effect at the start', () => {
  renderHook(hook);

  expect(effect.mock.calls.length).toEqual(1);
});

it('calls the effect only once', () => {
  const { rerender } = renderHook(hook);

  rerender();
  rerender();
  rerender();

  expect(effect.mock.calls.length).toEqual(1);
});

it('cleans up on unmount', () => {
  effect.mockReturnValue(cleanup);
  const { unmount } = renderHook(hook);

  expect(cleanup.mock.calls.length).toEqual(0);
  unmount();

  expect(cleanup.mock.calls.length).toEqual(1);
});

it('runs an async funciton', async () => {
  let resolve: () => void;
  let finished = false;
  const promise = new Promise<void>(r => {
    resolve = r;
  });

  effect.mockImplementation(async () => {
    await promise;
    finished = true;
  });

  renderHook(hook);

  expect(effect.mock.calls.length).toEqual(1);
  expect(finished).toBe(false);

  resolve!();

  expect(finished).toBe(false);
});
