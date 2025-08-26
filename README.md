<!-- symbiote-template-region-start 1 -->

<p align="center" width="100%">
  <img width="500" src="https://raw.githubusercontent.com/Xunnamius/babel-plugin-transform-rewrite-imports/refs/heads/main/logo.png">
</p>

<p align="center" width="100%">
<!-- symbiote-template-region-end -->
Reliably add/replace extensions of select import specifiers or just rewrite them entirely!
<!-- symbiote-template-region-start 2 -->
</p>

<hr />

<div align="center">

[![Black Lives Matter!][x-badge-blm-image]][x-badge-blm-link]
[![Last commit timestamp][x-badge-lastcommit-image]][x-badge-repo-link]
[![Codecov][x-badge-codecov-image]][x-badge-codecov-link]
[![Source license][x-badge-license-image]][x-badge-license-link]
[![Uses Semantic Release!][x-badge-semanticrelease-image]][x-badge-semanticrelease-link]

[![NPM version][x-badge-npm-image]][x-badge-npm-link]
[![Monthly Downloads][x-badge-downloads-image]][x-badge-downloads-link]

</div>

<br />

# babel-plugin-transform-rewrite-imports

<!-- symbiote-template-region-end -->

This Babel plugin (1) reliably adds [_extensions_][1] to import and export
[_specifiers_][2] that do not already have one, (2) selectively replaces
extensions of specifiers that do, and (3) can rewrite whole specifiers in
intricate ways using simple yet powerful [replacement maps][3].

All TypeScript and JavaScript flavors are supported depending on how Babel is
configured in the project.

For example, something like this:

```typescript
import { item1, type item2 } from '==> pretty specifier #1 <==';

export { here as there } from '==> pretty specifier #2 <==';

const elsewhere = `==> pretty specifier #${getRandomNumber()} <==`;

jest.mock('==> pretty specifier #3 <==');

const x = require('==> pretty specifier #4 <==');

export async function myFunction() {
  return (await import(elsewhere, { with: { type: 'json' } })).name;
}

export type MyType = {
  typeOnlyImport: typeof import('==> pretty specifier #5 <==').Type;
};
```

Can be easily transformed into something like this:

```typescript
import { item1, type item2 } from '../../../specifier-1.js';

export { here as there } from '../specifier-2.js';

const elsewhere = `==> specifier #${getRandomNumber()} <==`;

jest.mock('../../../packages/a-different-monorepo-package/src/specifier-3.js');

const x = require('@specifier/four');

const __injected_dynamic_rewrite = function () {
  /*...*/
};

export async function myFunction() {
  return (
    await import(__injected_dynamic_rewrite(elsewhere), {
      with: { type: 'json' }
    })
  ).name;
}

