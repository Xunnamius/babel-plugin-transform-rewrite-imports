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

[index.ts:44](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/40f2b2bf6fa6d5f4f6faf3e8004138265cb3ed3d/src/index.ts#L44)
