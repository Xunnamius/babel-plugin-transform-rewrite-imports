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

### injectDynamicRewriter?

> `optional` **injectDynamicRewriter**: `"never"` \| `"only-if-necessary"`

If `'only-if-necessary'`, the dynamic rewriter function will only be
injected into the AST if necessary. If `'never'`, support for arbitrary
dynamic imports that are not statically analyzable will be disabled and no
rewriter function injection will occur.

#### Default

```ts
'only-if-necessary'
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

### requireLikeFunctions?

> `optional` **requireLikeFunctions**: `string`[]

Members of this array will be considered as "require-like functions," or
functions that should be treated as if they were CJS `require(...)` (or ESM
`import(...)`) functions. This is useful when, for instance, you want
Jest's `jest.mock` and `jest.requireActual` functions to have their import
specifiers transformed.

If not overridden, `requireLikeFunctions` defaults to
[defaultRequireLikeFunctions](../variables/defaultRequireLikeFunctions.md).

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

[index.ts:64](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/bc746a21e0690faa47b9d98ed4abf9ff41a1b71d/src/index.ts#L64)
