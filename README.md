<!-- badges-start -->

[![Black Lives Matter!][x-badge-blm-image]][x-badge-blm-link]
[![Last commit timestamp][x-badge-lastcommit-image]][x-badge-repo-link]
[![Codecov][x-badge-codecov-image]][x-badge-codecov-link]
[![Source license][x-badge-license-image]][x-badge-license-link]
[![Monthly Downloads][x-badge-downloads-image]][x-badge-npm-link]
[![NPM version][x-badge-npm-image]][x-badge-npm-link]
[![Uses Semantic Release!][x-badge-semanticrelease-image]][x-badge-semanticrelease-link]

<!-- badges-end -->

# babel-plugin-transform-rewrite-imports

A babel plugin that reliably adds extensions to import (and export) specifiers
that do not already have one, selectively replaces extensions of specifiers that
do, and can even rewrite specifiers entirely if desired. This plugin comes in
handy in situations like transpiling TypeScript source with extensionless
imports to ESM, or [changing alias paths][1] in TypeScript declaration (i.e.
`.d.ts`) files into relative paths suitable for publishing. This plugin does
this more reliably and correctly than prior art like tsconfig-paths and
[tsconfig-replace-paths][2].

This plugin started off as a fork of [babel-plugin-add-import-extension][3] that
functions [more consistently][4], including support for `require` and dynamic
`import()`, replacing multiple extensions via mapping, and [reliably ignoring
extensions that should not be replaced][5].

This plugin is similar in intent to [babel-plugin-replace-import-extension][6]
and [babel-plugin-transform-rename-import][7] but with the ability to rewrite
both `require` and dynamic `import()` statements, memoize the `rewrite` function
AST and any passed options as globals for substantial comparative output size
reduction, and append extensions to import specifiers that do not already have
one.

---