export type MyType = {
  typeOnlyImport: typeof import('../../../../node_modules/s-5/dist/src/lib.d.ts').Type;
};
```

The transform-rewrite-imports plugin comes in handy in situations like
transpiling TypeScript source with extensionless imports to ESM, or [changing
alias paths][4] in TypeScript declaration (i.e. `.d.ts`) files into relative
paths suitable for publishing. It does this more reliably and efficiently than
prior art.

<!-- symbiote-template-region-start 3 -->

---

<!-- remark-ignore-start -->
<!-- symbiote-template-region-end -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [Comparison with Prior Art](#comparison-with-prior-art)
- [Usage](#usage)
  - [`appendExtension`](#appendextension)
  - [`recognizedExtensions`](#recognizedextensions)
  - [`replaceExtensions`](#replaceextensions)
  - [`requireLikeFunctions`](#requirelikefunctions)
  - [`injectDynamicRewriter`](#injectdynamicrewriter)
- [Advanced Usage](#advanced-usage)
  - [Rewriting Dynamic Imports and Requires with Non-Literal Arguments](#rewriting-dynamic-imports-and-requires-with-non-literal-arguments)
- [Comprehensive Logging](#comprehensive-logging)
- [Examples](#examples)
  - [Real-World Examples](#real-world-examples)
- [Appendix](#appendix)
  - [Published Package Details](#published-package-details)
  - [License](#license)
- [Contributing and Support](#contributing-and-support)
  - [Contributors](#contributors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<!-- symbiote-template-region-start 4 -->
<!-- remark-ignore-end -->

<br />

## Install

<!-- symbiote-template-region-end -->

```shell
npm install --save-dev babel-plugin-transform-rewrite-imports
```

And integrate the following snippet into your Babel configuration:

```typescript
module.exports = {
  plugins: [
    [
      'babel-plugin-transform-rewrite-imports',
      {
        // See below for configuration instructions and examples
      }
    ]
  ]
};
```

Finally, run Babel through your toolchain (Webpack, Jest, etc) or manually:

```shell
npx babel src --out-dir dist
```

## Comparison with Prior Art

The transform-rewrite-imports plugin effectively combines the functionality of
the following:

- [babel-plugin-module-resolver][5]

  The module-resolver plugin inspired quite a bit of the functionality of
  transform-rewrite-imports, such as [transforming `require`-like functions][6],
  and offers some similar features like RegExp-based aliasing and support for
  substitution functions. However, transform-rewrite-imports is capable of more
  complex replacements (like handling intricate file extension changes) with
  support for a wider variety of specifier types while surfacing a simpler
  interface.

- [babel-plugin-add-import-extension][7]

  transform-rewrite-imports started off as a fork of add-import-extension;
  transform-rewrite-imports functions [more consistently][8] and includes
  support for transforming `require`, `require`-like, static `import()`, _and
  arbitrary dynamic `import()`_ statements, replacing multiple extensions using
  complex logic, and [reliably ignoring extensions that should not be
  replaced][9].

- [babel-plugin-replace-import-extension][10]

  transform-rewrite-imports is similar in intent to replace-import-extension.
  However, rewriting extensions is only a small fraction of what
  transform-rewrite-imports can do. And while both extensions support
  [transforming dynamic imports][11], transform-rewrite-imports results in more
  efficient code in production environments due to (1) avoiding injecting
  dynamic code into the AST except as the very last resort and (2) only
  injecting dynamic code once and caching it globally (at the file level) rather
  than filling the file with repeated functions.

- [babel-plugin-transform-rename-import][12]

  With its last update published over 6 years ago, transform-rename-import can
  also replace import specifiers, though transform-rewrite-imports offers a
  [powerful superset][13] of replacer functionality, including optionally
  performing replacements of [arbitrary dynamic imports][11] at runtime and
  appending extensions to specifiers that would otherwise not have one.

- [tsconfig-replace-paths][14] / [tsconfig-paths][15] / [tscpaths][16]

  tsconfig-replace-paths and its predecessors/alternatives tsconfig-paths and
  tscpaths are extremely useful for transpiling TypeScript projects, as they
  handle alias- and path- resolving use cases without additional configuration;
  transform-rewrite-imports, on the other hand, must be fed path/alias
  information from `tsconfig.json` manually.

  Unfortunately, tsconfig-paths is not a Babel plugin and requires [patching
  your runtime][17] while the others do not support all the latest
  TypeScript/Babel AST features (like [`TsImportType`][18]) and therefore fail
  to consistently and correctly transform certain files (especially certain
  `.d.ts` files).

  By mapping a project's `tsconfig.json` `paths` value to a replacement map
  transform-rewrite-imports can understand, it becomes possible to ditch
  tsconfig-replace-paths etc and reduce dependency count. [Here's an
  example][19] using transform-rewrite-imports to replace these plugins (and
  babel-plugin-module-resolver) for transforming both sources and type
  definitions. Essentially, this Babel configuration file maps the project's
  `tsconfig.json` `paths` into a [`replaceExtensions`][13] replacement map.

## Usage

By default this plugin does not affect Babel's output. You must explicitly
configure this extension before any specifier will be rewritten.

More information on the available options can be found in [the
docs][x-repo-docs]:

```typescript
{
  appendExtension?: string | Callback<string | undefined>;
  recognizedExtensions?: string[];
  replaceExtensions?: Record<string, string | Callback<string>>;
  requireLikeFunctions?: string[];
  injectDynamicRewriter?: 'never' | 'only-if-necessary';
  silent?: boolean;
  verbose?: boolean;
}
```

### `appendExtension`

To append an extension to all relative import specifiers that do not already
have a recognized extension, use `appendExtension`:

```typescript
module.exports = {
  plugins: [
    [
      'babel-plugin-transform-rewrite-imports',
      {
        appendExtension: '.mjs'
      }
    ]
  ]
};
```

> [!TIP]
>
> Only relative import specifiers (that start with `./` or `../`) will be
> considered for `appendExtension`. This means bare specifiers (e.g. built-in
> packages and packages imported from `node_modules`) and absolute specifiers
> will never be affected by `appendExtension`.

### `recognizedExtensions`

What is and is not considered a "recognized extension" is determined by
`recognizedExtensions`:

```typescript
module.exports = {
  plugins: [
    [
      'babel-plugin-transform-rewrite-imports',
      {
        appendExtension: '.mjs',
        recognizedExtensions: ['.js']
      }
    ]
  ]
};
```

That is: **import specifiers that end with an extension included in
`recognizedExtensions` will never have [`appendExtension`][21] appended to
them**. All other imports, including those with a `.` in the file name (e.g.
`component.module.style.ts`), may be rewritten.

`recognizedExtensions` is set to `['.js', '.jsx', '.mjs', '.cjs', '.json']` by
default.

If the value of [`appendExtension`][21] is not included in
`recognizedExtensions`, then imports that already end in [`appendExtension`][21]
will have [`appendExtension`][21] appended to them (e.g. `index.ts` is rewritten
as `index.ts.ts` when `appendExtension: '.ts'` and `recognizedExtensions` is its
default value). If this behavior is undesired, ensure [`appendExtension`][21] is
included in `recognizedExtensions`.

> [!WARNING]
>
> Note that specifying a custom value for `recognizedExtensions` overwrites the
> default value entirely. To extend rather than overwrite, you can import the
> default value from the package itself:
>
> ```typescript
> const {
>   defaultRecognizedExtensions
> } = require('babel-plugin-transform-rewrite-imports');
>
> module.exports = {
>   plugins: [
>     [
>       'babel-plugin-transform-rewrite-imports',
>       {
>         appendExtension: '.mjs',
>         recognizedExtensions: [...defaultRecognizedExtensions, '.ts']
>       }
>     ]
>   ]
> };
> ```

### `replaceExtensions`

You can also replace one or more existing extensions in specifiers using a
replacement map:

```typescript
module.exports = {
  plugins: [
    [
      'babel-plugin-transform-rewrite-imports',
      {
        replaceExtensions: {
          // Replacements are evaluated **in order**, stopping on the first match.
          // That means if the following two keys were listed in reverse order,
          // .node.js would become .node.mjs instead of .cjs
          '.node.js': '.cjs',
          '.js': '.mjs'
        }
      }
    ]
  ]
};
```

These configurations can be combined to rewrite many imports at once. For
instance, if you wanted to replace certain extensions and append only when no
recognized or listed extension is specified:

```typescript
module.exports = {
  plugins: [
    [
      'babel-plugin-transform-rewrite-imports',
      {
        appendExtension: '.mjs',
        replaceExtensions: {
          '.node.js': '.cjs',
          // Since .js is in recognizedExtensions by default, file.js would normally
          // be ignored. However, since .js is mapped to .mjs in the
          // replaceExtensions map, file.js becomes file.mjs
          '.js': '.mjs'
        }
      }
    ]
  ]
};
```

Since specifier comparisons are made using [`String.endsWith`][39] without
splitting on directory separators or any other characters,
[`appendExtension`][21] and `replaceExtensions` accept any suffix, not just
those that begin with `.`; additionally, `replaceExtensions` accepts _regular
expressions_. This allows you to partially or entirely rewrite a specifier
rather than just its extension:

```typescript
const {
  defaultRecognizedExtensions
} = require('babel-plugin-transform-rewrite-imports');

