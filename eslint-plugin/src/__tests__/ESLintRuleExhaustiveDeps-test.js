/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Original Source: https://github.com/facebook/react/blob/9e64bf18e11828d6b4c0363bff5ed2eca1ccd838/packages/eslint-plugin-react-hooks/__tests__/ESLintRuleExhaustiveDeps-test.js
 */

'use strict';

const ESLintTester = require('eslint').RuleTester;
const ReactHooksESLintPlugin = require('@react-hook-utilities/eslint-plugin');
const ReactHooksESLintRule = ReactHooksESLintPlugin.rules['exhaustive-deps'];

ESLintTester.setDefaultConfig({
  parser: require.resolve('babel-eslint'),
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
});

// ***************************************************
// For easier local testing, you can add to any case:
// {
//   skip: true,
//   --or--
//   only: true,
//   ...
// }
// ***************************************************

const tests = {
  valid: [
    {
      code: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
          });
        }
      `,
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          useDidMount(() => {
            console.log(local);
          });
        }
      `,
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          useDidMount(() => {
            return history.listen();
          });
        }
      `,
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          useDidMount(async () => {
            console.log(local);            
          });
        }
      `,
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          useDidUnmount(() => {
            console.log(local);
          });
        }
      `,
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          useDidUnmount(async () => {
            console.log(local);
          });
        }
      `,
    },
    {
      code: `
        function MyComponent() {
          useAsyncEffect(async () => {
            const local = {};
            console.log(local);
          }, []);
        }
      `,
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
          }, [local]);
        }
      `,
    },
    {
      // OK because `props` wasn't defined.
      // We don't technically know if `props` is supposed
      // to be an import that hasn't been added yet, or
      // a component-level variable. Ignore it until it
      //  gets defined (a different rule would flag it anyway).
      code: `
        function MyComponent() {
          useAsyncEffect(async () => {
            console.log(props.foo);
          }, []);
        }
      `,
    },
    {
      code: `
        function MyComponent() {
          const local1 = {};
          {
            const local2 = {};
            useAsyncEffect(async () => {
              console.log(local1);
              console.log(local2);
            });
          }
        }
      `,
    },
    {
      code: `
        function MyComponent() {
          const local1 = {};
          {
            const local2 = {};
            useWorker(async () => {
              console.log(local1);
              console.log(local2);
            }, [local1, local2]);
          }
        }
      `,
    },
    {
      code: `
        function MyComponent() {
          const local1 = {};
          function MyNestedComponent() {
            const local2 = {};
            useWorker(async () => {
              console.log(local1);
              console.log(local2);
            }, [local2]);
          }
        }
      `,
    },
    {
      code: `
        function MyComponent() {
          const local1 = {};
          {
            const local2 = {};
            useWorkerLoad(async () => {
              console.log(local1);
              console.log(local2);
            }, [local1, local2]);
          }
        }
      `,
    },
    {
      code: `
        function MyComponent() {
          const local1 = {};
          function MyNestedComponent() {
            const local2 = {};
            useWorkerLoad(async () => {
              console.log(local1);
              console.log(local2);
            }, [local2]);
          }
        }
      `,
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
            console.log(local);
          }, [local]);
        }
      `,
    },
    {
      code: `
        function MyComponent() {
          useAsyncEffect(async () => {
            console.log(unresolved);
          }, []);
        }
      `,
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
          }, [,,,local,,,]);
        }
      `,
    },
    {
      // Regression test
      code: `
        function MyComponent({ foo }) {
          useAsyncEffect(async () => {
            console.log(foo.length);
          }, [foo]);
        }
      `,
    },
    {
      // Regression test
      code: `
        function MyComponent({ foo }) {
          useAsyncEffect(async () => {
            console.log(foo.length);
            console.log(foo.slice(0));
          }, [foo]);
        }
      `,
    },
    {
      // Regression test
      code: `
        function MyComponent({ history }) {
          useAsyncEffect(async () => {
            return history.listen();
          }, [history]);
        }
      `,
    },
    {
      // Valid because they have meaning without deps.
      code: `
        function MyComponent(props) {
          useAsyncEffect(async () => {});
          useAsyncLayoutEffect(async () => {});
          useConditionalEffect(props.innerRef, () => {});
        }
      `,
    },
    {
      code: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            console.log(props.foo);
          }, [props.foo]);
        }
      `,
    },
    {
      code: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            console.log(props.foo);
            console.log(props.bar);
          }, [props.bar, props.foo]);
        }
      `,
    },
    {
      code: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            console.log(props.foo);
            console.log(props.bar);
          }, [props.foo, props.bar]);
        }
      `,
    },
    {
      code: `
        function MyComponent(props) {
          const local = {};
          useAsyncEffect(async () => {
            console.log(props.foo);
            console.log(props.bar);
            console.log(local);
          }, [props.foo, props.bar, local]);
        }
      `,
    },
    {
      // [props, props.foo] is technically unnecessary ('props' covers 'props.foo').
      // However, it's valid for effects to over-specify their deps.
      // So we don't warn about this. We *would* warn about useEffectUpdate/useWorker.
      code: `
        function MyComponent(props) {
          const local = {};
          useAsyncEffect(async () => {
            console.log(props.foo);
            console.log(props.bar);
          }, [props, props.foo]);

          let color = {}
          useAsyncEffect(async () => {
            console.log(props.foo.bar.baz);
            console.log(color);
          }, [props.foo, props.foo.bar.baz, color]);
        }
      `,
    },
    {
      // Valid because we don't care about hooks outside of components.
      code: `
        const local = {};
        useAsyncEffect(async () => {
          console.log(local);
        }, []);
      `,
    },
    {
      // Valid because we don't care about hooks outside of components.
      code: `
        const local1 = {};
        {
          const local2 = {};
          useAsyncEffect(async () => {
            console.log(local1);
            console.log(local2);
          }, []);
        }
      `,
    },
    {
      code: `
        function MyComponent() {
          const ref = useRef();
          useAsyncEffect(async () => {
            console.log(ref.current);
          }, [ref]);
        }
      `,
    },
    {
      code: `
        function MyComponent() {
          const ref = useRef();
          useAsyncEffect(async () => {
            console.log(ref.current);
          }, []);
        }
      `,
    },
    {
      code: `
        function MyComponent({ maybeRef2, foo }) {
          const definitelyRef1 = useRef();
          const definitelyRef2 = useRef();
          const maybeRef1 = useSomeOtherRefyThing();
          const [state1, setState1] = useState();
          const [state2, setState2] = React.useState();
          const [state3, dispatch1] = useReducer();
          const [state4, dispatch2] = React.useReducer();
          const [state5, maybeSetState] = useFunnyState();
          const [state6, maybeDispatch] = useFunnyReducer();
          const mySetState = useWorker(async () => {}, []);
          let myDispatch = useWorker(async () => {}, []);

          useAsyncEffect(async () => {
            // Known to be static
            console.log(definitelyRef1.current);
            console.log(definitelyRef2.current);
            console.log(maybeRef1.current);
            console.log(maybeRef2.current);
            setState1();
            setState2();
            dispatch1();
            dispatch2();

            // Dynamic
            console.log(state1);
            console.log(state2);
            console.log(state3);
            console.log(state4);
            console.log(state5);
            console.log(state6);
            mySetState();
            myDispatch();

            // Not sure; assume dynamic
            maybeSetState();
            maybeDispatch();
          }, [
            // Dynamic
            state1, state2, state3, state4, state5, state6,
            maybeRef1, maybeRef2,

            // Not sure; assume dynamic
            mySetState, myDispatch,
            maybeSetState, maybeDispatch

            // In this test, we don't specify static deps.
            // That should be okay.
          ]);
        }
      `,
    },
    {
      code: `
        function MyComponent({ maybeRef2 }) {
          const definitelyRef1 = useRef();
          const definitelyRef2 = useRef();
          const maybeRef1 = useSomeOtherRefyThing();

          const [state1, setState1] = useState();
          const [state2, setState2] = React.useState();
          const [state3, dispatch1] = useReducer();
          const [state4, dispatch2] = React.useReducer();

          const [state5, maybeSetState] = useFunnyState();
          const [state6, maybeDispatch] = useFunnyReducer();

          const mySetState = useWorker(async () => {}, []);
          let myDispatch = useWorker(async () => {}, []);

          useAsyncEffect(async () => {
            // Known to be static
            console.log(definitelyRef1.current);
            console.log(definitelyRef2.current);
            console.log(maybeRef1.current);
            console.log(maybeRef2.current);
            setState1();
            setState2();
            dispatch1();
            dispatch2();

            // Dynamic
            console.log(state1);
            console.log(state2);
            console.log(state3);
            console.log(state4);
            console.log(state5);
            console.log(state6);
            mySetState();
            myDispatch();

            // Not sure; assume dynamic
            maybeSetState();
            maybeDispatch();
          }, [
            // Dynamic
            state1, state2, state3, state4, state5, state6,
            maybeRef1, maybeRef2,

            // Not sure; assume dynamic
            mySetState, myDispatch,
            maybeSetState, maybeDispatch,

            // In this test, we specify static deps.
            // That should be okay too!
            definitelyRef1, definitelyRef2, setState1, setState2, dispatch1, dispatch2
          ]);
        }
      `,
    },
    {
      code: `
        function MyComponent({ maybeRef2, foo }) {
          const definitelyRef1 = useRef();
          const definitelyRef2 = useRef();
          const maybeRef1 = useSomeOtherRefyThing();
          const [state1, setState1] = useState();
          const [state2, setState2] = React.useState();
          const [state3, dispatch1] = useReducer();
          const [state4, dispatch2] = React.useReducer();
          const [state5, maybeSetState] = useFunnyState();
          const [state6, maybeDispatch] = useFunnyReducer();
          const mySetState = useWorkerLoad(async () => {}, []);
          let myDispatch = useWorkerLoad(async () => {}, []);

          useAsyncEffect(async () => {
            // Known to be static
            console.log(definitelyRef1.current);
            console.log(definitelyRef2.current);
            console.log(maybeRef1.current);
            console.log(maybeRef2.current);
            setState1();
            setState2();
            dispatch1();
            dispatch2();

            // Dynamic
            console.log(state1);
            console.log(state2);
            console.log(state3);
            console.log(state4);
            console.log(state5);
            console.log(state6);
            mySetState();
            myDispatch();

            // Not sure; assume dynamic
            maybeSetState();
            maybeDispatch();
          }, [
            // Dynamic
            state1, state2, state3, state4, state5, state6,
            maybeRef1, maybeRef2,

            // Not sure; assume dynamic
            mySetState, myDispatch,
            maybeSetState, maybeDispatch

            // In this test, we don't specify static deps.
            // That should be okay.
          ]);
        }
      `,
    },
    {
      code: `
        function MyComponent({ maybeRef2 }) {
          const definitelyRef1 = useRef();
          const definitelyRef2 = useRef();
          const maybeRef1 = useSomeOtherRefyThing();

          const [state1, setState1] = useState();
          const [state2, setState2] = React.useState();
          const [state3, dispatch1] = useReducer();
          const [state4, dispatch2] = React.useReducer();

          const [state5, maybeSetState] = useFunnyState();
          const [state6, maybeDispatch] = useFunnyReducer();

          const mySetState = useWorkerLoad(async () => {}, []);
          let myDispatch = useWorkerLoad(async () => {}, []);

          useAsyncEffect(async () => {
            // Known to be static
            console.log(definitelyRef1.current);
            console.log(definitelyRef2.current);
            console.log(maybeRef1.current);
            console.log(maybeRef2.current);
            setState1();
            setState2();
            dispatch1();
            dispatch2();

            // Dynamic
            console.log(state1);
            console.log(state2);
            console.log(state3);
            console.log(state4);
            console.log(state5);
            console.log(state6);
            mySetState();
            myDispatch();

            // Not sure; assume dynamic
            maybeSetState();
            maybeDispatch();
          }, [
            // Dynamic
            state1, state2, state3, state4, state5, state6,
            maybeRef1, maybeRef2,

            // Not sure; assume dynamic
            mySetState, myDispatch,
            maybeSetState, maybeDispatch,

            // In this test, we specify static deps.
            // That should be okay too!
            definitelyRef1, definitelyRef2, setState1, setState2, dispatch1, dispatch2
          ]);
        }
      `,
    },
    {
      code: `
        const MyComponent = forwardRef((props, ref) => {
          useConditionalEffect(ref, () => ({
            focus() {
              alert(props.hello);
            }
          }))
        });
      `,
    },
    {
      code: `
        const MyComponent = forwardRef((props, ref) => {
          useConditionalEffect(ref, () => ({
            focus() {
              alert(props.hello);
            }
          }), [props.hello])
        });
      `,
    },
    {
      // This is not ideal but warning would likely create
      // too many false positives. We do, however, prevent
      // direct assignments.
      code: `
        function MyComponent(props) {
          let obj = {};
          useAsyncEffect(async () => {
            obj.foo = true;
          }, [obj]);
        }
      `,
    },
    {
      // Valid because we assign ref.current
      // ourselves. Therefore it's likely not
      // a ref managed by React.
      code: `
        function MyComponent() {
          const myRef = useRef();
          useAsyncEffect(async () => {
            const handleMove = () => {};
            myRef.current = {};
            return () => {
              console.log(myRef.current.toString())
            };
          }, []);
          return <div />;
        }
      `,
    },
    {
      // Valid because we assign ref.current
      // ourselves. Therefore it's likely not
      // a ref managed by React.
      code: `
        function useMyThing(myRef) {
          useAsyncEffect(async () => {
            const handleMove = () => {};
            myRef.current = {};
            return () => {
              console.log(myRef.current.toString())
            };
          }, [myRef]);
        }
      `,
    },
    {
      // Valid because the ref is captured.
      code: `
        function MyComponent() {
          const myRef = useRef();
          useAsyncEffect(async () => {
            const handleMove = () => {};
            const node = myRef.current;
            node.addEventListener('mousemove', handleMove);
            return () => node.removeEventListener('mousemove', handleMove);
          }, []);
          return <div ref={myRef} />;
        }
      `,
    },
    {
      // Valid because the ref is captured.
      code: `
        function useMyThing(myRef) {
          useAsyncEffect(async () => {
            const handleMove = () => {};
            const node = myRef.current;
            node.addEventListener('mousemove', handleMove);
            return () => node.removeEventListener('mousemove', handleMove);
          }, [myRef]);
          return <div ref={myRef} />;
        }
      `,
    },
    {
      // Valid because it's not an effect.
      code: `
        function useMyThing(myRef) {
          useWorker(async () => {
            const handleMouse = () => {};
            myRef.current.addEventListener('mousemove', handleMouse);
            myRef.current.addEventListener('mousein', handleMouse);
            return function() {
              setTimeout(() => {
                myRef.current.removeEventListener('mousemove', handleMouse);
                myRef.current.removeEventListener('mousein', handleMouse);
              });
            }
          }, [myRef]);
        }
      `,
    },
    {
      // Valid because it's not an effect.
      code: `
        function useMyThing(myRef) {
          useWorkerLoad(async () => {
            const handleMouse = () => {};
            myRef.current.addEventListener('mousemove', handleMouse);
            myRef.current.addEventListener('mousein', handleMouse);
            return function() {
              setTimeout(() => {
                myRef.current.removeEventListener('mousemove', handleMouse);
                myRef.current.removeEventListener('mousein', handleMouse);
              });
            }
          }, [myRef]);
        }
      `,
    },
    {
      // Valid because we read ref.current in a function that isn't cleanup.
      code: `
        function useMyThing() {
          const myRef = useRef();
          useAsyncEffect(async () => {
            const handleMove = () => {
              console.log(myRef.current)
            };
            window.addEventListener('mousemove', handleMove);
            return () => window.removeEventListener('mousemove', handleMove);
          }, []);
          return <div ref={myRef} />;
        }
      `,
    },
    {
      // Valid because we read ref.current in a function that isn't cleanup.
      code: `
        function useMyThing() {
          const myRef = useRef();
          useAsyncEffect(async () => {
            const handleMove = () => {
              return () => window.removeEventListener('mousemove', handleMove);
            };
            window.addEventListener('mousemove', handleMove);
            return () => {};
          }, []);
          return <div ref={myRef} />;
        }
      `,
    },
    {
      // Valid because it's a primitive constant.
      code: `
        function MyComponent() {
          const local1 = 42;
          const local2 = '42';
          const local3 = null;
          useAsyncEffect(async () => {
            console.log(local1);
            console.log(local2);
            console.log(local3);
          }, []);
        }
      `,
    },
    {
      // It's not a mistake to specify constant values though.
      code: `
        function MyComponent() {
          const local1 = 42;
          const local2 = '42';
          const local3 = null;
          useAsyncEffect(async () => {
            console.log(local1);
            console.log(local2);
            console.log(local3);
          }, [local1, local2, local3]);
        }
      `,
    },
    {
      // It is valid for effects to over-specify their deps.
      code: `
        function MyComponent(props) {
          const local = props.local;
          useAsyncEffect(async () => {}, [local]);
        }
      `,
    },
    {
      // Valid even though activeTab is "unused".
      // We allow over-specifying deps for effects, but not callbacks or memo.
      code: `
        function Foo({ activeTab }) {
          useAsyncEffect(async () => {
            window.scrollTo(0, 0);
          }, [activeTab]);
        }
      `,
    },
    {
      // It is valid to specify broader effect deps than strictly necessary.
      // Don't warn for this.
      code: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            console.log(props.foo.bar.baz);
          }, [props]);
          useAsyncEffect(async () => {
            console.log(props.foo.bar.baz);
          }, [props.foo]);
          useAsyncEffect(async () => {
            console.log(props.foo.bar.baz);
          }, [props.foo.bar]);
          useAsyncEffect(async () => {
            console.log(props.foo.bar.baz);
          }, [props.foo.bar.baz]);
        }
      `,
    },
    {
      // It is *also* valid to specify broader memo/callback deps than strictly necessary.
      // Don't warn for this either.
      code: `
        function MyComponent(props) {
          const fn = useWorker(async () => {
            console.log(props.foo.bar.baz);
          }, [props]);
          const fn2 = useWorker(async () => {
            console.log(props.foo.bar.baz);
          }, [props.foo]);
          const fn3 = useEffectUpdate(() => {
            console.log(props.foo.bar.baz);
          }, [props.foo.bar]);
          const fn4 = useEffectUpdate(() => {
            console.log(props.foo.bar.baz);
          }, [props.foo.bar.baz]);
        }
      `,
    },
    {
      // It is *also* valid to specify broader memo/callback deps than strictly necessary.
      // Don't warn for this either.
      code: `
        function MyComponent(props) {
          const fn = useWorkerLoad(async () => {
            console.log(props.foo.bar.baz);
          }, [props]);
          const fn2 = useWorkerLoad(async () => {
            console.log(props.foo.bar.baz);
          }, [props.foo]);
          const fn3 = useEffectUpdate(() => {
            console.log(props.foo.bar.baz);
          }, [props.foo.bar]);
          const fn4 = useEffectUpdate(() => {
            console.log(props.foo.bar.baz);
          }, [props.foo.bar.baz]);
        }
      `,
    },
    {
      // Declaring handleNext is optional because
      // it doesn't use anything in the function scope.
      code: `
        function MyComponent(props) {
          function handleNext1() {
            console.log('hello');
          }
          const handleNext2 = () => {
            console.log('hello');
          };
          let handleNext3 = function() {
            console.log('hello');
          };
          useAsyncEffect(async () => {
            return Store.subscribe(handleNext1);
          }, []);
          useAsyncLayoutEffect(async () => {
            return Store.subscribe(handleNext2);
          }, []);
          useEffectUpdate(() => {
            return Store.subscribe(handleNext3);
          }, []);
        }
      `,
    },
    {
      // Declaring handleNext is optional because
      // it doesn't use anything in the function scope.
      code: `
        function MyComponent(props) {
          function handleNext() {
            console.log('hello');
          }
          useAsyncEffect(async () => {
            return Store.subscribe(handleNext);
          }, []);
          useAsyncLayoutEffect(async () => {
            return Store.subscribe(handleNext);
          }, []);
          useEffectUpdate(() => {
            return Store.subscribe(handleNext);
          }, []);
        }
      `,
    },
    {
      // Declaring handleNext is optional because
      // everything they use is fully static.
      code: `
        function MyComponent(props) {
          let [, setState] = useState();
          let [, dispatch] = React.useReducer();

          function handleNext1(value) {
            let value2 = value * 100;
            setState(value2);
            console.log('hello');
          }
          const handleNext2 = (value) => {
            setState(foo(value));
            console.log('hello');
          };
          let handleNext3 = function(value) {
            console.log(value);
            dispatch({ type: 'x', value });
          };
          useAsyncEffect(async () => {
            return Store.subscribe(handleNext1);
          }, []);
          useAsyncLayoutEffect(async () => {
            return Store.subscribe(handleNext2);
          }, []);
          useEffectUpdate(() => {
            return Store.subscribe(handleNext3);
          }, []);
        }
      `,
    },
    {
      code: `
        function useInterval(callback, delay) {
          const savedCallback = useRef();
          useAsyncEffect(async () => {
            savedCallback.current = callback;
          });
          useAsyncEffect(async () => {
            function tick() {
              savedCallback.current();
            }
            if (delay !== null) {
              let id = setInterval(tick, delay);
              return () => clearInterval(id);
            }
          }, [delay]);
        }
      `,
    },
    {
      code: `
        function Counter() {
          const [count, setCount] = useState(0);

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              setCount(c => c + 1);
            }, 1000);
            return () => clearInterval(id);
          }, []);

          return <h1>{count}</h1>;
        }
      `,
    },
    {
      code: `
        function Counter() {
          const [count, setCount] = useState(0);

          function tick() {
            setCount(c => c + 1);
          }

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              tick();
            }, 1000);
            return () => clearInterval(id);
          }, []);

          return <h1>{count}</h1>;
        }
      `,
    },
    {
      code: `
        function Counter() {
          const [count, dispatch] = useReducer((state, action) => {
            if (action === 'inc') {
              return state + 1;
            }
          }, 0);

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              dispatch('inc');
            }, 1000);
            return () => clearInterval(id);
          }, []);

          return <h1>{count}</h1>;
        }
      `,
    },
    {
      code: `
        function Counter() {
          const [count, dispatch] = useReducer((state, action) => {
            if (action === 'inc') {
              return state + 1;
            }
          }, 0);

          const tick = () => {
            dispatch('inc');
          };

          useAsyncEffect(async () => {
            let id = setInterval(tick, 1000);
            return () => clearInterval(id);
          }, []);

          return <h1>{count}</h1>;
        }
      `,
    },
    {
      // Regression test for a crash
      code: `
        function Podcasts() {
          useAsyncEffect(async () => {
            setPodcasts([]);
          }, []);
          let [podcasts, setPodcasts] = useState(null);
        }
      `,
    },
    {
      code: `
        function withFetch(fetchPodcasts) {
          return function Podcasts({ id }) {
            let [podcasts, setPodcasts] = useState(null);
            useAsyncEffect(async () => {
              fetchPodcasts(id).then(setPodcasts);
            }, [id]);
          }
        }
      `,
    },
    {
      code: `
        function Podcasts({ id }) {
          let [podcasts, setPodcasts] = useState(null);
          useAsyncEffect(async () => {
            function doFetch({ fetchPodcasts }) {
              fetchPodcasts(id).then(setPodcasts);
            }
            doFetch({ fetchPodcasts: API.fetchPodcasts });
          }, [id]);
        }
      `,
    },
    {
      code: `
        function Counter() {
          let [count, setCount] = useState(0);

          function increment(x) {
            return x + 1;
          }

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              setCount(increment);
            }, 1000);
            return () => clearInterval(id);
          }, []);

          return <h1>{count}</h1>;
        }
      `,
    },
    {
      code: `
        function Counter() {
          let [count, setCount] = useState(0);

          function increment(x) {
            return x + 1;
          }

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              setCount(count => increment(count));
            }, 1000);
            return () => clearInterval(id);
          }, []);

          return <h1>{count}</h1>;
        }
      `,
    },
    {
      code: `
        import increment from './increment';
        function Counter() {
          let [count, setCount] = useState(0);

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              setCount(count => count + increment);
            }, 1000);
            return () => clearInterval(id);
          }, []);

          return <h1>{count}</h1>;
        }
      `,
    },
    {
      code: `
        function withStuff(increment) {
          return function Counter() {
            let [count, setCount] = useState(0);

            useAsyncEffect(async () => {
              let id = setInterval(() => {
                setCount(count => count + increment);
              }, 1000);
              return () => clearInterval(id);
            }, []);

            return <h1>{count}</h1>;
          }
        }
      `,
    },
    {
      code: `
        function App() {
          const [query, setQuery] = useState('react');
          const [state, setState] = useState(null);
          useAsyncEffect(async () => {
            let ignore = false;
            fetchSomething();
            async function fetchSomething() {
              const result = await (await fetch('http://hn.algolia.com/api/v1/search?query=' + query)).json();
              if (!ignore) setState(result);
            }
            return () => { ignore = true; };
          }, [query]);
          return (
            <>
              <input value={query} onChange={e => setQuery(e.target.value)} />
              {JSON.stringify(state)}
            </>
          );
        }
      `,
    },
    {
      code: `
        function Example() {
          const foo = useWorker(async () => {
            foo();
          }, []);
        }
      `,
    },
    {
      code: `
        function Example({ prop }) {
          const foo = useWorker(async () => {
            if (prop) {
              foo();
            }
          }, [prop]);
        }
      `,
    },
    {
      code: `
        function Example() {
          const foo = useWorkerLoad(async () => {
            foo();
          }, []);
        }
      `,
    },
    {
      code: `
        function Example({ prop }) {
          const foo = useWorkerLoad(async () => {
            if (prop) {
              foo();
            }
          }, [prop]);
        }
      `,
    },
    {
      code: `
        function Hello() {
          const [state, setState] = useState(0);
          useAsyncEffect(async () => {
            const handleResize = () => setState(window.innerWidth);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
          });
        }
      `,
    },
    // Ignore Generic Type Variables for arrow functions
    {
      code: `
        function Example({ prop }) {
          const bar = useAsyncEffect(<T>(a: T): Hello => {
            prop();
          }, [prop]);
        }
      `,
    },
    // Ignore arguments keyword for arrow functions.
    {
      code: `
        function Example() {
          useAsyncEffect(async () => {
            arguments
          }, [])
        }
      `,
    },
    {
      code: `
        function Example() {
          useAsyncEffect(async () => {
            const bar = () => {
              arguments;
            };
            bar();
          }, [])
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        function MyComponent() {
          const ref = useLazyRef();
          const [state, setState] = useState();
          useAsyncEffect(async () => {
            ref.current = {};
            setState(state + 1);
          }, []);
        }
      `,
      output: `
        function MyComponent() {
          const ref = useLazyRef();
          const [state, setState] = useState();
          useAsyncEffect(async () => {
            ref.current = {};
            setState(state + 1);
          }, [state]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'state'. " +
          'Either include it or remove the dependency array. ' +
          `You can also do a functional update 'setState(s => ...)' ` +
          `if you only need 'state' in the 'setState' call.`,
      ],
    },
    {
      code: `
        function MyComponent() {
          const ref = useLazyRef();
          const [state, setState] = useState();
          useAsyncEffect(() => {
            ref.current = {};
            setState(state + 1);
          }, [ref]);
        }
      `,
      // We don't ask to remove static deps but don't add them either.
      // Don't suggest removing "ref" (it's fine either way)
      // but *do* add "state". *Don't* add "setState" ourselves.
      output: `
        function MyComponent() {
          const ref = useLazyRef();
          const [state, setState] = useState();
          useAsyncEffect(() => {
            ref.current = {};
            setState(state + 1);
          }, [ref, state]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'state'. " +
          'Either include it or remove the dependency array. ' +
          `You can also do a functional update 'setState(s => ...)' ` +
          `if you only need 'state' in the 'setState' call.`,
      ],
    },
    {
      code: `
        function MyComponent(props) {
          const ref1 = useLazyRef();
          const ref2 = useLazyRef();
          useAsyncEffect(() => {
            ref1.current.focus();
            console.log(ref2.current.textContent);
            alert(props.someOtherRefs.current.innerHTML);
            fetch(props.color);
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          const ref1 = useLazyRef();
          const ref2 = useLazyRef();
          useAsyncEffect(() => {
            ref1.current.focus();
            console.log(ref2.current.textContent);
            alert(props.someOtherRefs.current.innerHTML);
            fetch(props.color);
          }, [props.color, props.someOtherRefs]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has missing dependencies: 'props.color' and 'props.someOtherRefs'. " +
          'Either include them or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          const ref1 = useLazyRef();
          const ref2 = useLazyRef();
          useAsyncEffect(() => {
            ref1.current.focus();
            console.log(ref2.current.textContent);
            alert(props.someOtherRefs.current.innerHTML);
            fetch(props.color);
          }, [ref1.current, ref2.current, props.someOtherRefs, props.color]);
        }
      `,
      output: `
        function MyComponent(props) {
          const ref1 = useLazyRef();
          const ref2 = useLazyRef();
          useAsyncEffect(() => {
            ref1.current.focus();
            console.log(ref2.current.textContent);
            alert(props.someOtherRefs.current.innerHTML);
            fetch(props.color);
          }, [props.someOtherRefs, props.color]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has unnecessary dependencies: 'ref1.current' and 'ref2.current'. " +
          'Either exclude them or remove the dependency array. ' +
          "Mutable values like 'ref1.current' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        function MyComponent() {
          const ref = useLazyRef();
          useAsyncEffect(() => {
            console.log(ref.current);
          }, [ref.current]);
        }
      `,
      output: `
        function MyComponent() {
          const ref = useLazyRef();
          useAsyncEffect(() => {
            console.log(ref.current);
          }, []);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has an unnecessary dependency: 'ref.current'. " +
          'Either exclude it or remove the dependency array. ' +
          "Mutable values like 'ref.current' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        function MyComponent({ activeTab }) {
          const ref1 = useLazyRef();
          const ref2 = useLazyRef();
          useAsyncEffect(() => {
            ref1.current.scrollTop = 0;
            ref2.current.scrollTop = 0;
          }, [ref1.current, ref2.current, activeTab]);
        }
      `,
      output: `
        function MyComponent({ activeTab }) {
          const ref1 = useLazyRef();
          const ref2 = useLazyRef();
          useAsyncEffect(() => {
            ref1.current.scrollTop = 0;
            ref2.current.scrollTop = 0;
          }, [activeTab]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has unnecessary dependencies: 'ref1.current' and 'ref2.current'. " +
          'Either exclude them or remove the dependency array. ' +
          "Mutable values like 'ref1.current' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        function MyComponent({ activeTab, initY }) {
          const ref1 = useLazyRef();
          const ref2 = useLazyRef();
          const fn = useWorker(() => {
            ref1.current.scrollTop = initY;
            ref2.current.scrollTop = initY;
          }, [ref1.current, ref2.current, activeTab, initY]);
        }
      `,
      output: `
        function MyComponent({ activeTab, initY }) {
          const ref1 = useLazyRef();
          const ref2 = useLazyRef();
          const fn = useWorker(() => {
            ref1.current.scrollTop = initY;
            ref2.current.scrollTop = initY;
          }, [initY]);
        }
      `,
      errors: [
        "React Hook useWorker has unnecessary dependencies: 'activeTab', 'ref1.current', and 'ref2.current'. " +
          'Either exclude them or remove the dependency array. ' +
          "Mutable values like 'ref1.current' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        function MyComponent() {
          const ref = useLazyRef();
          useAsyncEffect(() => {
            console.log(ref.current);
          }, [ref.current, ref]);
        }
      `,
      output: `
        function MyComponent() {
          const ref = useLazyRef();
          useAsyncEffect(() => {
            console.log(ref.current);
          }, [ref]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has an unnecessary dependency: 'ref.current'. " +
          'Either exclude it or remove the dependency array. ' +
          "Mutable values like 'ref.current' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
          }, []);
        }
      `,
      output: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
          }, [local]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'local'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      // Note: we *could* detect it's a primitive and never assigned
      // even though it's not a constant -- but we currently don't.
      // So this is an error.
      code: `
        function MyComponent() {
          let local = 42;
          useAsyncEffect(async () => {
            console.log(local);
          }, []);
        }
      `,
      output: `
        function MyComponent() {
          let local = 42;
          useAsyncEffect(async () => {
            console.log(local);
          }, [local]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'local'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      // Regexes are literals but potentially stateful.
      code: `
        function MyComponent() {
          const local = /foo/;
          useAsyncEffect(async () => {
            console.log(local);
          }, []);
        }
      `,
      output: `
        function MyComponent() {
          const local = /foo/;
          useAsyncEffect(async () => {
            console.log(local);
          }, [local]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'local'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      // Regression test
      code: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            if (true) {
              console.log(local);
            }
          }, []);
        }
      `,
      output: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            if (true) {
              console.log(local);
            }
          }, [local]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'local'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      // Regression test
      code: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            try {
              console.log(local);
            } finally {}
          }, []);
        }
      `,
      output: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            try {
              console.log(local);
            } finally {}
          }, [local]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'local'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      // Regression test
      code: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            function inner() {
              console.log(local);
            }
            inner();
          }, []);
        }
      `,
      output: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            function inner() {
              console.log(local);
            }
            inner();
          }, [local]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'local'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent() {
          const local1 = {};
          {
            const local2 = {};
            useAsyncEffect(async () => {
              console.log(local1);
              console.log(local2);
            }, []);
          }
        }
      `,
      output: `
        function MyComponent() {
          const local1 = {};
          {
            const local2 = {};
            useAsyncEffect(async () => {
              console.log(local1);
              console.log(local2);
            }, [local1, local2]);
          }
        }
      `,
      errors: [
        "React Hook useAsyncEffect has missing dependencies: 'local1' and 'local2'. " +
          'Either include them or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent() {
          const local1 = {};
          const local2 = {};
          useAsyncEffect(async () => {
            console.log(local1);
            console.log(local2);
          }, [local1]);
        }
      `,
      output: `
        function MyComponent() {
          const local1 = {};
          const local2 = {};
          useAsyncEffect(async () => {
            console.log(local1);
            console.log(local2);
          }, [local1, local2]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'local2'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent() {
          const local1 = {};
          function MyNestedComponent() {
            const local2 = {};
            useWorker(async () => {
              console.log(local1);
              console.log(local2);
            }, [local1]);
          }
        }
      `,
      output: `
        function MyComponent() {
          const local1 = {};
          function MyNestedComponent() {
            const local2 = {};
            useWorker(async () => {
              console.log(local1);
              console.log(local2);
            }, [local2]);
          }
        }
      `,
      errors: [
        "React Hook useWorker has a missing dependency: 'local2'. " +
          'Either include it or remove the dependency array. ' +
          "Outer scope values like 'local1' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        function MyComponent() {
          const local1 = {};
          function MyNestedComponent() {
            const local2 = {};
            useWorkerLoad(async () => {
              console.log(local1);
              console.log(local2);
            }, [local1]);
          }
        }
      `,
      output: `
        function MyComponent() {
          const local1 = {};
          function MyNestedComponent() {
            const local2 = {};
            useWorkerLoad(async () => {
              console.log(local1);
              console.log(local2);
            }, [local2]);
          }
        }
      `,
      errors: [
        "React Hook useWorkerLoad has a missing dependency: 'local2'. " +
          'Either include it or remove the dependency array. ' +
          "Outer scope values like 'local1' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
            console.log(local);
          }, []);
        }
      `,
      output: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
            console.log(local);
          }, [local]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'local'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
            console.log(local);
          }, [local, local]);
        }
      `,
      output: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
            console.log(local);
          }, [local]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a duplicate dependency: 'local'. " +
          'Either omit it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent() {
          useWorker(async () => {}, [window]);
        }
      `,
      output: `
        function MyComponent() {
          useWorker(async () => {}, []);
        }
      `,
      errors: [
        "React Hook useWorker has an unnecessary dependency: 'window'. " +
          'Either exclude it or remove the dependency array. ' +
          "Outer scope values like 'window' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        function MyComponent() {
          useWorkerLoad(async () => {}, [window]);
        }
      `,
      output: `
        function MyComponent() {
          useWorkerLoad(async () => {}, []);
        }
      `,
      errors: [
        "React Hook useWorkerLoad has an unnecessary dependency: 'window'. " +
          'Either exclude it or remove the dependency array. ' +
          "Outer scope values like 'window' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      // It is not valid for useWorker to specify extraneous deps
      // because it doesn't serve as a side effect trigger unlike useAsyncEffect.
      code: `
        function MyComponent(props) {
          let local = props.foo;
          useWorker(async () => {}, [local]);
        }
      `,
      output: `
        function MyComponent(props) {
          let local = props.foo;
          useWorker(async () => {}, []);
        }
      `,
      errors: [
        "React Hook useWorker has an unnecessary dependency: 'local'. " +
          'Either exclude it or remove the dependency array.',
      ],
    },
    {
      // It is not valid for useWorkerLoad to specify extraneous deps
      // because it doesn't serve as a side effect trigger unlike useAsyncEffect.
      code: `
        function MyComponent(props) {
          let local = props.foo;
          useWorkerLoad(async () => {}, [local]);
        }
      `,
      output: `
        function MyComponent(props) {
          let local = props.foo;
          useWorkerLoad(async () => {}, []);
        }
      `,
      errors: [
        "React Hook useWorkerLoad has an unnecessary dependency: 'local'. " +
          'Either exclude it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent({ history }) {
          useAsyncEffect(async () => {
            return history.listen();
          }, []);
        }
      `,
      output: `
        function MyComponent({ history }) {
          useAsyncEffect(async () => {
            return history.listen();
          }, [history]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'history'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent({ history }) {
          useAsyncEffect(async () => {
            return [
              history.foo.bar[2].dobedo.listen(),
              history.foo.bar().dobedo.listen[2]
            ];
          }, []);
        }
      `,
      output: `
        function MyComponent({ history }) {
          useAsyncEffect(async () => {
            return [
              history.foo.bar[2].dobedo.listen(),
              history.foo.bar().dobedo.listen[2]
            ];
          }, [history.foo]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'history.foo'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent() {
          useAsyncEffect(async () => {}, ['foo']);
        }
      `,
      // TODO: we could autofix this.
      output: `
        function MyComponent() {
          useAsyncEffect(async () => {}, ['foo']);
        }
      `,
      errors: [
        // Don't assume user meant `foo` because it's not used in the effect.
        "The 'foo' literal is not a valid dependency because it never changes. " +
          'You can safely remove it.',
      ],
    },
    {
      code: `
        function MyComponent({ foo, bar, baz }) {
          useAsyncEffect(async () => {
            console.log(foo, bar, baz);
          }, ['foo', 'bar']);
        }
      `,
      output: `
        function MyComponent({ foo, bar, baz }) {
          useAsyncEffect(async () => {
            console.log(foo, bar, baz);
          }, [bar, baz, foo]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has missing dependencies: 'bar', 'baz', and 'foo'. " +
          'Either include them or remove the dependency array.',
        "The 'foo' literal is not a valid dependency because it never changes. " +
          'Did you mean to include foo in the array instead?',
        "The 'bar' literal is not a valid dependency because it never changes. " +
          'Did you mean to include bar in the array instead?',
      ],
    },
    {
      code: `
        function MyComponent({ foo, bar, baz }) {
          useAsyncEffect(async () => {
            console.log(foo, bar, baz);
          }, [42, false, null]);
        }
      `,
      output: `
        function MyComponent({ foo, bar, baz }) {
          useAsyncEffect(async () => {
            console.log(foo, bar, baz);
          }, [bar, baz, foo]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has missing dependencies: 'bar', 'baz', and 'foo'. " +
          'Either include them or remove the dependency array.',
        'The 42 literal is not a valid dependency because it never changes. You can safely remove it.',
        'The false literal is not a valid dependency because it never changes. You can safely remove it.',
        'The null literal is not a valid dependency because it never changes. You can safely remove it.',
      ],
    },
    {
      code: `
        function MyComponent() {
          const dependencies = [];
          useAsyncEffect(async () => {}, dependencies);
        }
      `,
      output: `
        function MyComponent() {
          const dependencies = [];
          useAsyncEffect(async () => {}, dependencies);
        }
      `,
      errors: [
        'React Hook useAsyncEffect was passed a dependency list that is not an ' +
          "array literal. This means we can't statically verify whether you've " +
          'passed the correct dependencies.',
      ],
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          const dependencies = [local];
          useAsyncEffect(async () => {
            console.log(local);
          }, dependencies);
        }
      `,
      // TODO: should this autofix or bail out?
      output: `
        function MyComponent() {
          const local = {};
          const dependencies = [local];
          useAsyncEffect(async () => {
            console.log(local);
          }, [local]);
        }
      `,
      errors: [
        'React Hook useAsyncEffect was passed a dependency list that is not an ' +
          "array literal. This means we can't statically verify whether you've " +
          'passed the correct dependencies.',
        "React Hook useAsyncEffect has a missing dependency: 'local'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          const dependencies = [local];
          useAsyncEffect(async () => {
            console.log(local);
          }, [...dependencies]);
        }
      `,
      // TODO: should this autofix or bail out?
      output: `
        function MyComponent() {
          const local = {};
          const dependencies = [local];
          useAsyncEffect(async () => {
            console.log(local);
          }, [local]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'local'. " +
          'Either include it or remove the dependency array.',
        'React Hook useAsyncEffect has a spread element in its dependency array. ' +
          "This means we can't statically verify whether you've passed the " +
          'correct dependencies.',
      ],
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
          }, [local, ...dependencies]);
        }
      `,
      output: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
          }, [local, ...dependencies]);
        }
      `,
      errors: [
        'React Hook useAsyncEffect has a spread element in its dependency array. ' +
          "This means we can't statically verify whether you've passed the " +
          'correct dependencies.',
      ],
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
          }, [computeCacheKey(local)]);
        }
      `,
      // TODO: I'm not sure this is a good idea.
      // Maybe bail out?
      output: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
          }, [local]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'local'. " +
          'Either include it or remove the dependency array.',
        'React Hook useAsyncEffect has a complex expression in the dependency array. ' +
          'Extract it to a separate variable so it can be statically checked.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            console.log(props.items[0]);
          }, [props.items[0]]);
        }
      `,
      output: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            console.log(props.items[0]);
          }, [props.items]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'props.items'. " +
          'Either include it or remove the dependency array.',
        'React Hook useAsyncEffect has a complex expression in the dependency array. ' +
          'Extract it to a separate variable so it can be statically checked.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            console.log(props.items[0]);
          }, [props.items, props.items[0]]);
        }
      `,
      // TODO: ideally autofix would remove the bad expression?
      output: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            console.log(props.items[0]);
          }, [props.items, props.items[0]]);
        }
      `,
      errors: [
        'React Hook useAsyncEffect has a complex expression in the dependency array. ' +
          'Extract it to a separate variable so it can be statically checked.',
      ],
    },
    {
      code: `
        function MyComponent({ items }) {
          useAsyncEffect(async () => {
            console.log(items[0]);
          }, [items[0]]);
        }
      `,
      output: `
        function MyComponent({ items }) {
          useAsyncEffect(async () => {
            console.log(items[0]);
          }, [items]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'items'. " +
          'Either include it or remove the dependency array.',
        'React Hook useAsyncEffect has a complex expression in the dependency array. ' +
          'Extract it to a separate variable so it can be statically checked.',
      ],
    },
    {
      code: `
        function MyComponent({ items }) {
          useAsyncEffect(async () => {
            console.log(items[0]);
          }, [items, items[0]]);
        }
      `,
      // TODO: ideally autofix would remove the bad expression?
      output: `
        function MyComponent({ items }) {
          useAsyncEffect(async () => {
            console.log(items[0]);
          }, [items, items[0]]);
        }
      `,
      errors: [
        'React Hook useAsyncEffect has a complex expression in the dependency array. ' +
          'Extract it to a separate variable so it can be statically checked.',
      ],
    },
    {
      // It is not valid for useWorker to specify extraneous deps
      // because it doesn't serve as a side effect trigger unlike useAsyncEffect.
      // However, we generally allow specifying *broader* deps as escape hatch.
      // So while [props, props.foo] is unnecessary, 'props' wins here as the
      // broader one, and this is why 'props.foo' is reported as unnecessary.
      code: `
        function MyComponent(props) {
          const local = {};
          useWorker(async () => {
            console.log(props.foo);
            console.log(props.bar);
          }, [props, props.foo]);
        }
      `,
      output: `
        function MyComponent(props) {
          const local = {};
          useWorker(async () => {
            console.log(props.foo);
            console.log(props.bar);
          }, [props]);
        }
      `,
      errors: [
        "React Hook useWorker has an unnecessary dependency: 'props.foo'. " +
          'Either exclude it or remove the dependency array.',
      ],
    },
    {
      // Since we don't have 'props' in the list, we'll suggest narrow dependencies.
      code: `
        function MyComponent(props) {
          const local = {};
          useWorker(async () => {
            console.log(props.foo);
            console.log(props.bar);
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          const local = {};
          useWorker(async () => {
            console.log(props.foo);
            console.log(props.bar);
          }, [props.bar, props.foo]);
        }
      `,
      errors: [
        "React Hook useWorker has missing dependencies: 'props.bar' and 'props.foo'. " +
          'Either include them or remove the dependency array.',
      ],
    },
    {
      // It is not valid for useWorkerLoad to specify extraneous deps
      // because it doesn't serve as a side effect trigger unlike useAsyncEffect.
      // However, we generally allow specifying *broader* deps as escape hatch.
      // So while [props, props.foo] is unnecessary, 'props' wins here as the
      // broader one, and this is why 'props.foo' is reported as unnecessary.
      code: `
        function MyComponent(props) {
          const local = {};
          useWorkerLoad(async () => {
            console.log(props.foo);
            console.log(props.bar);
          }, [props, props.foo]);
        }
      `,
      output: `
        function MyComponent(props) {
          const local = {};
          useWorkerLoad(async () => {
            console.log(props.foo);
            console.log(props.bar);
          }, [props]);
        }
      `,
      errors: [
        "React Hook useWorkerLoad has an unnecessary dependency: 'props.foo'. " +
          'Either exclude it or remove the dependency array.',
      ],
    },
    {
      // Since we don't have 'props' in the list, we'll suggest narrow dependencies.
      code: `
        function MyComponent(props) {
          const local = {};
          useWorkerLoad(async () => {
            console.log(props.foo);
            console.log(props.bar);
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          const local = {};
          useWorkerLoad(async () => {
            console.log(props.foo);
            console.log(props.bar);
          }, [props.bar, props.foo]);
        }
      `,
      errors: [
        "React Hook useWorkerLoad has missing dependencies: 'props.bar' and 'props.foo'. " +
          'Either include them or remove the dependency array.',
      ],
    },
    {
      // Effects are allowed to over-specify deps. We'll complain about missing
      // 'local', but we won't remove the already-specified 'local.id' from your list.
      code: `
        function MyComponent() {
          const local = {id: 42};
          useAsyncEffect(async () => {
            console.log(local);
          }, [local.id]);
        }
      `,
      output: `
        function MyComponent() {
          const local = {id: 42};
          useAsyncEffect(async () => {
            console.log(local);
          }, [local, local.id]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'local'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      // Callbacks are not allowed to over-specify deps. So we'll complain about missing
      // 'local' and we will also *remove* 'local.id' from your list.
      code: `
        function MyComponent() {
          const local = {id: 42};
          const fn = useWorker(async () => {
            console.log(local);
          }, [local.id]);
        }
      `,
      output: `
        function MyComponent() {
          const local = {id: 42};
          const fn = useWorker(async () => {
            console.log(local);
          }, [local]);
        }
      `,
      errors: [
        "React Hook useWorker has a missing dependency: 'local'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      // Callbacks are not allowed to over-specify deps. So we'll complain about
      // the unnecessary 'local.id'.
      code: `
        function MyComponent() {
          const local = {id: 42};
          const fn = useWorker(async () => {
            console.log(local);
          }, [local.id, local]);
        }
      `,
      output: `
        function MyComponent() {
          const local = {id: 42};
          const fn = useWorker(async () => {
            console.log(local);
          }, [local]);
        }
      `,
      errors: [
        "React Hook useWorker has an unnecessary dependency: 'local.id'. " +
          'Either exclude it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          const fn = useWorker(async () => {
            console.log(props.foo.bar.baz);
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          const fn = useWorker(async () => {
            console.log(props.foo.bar.baz);
          }, [props.foo.bar.baz]);
        }
      `,
      errors: [
        "React Hook useWorker has a missing dependency: 'props.foo.bar.baz'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          let color = {}
          const fn = useWorker(async () => {
            console.log(props.foo.bar.baz);
            console.log(color);
          }, [props.foo, props.foo.bar.baz]);
        }
      `,
      output: `
        function MyComponent(props) {
          let color = {}
          const fn = useWorker(async () => {
            console.log(props.foo.bar.baz);
            console.log(color);
          }, [color, props.foo.bar.baz]);
        }
      `,
      errors: [
        "React Hook useWorker has a missing dependency: 'color'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      // Callbacks are not allowed to over-specify deps. So one of these is extra.
      // However, it *is* allowed to specify broader deps then strictly necessary.
      // So in this case we ask you to remove 'props.foo.bar.baz' because 'props.foo'
      // already covers it, and having both is unnecessary.
      // TODO: maybe consider suggesting a narrower one by default in these cases.
      code: `
        function MyComponent(props) {
          const fn = useWorker(async () => {
            console.log(props.foo.bar.baz);
          }, [props.foo.bar.baz, props.foo]);
        }
      `,
      output: `
        function MyComponent(props) {
          const fn = useWorker(async () => {
            console.log(props.foo.bar.baz);
          }, [props.foo]);
        }
      `,
      errors: [
        "React Hook useWorker has an unnecessary dependency: 'props.foo.bar.baz'. " +
          'Either exclude it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          const fn = useWorker(async () => {
            console.log(props.foo.bar.baz);
            console.log(props.foo.fizz.bizz);
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          const fn = useWorker(async () => {
            console.log(props.foo.bar.baz);
            console.log(props.foo.fizz.bizz);
          }, [props.foo.bar.baz, props.foo.fizz.bizz]);
        }
      `,
      errors: [
        "React Hook useWorker has missing dependencies: 'props.foo.bar.baz' and 'props.foo.fizz.bizz'. " +
          'Either include them or remove the dependency array.',
      ],
    },
    {
      // Normally we allow specifying deps too broadly.
      // So we'd be okay if 'props.foo.bar' was there rather than 'props.foo.bar.baz'.
      // However, 'props.foo.bar.baz' is missing. So we know there is a mistake.
      // When we're sure there is a mistake, for callbacks we will rebuild the list
      // from scratch. This will set the user on a better path by default.
      // This is why we end up with just 'props.foo.bar', and not them both.
      code: `
        function MyComponent(props) {
          const fn = useWorker(async () => {
            console.log(props.foo.bar);
          }, [props.foo.bar.baz]);
        }
      `,
      output: `
        function MyComponent(props) {
          const fn = useWorker(async () => {
            console.log(props.foo.bar);
          }, [props.foo.bar]);
        }
      `,
      errors: [
        "React Hook useWorker has a missing dependency: 'props.foo.bar'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          const fn = useWorker(async () => {
            console.log(props);
            console.log(props.hello);
          }, [props.foo.bar.baz]);
        }
      `,
      output: `
        function MyComponent(props) {
          const fn = useWorker(async () => {
            console.log(props);
            console.log(props.hello);
          }, [props]);
        }
      `,
      errors: [
        "React Hook useWorker has a missing dependency: 'props'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      // Callbacks are not allowed to over-specify deps. So we'll complain about missing
      // 'local' and we will also *remove* 'local.id' from your list.
      code: `
        function MyComponent() {
          const local = {id: 42};
          const fn = useWorkerLoad(async () => {
            console.log(local);
          }, [local.id]);
        }
      `,
      output: `
        function MyComponent() {
          const local = {id: 42};
          const fn = useWorkerLoad(async () => {
            console.log(local);
          }, [local]);
        }
      `,
      errors: [
        "React Hook useWorkerLoad has a missing dependency: 'local'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      // Callbacks are not allowed to over-specify deps. So we'll complain about
      // the unnecessary 'local.id'.
      code: `
        function MyComponent() {
          const local = {id: 42};
          const fn = useWorkerLoad(async () => {
            console.log(local);
          }, [local.id, local]);
        }
      `,
      output: `
        function MyComponent() {
          const local = {id: 42};
          const fn = useWorkerLoad(async () => {
            console.log(local);
          }, [local]);
        }
      `,
      errors: [
        "React Hook useWorkerLoad has an unnecessary dependency: 'local.id'. " +
          'Either exclude it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          const fn = useWorkerLoad(async () => {
            console.log(props.foo.bar.baz);
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          const fn = useWorkerLoad(async () => {
            console.log(props.foo.bar.baz);
          }, [props.foo.bar.baz]);
        }
      `,
      errors: [
        "React Hook useWorkerLoad has a missing dependency: 'props.foo.bar.baz'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          let color = {}
          const fn = useWorkerLoad(async () => {
            console.log(props.foo.bar.baz);
            console.log(color);
          }, [props.foo, props.foo.bar.baz]);
        }
      `,
      output: `
        function MyComponent(props) {
          let color = {}
          const fn = useWorkerLoad(async () => {
            console.log(props.foo.bar.baz);
            console.log(color);
          }, [color, props.foo.bar.baz]);
        }
      `,
      errors: [
        "React Hook useWorkerLoad has a missing dependency: 'color'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      // Callbacks are not allowed to over-specify deps. So one of these is extra.
      // However, it *is* allowed to specify broader deps then strictly necessary.
      // So in this case we ask you to remove 'props.foo.bar.baz' because 'props.foo'
      // already covers it, and having both is unnecessary.
      // TODO: maybe consider suggesting a narrower one by default in these cases.
      code: `
        function MyComponent(props) {
          const fn = useWorkerLoad(async () => {
            console.log(props.foo.bar.baz);
          }, [props.foo.bar.baz, props.foo]);
        }
      `,
      output: `
        function MyComponent(props) {
          const fn = useWorkerLoad(async () => {
            console.log(props.foo.bar.baz);
          }, [props.foo]);
        }
      `,
      errors: [
        "React Hook useWorkerLoad has an unnecessary dependency: 'props.foo.bar.baz'. " +
          'Either exclude it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          const fn = useWorkerLoad(async () => {
            console.log(props.foo.bar.baz);
            console.log(props.foo.fizz.bizz);
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          const fn = useWorkerLoad(async () => {
            console.log(props.foo.bar.baz);
            console.log(props.foo.fizz.bizz);
          }, [props.foo.bar.baz, props.foo.fizz.bizz]);
        }
      `,
      errors: [
        "React Hook useWorkerLoad has missing dependencies: 'props.foo.bar.baz' and 'props.foo.fizz.bizz'. " +
          'Either include them or remove the dependency array.',
      ],
    },
    {
      // Normally we allow specifying deps too broadly.
      // So we'd be okay if 'props.foo.bar' was there rather than 'props.foo.bar.baz'.
      // However, 'props.foo.bar.baz' is missing. So we know there is a mistake.
      // When we're sure there is a mistake, for callbacks we will rebuild the list
      // from scratch. This will set the user on a better path by default.
      // This is why we end up with just 'props.foo.bar', and not them both.
      code: `
        function MyComponent(props) {
          const fn = useWorkerLoad(async () => {
            console.log(props.foo.bar);
          }, [props.foo.bar.baz]);
        }
      `,
      output: `
        function MyComponent(props) {
          const fn = useWorkerLoad(async () => {
            console.log(props.foo.bar);
          }, [props.foo.bar]);
        }
      `,
      errors: [
        "React Hook useWorkerLoad has a missing dependency: 'props.foo.bar'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          const fn = useWorkerLoad(async () => {
            console.log(props);
            console.log(props.hello);
          }, [props.foo.bar.baz]);
        }
      `,
      output: `
        function MyComponent(props) {
          const fn = useWorkerLoad(async () => {
            console.log(props);
            console.log(props.hello);
          }, [props]);
        }
      `,
      errors: [
        "React Hook useWorkerLoad has a missing dependency: 'props'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
          }, [local, local]);
        }
      `,
      output: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
          }, [local]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a duplicate dependency: 'local'. " +
          'Either omit it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent() {
          const local1 = {};
          useWorker(async () => {
            const local1 = {};
            console.log(local1);
          }, [local1]);
        }
      `,
      output: `
        function MyComponent() {
          const local1 = {};
          useWorker(async () => {
            const local1 = {};
            console.log(local1);
          }, []);
        }
      `,
      errors: [
        "React Hook useWorker has an unnecessary dependency: 'local1'. " +
          'Either exclude it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent() {
          const local1 = {};
          useWorker(async () => {}, [local1]);
        }
      `,
      output: `
        function MyComponent() {
          const local1 = {};
          useWorker(async () => {}, []);
        }
      `,
      errors: [
        "React Hook useWorker has an unnecessary dependency: 'local1'. " +
          'Either exclude it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent() {
          const local1 = {};
          useWorkerLoad(async () => {
            const local1 = {};
            console.log(local1);
          }, [local1]);
        }
      `,
      output: `
        function MyComponent() {
          const local1 = {};
          useWorkerLoad(async () => {
            const local1 = {};
            console.log(local1);
          }, []);
        }
      `,
      errors: [
        "React Hook useWorkerLoad has an unnecessary dependency: 'local1'. " +
          'Either exclude it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent() {
          const local1 = {};
          useWorkerLoad(async () => {}, [local1]);
        }
      `,
      output: `
        function MyComponent() {
          const local1 = {};
          useWorkerLoad(async () => {}, []);
        }
      `,
      errors: [
        "React Hook useWorkerLoad has an unnecessary dependency: 'local1'. " +
          'Either exclude it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            console.log(props.foo);
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            console.log(props.foo);
          }, [props.foo]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'props.foo'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            console.log(props.foo);
            console.log(props.bar);
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            console.log(props.foo);
            console.log(props.bar);
          }, [props.bar, props.foo]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has missing dependencies: 'props.bar' and 'props.foo'. " +
          'Either include them or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          let a, b, c, d, e, f, g;
          useAsyncEffect(async () => {
            console.log(b, e, d, c, a, g, f);
          }, [c, a, g]);
        }
      `,
      // Don't alphabetize if it wasn't alphabetized in the first place.
      output: `
        function MyComponent(props) {
          let a, b, c, d, e, f, g;
          useAsyncEffect(async () => {
            console.log(b, e, d, c, a, g, f);
          }, [c, a, g, b, e, d, f]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has missing dependencies: 'b', 'd', 'e', and 'f'. " +
          'Either include them or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          let a, b, c, d, e, f, g;
          useAsyncEffect(async () => {
            console.log(b, e, d, c, a, g, f);
          }, [a, c, g]);
        }
      `,
      // Alphabetize if it was alphabetized.
      output: `
        function MyComponent(props) {
          let a, b, c, d, e, f, g;
          useAsyncEffect(async () => {
            console.log(b, e, d, c, a, g, f);
          }, [a, b, c, d, e, f, g]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has missing dependencies: 'b', 'd', 'e', and 'f'. " +
          'Either include them or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          let a, b, c, d, e, f, g;
          useAsyncEffect(async () => {
            console.log(b, e, d, c, a, g, f);
          }, []);
        }
      `,
      // Alphabetize if it was empty.
      output: `
        function MyComponent(props) {
          let a, b, c, d, e, f, g;
          useAsyncEffect(async () => {
            console.log(b, e, d, c, a, g, f);
          }, [a, b, c, d, e, f, g]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has missing dependencies: 'a', 'b', 'c', 'd', 'e', 'f', and 'g'. " +
          'Either include them or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          const local = {};
          useAsyncEffect(async () => {
            console.log(props.foo);
            console.log(props.bar);
            console.log(local);
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          const local = {};
          useAsyncEffect(async () => {
            console.log(props.foo);
            console.log(props.bar);
            console.log(local);
          }, [local, props.bar, props.foo]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has missing dependencies: 'local', 'props.bar', and 'props.foo'. " +
          'Either include them or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          const local = {};
          useAsyncEffect(async () => {
            console.log(props.foo);
            console.log(props.bar);
            console.log(local);
          }, [props]);
        }
      `,
      output: `
        function MyComponent(props) {
          const local = {};
          useAsyncEffect(async () => {
            console.log(props.foo);
            console.log(props.bar);
            console.log(local);
          }, [local, props]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'local'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            console.log(props.foo);
          }, []);
          useWorker(async () => {
            console.log(props.foo);
          }, []);
          useEffectUpdate(() => {
            console.log(props.foo);
          }, []);
          React.useAsyncEffect(async () => {
            console.log(props.foo);
          }, []);
          React.useWorker(async () => {
            console.log(props.foo);
          }, []);
          React.useEffectUpdate(() => {
            console.log(props.foo);
          }, []);
          React.notReactiveHook(() => {
            console.log(props.foo);
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            console.log(props.foo);
          }, [props.foo]);
          useWorker(async () => {
            console.log(props.foo);
          }, [props.foo]);
          useEffectUpdate(() => {
            console.log(props.foo);
          }, [props.foo]);
          React.useAsyncEffect(async () => {
            console.log(props.foo);
          }, [props.foo]);
          React.useWorker(async () => {
            console.log(props.foo);
          }, [props.foo]);
          React.useEffectUpdate(() => {
            console.log(props.foo);
          }, [props.foo]);
          React.notReactiveHook(() => {
            console.log(props.foo);
          }, []);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'props.foo'. " +
          'Either include it or remove the dependency array.',
        "React Hook useWorker has a missing dependency: 'props.foo'. " +
          'Either include it or remove the dependency array.',
        "React Hook useEffectUpdate has a missing dependency: 'props.foo'. " +
          'Either include it or remove the dependency array.',
        "React Hook React.useAsyncEffect has a missing dependency: 'props.foo'. " +
          'Either include it or remove the dependency array.',
        "React Hook React.useWorker has a missing dependency: 'props.foo'. " +
          'Either include it or remove the dependency array.',
        "React Hook React.useEffectUpdate has a missing dependency: 'props.foo'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            console.log(props.foo);
          }, []);
          useWorkerLoad(async () => {
            console.log(props.foo);
          }, []);
          useEffectUpdate(() => {
            console.log(props.foo);
          }, []);
          React.useAsyncEffect(async () => {
            console.log(props.foo);
          }, []);
          React.useWorkerLoad(async () => {
            console.log(props.foo);
          }, []);
          React.useEffectUpdate(() => {
            console.log(props.foo);
          }, []);
          React.notReactiveHook(() => {
            console.log(props.foo);
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            console.log(props.foo);
          }, [props.foo]);
          useWorkerLoad(async () => {
            console.log(props.foo);
          }, [props.foo]);
          useEffectUpdate(() => {
            console.log(props.foo);
          }, [props.foo]);
          React.useAsyncEffect(async () => {
            console.log(props.foo);
          }, [props.foo]);
          React.useWorkerLoad(async () => {
            console.log(props.foo);
          }, [props.foo]);
          React.useEffectUpdate(() => {
            console.log(props.foo);
          }, [props.foo]);
          React.notReactiveHook(() => {
            console.log(props.foo);
          }, []);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'props.foo'. " +
          'Either include it or remove the dependency array.',
        "React Hook useWorkerLoad has a missing dependency: 'props.foo'. " +
          'Either include it or remove the dependency array.',
        "React Hook useEffectUpdate has a missing dependency: 'props.foo'. " +
          'Either include it or remove the dependency array.',
        "React Hook React.useAsyncEffect has a missing dependency: 'props.foo'. " +
          'Either include it or remove the dependency array.',
        "React Hook React.useWorkerLoad has a missing dependency: 'props.foo'. " +
          'Either include it or remove the dependency array.',
        "React Hook React.useEffectUpdate has a missing dependency: 'props.foo'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
          }, [a ? local : b]);
        }
      `,
      // TODO: should we bail out instead?
      output: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
          }, [local]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'local'. " +
          'Either include it or remove the dependency array.',
        'React Hook useAsyncEffect has a complex expression in the dependency array. ' +
          'Extract it to a separate variable so it can be statically checked.',
      ],
    },
    {
      code: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
          }, [a && local]);
        }
      `,
      // TODO: should we bail out instead?
      output: `
        function MyComponent() {
          const local = {};
          useAsyncEffect(async () => {
            console.log(local);
          }, [local]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'local'. " +
          'Either include it or remove the dependency array.',
        'React Hook useAsyncEffect has a complex expression in the dependency array. ' +
          'Extract it to a separate variable so it can be statically checked.',
      ],
    },
    {
      code: `
        function MyComponent() {
          const ref = useRef();
          const [state, setState] = useState();
          useAsyncEffect(async () => {
            ref.current = {};
            setState(state + 1);
          }, []);
        }
      `,
      output: `
        function MyComponent() {
          const ref = useRef();
          const [state, setState] = useState();
          useAsyncEffect(async () => {
            ref.current = {};
            setState(state + 1);
          }, [state]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'state'. " +
          'Either include it or remove the dependency array. ' +
          `You can also do a functional update 'setState(s => ...)' ` +
          `if you only need 'state' in the 'setState' call.`,
      ],
    },
    {
      code: `
        function MyComponent() {
          const ref = useRef();
          const [state, setState] = useState();
          useAsyncEffect(async () => {
            ref.current = {};
            setState(state + 1);
          }, [ref]);
        }
      `,
      // We don't ask to remove static deps but don't add them either.
      // Don't suggest removing "ref" (it's fine either way)
      // but *do* add "state". *Don't* add "setState" ourselves.
      output: `
        function MyComponent() {
          const ref = useRef();
          const [state, setState] = useState();
          useAsyncEffect(async () => {
            ref.current = {};
            setState(state + 1);
          }, [ref, state]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'state'. " +
          'Either include it or remove the dependency array. ' +
          `You can also do a functional update 'setState(s => ...)' ` +
          `if you only need 'state' in the 'setState' call.`,
      ],
    },
    {
      code: `
        function MyComponent(props) {
          const ref1 = useRef();
          const ref2 = useRef();
          useAsyncEffect(async () => {
            ref1.current.focus();
            console.log(ref2.current.textContent);
            alert(props.someOtherRefs.current.innerHTML);
            fetch(props.color);
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          const ref1 = useRef();
          const ref2 = useRef();
          useAsyncEffect(async () => {
            ref1.current.focus();
            console.log(ref2.current.textContent);
            alert(props.someOtherRefs.current.innerHTML);
            fetch(props.color);
          }, [props.color, props.someOtherRefs]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has missing dependencies: 'props.color' and 'props.someOtherRefs'. " +
          'Either include them or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          const ref1 = useRef();
          const ref2 = useRef();
          useAsyncEffect(async () => {
            ref1.current.focus();
            console.log(ref2.current.textContent);
            alert(props.someOtherRefs.current.innerHTML);
            fetch(props.color);
          }, [ref1.current, ref2.current, props.someOtherRefs, props.color]);
        }
      `,
      output: `
        function MyComponent(props) {
          const ref1 = useRef();
          const ref2 = useRef();
          useAsyncEffect(async () => {
            ref1.current.focus();
            console.log(ref2.current.textContent);
            alert(props.someOtherRefs.current.innerHTML);
            fetch(props.color);
          }, [props.someOtherRefs, props.color]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has unnecessary dependencies: 'ref1.current' and 'ref2.current'. " +
          'Either exclude them or remove the dependency array. ' +
          "Mutable values like 'ref1.current' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        function MyComponent() {
          const ref = useRef();
          useAsyncEffect(async () => {
            console.log(ref.current);
          }, [ref.current]);
        }
      `,
      output: `
        function MyComponent() {
          const ref = useRef();
          useAsyncEffect(async () => {
            console.log(ref.current);
          }, []);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has an unnecessary dependency: 'ref.current'. " +
          'Either exclude it or remove the dependency array. ' +
          "Mutable values like 'ref.current' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        function MyComponent({ activeTab }) {
          const ref1 = useRef();
          const ref2 = useRef();
          useAsyncEffect(async () => {
            ref1.current.scrollTop = 0;
            ref2.current.scrollTop = 0;
          }, [ref1.current, ref2.current, activeTab]);
        }
      `,
      output: `
        function MyComponent({ activeTab }) {
          const ref1 = useRef();
          const ref2 = useRef();
          useAsyncEffect(async () => {
            ref1.current.scrollTop = 0;
            ref2.current.scrollTop = 0;
          }, [activeTab]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has unnecessary dependencies: 'ref1.current' and 'ref2.current'. " +
          'Either exclude them or remove the dependency array. ' +
          "Mutable values like 'ref1.current' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        function MyComponent({ activeTab, initY }) {
          const ref1 = useRef();
          const ref2 = useRef();
          const fn = useWorker(async () => {
            ref1.current.scrollTop = initY;
            ref2.current.scrollTop = initY;
          }, [ref1.current, ref2.current, activeTab, initY]);
        }
      `,
      output: `
        function MyComponent({ activeTab, initY }) {
          const ref1 = useRef();
          const ref2 = useRef();
          const fn = useWorker(async () => {
            ref1.current.scrollTop = initY;
            ref2.current.scrollTop = initY;
          }, [initY]);
        }
      `,
      errors: [
        "React Hook useWorker has unnecessary dependencies: 'activeTab', 'ref1.current', and 'ref2.current'. " +
          'Either exclude them or remove the dependency array. ' +
          "Mutable values like 'ref1.current' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        function MyComponent({ activeTab, initY }) {
          const ref1 = useRef();
          const ref2 = useRef();
          const fn = useWorkerLoad(async () => {
            ref1.current.scrollTop = initY;
            ref2.current.scrollTop = initY;
          }, [ref1.current, ref2.current, activeTab, initY]);
        }
      `,
      output: `
        function MyComponent({ activeTab, initY }) {
          const ref1 = useRef();
          const ref2 = useRef();
          const fn = useWorkerLoad(async () => {
            ref1.current.scrollTop = initY;
            ref2.current.scrollTop = initY;
          }, [initY]);
        }
      `,
      errors: [
        "React Hook useWorkerLoad has unnecessary dependencies: 'activeTab', 'ref1.current', and 'ref2.current'. " +
          'Either exclude them or remove the dependency array. ' +
          "Mutable values like 'ref1.current' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        function MyComponent() {
          const ref = useRef();
          useAsyncEffect(async () => {
            console.log(ref.current);
          }, [ref.current, ref]);
        }
      `,
      output: `
        function MyComponent() {
          const ref = useRef();
          useAsyncEffect(async () => {
            console.log(ref.current);
          }, [ref]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has an unnecessary dependency: 'ref.current'. " +
          'Either exclude it or remove the dependency array. ' +
          "Mutable values like 'ref.current' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        const MyComponent = forwardRef((props, ref) => {
          useConditionalEffect(ref, () => ({
            focus() {
              alert(props.hello);
            }
          }), [])
        });
      `,
      output: `
        const MyComponent = forwardRef((props, ref) => {
          useConditionalEffect(ref, () => ({
            focus() {
              alert(props.hello);
            }
          }), [props.hello])
        });
      `,
      errors: [
        "React Hook useConditionalEffect has a missing dependency: 'props.hello'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            if (props.onChange) {
              props.onChange();
            }
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            if (props.onChange) {
              props.onChange();
            }
          }, [props]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'props'. " +
          'Either include it or remove the dependency array. ' +
          `However, 'props' will change when *any* prop changes, so the ` +
          `preferred fix is to destructure the 'props' object outside ` +
          `of the useAsyncEffect call and refer to those specific ` +
          `props inside useAsyncEffect.`,
      ],
    },
    {
      code: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
           function play() {
              props.onPlay();
            }
            function pause() {
              props.onPause();
            }
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
           function play() {
              props.onPlay();
            }
            function pause() {
              props.onPause();
            }
          }, [props]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'props'. " +
          'Either include it or remove the dependency array. ' +
          `However, 'props' will change when *any* prop changes, so the ` +
          `preferred fix is to destructure the 'props' object outside ` +
          `of the useAsyncEffect call and refer to those specific ` +
          `props inside useAsyncEffect.`,
      ],
    },
    {
      code: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            if (props.foo.onChange) {
              props.foo.onChange();
            }
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            if (props.foo.onChange) {
              props.foo.onChange();
            }
          }, [props.foo]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'props.foo'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            props.onChange();
            if (props.foo.onChange) {
              props.foo.onChange();
            }
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            props.onChange();
            if (props.foo.onChange) {
              props.foo.onChange();
            }
          }, [props]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'props'. " +
          'Either include it or remove the dependency array. ' +
          `However, 'props' will change when *any* prop changes, so the ` +
          `preferred fix is to destructure the 'props' object outside ` +
          `of the useAsyncEffect call and refer to those specific ` +
          `props inside useAsyncEffect.`,
      ],
    },
    {
      code: `
        function MyComponent(props) {
          const [skillsCount] = useState();
          useAsyncEffect(async () => {
            if (skillsCount === 0 && !props.isEditMode) {
              props.toggleEditMode();
            }
          }, [skillsCount, props.isEditMode, props.toggleEditMode]);
        }
      `,
      output: `
        function MyComponent(props) {
          const [skillsCount] = useState();
          useAsyncEffect(async () => {
            if (skillsCount === 0 && !props.isEditMode) {
              props.toggleEditMode();
            }
          }, [skillsCount, props.isEditMode, props.toggleEditMode, props]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'props'. " +
          'Either include it or remove the dependency array. ' +
          `However, 'props' will change when *any* prop changes, so the ` +
          `preferred fix is to destructure the 'props' object outside ` +
          `of the useAsyncEffect call and refer to those specific ` +
          `props inside useAsyncEffect.`,
      ],
    },
    {
      code: `
        function MyComponent(props) {
          const [skillsCount] = useState();
          useAsyncEffect(async () => {
            if (skillsCount === 0 && !props.isEditMode) {
              props.toggleEditMode();
            }
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          const [skillsCount] = useState();
          useAsyncEffect(async () => {
            if (skillsCount === 0 && !props.isEditMode) {
              props.toggleEditMode();
            }
          }, [props, skillsCount]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has missing dependencies: 'props' and 'skillsCount'. " +
          'Either include them or remove the dependency array. ' +
          `However, 'props' will change when *any* prop changes, so the ` +
          `preferred fix is to destructure the 'props' object outside ` +
          `of the useAsyncEffect call and refer to those specific ` +
          `props inside useAsyncEffect.`,
      ],
    },
    {
      code: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            externalCall(props);
            props.onChange();
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            externalCall(props);
            props.onChange();
          }, [props]);
        }
      `,
      // Don't suggest to destructure props here since you can't.
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'props'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            props.onChange();
            externalCall(props);
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          useAsyncEffect(async () => {
            props.onChange();
            externalCall(props);
          }, [props]);
        }
      `,
      // Don't suggest to destructure props here since you can't.
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'props'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent(props) {
          let value;
          let value2;
          let value3;
          let value4;
          let asyncValue;
          useAsyncEffect(async () => {
            if (value4) {
              value = {};
            }
            value2 = 100;
            value = 43;
            value4 = true;
            console.log(value2);
            console.log(value3);
            setTimeout(() => {
              asyncValue = 100;
            });
          }, []);
        }
      `,
      // This is a separate warning unrelated to others.
      // We could've made a separate rule for it but it's rare enough to name it.
      // No autofix suggestion because the intent isn't clear.
      output: `
        function MyComponent(props) {
          let value;
          let value2;
          let value3;
          let value4;
          let asyncValue;
          useAsyncEffect(async () => {
            if (value4) {
              value = {};
            }
            value2 = 100;
            value = 43;
            value4 = true;
            console.log(value2);
            console.log(value3);
            setTimeout(() => {
              asyncValue = 100;
            });
          }, []);
        }
      `,
      errors: [
        // value2
        `Assignments to the 'value2' variable from inside React Hook useAsyncEffect ` +
          `will be lost after each render. To preserve the value over time, ` +
          `store it in a useRef or useLazyRef Hook and keep the mutable value in the '.current' property. ` +
          `Otherwise, you can move this variable directly inside useAsyncEffect.`, // value
        `Assignments to the 'value' variable from inside React Hook useAsyncEffect ` +
          `will be lost after each render. To preserve the value over time, ` +
          `store it in a useRef or useLazyRef Hook and keep the mutable value in the '.current' property. ` +
          `Otherwise, you can move this variable directly inside useAsyncEffect.`, // value4
        `Assignments to the 'value4' variable from inside React Hook useAsyncEffect ` +
          `will be lost after each render. To preserve the value over time, ` +
          `store it in a useRef or useLazyRef Hook and keep the mutable value in the '.current' property. ` +
          `Otherwise, you can move this variable directly inside useAsyncEffect.`, // asyncValue
        `Assignments to the 'asyncValue' variable from inside React Hook useAsyncEffect ` +
          `will be lost after each render. To preserve the value over time, ` +
          `store it in a useRef or useLazyRef Hook and keep the mutable value in the '.current' property. ` +
          `Otherwise, you can move this variable directly inside useAsyncEffect.`,
      ],
    },
    {
      code: `
        function MyComponent(props) {
          let value;
          let value2;
          let value3;
          let asyncValue;
          useAsyncEffect(async () => {
            value = {};
            value2 = 100;
            value = 43;
            console.log(value2);
            console.log(value3);
            setTimeout(() => {
              asyncValue = 100;
            });
          }, [value, value2, value3]);
        }
      `,
      // This is a separate warning unrelated to others.
      // We could've made a separate rule for it but it's rare enough to name it.
      // No autofix suggestion because the intent isn't clear.
      output: `
        function MyComponent(props) {
          let value;
          let value2;
          let value3;
          let asyncValue;
          useAsyncEffect(async () => {
            value = {};
            value2 = 100;
            value = 43;
            console.log(value2);
            console.log(value3);
            setTimeout(() => {
              asyncValue = 100;
            });
          }, [value, value2, value3]);
        }
      `,
      errors: [
        // value
        `Assignments to the 'value' variable from inside React Hook useAsyncEffect ` +
          `will be lost after each render. To preserve the value over time, ` +
          `store it in a useRef or useLazyRef Hook and keep the mutable value in the '.current' property. ` +
          `Otherwise, you can move this variable directly inside useAsyncEffect.`, // value2
        `Assignments to the 'value2' variable from inside React Hook useAsyncEffect ` +
          `will be lost after each render. To preserve the value over time, ` +
          `store it in a useRef or useLazyRef Hook and keep the mutable value in the '.current' property. ` +
          `Otherwise, you can move this variable directly inside useAsyncEffect.`, // asyncValue
        `Assignments to the 'asyncValue' variable from inside React Hook useAsyncEffect ` +
          `will be lost after each render. To preserve the value over time, ` +
          `store it in a useRef or useLazyRef Hook and keep the mutable value in the '.current' property. ` +
          `Otherwise, you can move this variable directly inside useAsyncEffect.`,
      ],
    },
    {
      code: `
        function MyComponent() {
          const myRef = useRef();
          useAsyncEffect(async () => {
            const handleMove = () => {};
            myRef.current.addEventListener('mousemove', handleMove);
            return () => myRef.current.removeEventListener('mousemove', handleMove);
          }, []);
          return <div ref={myRef} />;
        }
      `,
      output: `
        function MyComponent() {
          const myRef = useRef();
          useAsyncEffect(async () => {
            const handleMove = () => {};
            myRef.current.addEventListener('mousemove', handleMove);
            return () => myRef.current.removeEventListener('mousemove', handleMove);
          }, []);
          return <div ref={myRef} />;
        }
      `,
      errors: [
        `The ref value 'myRef.current' will likely have changed by the time ` +
          `this effect cleanup function runs. If this ref points to a node ` +
          `rendered by React, copy 'myRef.current' to a variable inside the effect, ` +
          `and use that variable in the cleanup function.`,
      ],
    },
    {
      code: `
        function MyComponent() {
          const myRef = useRef();
          useAsyncEffect(async () => {
            const handleMove = () => {};
            myRef.current.addEventListener('mousemove', handleMove);
            return () => myRef.current.removeEventListener('mousemove', handleMove);
          });
          return <div ref={myRef} />;
        }
      `,
      output: `
        function MyComponent() {
          const myRef = useRef();
          useAsyncEffect(async () => {
            const handleMove = () => {};
            myRef.current.addEventListener('mousemove', handleMove);
            return () => myRef.current.removeEventListener('mousemove', handleMove);
          });
          return <div ref={myRef} />;
        }
      `,
      errors: [
        `The ref value 'myRef.current' will likely have changed by the time ` +
          `this effect cleanup function runs. If this ref points to a node ` +
          `rendered by React, copy 'myRef.current' to a variable inside the effect, ` +
          `and use that variable in the cleanup function.`,
      ],
    },
    {
      code: `
        function useMyThing(myRef) {
          useAsyncEffect(async () => {
            const handleMove = () => {};
            myRef.current.addEventListener('mousemove', handleMove);
            return () => myRef.current.removeEventListener('mousemove', handleMove);
          }, [myRef]);
        }
      `,
      output: `
        function useMyThing(myRef) {
          useAsyncEffect(async () => {
            const handleMove = () => {};
            myRef.current.addEventListener('mousemove', handleMove);
            return () => myRef.current.removeEventListener('mousemove', handleMove);
          }, [myRef]);
        }
      `,
      errors: [
        `The ref value 'myRef.current' will likely have changed by the time ` +
          `this effect cleanup function runs. If this ref points to a node ` +
          `rendered by React, copy 'myRef.current' to a variable inside the effect, ` +
          `and use that variable in the cleanup function.`,
      ],
    },
    {
      code: `
        function useMyThing(myRef) {
          useAsyncEffect(async () => {
            const handleMouse = () => {};
            myRef.current.addEventListener('mousemove', handleMouse);
            myRef.current.addEventListener('mousein', handleMouse);
            return function() {
              setTimeout(() => {
                myRef.current.removeEventListener('mousemove', handleMouse);
                myRef.current.removeEventListener('mousein', handleMouse);
              });
            }
          }, [myRef]);
        }
      `,
      output: `
        function useMyThing(myRef) {
          useAsyncEffect(async () => {
            const handleMouse = () => {};
            myRef.current.addEventListener('mousemove', handleMouse);
            myRef.current.addEventListener('mousein', handleMouse);
            return function() {
              setTimeout(() => {
                myRef.current.removeEventListener('mousemove', handleMouse);
                myRef.current.removeEventListener('mousein', handleMouse);
              });
            }
          }, [myRef]);
        }
      `,
      errors: [
        `The ref value 'myRef.current' will likely have changed by the time ` +
          `this effect cleanup function runs. If this ref points to a node ` +
          `rendered by React, copy 'myRef.current' to a variable inside the effect, ` +
          `and use that variable in the cleanup function.`,
      ],
    },
    {
      code: `
        function useMyThing(myRef, active) {
          useAsyncEffect(async () => {
            const handleMove = () => {};
            if (active) {
              myRef.current.addEventListener('mousemove', handleMove);
              return function() {
                setTimeout(() => {
                  myRef.current.removeEventListener('mousemove', handleMove);
                });
              }
            }
          }, [myRef, active]);
        }
      `,
      output: `
        function useMyThing(myRef, active) {
          useAsyncEffect(async () => {
            const handleMove = () => {};
            if (active) {
              myRef.current.addEventListener('mousemove', handleMove);
              return function() {
                setTimeout(() => {
                  myRef.current.removeEventListener('mousemove', handleMove);
                });
              }
            }
          }, [myRef, active]);
        }
      `,
      errors: [
        `The ref value 'myRef.current' will likely have changed by the time ` +
          `this effect cleanup function runs. If this ref points to a node ` +
          `rendered by React, copy 'myRef.current' to a variable inside the effect, ` +
          `and use that variable in the cleanup function.`,
      ],
    },
    {
      // Autofix ignores constant primitives (leaving the ones that are there).
      code: `
      function MyComponent() {
        const local1 = 42;
        const local2 = '42';
        const local3 = null;
        const local4 = {};
        useAsyncEffect(async () => {
          console.log(local1);
          console.log(local2);
          console.log(local3);
          console.log(local4);
        }, [local1, local3]);
      }
    `,
      output: `
      function MyComponent() {
        const local1 = 42;
        const local2 = '42';
        const local3 = null;
        const local4 = {};
        useAsyncEffect(async () => {
          console.log(local1);
          console.log(local2);
          console.log(local3);
          console.log(local4);
        }, [local1, local3, local4]);
      }
    `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'local4'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function MyComponent() {
          useAsyncEffect(async () => {
            window.scrollTo(0, 0);
          }, [window]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has an unnecessary dependency: 'window'. " +
          'Either exclude it or remove the dependency array. ' +
          "Outer scope values like 'window' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        import MutableStore from 'store';

        function MyComponent() {
          useAsyncEffect(async () => {
            console.log(MutableStore.hello);
          }, [MutableStore.hello]);
        }
      `,
      output: `
        import MutableStore from 'store';

        function MyComponent() {
          useAsyncEffect(async () => {
            console.log(MutableStore.hello);
          }, []);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has an unnecessary dependency: 'MutableStore.hello'. " +
          'Either exclude it or remove the dependency array. ' +
          "Outer scope values like 'MutableStore.hello' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        import MutableStore from 'store';
        let z = {};

        function MyComponent(props) {
          let x = props.foo;
          {
            let y = props.bar;
            useAsyncEffect(async () => {
              console.log(MutableStore.hello.world, props.foo, x, y, z, global.stuff);
            }, [MutableStore.hello.world, props.foo, x, y, z, global.stuff]);
          }
        }
      `,
      output: `
        import MutableStore from 'store';
        let z = {};

        function MyComponent(props) {
          let x = props.foo;
          {
            let y = props.bar;
            useAsyncEffect(async () => {
              console.log(MutableStore.hello.world, props.foo, x, y, z, global.stuff);
            }, [props.foo, x, y]);
          }
        }
      `,
      errors: [
        'React Hook useAsyncEffect has unnecessary dependencies: ' +
          "'MutableStore.hello.world', 'global.stuff', and 'z'. " +
          'Either exclude them or remove the dependency array. ' +
          "Outer scope values like 'MutableStore.hello.world' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        import MutableStore from 'store';
        let z = {};

        function MyComponent(props) {
          let x = props.foo;
          {
            let y = props.bar;
            useAsyncEffect(async () => {
              // nothing
            }, [MutableStore.hello.world, props.foo, x, y, z, global.stuff]);
          }
        }
      `,
      // The output should contain the ones that are inside a component
      // since there are legit reasons to over-specify them for effects.
      output: `
        import MutableStore from 'store';
        let z = {};

        function MyComponent(props) {
          let x = props.foo;
          {
            let y = props.bar;
            useAsyncEffect(async () => {
              // nothing
            }, [props.foo, x, y]);
          }
        }
      `,
      errors: [
        'React Hook useAsyncEffect has unnecessary dependencies: ' +
          "'MutableStore.hello.world', 'global.stuff', and 'z'. " +
          'Either exclude them or remove the dependency array. ' +
          "Outer scope values like 'MutableStore.hello.world' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        import MutableStore from 'store';
        let z = {};

        function MyComponent(props) {
          let x = props.foo;
          {
            let y = props.bar;
            const fn = useWorker(async () => {
              // nothing
            }, [MutableStore.hello.world, props.foo, x, y, z, global.stuff]);
          }
        }
      `,
      output: `
        import MutableStore from 'store';
        let z = {};

        function MyComponent(props) {
          let x = props.foo;
          {
            let y = props.bar;
            const fn = useWorker(async () => {
              // nothing
            }, []);
          }
        }
      `,
      errors: [
        'React Hook useWorker has unnecessary dependencies: ' +
          "'MutableStore.hello.world', 'global.stuff', 'props.foo', 'x', 'y', and 'z'. " +
          'Either exclude them or remove the dependency array. ' +
          "Outer scope values like 'MutableStore.hello.world' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      code: `
        import MutableStore from 'store';
        let z = {};

        function MyComponent(props) {
          let x = props.foo;
          {
            let y = props.bar;
            const fn = useWorkerLoad(async () => {
              // nothing
            }, [MutableStore.hello.world, props.foo, x, y, z, global.stuff]);
          }
        }
      `,
      output: `
        import MutableStore from 'store';
        let z = {};

        function MyComponent(props) {
          let x = props.foo;
          {
            let y = props.bar;
            const fn = useWorkerLoad(async () => {
              // nothing
            }, []);
          }
        }
      `,
      errors: [
        'React Hook useWorkerLoad has unnecessary dependencies: ' +
          "'MutableStore.hello.world', 'global.stuff', 'props.foo', 'x', 'y', and 'z'. " +
          'Either exclude them or remove the dependency array. ' +
          "Outer scope values like 'MutableStore.hello.world' aren't valid dependencies " +
          "because mutating them doesn't re-render the component.",
      ],
    },
    {
      // Every almost-static function is tainted by a dynamic value.
      code: `
        function MyComponent(props) {
          let [, setState] = useState();
          let [, dispatch] = React.useReducer();
          let taint = props.foo;

          function handleNext1(value) {
            let value2 = value * taint;
            setState(value2);
            console.log('hello');
          }
          const handleNext2 = (value) => {
            setState(taint(value));
            console.log('hello');
          };
          let handleNext3 = function(value) {
            setTimeout(() => console.log(taint));
            dispatch({ type: 'x', value });
          };
          useAsyncEffect(async () => {
            return Store.subscribe(handleNext1);
          }, []);
          useAsyncLayoutEffect(async () => {
            return Store.subscribe(handleNext2);
          }, []);
          useEffectUpdate(() => {
            return Store.subscribe(handleNext3);
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          let [, setState] = useState();
          let [, dispatch] = React.useReducer();
          let taint = props.foo;

          function handleNext1(value) {
            let value2 = value * taint;
            setState(value2);
            console.log('hello');
          }
          const handleNext2 = (value) => {
            setState(taint(value));
            console.log('hello');
          };
          let handleNext3 = function(value) {
            setTimeout(() => console.log(taint));
            dispatch({ type: 'x', value });
          };
          useAsyncEffect(async () => {
            return Store.subscribe(handleNext1);
          }, [handleNext1]);
          useAsyncLayoutEffect(async () => {
            return Store.subscribe(handleNext2);
          }, [handleNext2]);
          useEffectUpdate(() => {
            return Store.subscribe(handleNext3);
          }, [handleNext3]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'handleNext1'. " +
          'Either include it or remove the dependency array.',
        "React Hook useAsyncLayoutEffect has a missing dependency: 'handleNext2'. " +
          'Either include it or remove the dependency array.',
        "React Hook useEffectUpdate has a missing dependency: 'handleNext3'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      // Regression test
      code: `
        function MyComponent(props) {
          let [, setState] = useState();
          let [, dispatch] = React.useReducer();
          let taint = props.foo;

          // Shouldn't affect anything
          function handleChange() {}

          function handleNext1(value) {
            let value2 = value * taint;
            setState(value2);
            console.log('hello');
          }
          const handleNext2 = (value) => {
            setState(taint(value));
            console.log('hello');
          };
          let handleNext3 = function(value) {
            console.log(taint);
            dispatch({ type: 'x', value });
          };
          useAsyncEffect(async () => {
            return Store.subscribe(handleNext1);
          }, []);
          useAsyncLayoutEffect(async () => {
            return Store.subscribe(handleNext2);
          }, []);
          useEffectUpdate(() => {
            return Store.subscribe(handleNext3);
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          let [, setState] = useState();
          let [, dispatch] = React.useReducer();
          let taint = props.foo;

          // Shouldn't affect anything
          function handleChange() {}

          function handleNext1(value) {
            let value2 = value * taint;
            setState(value2);
            console.log('hello');
          }
          const handleNext2 = (value) => {
            setState(taint(value));
            console.log('hello');
          };
          let handleNext3 = function(value) {
            console.log(taint);
            dispatch({ type: 'x', value });
          };
          useAsyncEffect(async () => {
            return Store.subscribe(handleNext1);
          }, [handleNext1]);
          useAsyncLayoutEffect(async () => {
            return Store.subscribe(handleNext2);
          }, [handleNext2]);
          useEffectUpdate(() => {
            return Store.subscribe(handleNext3);
          }, [handleNext3]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'handleNext1'. " +
          'Either include it or remove the dependency array.',
        "React Hook useAsyncLayoutEffect has a missing dependency: 'handleNext2'. " +
          'Either include it or remove the dependency array.',
        "React Hook useEffectUpdate has a missing dependency: 'handleNext3'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      // Regression test
      code: `
        function MyComponent(props) {
          let [, setState] = useState();
          let [, dispatch] = React.useReducer();
          let taint = props.foo;

          // Shouldn't affect anything
          const handleChange = () => {};

          function handleNext1(value) {
            let value2 = value * taint;
            setState(value2);
            console.log('hello');
          }
          const handleNext2 = (value) => {
            setState(taint(value));
            console.log('hello');
          };
          let handleNext3 = function(value) {
            console.log(taint);
            dispatch({ type: 'x', value });
          };
          useAsyncEffect(async () => {
            return Store.subscribe(handleNext1);
          }, []);
          useAsyncLayoutEffect(async () => {
            return Store.subscribe(handleNext2);
          }, []);
          useEffectUpdate(() => {
            return Store.subscribe(handleNext3);
          }, []);
        }
      `,
      output: `
        function MyComponent(props) {
          let [, setState] = useState();
          let [, dispatch] = React.useReducer();
          let taint = props.foo;

          // Shouldn't affect anything
          const handleChange = () => {};

          function handleNext1(value) {
            let value2 = value * taint;
            setState(value2);
            console.log('hello');
          }
          const handleNext2 = (value) => {
            setState(taint(value));
            console.log('hello');
          };
          let handleNext3 = function(value) {
            console.log(taint);
            dispatch({ type: 'x', value });
          };
          useAsyncEffect(async () => {
            return Store.subscribe(handleNext1);
          }, [handleNext1]);
          useAsyncLayoutEffect(async () => {
            return Store.subscribe(handleNext2);
          }, [handleNext2]);
          useEffectUpdate(() => {
            return Store.subscribe(handleNext3);
          }, [handleNext3]);
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'handleNext1'. " +
          'Either include it or remove the dependency array.',
        "React Hook useAsyncLayoutEffect has a missing dependency: 'handleNext2'. " +
          'Either include it or remove the dependency array.',
        "React Hook useEffectUpdate has a missing dependency: 'handleNext3'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function Counter() {
          let [count, setCount] = useState(0);

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              setCount(count + 1);
            }, 1000);
            return () => clearInterval(id);
          }, []);

          return <h1>{count}</h1>;
        }
      `,
      output: `
        function Counter() {
          let [count, setCount] = useState(0);

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              setCount(count + 1);
            }, 1000);
            return () => clearInterval(id);
          }, [count]);

          return <h1>{count}</h1>;
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'count'. " +
          'Either include it or remove the dependency array. ' +
          `You can also do a functional update 'setCount(c => ...)' if you ` +
          `only need 'count' in the 'setCount' call.`,
      ],
    },
    {
      code: `
        function Counter() {
          let [count, setCount] = useState(0);
          let [increment, setIncrement] = useState(0);

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              setCount(count + increment);
            }, 1000);
            return () => clearInterval(id);
          }, []);

          return <h1>{count}</h1>;
        }
      `,
      output: `
        function Counter() {
          let [count, setCount] = useState(0);
          let [increment, setIncrement] = useState(0);

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              setCount(count + increment);
            }, 1000);
            return () => clearInterval(id);
          }, [count, increment]);

          return <h1>{count}</h1>;
        }
      `,
      errors: [
        "React Hook useAsyncEffect has missing dependencies: 'count' and 'increment'. " +
          'Either include them or remove the dependency array. ' +
          `You can also do a functional update 'setCount(c => ...)' if you ` +
          `only need 'count' in the 'setCount' call.`,
      ],
    },
    {
      code: `
        function Counter() {
          let [count, setCount] = useState(0);
          let [increment, setIncrement] = useState(0);

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              setCount(count => count + increment);
            }, 1000);
            return () => clearInterval(id);
          }, []);

          return <h1>{count}</h1>;
        }
      `,
      output: `
        function Counter() {
          let [count, setCount] = useState(0);
          let [increment, setIncrement] = useState(0);

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              setCount(count => count + increment);
            }, 1000);
            return () => clearInterval(id);
          }, [increment]);

          return <h1>{count}</h1>;
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'increment'. " +
          'Either include it or remove the dependency array. ' +
          `You can also replace multiple useState variables with useReducer ` +
          `if 'setCount' needs the current value of 'increment'.`,
      ],
    },
    {
      code: `
        function Counter() {
          let [count, setCount] = useState(0);
          let increment = useCustomHook();

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              setCount(count => count + increment);
            }, 1000);
            return () => clearInterval(id);
          }, []);

          return <h1>{count}</h1>;
        }
      `,
      output: `
        function Counter() {
          let [count, setCount] = useState(0);
          let increment = useCustomHook();

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              setCount(count => count + increment);
            }, 1000);
            return () => clearInterval(id);
          }, [increment]);

          return <h1>{count}</h1>;
        }
      `,
      // This intentionally doesn't show the reducer message
      // because we don't know if it's safe for it to close over a value.
      // We only show it for state variables (and possibly props).
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'increment'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function Counter({ step }) {
          let [count, setCount] = useState(0);

          function increment(x) {
            return x + step;
          }

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              setCount(count => increment(count));
            }, 1000);
            return () => clearInterval(id);
          }, []);

          return <h1>{count}</h1>;
        }
      `,
      output: `
        function Counter({ step }) {
          let [count, setCount] = useState(0);

          function increment(x) {
            return x + step;
          }

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              setCount(count => increment(count));
            }, 1000);
            return () => clearInterval(id);
          }, [increment]);

          return <h1>{count}</h1>;
        }
      `,
      // This intentionally doesn't show the reducer message
      // because we don't know if it's safe for it to close over a value.
      // We only show it for state variables (and possibly props).
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'increment'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function Counter({ increment }) {
          let [count, setCount] = useState(0);

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              setCount(count => count + increment);
            }, 1000);
            return () => clearInterval(id);
          }, []);

          return <h1>{count}</h1>;
        }
      `,
      output: `
        function Counter({ increment }) {
          let [count, setCount] = useState(0);

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              setCount(count => count + increment);
            }, 1000);
            return () => clearInterval(id);
          }, [increment]);

          return <h1>{count}</h1>;
        }
      `,
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'increment'. " +
          'Either include it or remove the dependency array. ' +
          `If 'setCount' needs the current value of 'increment', ` +
          `you can also switch to useReducer instead of useState and read 'increment' in the reducer.`,
      ],
    },
    {
      code: `
        function Counter() {
          const [count, setCount] = useState(0);

          function tick() {
            setCount(count + 1);
          }

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              tick();
            }, 1000);
            return () => clearInterval(id);
          }, []);

          return <h1>{count}</h1>;
        }
      `,
      output: `
        function Counter() {
          const [count, setCount] = useState(0);

          function tick() {
            setCount(count + 1);
          }

          useAsyncEffect(async () => {
            let id = setInterval(() => {
              tick();
            }, 1000);
            return () => clearInterval(id);
          }, [tick]);

          return <h1>{count}</h1>;
        }
      `,
      // TODO: ideally this should suggest useState updater form
      // since this code doesn't actually work. The autofix could
      // at least avoid suggesting 'tick' since it's obviously
      // always different, and thus useless.
      errors: [
        "React Hook useAsyncEffect has a missing dependency: 'tick'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      // Regression test for a crash
      code: `
        function Podcasts() {
          useAsyncEffect(async () => {
            alert(podcasts);
          }, []);
          let [podcasts, setPodcasts] = useState(null);
        }
      `,
      // Note: this autofix is shady because
      // the variable is used before declaration.
      // TODO: Maybe we can catch those fixes and not autofix.
      output: `
        function Podcasts() {
          useAsyncEffect(async () => {
            alert(podcasts);
          }, [podcasts]);
          let [podcasts, setPodcasts] = useState(null);
        }
      `,
      errors: [
        `React Hook useAsyncEffect has a missing dependency: 'podcasts'. ` +
          `Either include it or remove the dependency array.`,
      ],
    },
    {
      code: `
        function Podcasts({ fetchPodcasts, id }) {
          let [podcasts, setPodcasts] = useState(null);
          useAsyncEffect(async () => {
            fetchPodcasts(id).then(setPodcasts);
          }, [id]);
        }
      `,
      output: `
        function Podcasts({ fetchPodcasts, id }) {
          let [podcasts, setPodcasts] = useState(null);
          useAsyncEffect(async () => {
            fetchPodcasts(id).then(setPodcasts);
          }, [fetchPodcasts, id]);
        }
      `,
      errors: [
        `React Hook useAsyncEffect has a missing dependency: 'fetchPodcasts'. ` +
          `Either include it or remove the dependency array. ` +
          `If 'fetchPodcasts' changes too often, ` +
          `find the parent component that defines it and wrap that definition in useWorker.`,
      ],
    },
    {
      code: `
        function Podcasts({ api: { fetchPodcasts }, id }) {
          let [podcasts, setPodcasts] = useState(null);
          useAsyncEffect(async () => {
            fetchPodcasts(id).then(setPodcasts);
          }, [id]);
        }
      `,
      output: `
        function Podcasts({ api: { fetchPodcasts }, id }) {
          let [podcasts, setPodcasts] = useState(null);
          useAsyncEffect(async () => {
            fetchPodcasts(id).then(setPodcasts);
          }, [fetchPodcasts, id]);
        }
      `,
      errors: [
        `React Hook useAsyncEffect has a missing dependency: 'fetchPodcasts'. ` +
          `Either include it or remove the dependency array. ` +
          `If 'fetchPodcasts' changes too often, ` +
          `find the parent component that defines it and wrap that definition in useWorker.`,
      ],
    },
    {
      code: `
        function Podcasts({ fetchPodcasts, fetchPodcasts2, id }) {
          let [podcasts, setPodcasts] = useState(null);
          useAsyncEffect(async () => {
            setTimeout(() => {
              console.log(id);
              fetchPodcasts(id).then(setPodcasts);
              fetchPodcasts2(id).then(setPodcasts);
            });
          }, [id]);
        }
      `,
      output: `
        function Podcasts({ fetchPodcasts, fetchPodcasts2, id }) {
          let [podcasts, setPodcasts] = useState(null);
          useAsyncEffect(async () => {
            setTimeout(() => {
              console.log(id);
              fetchPodcasts(id).then(setPodcasts);
              fetchPodcasts2(id).then(setPodcasts);
            });
          }, [fetchPodcasts, fetchPodcasts2, id]);
        }
      `,
      errors: [
        `React Hook useAsyncEffect has missing dependencies: 'fetchPodcasts' and 'fetchPodcasts2'. ` +
          `Either include them or remove the dependency array. ` +
          `If 'fetchPodcasts' changes too often, ` +
          `find the parent component that defines it and wrap that definition in useWorker.`,
      ],
    },
    {
      code: `
        function Podcasts({ fetchPodcasts, id }) {
          let [podcasts, setPodcasts] = useState(null);
          useAsyncEffect(async () => {
            console.log(fetchPodcasts);
            fetchPodcasts(id).then(setPodcasts);
          }, [id]);
        }
      `,
      output: `
        function Podcasts({ fetchPodcasts, id }) {
          let [podcasts, setPodcasts] = useState(null);
          useAsyncEffect(async () => {
            console.log(fetchPodcasts);
            fetchPodcasts(id).then(setPodcasts);
          }, [fetchPodcasts, id]);
        }
      `,
      errors: [
        `React Hook useAsyncEffect has a missing dependency: 'fetchPodcasts'. ` +
          `Either include it or remove the dependency array. ` +
          `If 'fetchPodcasts' changes too often, ` +
          `find the parent component that defines it and wrap that definition in useWorker.`,
      ],
    },
    {
      // The mistake here is that it was moved inside the effect
      // so it can't be referenced in the deps array.
      code: `
        function Thing() {
          useAsyncEffect(async () => {
            const fetchData = async () => {};
            fetchData();
          }, [fetchData]);
        }
      `,
      output: `
        function Thing() {
          useAsyncEffect(async () => {
            const fetchData = async () => {};
            fetchData();
          }, []);
        }
      `,
      errors: [
        `React Hook useAsyncEffect has an unnecessary dependency: 'fetchData'. ` +
          `Either exclude it or remove the dependency array.`,
      ],
    },
    {
      code: `
        function Hello() {
          const [state, setState] = useState(0);
          useAsyncEffect(async () => {
            setState({});
          });
        }
      `,
      output: `
        function Hello() {
          const [state, setState] = useState(0);
          useAsyncEffect(async () => {
            setState({});
          }, []);
        }
      `,
      errors: [
        `React Hook useAsyncEffect contains a call to 'setState'. ` +
          `Without a list of dependencies, this can lead to an infinite chain of updates. ` +
          `To fix this, pass [] as a second argument to the useAsyncEffect Hook.`,
      ],
    },
    {
      code: `
        function Hello() {
          const [data, setData] = useState(0);
          useAsyncEffect(async () => {
            fetchData.then(setData);
          });
        }
      `,
      output: `
        function Hello() {
          const [data, setData] = useState(0);
          useAsyncEffect(async () => {
            fetchData.then(setData);
          }, []);
        }
      `,
      errors: [
        `React Hook useAsyncEffect contains a call to 'setData'. ` +
          `Without a list of dependencies, this can lead to an infinite chain of updates. ` +
          `To fix this, pass [] as a second argument to the useAsyncEffect Hook.`,
      ],
    },
    {
      code: `
        function Hello({ country }) {
          const [data, setData] = useState(0);
          useAsyncEffect(async () => {
            fetchData(country).then(setData);
          });
        }
      `,
      output: `
        function Hello({ country }) {
          const [data, setData] = useState(0);
          useAsyncEffect(async () => {
            fetchData(country).then(setData);
          }, [country]);
        }
      `,
      errors: [
        `React Hook useAsyncEffect contains a call to 'setData'. ` +
          `Without a list of dependencies, this can lead to an infinite chain of updates. ` +
          `To fix this, pass [country] as a second argument to the useAsyncEffect Hook.`,
      ],
    },
    {
      code: `
        function Hello({ prop1, prop2 }) {
          const [state, setState] = useState(0);
          useAsyncEffect(async () => {
            if (prop1) {
              setState(prop2);
            }
          });
        }
      `,
      output: `
        function Hello({ prop1, prop2 }) {
          const [state, setState] = useState(0);
          useAsyncEffect(async () => {
            if (prop1) {
              setState(prop2);
            }
          }, [prop1, prop2]);
        }
      `,
      errors: [
        `React Hook useAsyncEffect contains a call to 'setState'. ` +
          `Without a list of dependencies, this can lead to an infinite chain of updates. ` +
          `To fix this, pass [prop1, prop2] as a second argument to the useAsyncEffect Hook.`,
      ],
    },
    {
      code: `
        function Example() {
          const foo = useWorker(async () => {
            foo();
          }, [foo]);
        }
      `,
      output: `
        function Example() {
          const foo = useWorker(async () => {
            foo();
          }, []);
        }
      `,
      errors: [
        "React Hook useWorker has an unnecessary dependency: 'foo'. " +
          'Either exclude it or remove the dependency array.',
      ],
    },
    {
      code: `
        function Example({ prop }) {
          const foo = useWorker(async () => {
            prop.hello(foo);
          }, [foo]);
          const bar = useWorker(async () => {
            foo();
          }, [foo]);
        }
      `,
      output: `
        function Example({ prop }) {
          const foo = useWorker(async () => {
            prop.hello(foo);
          }, [prop]);
          const bar = useWorker(async () => {
            foo();
          }, [foo]);
        }
      `,
      errors: [
        "React Hook useWorker has a missing dependency: 'prop'. " +
          'Either include it or remove the dependency array.',
      ],
    },
    {
      code: `
        function Example() {
          const foo = useWorkerLoad(async () => {
            foo();
          }, [foo]);
        }
      `,
      output: `
        function Example() {
          const foo = useWorkerLoad(async () => {
            foo();
          }, []);
        }
      `,
      errors: [
        "React Hook useWorkerLoad has an unnecessary dependency: 'foo'. " +
          'Either exclude it or remove the dependency array.',
      ],
    },
    {
      code: `
        function Example({ prop }) {
          const foo = useWorkerLoad(async () => {
            prop.hello(foo);
          }, [foo]);
          const bar = useWorkerLoad(async () => {
            foo();
          }, [foo]);
        }
      `,
      output: `
        function Example({ prop }) {
          const foo = useWorkerLoad(async () => {
            prop.hello(foo);
          }, [prop]);
          const bar = useWorkerLoad(async () => {
            foo();
          }, [foo]);
        }
      `,
      errors: [
        "React Hook useWorkerLoad has a missing dependency: 'prop'. " +
          'Either include it or remove the dependency array.',
      ],
    },
  ],
};

// For easier local testing
if (!process.env.CI) {
  let only = [];
  let skipped = [];
  [...tests.valid, ...tests.invalid].forEach(t => {
    if (t.skip) {
      delete t.skip;
      skipped.push(t);
    }
    if (t.only) {
      delete t.only;
      only.push(t);
    }
    // if (!t.options) {
    //   t.options = [{ additionalHooks: 'useAsyncLayoutEffect' }];
    // }
  });
  const predicate = t => {
    if (only.length > 0) {
      return only.indexOf(t) !== -1;
    }
    if (skipped.length > 0) {
      return skipped.indexOf(t) === -1;
    }
    return true;
  };
  tests.valid = tests.valid.filter(predicate);
  tests.invalid = tests.invalid.filter(predicate);
}

const eslintTester = new ESLintTester();
eslintTester.run(
  '@react-hook-utilities/eslint-plugin',
  ReactHooksESLintRule,
  tests,
);
