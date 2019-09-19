react-hook-utilities [![Build Status][1]](https://github.com/fjcaetano/react-hook-utilities/actions) [![codecov][2]](https://codecov.io/gh/fjcaetano/react-hook-utilities) [![npm][3]](https://www.npmjs.com/package/react-hook-utilities)
---

A set of extraordinarily common React hooks.

# Installation

We recommend installing using `yarn`:
```sh
$ yarn add react-hook-utilities
```

Or, if you prefer `npm`:
```sh
$ npm -S react-hook-utilities
```

# Usage

### Async effects

Run asynchronous effects:

```ts
useAsyncEffect(async () => {
  await promise;
}, []);
```

### Async layout effects

Run asynchronous layout effects:

```ts
useAsyncLayoutEffect(async () => {
  await promise;
}, []);
```

### Effect update

Executes an effect and get its dependencies previous state:

```ts
let name: string | undefined;

useEffectUpdate(
  ([oldName]) => {
    if (!oldName && !!name) {
      // name now has a valid value
    }
  },
  [name],
)
```

### Conditional effect

Conditionally executes an effect. The previous state is sent to the condition evaluation:

```ts
let error: Error | undefined;

useConditionalEffect(
  ([prevError]) => !prevError && !!error,
  () => {
    // an error was introduced
    showToast(error);
  },
  [error],
)
```

### Worker

Wraps a promise with loading and error states:

```ts
const { isLoading, error, result, callback } = useWorker(
  async param => {
    if (!param) {
      throw new Error('invalid arguments');
    }

    const result = await doSomething(param)
    return result
  },
  [doSomething],
)
```

`isLoading` is set to true as soon as the callback is loaded and only returns to `false` when it
ends or when an error happens. If an exception is thrown or a promise fails, `error` will be updated.

[1]: https://github.com/fjcaetano/react-hook-utilities/workflows/Node%20CI/badge.svg
[2]: https://codecov.io/gh/fjcaetano/react-hook-utilities/branch/master/graph/badge.svg
[3]: https://img.shields.io/npm/v/react-hook-utilities