module.exports = {
  plugins: [
    [
      'babel-plugin-transform-rewrite-imports',
      {
        appendExtension: '.mjs',
        // Add .css to recognizedExtensions so .mjs isn't automatically appended
        recognizedExtensions: [...defaultRecognizedExtensions, '.css'],
        replaceExtensions: {
          '.node.js': '.cjs',
          '.js': '.mjs',

          // The following key replaces the entire specifier when matched
          '^package$': `${__dirname}/package.json`,
          // If .css wasn't in recognizedExtensions, my-utils/src/file.less would
          // become my-utils/src/file.css.mjs instead of my-utils/src/file.css
          '(.+?)\\.less$': '$1.css'
        }
      }
    ]
  ]
};
```

> [!TIP]
>
> If a key of `replaceExtensions` begins with `^` _or_ ends with `$`, it is
> considered a regular expression instead of an extension. Regular expression
> replacements support substitutions of capturing groups as well (e.g. `$1`,
> `$2`, etc).

`replaceExtensions` is evaluated and replacements made _before_
[`appendExtension`][21] is appended to specifiers with unrecognized or missing
extensions. This means an extensionless import specifier could be rewritten by
`replaceExtensions` to have a recognized extension, which would then be ignored
instead of having [`appendExtension`][21] appended to it.

### `requireLikeFunctions`

When it comes to deciding what is and is not a specifier,
transform-rewrite-imports will always scan [`ImportDeclaration`][22],
[`ExportAllDeclaration`][23], [`ExportNamedDeclaration`][24],
[`TSImportType`][18], and dynamic import [`CallExpression`][25]s for specifiers.

For call expressions specifically, `requireLikeFunctions` is used to determine
which additional function calls will have their first arguments scanned for
specifiers. By default, `requireLikeFunctions` is set to:

```typescript
[
  'require',
  'require.resolve',
  'System.import',
  'jest.genMockFromModule',
  'jest.mock',
  'jest.unmock',
  'jest.doMock',
  'jest.dontMock',
  'jest.requireActual'
];
```

> [!TIP]
>
> Similar to `defaultRequireLikeFunctions`, these defaults are exported under
> the name `defaultRequireLikeFunctions`.

This means call expressions like `require(...)`, `jest.mock(...)`, etc will be
treated the same way as `import(...)`, where the first parameter is considered a
specifier. You are free to tweak this functionality to suit your environment.

### `injectDynamicRewriter`

By default, a dynamic rewriter is injected only if necessary. Set this to
`"never"` to ensure a dynamic rewriter is _never_ injected into the the output
regardless of any perceived necessity.

Refer to [the Advanced Usage section][11] for more details.

## Advanced Usage

[`replaceExtensions`][13] and [`appendExtension`][21] both accept function
callbacks as values everywhere strings are accepted. This can be used to provide
advanced replacement logic.

These callback functions have the following signatures:

```typescript
type AppendExtensionCallback = (context: {
  specifier: string;
  capturingGroups: never[];
  filepath: string;
}) => string | undefined;

