[**babel-plugin-transform-rewrite-imports**](../README.md) • **Docs**

***

[babel-plugin-transform-rewrite-imports](../README.md) / Callback

# Type Alias: Callback()\<ReturnType\>

> **Callback**\<`ReturnType`\>: (`context`) => `ReturnType`

A callback function provided as a value to `Options.appendExtension` or to an
entry in `Options.replaceExtensions`.

## Type Parameters

• **ReturnType**

## Parameters

• **context**

• **context.capturingGroups**: `string`[]

An array of capturing groups returned by `String.prototype.match()` or an
empty array if the matcher string was not a regular expression.

• **context.filepath**: `string`

The absolute path of the file containing the specifier being evaluated by
Babel.

• **context.specifier**: `string`

The import/export specifier being evaluated by Babel.

## Returns

`ReturnType`

## Defined in

[index.ts:15](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/0be1eda4a2b30709c0755c0ffd994f51ba295498/src/index.ts#L15)
