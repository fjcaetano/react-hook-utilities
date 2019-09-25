import { renderHook } from '@testing-library/react-hooks';

import { useDidUnmount } from '..';

let cleanup: jest.Mock;
let hook: any;

beforeEach(() => {
  cleanup = jest.fn();
  hook = useDidUnmount.bind(null, cleanup);
});

it('does not call the effect if the component is mounted', () => {
  renderHook(hook);

  expect(cleanup.mock.calls.length).toEqual(0);
});

it('calls the effect when the component gets unmounted', () => {
  const { unmount } = renderHook(hook);

  expect(cleanup.mock.calls.length).toEqual(0);
  unmount();

  expect(cleanup.mock.calls.length).toEqual(1);
});

it('calls the effect only once', () => {
  const { unmount } = renderHook(hook);

  expect(cleanup.mock.calls.length).toEqual(0);
  unmount();
  unmount();
  unmount();

  expect(cleanup.mock.calls.length).toEqual(1);
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

  const { unmount } = renderHook(hook);

  unmount();

  expect(cleanup.mock.calls.length).toEqual(1);
  expect(finished).toBe(false);

  resolve!();

  expect(finished).toBe(false);
});