type ReplaceExtensionsCallback = (context: {
  specifier: string;
  capturingGroups: string[];
  filepath: string;
}) => string;
```

Where `specifier` is the [import/export specifier][2] being rewritten,
`capturingGroups` is a simple string array of capturing groups returned by
[`String.prototype.match()`][26], and `filepath` is the absolute path to the
original input file being transformed by Babel. `capturingGroups` will always be
an empty array except when it appears within a function value of a
[`replaceExtensions`][13] entry that has a regular expression key.

When provided as the value of [`appendExtension`][21], a string containing an
extension should be returned (including leading dot). When provided as the value
of a [`replaceExtensions`][13] entry, a string containing the full specifier
should be returned. When returning a full specifier, capturing group
substitutions (e.g. $1, $2, etc) within the returned string will be honored.

Further, in the case of [`appendExtension`][21], note that `specifier`, if its
basename is `.` or `..` or if it ends in a directory separator (e.g. `/`), will
have "/index" appended to the end before the callback is invoked. However, if
the callback returns `undefined` (and the specifier was not matched in
[`replaceExtensions`][13]), the specifier will not be modified in any way.

By way of example (see the output of this example [here][27]):

```typescript
module.exports = {
  plugins: [
    [
      'babel-plugin-transform-rewrite-imports',
      {
        // If the specifier ends with "/no-ext", do not append any extension
        appendExtension: ({ specifier }) => {
          return specifier.endsWith('/no-ext') ||
            specifier.endsWith('..') ||
            specifier === './another-thing'
            ? undefined
            : '.mjs';
        },
        replaceExtensions: {
          // Rewrite imports of packages in a monorepo to use their actual names
          //         v capturing group #1: capturingGroups[1]
          '^packages/([^/]+)(/.+)?': ({ specifier, capturingGroups }) => {
            //              ^ capturing group #2: capturingGroups[2]
            if (
              specifier === 'packages/root' ||
              specifier.startsWith('packages/root/')
            ) {
              return `./monorepo-js${capturingGroups[2] ?? '/'}`;
            } else if (
              !capturingGroups[2] ||
              capturingGroups[2].startsWith('/src/index')
            ) {
              return `@monorepo/$1`;
            } else if (capturingGroups[2].startsWith('/package.json')) {
              return `@monorepo/$1$2`;
            } else {
              return `@monorepo/$1/dist$2`;
            }
          }
        }
      }
    ]
  ]
};
```

### Rewriting Dynamic Imports and Requires with Non-Literal Arguments

When transforming dynamic imports and require statements [that do not have a
string literal as the first argument][28], and [`injectDynamicRewriter`][20] is
not set to `'never'`, the options passed to this plugin are [transpiled and
injected][30] into the resulting AST.

> [!CAUTION]
>
> This means you take a slight performance hit when you do arbitrary dynamic
> imports that cannot be statically analyzed (e.g.
> `require(getMd5Hash() + '.txt')`). These types of dynamic imports are usually
> code smell, but this library is built to accommodate them regardless.
>
> However, **if you are NOT doing _arbitrary_ dynamic imports**, which are
> dynamic imports where the first argument is not a string literal, then this
> section is of no relevance to you since nothing extra will be injected into
> the AST.

Therefore, to be safe, **callback functions must not reference variables outside
of their immediate [scope][31]**.

Good:

```typescript
module.exports = {
  plugins: [
    [
      'babel-plugin-transform-rewrite-imports',
      {
        replaceExtensions: {
          '^packages/([^/]+)(/.+)?': ({ specifier, capturingGroups }) => {
            const myPkg = require('my-pkg');
            myPkg.doStuff(specifier, capturingGroups);
          }
        }
      }
    ]
  ]
};
```

Bad:

```typescript
const myPkg = require('my-pkg');

