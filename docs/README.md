babel-plugin-transform-rewrite-imports

# babel-plugin-transform-rewrite-imports

## Table of contents

### Type Aliases

- [Options](README.md#options)

### Variables

- [defaultRecognizedExtensions](README.md#defaultrecognizedextensions)

### Functions

- [default](README.md#default)

## Type Aliases

### Options

Ƭ **Options**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `appendExtension?` | `string` |
| `recognizedExtensions?` | `string`[] |
| `replaceExtensions?` | `Record`<`string`, `string`\> |
| `silent?` | `boolean` |
| `verbose?` | `boolean` |

#### Defined in

[index.ts:10](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/a50db17/src/index.ts#L10)

## Variables

### defaultRecognizedExtensions

• `Const` **defaultRecognizedExtensions**: readonly [``".js"``, ``".jsx"``, ``".mjs"``, ``".cjs"``, ``".json"``]

#### Defined in

[index.ts:29](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/a50db17/src/index.ts#L29)

## Functions

### default

▸ **default**(): `PluginObj`<`State`\>

#### Returns

`PluginObj`<`State`\>

#### Defined in

[index.ts:39](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/a50db17/src/index.ts#L39)
