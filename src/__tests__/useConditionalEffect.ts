import { renderHook } from '@testing-library/react-hooks';

import { useConditionalEffect } from '..';

let effect: jest.Mock;
let cleanup: jest.Mock;
let condition: jest.Mock;

const hook = async (args: any) =>
  new Promise<any>(resolve => {
    useConditionalEffect(
      oldState => {
        resolve(oldState);
        return condition();
      },
      effect,
      args,
    );
  });

beforeEach(() => {
  condition = jest.fn().mockReturnValue(false);
  cleanup = jest.fn();
  effect = jest.fn().mockReturnValue(cleanup);
});

it('receives empty array as old state', async () => {
  const {
    result: { current },
  } = renderHook(hook, { initialProps: [1, 2, 3] });

  expect(await current).toEqual([]);
  expect(effect.mock.calls.length).toEqual(0);
  expect(cleanup.mock.calls.length).toEqual(0);
});

it('receives state update', async () => {
  const deps = [1, 2, 3];
  const {
    result: { current },
    rerender,
  } = renderHook(hook, { initialProps: deps });

  rerender([4, 5, 6]);

  expect(await current).toEqual([]);
  expect(effect.mock.calls.length).toEqual(0);
  expect(cleanup.mock.calls.length).toEqual(0);
});

it('executes the effect when condition returns true', () => {
  condition.mockReturnValue(true);

  renderHook(hook, { initialProps: [1, 2, 3] });

  expect(effect.mock.calls.length).toEqual(1);
  expect(cleanup.mock.calls.length).toEqual(0);
});

it('cleans up', () => {
  condition.mockReturnValue(true);

  const { unmount } = renderHook(hook, { initialProps: [1, 2, 3] });
  unmount();

  expect(effect.mock.calls.length).toEqual(1);
  expect(cleanup.mock.calls.length).toEqual(1);
});