module.exports = {
  plugins: [
    [
      'babel-plugin-transform-rewrite-imports',
      {
        replaceExtensions: {
          '^packages/([^/]+)(/.+)?': ({ specifier, capturingGroups }) => {
            myPkg.doStuff(specifier, capturingGroups);
          }
        }
      }
    ]
  ]
};
```

Technically, you can get away with violating this rule if you're _sure_ you'll
only ever use [dynamic imports/require statements with string literal
arguments][32].

## Comprehensive Logging

Like Babel itself, this plugin leverages [debug (via rejoinder)][33] under the
hood for log management. You can take advantage of this to peer into
transform-rewrite-imports's innermost workings and deepest decision-making
processes by [activating][34] the appropriate log level. For example, the
following will enable all logging related to this plugin:

```bash
DEBUG='babel-plugin-transform-rewrite-imports:*' npx babel src --out-dir dist
```

## Examples

With the following snippet integrated into your Babel configuration:

```typescript
const {
  defaultRecognizedExtensions
} = require('babel-plugin-transform-rewrite-imports');

module.exports = {
  plugins: [
    [
      'babel-plugin-transform-rewrite-imports',
      {
        appendExtension: '.mjs',
        recognizedExtensions: [...defaultRecognizedExtensions, '.css'],
        replaceExtensions: {
          '.ts': '.mjs',
          '^package$': `${__dirname}/package.json`,
          '(.+?)\\.less$': '$1.css'
        }
      }
    ]
  ]
};
```

The following source:

```typescript
/* file: src/index.ts */
import { name as pkgName } from 'package';
import { primary } from '.';
import { secondary } from '..';
import { tertiary } from '../..';
import dirImport from './some-dir/';
import jsConfig from './jsconfig.json';
import projectConfig from './project.config.cjs';
import { add, double } from './src/numbers';
import { curry } from './src/typed/curry.ts';
import styles from './src/less/styles.less';

// Note that, unless otherwise configured, @babel/preset-typescript deletes
// type-only imports. If you want to operate on type imports and/or .d.ts files,
// use @babel/syntax-typescript instead. See ./test/supports-type-only for
// an example.
import type * as AllTypes from './lib/something.mjs';

export { triple, quadruple } from './lib/num-utils';

