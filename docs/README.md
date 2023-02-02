babel-plugin-transform-rewrite-imports

# babel-plugin-transform-rewrite-imports

## Table of contents

### Type Aliases

- [Callback](README.md#callback)
- [Options](README.md#options)

### Variables

- [defaultRecognizedExtensions](README.md#defaultrecognizedextensions)

### Functions

- [default](README.md#default)

## Type Aliases

### Callback

Ƭ **Callback**<`ReturnType`\>: (`context`: { `capturingGroups`: `string`[] ; `specifier`: `string`  }) => `ReturnType`

#### Type parameters

| Name |
| :------ |
| `ReturnType` |

#### Type declaration

▸ (`context`): `ReturnType`

A callback function provided as a value to `Options.appendExtension` or to an
entry in `Options.replaceExtensions`.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `context` | `Object` | - |
| `context.capturingGroups` | `string`[] | An array of capturing groups returned by `String.prototype.match()` or an empty array if the matcher string was not a regular expression. |
| `context.specifier` | `string` | The import/export specifier being evaluated by babel. |

##### Returns

`ReturnType`

#### Defined in

[index.ts:15](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/e42f369/src/index.ts#L15)

___

### Options

Ƭ **Options**: `Object`

The options that can be passed to this plugin from babel.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `appendExtension?` | `string` \| [`Callback`](README.md#callback)<`string` \| `undefined`\> | This string will be appended to all relative import specifiers that do not already have a recognized extension. Also accepts a callback function for advanced use cases. **`Default`** undefined |
| `recognizedExtensions?` | `string`[] | Members of this array will be considered a "recognized extension". **`Default`** defaultRecognizedExtensions |
| `replaceExtensions?` | `Record`<`string`, `string` \| [`Callback`](README.md#callback)<`string`\>\> | Map of specifiers to their replacements. Specifiers can be strings or regular expressions (i.e. strings that start with ^ and/or end with $). If a specifier is a regular expression, capturing group notation can be used in the replacement. Replacements can either be a string or a callback function that returns a string. **`Default`** |
| `silent?` | `boolean` | If true, this plugin will generate no output. **`Default`** false |
| `verbose?` | `boolean` | If true, this plugin will generate more output than usual. **`Default`** false |

#### Defined in

[index.ts:30](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/e42f369/src/index.ts#L30)

## Variables

### defaultRecognizedExtensions

• `Const` **defaultRecognizedExtensions**: readonly [``".js"``, ``".jsx"``, ``".mjs"``, ``".cjs"``, ``".json"``]

The default value of `Options.recognizedExtensions`.

#### Defined in

[index.ts:83](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/e42f369/src/index.ts#L83)

## Functions

### default

▸ **default**(): `PluginObj`<`State`\>

A babel plugin that reliably rewrites import (and export) specifiers.

#### Returns

`PluginObj`<`State`\>

#### Defined in

[index.ts:96](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/e42f369/src/index.ts#L96)
