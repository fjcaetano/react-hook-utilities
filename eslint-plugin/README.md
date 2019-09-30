# @react-hook-utilities/eslint-plugin

ESLint rules for hook utils

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `@react-hook-utilities/eslint-plugin`:

```
$ npm install @react-hook-utilities/eslint-plugin --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `@react-hook-utilities/eslint-plugin` globally.

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

* Fill in provided rules here