// Note that, unless otherwise configured, @babel/preset-typescript deletes
// type-only exports. If you want to operate on type imports and/or .d.ts files,
// use @babel/syntax-typescript instead. See ./test/supports-type-only for
// an example.
export type { NamedType } from './lib/something';

const thing = await import('./thing');
const anotherThing = require('./another-thing');

const thing2 = await import(someFn(`./${someVariable}`) + '.json');
const anotherThing2 = require(someOtherVariable);
```

Is, depending on your other plugins/settings, transformed into something like:

```typescript
/* file: dist/index.js */
const _rewrite = (importPath, options) => {
    ...
  },
  _rewrite_options = {
    appendExtension: '.mjs',
    recognizedExtensions: ['.js', '.jsx', '.mjs', '.cjs', '.json', '.css'],
    replaceExtensions: {
      '.ts': '.mjs',
      '^package$': '/absolute/path/to/project/package.json',
      '(.+?)\\.less$': '$1.css'
    }
  };

import { name as pkgName } from '/absolute/path/to/project/package.json';
import { primary } from './index.mjs';
import { secondary } from '../index.mjs';
import { tertiary } from '../../index.mjs';
import dirImport from './some-dir/index.mjs';
import jsConfig from './jsconfig.json';
import projectConfig from './project.config.cjs';
import { add, double } from './src/numbers.mjs';
import { curry } from './src/typed/curry.mjs';
import styles from './src/less/styles.css';

export { triple, quadruple } from './lib/num-utils.mjs';

const thing = await import('./thing.mjs');
const anotherThing = require('./another-thing.mjs');

// Require calls and dynamic imports with a non-string-literal first argument
// are transformed into function calls that dynamically return the rewritten
// string:

const thing2 = await import(
  _rewrite(someFn(`./${someVariable}`) + '.json', _rewrite_options)
);

const anotherThing2 = require(_rewrite(someOtherVariable, _rewrite_options));

