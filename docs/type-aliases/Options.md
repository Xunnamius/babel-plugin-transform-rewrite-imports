[**babel-plugin-transform-rewrite-imports**](../README.md) • **Docs**

***

[babel-plugin-transform-rewrite-imports](../README.md) / Options

# Type Alias: Options

> **Options**: `object`

The options that can be passed to this plugin from babel.

## Type declaration

### appendExtension?

> `optional` **appendExtension**: `string` \| [`Callback`](Callback.md)\<`string` \| `undefined`\>

This string will be appended to all relative import specifiers that do not
already have a recognized extension. Also accepts a callback function for
advanced use cases.

#### Default

```ts
undefined
```

### recognizedExtensions?

> `optional` **recognizedExtensions**: `string`[]

Members of this array will be considered a "recognized extension".

#### Default

```ts
defaultRecognizedExtensions
```

### replaceExtensions?

> `optional` **replaceExtensions**: `Record`\<`string`, `string` \| [`Callback`](Callback.md)\<`string`\>\>

Map of specifiers to their replacements. Specifiers can be strings or
regular expressions (i.e. strings that start with ^ and/or end with $). If
a specifier is a regular expression, capturing group notation can be used
in the replacement. Replacements can either be a string or a callback
function that returns a string.

#### Default

```ts
{}
```

### silent?

> `optional` **silent**: `boolean`

If true, this plugin will generate no output.

#### Default

```ts
false
```

### verbose?

> `optional` **verbose**: `boolean`

If true, this plugin will generate more output than usual.

#### Default

```ts
false
```

## Defined in

[index.ts:48](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/19e1588c04e6526fdd6fd5327755da13326abcaa/src/index.ts#L48)
