[**babel-plugin-transform-rewrite-imports**](../../README.md)

***

[babel-plugin-transform-rewrite-imports](../../README.md) / [src](../README.md) / Options

# Type Alias: Options

> **Options** = `object`

Defined in: [src/index.ts:66](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/04cb03720cd5c4b4ccc3763758fd11307ea668ef/src/index.ts#L66)

The options that can be passed to this plugin from babel.

## Properties

### appendExtension?

> `optional` **appendExtension**: `string` \| [`Callback`](Callback.md)\<`string` \| `undefined`\>

Defined in: [src/index.ts:83](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/04cb03720cd5c4b4ccc3763758fd11307ea668ef/src/index.ts#L83)

This string will be appended to all relative import specifiers that do not
already have a recognized extension. Also accepts a callback function for
advanced use cases.

Note that only relative import specifiers (that start with `./` or `../`)
will be considered for `appendExtension`.

Also note that `replaceExtensions` is evaluated and replacements made
_before_ `appendExtension` is appended to specifiers with unrecognized or
missing extensions. This means an extensionless import specifier could be
rewritten by `replaceExtensions` to have a recognized extension, which
would then be ignored instead of having `appendExtension` appended to it.

#### Default

```ts
undefined
```

***

### injectDynamicRewriter?

> `optional` **injectDynamicRewriter**: `"never"` \| `"only-if-necessary"`

Defined in: [src/index.ts:125](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/04cb03720cd5c4b4ccc3763758fd11307ea668ef/src/index.ts#L125)

If `'only-if-necessary'`, the dynamic rewriter function will only be
injected into the AST if necessary. If `'never'`, support for arbitrary
dynamic imports that are not statically analyzable will be disabled and no
rewriter function injection will occur.

#### Default

```ts
'only-if-necessary'
```

***

### recognizedExtensions?

> `optional` **recognizedExtensions**: `string`[]

Defined in: [src/index.ts:89](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/04cb03720cd5c4b4ccc3763758fd11307ea668ef/src/index.ts#L89)

Members of this array will be considered a "recognized extension".

#### Default

```ts
defaultRecognizedExtensions
```

***

### replaceExtensions?

> `optional` **replaceExtensions**: `Record`\<`string`, `string` \| [`Callback`](Callback.md)\<`string`\>\>

Defined in: [src/index.ts:105](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/04cb03720cd5c4b4ccc3763758fd11307ea668ef/src/index.ts#L105)

Map of specifiers to their replacements. Specifiers can be strings or
regular expressions (i.e. strings that start with ^ and/or end with $). If
a specifier is a regular expression, capturing group notation can be used
in the replacement. Replacements can either be a string or a callback
function that returns a string.

Note that `replaceExtensions` is evaluated and replacements made _before_
`appendExtension` is appended to specifiers with unrecognized or missing
extensions. This means an extensionless import specifier could be rewritten
by `replaceExtensions` to have a recognized extension, which would then be
ignored instead of having `appendExtension` appended to it.

#### Default

```ts
{}
```

***

### requireLikeFunctions?

> `optional` **requireLikeFunctions**: `string`[]

Defined in: [src/index.ts:116](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/04cb03720cd5c4b4ccc3763758fd11307ea668ef/src/index.ts#L116)

Members of this array will be considered as "require-like functions," or
functions that should be treated as if they were CJS `require(...)` (or ESM
`import(...)`) functions. This is useful when, for instance, you want
Jest's `jest.mock` and `jest.requireActual` functions to have their import
specifiers transformed.

If not overridden, `requireLikeFunctions` defaults to
[defaultRequireLikeFunctions](../variables/defaultRequireLikeFunctions.md).

***

### silent?

> `optional` **silent**: `boolean`

Defined in: [src/index.ts:131](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/04cb03720cd5c4b4ccc3763758fd11307ea668ef/src/index.ts#L131)

If true, this plugin will generate no output.

#### Default

```ts
false
```

***

### verbose?

> `optional` **verbose**: `boolean`

Defined in: [src/index.ts:137](https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/04cb03720cd5c4b4ccc3763758fd11307ea668ef/src/index.ts#L137)

If true, this plugin will generate more output than usual.

#### Default

```ts
false
```
