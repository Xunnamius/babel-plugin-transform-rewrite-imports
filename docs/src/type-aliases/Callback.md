[**babel-plugin-transform-rewrite-imports**](../../README.md)

***

[babel-plugin-transform-rewrite-imports](../../README.md) / [src](../README.md) / Callback

# Type Alias: Callback()\<ReturnType\>

> **Callback**\<`ReturnType`\> = (`context`) => `ReturnType`

Defined in: [src/index.ts:46](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/457e072ce7310b4a930c6a9b79d7ebab69545419/src/index.ts#L46)

A callback function provided as a value to `Options.appendExtension` or to an
entry in `Options.replaceExtensions`.

## Type Parameters

### ReturnType

`ReturnType`

## Parameters

### context

#### capturingGroups

`string`[]

An array of capturing groups returned by `String.prototype.match()` or an
empty array if the matcher string was not a regular expression.

#### filepath

`string`

The absolute path of the file containing the specifier being evaluated by
Babel.

#### specifier

`string`

The import/export specifier being evaluated by Babel.

## Returns

`ReturnType`