```

> [!NOTE]
>
> See the full output of this example [here][35].

### Real-World Examples

For some real-world examples of this Babel plugin in action, check out
[symbiote's `babel.config.js` file][19] (which uses transform-rewrite-imports to
replace both babel-plugin-module-resolver and tsconfig-replace-paths),
[unified-utils][36], [this very repository][37], or just take a peek at the
[test cases][38].

<!-- symbiote-template-region-start 5 -->

## Appendix

<!-- symbiote-template-region-end -->

Further documentation can be found under [`docs/`][x-repo-docs].

<!-- symbiote-template-region-start 6 -->

### Published Package Details

This is a [CJS2 package][x-pkg-cjs-mojito] with statically-analyzable exports
built by Babel for use in Node.js versions that are not end-of-life. For
TypeScript users, this package supports both `"Node10"` and `"Node16"` module
resolution strategies.

<!-- symbiote-template-region-end -->
<!-- symbiote-template-region-start 7 -->

<details><summary>Expand details</summary>

That means both CJS2 (via `require(...)`) and ESM (via `import { ... } from ...`
or `await import(...)`) source will load this package from the same entry points
when using Node. This has several benefits, the foremost being: less code
shipped/smaller package size, avoiding [dual package
hazard][x-pkg-dual-package-hazard] entirely, distributables are not
packed/bundled/uglified, a drastically less complex build process, and CJS
consumers aren't shafted.

Each entry point (i.e. `ENTRY`) in [`package.json`'s
`exports[ENTRY]`][x-repo-package-json] object includes one or more [export
conditions][x-pkg-exports-conditions]. These entries may or may not include: an
[`exports[ENTRY].types`][x-pkg-exports-types-key] condition pointing to a type
declaration file for TypeScript and IDEs, a
[`exports[ENTRY].module`][x-pkg-exports-module-key] condition pointing to
(usually ESM) source for Webpack/Rollup, a `exports[ENTRY].node` and/or
`exports[ENTRY].default` condition pointing to (usually CJS2) source for Node.js
`require`/`import` and for browsers and other environments, and [other
conditions][x-pkg-exports-conditions] not enumerated here. Check the
[package.json][x-repo-package-json] file to see which export conditions are
supported.

Note that, regardless of the [`{ "type": "..." }`][x-pkg-type] specified in
[`package.json`][x-repo-package-json], any JavaScript files written in ESM
syntax (including distributables) will always have the `.mjs` extension. Note
also that [`package.json`][x-repo-package-json] may include the
[`sideEffects`][x-pkg-side-effects-key] key, which is almost always `false` for
optimal [tree shaking][x-pkg-tree-shaking] where appropriate.

<!-- symbiote-template-region-end -->
<!-- symbiote-template-region-start 8 -->

</details>

### License

<!-- symbiote-template-region-end -->

See [LICENSE][x-repo-license].

<!-- symbiote-template-region-start 9 -->

## Contributing and Support

**[New issues][x-repo-choose-new-issue] and [pull requests][x-repo-pr-compare]
are always welcome and greatly appreciated! 🤩** Just as well, you can [star 🌟
this project][x-badge-repo-link] to let me know you found it useful! ✊🏿 Or [buy
me a beer][x-repo-sponsor], I'd appreciate it. Thank you!

See [CONTRIBUTING.md][x-repo-contributing] and [SUPPORT.md][x-repo-support] for
more information.

<!-- symbiote-template-region-end -->
<!-- symbiote-template-region-start 10 -->

### Contributors

<!-- symbiote-template-region-end -->
<!-- symbiote-template-region-start root-package-only -->
<!-- remark-ignore-start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- remark-ignore-end -->

Thanks goes to these wonderful people ([emoji
key][x-repo-all-contributors-emojis]):

<!-- remark-ignore-start -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://xunn.io/"><img src="https://avatars.githubusercontent.com/u/656017?v=4?s=100" width="100px;" alt="Bernard"/><br /><sub><b>Bernard</b></sub></a><br /><a href="#infra-Xunnamius" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commits?author=Xunnamius" title="Code">💻</a> <a href="https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commits?author=Xunnamius" title="Documentation">📖</a> <a href="#maintenance-Xunnamius" title="Maintenance">🚧</a> <a href="https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commits?author=Xunnamius" title="Tests">⚠️</a> <a href="https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/pulls?q=is%3Apr+reviewed-by%3AXunnamius" title="Reviewed Pull Requests">👀</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- remark-ignore-end -->

This project follows the [all-contributors][x-repo-all-contributors]
specification. Contributions of any kind welcome!

<!-- symbiote-template-region-end -->
<!-- symbiote-template-region-start workspace-package-only -->
<!-- (section elided by symbiote) -->
<!-- symbiote-template-region-end -->

[x-badge-blm-image]: https://xunn.at/badge-blm 'Join the movement!'
[x-badge-blm-link]: https://xunn.at/donate-blm
[x-badge-codecov-image]:
  https://img.shields.io/codecov/c/github/Xunnamius/babel-plugin-transform-rewrite-imports/main?style=flat-square&token=HWRIOBAAPW&flag=package.main_root
  'Is this package well-tested?'
[x-badge-codecov-link]:
  https://codecov.io/gh/Xunnamius/babel-plugin-transform-rewrite-imports
[x-badge-downloads-image]:
  https://img.shields.io/npm/dm/babel-plugin-transform-rewrite-imports?style=flat-square
  'Number of times this package has been downloaded per month'
[x-badge-downloads-link]:
  https://npmtrends.com/babel-plugin-transform-rewrite-imports
[x-badge-lastcommit-image]:
  https://img.shields.io/github/last-commit/Xunnamius/babel-plugin-transform-rewrite-imports?style=flat-square
  'Latest commit timestamp'
[x-badge-license-image]:
  https://img.shields.io/npm/l/babel-plugin-transform-rewrite-imports?style=flat-square
  "This package's source license"
[x-badge-license-link]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/main/LICENSE
[x-badge-npm-image]:
  https://xunn.at/npm-pkg-version/babel-plugin-transform-rewrite-imports
  'Install this package using npm or yarn!'
[x-badge-npm-link]: https://npm.im/babel-plugin-transform-rewrite-imports
[x-badge-repo-link]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports
[x-badge-semanticrelease-image]:
  https://xunn.at/badge-semantic-release
  'This repo practices continuous integration and deployment!'
[x-badge-semanticrelease-link]:
  https://github.com/semantic-release/semantic-release
[x-pkg-cjs-mojito]:
  https://dev.to/jakobjingleheimer/configuring-commonjs-es-modules-for-nodejs-12ed#publish-only-a-cjs-distribution-with-property-exports
[x-pkg-dual-package-hazard]:
  https://nodejs.org/api/packages.html#dual-package-hazard
[x-pkg-exports-conditions]:
  https://webpack.js.org/guides/package-exports#reference-syntax
[x-pkg-exports-module-key]:
  https://webpack.js.org/guides/package-exports#providing-commonjs-and-esm-version-stateless
[x-pkg-exports-types-key]:
  https://devblogs.microsoft.com/typescript/announcing-typescript-4-5-beta#packagejson-exports-imports-and-self-referencing
[x-pkg-side-effects-key]:
  https://webpack.js.org/guides/tree-shaking#mark-the-file-as-side-effect-free
[x-pkg-tree-shaking]: https://webpack.js.org/guides/tree-shaking
[x-pkg-type]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#type
[x-repo-all-contributors]: https://github.com/all-contributors/all-contributors
[x-repo-all-contributors-emojis]: https://allcontributors.org/docs/en/emoji-key
[x-repo-choose-new-issue]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/issues/new/choose
[x-repo-contributing]: /CONTRIBUTING.md
[x-repo-docs]: docs
[x-repo-license]: ./LICENSE
[x-repo-package-json]: package.json
[x-repo-pr-compare]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/compare
[x-repo-sponsor]: https://github.com/sponsors/Xunnamius
[x-repo-support]: /.github/SUPPORT.md
[1]: https://en.wikipedia.org/wiki/Filename_extension
[2]: https://nodejs.org/api/esm.html#terminology
[3]: #usage
[4]:
  https://www.reddit.com/r/typescript/comments/9mdfio/change_back_your_alias_paths_to_relative_paths_in
[5]:
  https://github.com/tleunen/babel-plugin-module-resolver/blob/HEAD/DOCS.md#extensions
[6]: #requirelikefunctions
[7]: https://github.com/karlprieb/babel-plugin-add-import-extension
[8]: https://codeberg.org/karl/babel-plugin-add-import-extension/issues/3
[9]: https://codeberg.org/karl/babel-plugin-add-import-extension/issues/10
[10]: https://www.npmjs.com/package/babel-plugin-replace-import-extension
[11]: #rewriting-dynamic-imports-and-requires-with-non-literal-arguments
[12]: https://www.npmjs.com/package/babel-plugin-transform-rename-import
[13]: #replaceextensions
[14]: https://www.npmjs.com/package/tsconfig-replace-paths
[15]: https://github.com/dividab/tsconfig-paths
[16]: https://github.com/joonhocho/tscpaths
[17]: https://github.com/dividab/tsconfig-paths?tab=readme-ov-file#how-to-use
[18]: https://babeljs.io/docs/babel-types#tsimporttype
[19]:
  https://github.com/Xunnamius/symbiote/blob/main/src/assets/transformers/_babel.config.cjs.ts
[20]: ./docs/src/type-aliases/Options.md#injectdynamicrewriter
[21]: #appendextension
[22]: https://babeljs.io/docs/babel-types#importdeclaration
[23]: https://babeljs.io/docs/babel-types#exportalldeclaration
[24]: https://babeljs.io/docs/babel-types#exportnameddeclaration
[25]: https://babeljs.io/docs/babel-types#callexpression
[26]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
[27]: ./test/fixtures/supports-callback-values/output.js
[28]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/50186e4dafbe022390727985edd14c2af9c85cb2/test/fixtures/supports-callback-values/code.ts#L38-L39
[30]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/50186e4dafbe022390727985edd14c2af9c85cb2/test/fixtures/supports-callback-values/output.js#L75-L97
[31]: https://developer.mozilla.org/en-US/docs/Glossary/Scope
[32]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/50186e4dafbe022390727985edd14c2af9c85cb2/test/fixtures/supports-callback-values/output.js#L130-L131
[33]: https://npm.im/rejoinder
[34]: https://www.npmjs.com/package/debug#usage
[35]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/tree/main/test/fixtures/readme-examples-work/output.js
[36]: https://github.com/Xunnamius/unified-utils/blob/main/babel.config.js
[37]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/main/babel.config.cjs
[38]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/tree/main/test/fixtures
[39]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
