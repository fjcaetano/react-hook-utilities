import { renderHook } from '@testing-library/react-hooks';

import { useLazyRef } from '..';

const callbackFn = jest.fn();
const mockHook = () => useLazyRef(callbackFn);

beforeEach(callbackFn.mockRestore);

it('calls factory on first call', () => {
  renderHook(mockHook);

  expect(callbackFn.mock.calls.length).toEqual(1);
});

it('does not call factory when value is unset', () => {
  const { result, rerender } = renderHook(mockHook);
  expect(callbackFn.mock.calls.length).toEqual(1);

  // act
  result.current.current = undefined;
  rerender();

  expect(callbackFn.mock.calls.length).toEqual(1);
});

describe('change in current value', () => {
  const assertChangeCurrentValue = () => {
    // initial value
    callbackFn.mockReturnValue(0);
    const { result } = renderHook(mockHook);

    expect(result.current.current).toEqual(0);

    // act
    result.current.current = 1;

    expect(result.current.current).toEqual(1);
  };

  it('can change current value', () => {
    assertChangeCurrentValue();
  });

  it('does not call factory when current value changes', () => {
    assertChangeCurrentValue();

    expect(callbackFn.mock.calls.length).toEqual(1);
  });
});
