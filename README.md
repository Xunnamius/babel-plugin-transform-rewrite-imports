<!-- prettier-ignore-start -->

<!-- badges-start -->

[![Black Lives Matter!][badge-blm]][link-blm]
[![Maintenance status][badge-maintenance]][link-repo]
[![Last commit timestamp][badge-last-commit]][link-repo]
[![Open issues][badge-issues]][link-issues]
[![Pull requests][badge-pulls]][link-pulls]
[![Codecov][badge-codecov]][link-codecov]
[![Source license][badge-license]][link-license]
[![NPM version][badge-npm]][link-npm]
[![Uses Semantic Release!][badge-semantic-release]][link-semantic-release]

<!-- badges-end -->

<!-- prettier-ignore-end -->

# babel-plugin-transform-rewrite-imports

A babel plugin that reliably adds extensions to import (and export) specifiers
that do not already have one, selectively replaces extensions of specifiers that
do, and can even rewrite specifiers entirely if desired. This plugin comes in
handy in situations like transpiling TypeScript source to ESM while maintaining
the ergonomic advantage of TypeScript/NodeJS extensionless imports.

This plugin started off as a fork of
[babel-plugin-transform-rewrite-imports][link-npm] that functions [more
consistently][1], including support for `require` and dynamic `import()`,
replacing multiple extensions via mapping, and [reliably ignoring extensions
that should not be replaced][2].

This plugin is similar in intent to [babel-plugin-replace-import-extension][3]
and [babel-plugin-transform-rename-import][4] but with the ability to rewrite
both `require` and dynamic `import()` statements, memoize rewrite function AST
and options as globals for substantial comparative output size reduction, and
append extensions to import specifiers that do not already have one.

## Install

```Shell
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

```Shell
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