<!-- remark-ignore-start -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [Usage](#usage)
  - [Advanced Usage](#advanced-usage)
- [Examples](#examples)
  - [Real-World Examples](#real-world-examples)
- [Appendix](#appendix)
  - [Published Package Details](#published-package-details)
  - [License](#license)
- [Contributing and Support](#contributing-and-support)
  - [Contributors](#contributors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<!-- remark-ignore-end -->

## Install

```shell
npm install --save-dev babel-plugin-transform-rewrite-imports
```

And integrate the following snippet into your babel configuration:

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

## Usage

By default this plugin does not affect babel's output. You must explicitly
configure this extension before any specifier will be rewritten.

Available options are:

```typescript
appendExtension?: string;
recognizedExtensions?: string[];
replaceExtensions?: Record<string, string>;
silent?: boolean;
verbose?: boolean;
```

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

> Only relative import specifiers (that start with `./` or `../`) will be
> considered for `appendExtension`. This means bare specifiers (e.g. built-in
> packages and packages imported from `node_modules`) and absolute specifiers
> will never be affected by `appendExtension`.

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
`recognizedExtensions` will never have `appendExtension` appended to them**. All
other imports, including those with a `.` in the file name (e.g.
`component.module.style.ts`), may be rewritten.

`recognizedExtensions` is set to `['.js', '.jsx', '.mjs', '.cjs', '.json']` by
default.

If the value of `appendExtension` is not included in `recognizedExtensions`,
then imports that already end in `appendExtension` will have `appendExtension`
appended to them (e.g. `index.ts` is rewritten as `index.ts.ts` when
`appendExtension: '.ts'` and `recognizedExtensions` is its default value). If
this behavior is undesired, ensure `appendExtension` is included in
`recognizedExtensions`.

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

`appendExtension` and `replaceExtensions` accept any suffix, not just those that
begin with `.`; additionally, `replaceExtensions` accepts _regular expressions_.
This allows you to partially or entirely rewrite a specifier rather than just
its extension:

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

> If a key of `replaceExtensions` begins with `^` _or_ ends with `$`, it is
> considered a regular expression instead of an extension. Regular expression
> replacements support substitutions of capturing groups as well (e.g. `$1`,
> `$2`, etc).

`replaceExtensions` is evaluated and replacements made before `appendExtension`
is appended to specifiers with unrecognized or missing extensions. This means an
extensionless import specifier could be rewritten by `replaceExtensions` to have
a recognized extension, which would then be ignored instead of having
`appendExtension` appended to it.

### Advanced Usage

`replaceExtensions` and `appendExtension` both accept function callbacks as
values everywhere strings are accepted. This can be used to provide advanced
replacement logic.

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

Where `specifier` is the [import/export specifier][8] being rewritten,
`capturingGroups` is a simple string array of capturing groups returned by
[`String.prototype.match()`][9], and `filename` is an absolute path to the file
in which the rewrite is occurring. `capturingGroups` will always be an empty
array except when it appears within a function value of a `replaceExtensions`
entry that has a regular expression key. `filename` is taken directly from
`babelOptions.filename`.

When provided as the value of `appendExtension`, a string containing an
extension should be returned (including leading dot). When provided as the value
of a `replaceExtensions` entry, a string containing the full specifier should be
returned. When returning a full specifier, capturing group substitutions (e.g.
$1, $2, etc) within the returned string will be honored.

Further, in the case of `appendExtension`, note that `specifier`, if its
basename is `.` or `..` or if it ends in a directory separator (e.g. `/`), will
have "/index" appended to the end before the callback is invoked. However, if
the callback returns `undefined` (and the specifier was not matched in
`replaceExtensions`), the specifier will not be modified in any way.

By way of example (see the output of this example [here][10]):

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

#### Rewriting Dynamic Imports and Requires with Non-Literal Arguments

When transforming dynamic imports and require statements [that do not have a
string literal as the first argument][11], the options passed to this plugin are
[transpiled and injected][12] into the resulting AST.

> \[!CAUTION]
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
of their immediate [scope][13]**.

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
arguments][14].

## Examples

With the following snippet integrated into your babel configuration:

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

> See the full output of this example [here][15].

### Real-World Examples

For some real-world examples of this babel plugin in action, check out the
[unified-utils][16] and [babel-plugin-transform-rewrite-imports][17]
repositories or take a peek at the [test cases][18].

## Appendix

Further documentation can be found under [`docs/`][x-repo-docs].

### Published Package Details

This is a [CJS2 package][x-pkg-cjs-mojito] with statically-analyzable exports
built by Babel for Node.js versions that are not end-of-life.

<details><summary>Expand details</summary>

That means both CJS2 (via `require(...)`) and ESM (via `import { ... } from ...`
or `await import(...)`) source will load this package from the same entry points
when using Node. This has several benefits, the foremost being: less code
shipped/smaller package size, avoiding [dual package
hazard][x-pkg-dual-package-hazard] entirely, distributables are not
packed/bundled/uglified, and a less complex build process.

Each entry point (i.e. `ENTRY`) in [`package.json`'s
`exports[ENTRY]`][x-repo-package-json] object includes one or more [export
conditions][x-pkg-exports-conditions]. These entries may or may not include: an
[`exports[ENTRY].types`][x-pkg-exports-types-key] condition pointing to a type
declarations file for TypeScript and IDEs, an
[`exports[ENTRY].module`][x-pkg-exports-module-key] condition pointing to
(usually ESM) source for Webpack/Rollup, an `exports[ENTRY].node` condition
pointing to (usually CJS2) source for Node.js `require` _and `import`_, an
`exports[ENTRY].default` condition pointing to source for browsers and other
environments, and [other conditions][x-pkg-exports-conditions] not enumerated
here. Check the [package.json][x-repo-package-json] file to see which export
conditions are supported.

Though [`package.json`][x-repo-package-json] includes
[`{ "type": "commonjs" }`][x-pkg-type], note that any ESM-only entry points will
be ES module (`.mjs`) files. Finally, [`package.json`][x-repo-package-json] also
includes the [`sideEffects`][x-pkg-side-effects-key] key, which is `false` for
optimal [tree shaking][x-pkg-tree-shaking].

</details>

### License

See [LICENSE][x-repo-license].

## Contributing and Support

**[New issues][x-repo-choose-new-issue] and [pull requests][x-repo-pr-compare]
are always welcome and greatly appreciated! 🤩** Just as well, you can [star 🌟
this project][x-badge-repo-link] to let me know you found it useful! ✊🏿 Thank
you!

See [CONTRIBUTING.md][x-repo-contributing] and [SUPPORT.md][x-repo-support] for
more information.

### Contributors

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

[x-badge-blm-image]: https://xunn.at/badge-blm 'Join the movement!'
[x-badge-blm-link]: https://xunn.at/donate-blm
[x-badge-codecov-image]:
  https://img.shields.io/codecov/c/github/Xunnamius/babel-plugin-transform-rewrite-imports/main?style=flat-square&token=HWRIOBAAPW
  'Is this package well-tested?'
[x-badge-codecov-link]:
  https://codecov.io/gh/Xunnamius/babel-plugin-transform-rewrite-imports
[x-badge-downloads-image]:
  https://img.shields.io/npm/dm/babel-plugin-transform-rewrite-imports?style=flat-square
  'Number of times this package has been downloaded per month'
[x-badge-lastcommit-image]:
  https://img.shields.io/github/last-commit/xunnamius/babel-plugin-transform-rewrite-imports?style=flat-square
  'Latest commit timestamp'
[x-badge-license-image]:
  https://img.shields.io/npm/l/babel-plugin-transform-rewrite-imports?style=flat-square
  "This package's source license"
[x-badge-license-link]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/main/LICENSE
[x-badge-npm-image]:
  https://xunn.at/npm-pkg-version/babel-plugin-transform-rewrite-imports
  'Install this package using npm or yarn!'
[x-badge-npm-link]:
  https://www.npmjs.com/package/babel-plugin-transform-rewrite-imports
[x-badge-repo-link]:
  https://github.com/xunnamius/babel-plugin-transform-rewrite-imports
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
  https://github.com/xunnamius/babel-plugin-transform-rewrite-imports/issues/new/choose
[x-repo-contributing]: /CONTRIBUTING.md
[x-repo-docs]: docs
[x-repo-license]: ./LICENSE
[x-repo-package-json]: package.json
[x-repo-pr-compare]:
  https://github.com/xunnamius/babel-plugin-transform-rewrite-imports/compare
[x-repo-support]: /.github/SUPPORT.md
[1]:
  https://www.reddit.com/r/typescript/comments/9mdfio/change_back_your_alias_paths_to_relative_paths_in
[2]: https://www.npmjs.com/package/tsconfig-replace-paths
[3]: https://github.com/karlprieb/babel-plugin-add-import-extension
[4]: https://codeberg.org/karl/babel-plugin-add-import-extension/issues/3
[5]: https://codeberg.org/karl/babel-plugin-add-import-extension/issues/10
[6]: https://www.npmjs.com/package/babel-plugin-replace-import-extension
[7]: https://www.npmjs.com/package/babel-plugin-transform-rename-import
[8]: https://nodejs.org/api/esm.html#terminology
[9]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
[10]: ./test/fixtures/supports-callback-values/output.js
[11]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/50186e4dafbe022390727985edd14c2af9c85cb2/test/fixtures/supports-callback-values/code.ts#L38-L39
[12]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/50186e4dafbe022390727985edd14c2af9c85cb2/test/fixtures/supports-callback-values/output.js#L75-L97
[13]: https://developer.mozilla.org/en-US/docs/Glossary/Scope
[14]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/50186e4dafbe022390727985edd14c2af9c85cb2/test/fixtures/supports-callback-values/output.js#L130-L131
[15]: ./test/fixtures/readme-examples-work/output.js
[16]: https://github.com/Xunnamius/unified-utils/blob/main/babel.config.js
[17]: https://github.com/Xunnamius/projector/blob/main/babel.config.js
[18]: ./test/fixtures
