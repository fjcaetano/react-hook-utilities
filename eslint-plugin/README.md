# @react-hook-utilities/eslint-plugin

ESLint rules for hook react-hook-utilities

## Installation

You'll first need to install [ESLint](http://eslint.org) and [react-hook-utilities](https://www.npmjs.com/package/react-hook-utilities)

```
$ npm i eslint react-hook-utilities --save-dev
```

Next, install `@react-hook-utilities/eslint-plugin` directly from the host dependency:

```
$ npm install ./node_modules/react-hook-utilities/eslint-plugin --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `react-hook-utilities` globally.

## Usage

Add `@react-hook-utilities` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "@react-hook-utilities"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "@react-hook-utilities/exhaustive-deps": 2
    }
}
```

## Supported Rules

* exhaustive-deps: Ensures all hooks external references have been declared as dependencies.