> Note that specifying a custom value for `recognizedExtensions` overwrites the
> default value entirely.

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
module.exports = {
  plugins: [
    [
      'babel-plugin-transform-rewrite-imports',
      {
        appendExtension: '.mjs',
        // Add .css to recognizedExtensions so .mjs isn't automatically appended
        recognizedExtensions: ['.js', '.jsx', '.mjs', '.cjs', '.json', '.css'],
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
> replacements support substitutions of capture groups as well (e.g. `$1`, `$2`,
> etc).

`replaceExtensions` is evaluated and replacements made before `appendExtension`
is appended to specifiers with unrecognized or missing extensions. This means an
extensionless import specifier could be rewritten by `replaceExtensions` to have
a recognized extension, which would then be ignored instead of having
`appendExtension` appended to it.

## Examples

With the following snippet integrated into your babel configuration:

```typescript
module.exports = {
  plugins: [
    [
      'babel-plugin-transform-rewrite-imports',
      {
        appendExtension: '.mjs',
        recognizedExtensions: ['.js', '.jsx', '.mjs', '.cjs', '.json', '.css'],
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

// Note that, unless otherwise configured, babel deletes type-only imports
import type * as AllTypes from './lib/something.mjs';

export { triple, quadruple } from './lib/num-utils';
// Note that, unless otherwise configured, babel deletes type-only imports
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

// Requires and dynamic imports with a non-string-literal first argument are
// transformed into function calls that dynamically return the rewritten string

const thing2 = await import(
  _rewrite(someFn(`./${someVariable}`) + '.json', _rewrite_options)
);

const anotherThing2 = require(_rewrite(someOtherVariable, _rewrite_options));

```

## Documentation

> Further documentation can be found under [`docs/`][docs].

This is a [CJS2 package][cjs-mojito] with statically-analyzable exports built by
Babel for Node14 and above. That means both CJS2 (via `require(...)`) and ESM
(via `import { ... } from ...` or `await import(...)`) source will load this
package from the same entry points when using Node. This has several benefits,
the foremost being: less code shipped/smaller package size, avoiding [dual
package hazard][dual-package-hazard] entirely, distributables are not
packed/bundled/uglified, and a less complex build process.

Each entry point (i.e. `ENTRY`) in [`package.json`'s
`exports[ENTRY]`][package-json] object includes one or more [export
conditions][exports-conditions]. These entries may or may not include: an
[`exports[ENTRY].types`][exports-types-key] condition pointing to a type
declarations file for TypeScript and IDEs, an
[`exports[ENTRY].module`][exports-module-key] condition pointing to (usually
ESM) source for Webpack/Rollup, an `exports[ENTRY].node` condition pointing to
(usually CJS2) source for Node.js `require` _and `import`_, an
`exports[ENTRY].default` condition pointing to (usually ESM) source for browsers
and other environments, and [other conditions][exports-conditions] not
enumerated here. Check the [package.json][package-json] file to see which export
conditions are supported.

Though [`package.json`][package-json] includes
[`{ "type": "commonjs" }`][local-pkg], note that the ESM entry points are ES
module (`.mjs`) files. Finally, [`package.json`][package-json] also includes the
[`sideEffects`][side-effects-key] key, which is `false` for optimal [tree
shaking][tree-shaking].

## Contributing and Support

**[New issues][choose-new-issue] and [pull requests][pr-compare] are always
welcome and greatly appreciated! 🤩** Just as well, you can [star 🌟 this
project][link-repo] to let me know you found it useful! ✊🏿 Thank you!

See [CONTRIBUTING.md][contributing] and [SUPPORT.md][support] for more
information.

[badge-blm]: https://xunn.at/badge-blm 'Join the movement!'
[link-blm]: https://xunn.at/donate-blm
[badge-maintenance]:
  https://img.shields.io/maintenance/active/2023
  'Is this package maintained?'
[link-repo]: https://github.com/xunnamius/babel-plugin-transform-rewrite-imports
[badge-last-commit]:
  https://img.shields.io/github/last-commit/xunnamius/babel-plugin-transform-rewrite-imports
  'Latest commit timestamp'
[badge-issues]:
  https://img.shields.io/github/issues/Xunnamius/babel-plugin-transform-rewrite-imports
  'Open issues'
[link-issues]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/issues?q=
[badge-pulls]:
  https://img.shields.io/github/issues-pr/xunnamius/babel-plugin-transform-rewrite-imports
  'Open pull requests'
[link-pulls]:
  https://github.com/xunnamius/babel-plugin-transform-rewrite-imports/pulls
[badge-codecov]:
  https://codecov.io/gh/Xunnamius/babel-plugin-transform-rewrite-imports/branch/main/graph/badge.svg?token=HWRIOBAAPW
  'Is this package well-tested?'
[link-codecov]:
  https://codecov.io/gh/Xunnamius/babel-plugin-transform-rewrite-imports
[badge-license]:
  https://img.shields.io/npm/l/babel-plugin-transform-rewrite-imports
  "This package's source license"
[link-license]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/blob/main/LICENSE
[badge-npm]:
  https://api.ergodark.com/badges/npm-pkg-version/babel-plugin-transform-rewrite-imports
  'Install this package using npm or yarn!'
[link-npm]: https://www.npmjs.com/package/babel-plugin-transform-rewrite-imports
[badge-semantic-release]:
  https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
  'This repo practices continuous integration and deployment!'
[link-semantic-release]: https://github.com/semantic-release/semantic-release
[package-json]: package.json
[docs]: docs
[choose-new-issue]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/issues/new/choose
[pr-compare]:
  https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/compare
[contributing]: CONTRIBUTING.md
[support]: .github/SUPPORT.md
[cjs-mojito]:
  https://dev.to/jakobjingleheimer/configuring-commonjs-es-modules-for-nodejs-12ed#publish-only-a-cjs-distribution-with-property-exports
[local-pkg]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#type
[exports-module-key]:
  https://webpack.js.org/guides/package-exports/#providing-commonjs-and-esm-version-stateless
[exports-types-key]:
  https://devblogs.microsoft.com/typescript/announcing-typescript-4-5-beta/#packagejson-exports-imports-and-self-referencing
[exports-conditions]:
  https://webpack.js.org/guides/package-exports/#reference-syntax
[side-effects-key]:
  https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free
[dual-package-hazard]: https://nodejs.org/api/packages.html#dual-package-hazard
[tree-shaking]: https://webpack.js.org/guides/tree-shaking
[1]: https://codeberg.org/karl/babel-plugin-transform-rewrite-imports/issues/3
[2]: https://codeberg.org/karl/babel-plugin-transform-rewrite-imports/issues/10
[3]: https://www.npmjs.com/package/babel-plugin-replace-import-extension
[4]: https://www.npmjs.com/package/babel-plugin-transform-rename-import
