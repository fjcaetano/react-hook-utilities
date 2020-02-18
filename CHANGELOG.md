# [0.5.0](https://github.com/fjcaetano/react-hook-utilities/compare/v0.4.0...v0.5.0) (2020-02-18)


### Bug Fixes

* **Scripts:** restrain from setting global git config values for deploying docs folder ([4d58bcb](https://github.com/fjcaetano/react-hook-utilities/commit/4d58bcb23c57050ef694ab6f6061d5a0bf8ecbdc))


### Features

* **useWorkerState:** allow initialValue to be a factory function ([a845a4b](https://github.com/fjcaetano/react-hook-utilities/commit/a845a4b0c98b2e2ba5ecf23babf14262c7371509))



# [0.4.0](https://github.com/fjcaetano/react-hook-utilities/compare/v0.3.0...v0.4.0) (2020-02-10)


### Bug Fixes

* **useLazyRef:** call factory only once ([ea7eb02](https://github.com/fjcaetano/react-hook-utilities/commit/ea7eb02298129f16d627379cb4ceefb26a35a534))
* **useWorker:** prevent multiple renders triggered by update ([9f1ee5f](https://github.com/fjcaetano/react-hook-utilities/commit/9f1ee5f12eead6f19b04717a6bf952fa8b11b27a)), closes [#16](https://github.com/fjcaetano/react-hook-utilities/issues/16)


### Features

* **usePromisedState:** use a state that waits for values ([dd32ab1](https://github.com/fjcaetano/react-hook-utilities/commit/dd32ab191c9567c36d8a0a5eb5d2daef6010fe00))



# [0.3.0](https://github.com/fjcaetano/react-hook-utilities/compare/v0.2.1...v0.3.0) (2019-11-25)


### Bug Fixes

* **Changelog:** build using conventional-changelog ([c862550](https://github.com/fjcaetano/react-hook-utilities/commit/c8625507eceb90bb9217db7941ff19b3cfda9702))
* **useConditionalEffect:** add overloads with generic types ([a67b9c0](https://github.com/fjcaetano/react-hook-utilities/commit/a67b9c07298d90462e8c1f8b5a5229a0c51c16c0)), closes [#14](https://github.com/fjcaetano/react-hook-utilities/issues/14)
* **useDidMount:** remove unnecessary type param ([e54171b](https://github.com/fjcaetano/react-hook-utilities/commit/e54171bcc40389bb16c54d9bf727cf6328021623))
* **useDidUnmount:** call effect with updated dependencies ([0bbacaa](https://github.com/fjcaetano/react-hook-utilities/commit/0bbacaaf6321cd8a254be5c51c77425a9e2383cd)), closes [#8](https://github.com/fjcaetano/react-hook-utilities/issues/8)
* **useEffectUpdate:** add overloads with generic types ([80ea3d0](https://github.com/fjcaetano/react-hook-utilities/commit/80ea3d073bf2c41267c58c88ff1aa9a30b39683c)), closes [#14](https://github.com/fjcaetano/react-hook-utilities/issues/14)


### Features

* **useWorkerLoad:** add new hook ([4d91e5b](https://github.com/fjcaetano/react-hook-utilities/commit/4d91e5b3aacbf63922a56c4b8d7df33a89210171)), closes [#11](https://github.com/fjcaetano/react-hook-utilities/issues/11)



## [0.2.1](https://github.com/fjcaetano/react-hook-utilities/compare/v0.2.0...v0.2.1) (2019-11-04)


### Bug Fixes

* **CI:** run 'Node CI' workflow on PRs ([46f84a7](https://github.com/fjcaetano/react-hook-utilities/commit/46f84a75c2c6faa20760fa4c244ec8a069bd3d34))
* **README:** fix typo on useDidMount description ([fd33d20](https://github.com/fjcaetano/react-hook-utilities/commit/fd33d204248978dd2a74a4db4ef6d813672c7a84)), closes [#4](https://github.com/fjcaetano/react-hook-utilities/issues/4)
* **useLazyRef:** remove extra call to useRef ([5f71852](https://github.com/fjcaetano/react-hook-utilities/commit/5f71852e0445298330d953aae9a6ea6a52b6e01b)), closes [#6](https://github.com/fjcaetano/react-hook-utilities/issues/6)



# [0.2.0](https://github.com/fjcaetano/react-hook-utilities/compare/v0.1.0...v0.2.0) (2019-10-31)


### Bug Fixes

* **CI:** fix coverage upload step ([85c25e0](https://github.com/fjcaetano/react-hook-utilities/commit/85c25e043598c5c140a844039c3b9bf9021b8337))
* **CI:** run nodejs workflow on all branches ([76605eb](https://github.com/fjcaetano/react-hook-utilities/commit/76605eb2ebd11a0c6fdf906f1dac7bb21323c201))
* **README:** fix typo ([a8b1c4a](https://github.com/fjcaetano/react-hook-utilities/commit/a8b1c4affd375da9a1ce6672d5d0447d14325781))
* **Types:** use new 'readonly' syntax ([32fe87c](https://github.com/fjcaetano/react-hook-utilities/commit/32fe87ccdec97c6b3b7845f32abaeda5510b154a))
* **useLazyRefTests:** remove unused variables ([0d6a0ff](https://github.com/fjcaetano/react-hook-utilities/commit/0d6a0ff1c420ba9e65eff7cd9afd6727b1ace69e))


### Features

* **DidMount:** add useDidMount hook ([8dd9836](https://github.com/fjcaetano/react-hook-utilities/commit/8dd983684d05799be8ba20240a467945c633522f))
* **DidMount:** allow effect to be asynchronous ([c6f58d4](https://github.com/fjcaetano/react-hook-utilities/commit/c6f58d4677a54f5201354e8fe945acdfd086f401))
* **DidUnmount:** add useDidUnmount hook ([b207563](https://github.com/fjcaetano/react-hook-utilities/commit/b207563bea24210cab640334516fec545fc0f982))
* **DidUnmount:** allow effect to be asynchronous ([fe03d2f](https://github.com/fjcaetano/react-hook-utilities/commit/fe03d2f900e1a8e1e47569cd4efe6c52a173e50d))
* **useLazyRef:** add new hook ([60e8105](https://github.com/fjcaetano/react-hook-utilities/commit/60e8105a7e64cd7568b43c7d9afb9a6b74589106))



# [0.1.0](https://github.com/fjcaetano/react-hook-utilities/compare/a1c3971c3979772638f3e34766008853f309d469...v0.1.0) (2019-09-20)


### Bug Fixes

* **CI:** fix release workflow ([b928c47](https://github.com/fjcaetano/react-hook-utilities/commit/b928c47dcc251a487261b6055e6f6c2a79026b07))


### Features

* **Async:** add useAsyncEffect hook ([b98d978](https://github.com/fjcaetano/react-hook-utilities/commit/b98d97829b9a005f9beacba34eb5ead99b5ac66d))
* **ConditionalEffect:** add useConditionalEffect hook ([587287a](https://github.com/fjcaetano/react-hook-utilities/commit/587287a88632d05dbfdd80d8cbb6863d507ccd42))
* **EffectUpdate:** add useEffectUpdate hook ([fea8d4b](https://github.com/fjcaetano/react-hook-utilities/commit/fea8d4b64e1d0db1dd21da603c17e95b044fc8f2))
* **LayoutAsync:** add useAsyncLayoutEffect hook ([910caaa](https://github.com/fjcaetano/react-hook-utilities/commit/910caaa55af46bc55d2ff8e867a772dd48065e04))
* **Worker:** add useWorker hook ([a1c3971](https://github.com/fjcaetano/react-hook-utilities/commit/a1c3971c3979772638f3e34766008853f309d469))



