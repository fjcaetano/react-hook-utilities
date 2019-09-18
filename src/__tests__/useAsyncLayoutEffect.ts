import { renderHook } from '@testing-library/react-hooks';

import { useAsyncLayoutEffect } from '..';

it('executes an async effect', () => {
  const effect = jest.fn().mockResolvedValue(undefined);

  renderHook(() => {
    useAsyncLayoutEffect(effect, []);
  });

  expect(effect.mock.calls.length).toEqual(1);
});

it('executes effect again when dependencies change', () => {
  const effect = jest.fn().mockResolvedValue(undefined);

  const { rerender } = renderHook(
    (deps: any) => {
      useAsyncLayoutEffect(effect, [deps]);
    },
    { initialProps: 1 },
  );

  expect(effect.mock.calls.length).toEqual(1);
  rerender(2);

  expect(effect.mock.calls.length).toEqual(2);
});
