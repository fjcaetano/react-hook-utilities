import { renderHook, act } from '@testing-library/react-hooks';

import { useLazyRef } from '..';

let callbackFn: jest.Mock;
let initialProps: any;
const thrownError = new Error('error');

interface Props<T> {
  factory?: () => T;
}

const mockHook = ({ factory = callbackFn }: Props<any> = {}) =>
  useLazyRef(factory);

beforeEach(() => {
  callbackFn = jest.fn();
  initialProps = { worker: callbackFn };
});

it('calls factory on first call', () => {
  renderHook(mockHook);

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
