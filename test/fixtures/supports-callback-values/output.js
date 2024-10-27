const _rewrite = (specifier, options) => {
    if (typeof specifier != 'string') {
      throw new TypeError(
        `rewrite error: expected specifier of type string, not ${typeof specifier}`
      );
    }
    let replacementMap;
    replacementMap = undefined;
    if (options.replaceExtensions) {
      Object.entries(options.replaceExtensions).some(([target, replacement]) => {
        if (target.startsWith('^') || target.endsWith('$')) {
          const targetRegExp = new RegExp(target);
          const capturingGroups = Array.from(specifier.match(targetRegExp) || []);
          if (capturingGroups.length) {
            replacementMap = [targetRegExp, replacement, capturingGroups];
            return true;
          }
        } else if (specifier.endsWith(target)) {
          replacementMap = [target, replacement, []];
          return true;
        }
      });
    }
    let finalImportPath = specifier;
    if (replacementMap) {
      const [target, replacement, capturingGroups] = replacementMap;
      finalImportPath = finalImportPath.replace(
        target,
        typeof replacement === 'string'
          ? replacement
          : replacement({
              specifier,
              capturingGroups
            })
      );
    }
    const isRelative =
      finalImportPath.startsWith('./') ||
      finalImportPath.startsWith('.\\') ||
      finalImportPath.startsWith('../') ||
      finalImportPath.startsWith('..\\') ||
      finalImportPath === '.' ||
      finalImportPath === '..';
    if (options.appendExtension && isRelative) {
      const endsWithSlash = /(\/|\\)$/.test(finalImportPath);
      const basenameIsDots = /(^\.?\.(\/|\\)?$)|((\/|\\)\.?\.(\/|\\)?$)/.test(
        finalImportPath
      );
      const extensionToAppend =
        typeof options.appendExtension === 'string'
          ? options.appendExtension
          : options.appendExtension({
              specifier,
              capturingGroups: []
            });
      if (extensionToAppend !== undefined) {
        if (basenameIsDots) {
          finalImportPath += `${endsWithSlash ? '' : '/'}index${extensionToAppend}`;
        } else {
          const hasRecognizedExtension =
            !endsWithSlash &&
            options.recognizedExtensions.some((extension) => {
              return finalImportPath.endsWith(extension);
            });
          if (!hasRecognizedExtension) {
            finalImportPath = endsWithSlash
              ? finalImportPath + `index${extensionToAppend}`
              : finalImportPath + extensionToAppend;
          }
        }
      }
    }
    return finalImportPath;
  },
  _rewrite_options = {
    appendExtension: ({ specifier }) => {
      return specifier.endsWith('/no-ext') ||
        specifier.endsWith('..') ||
        specifier === './another-thing'
        ? undefined
        : '.mjs';
    },
    recognizedExtensions: ['.js', '.jsx', '.mjs', '.cjs', '.json'],
    replaceExtensions: {
      '^packages/([^/]+)(/.+)?': ({ specifier, capturingGroups }) => {
        if (specifier === 'packages/root' || specifier.startsWith('packages/root/')) {
          return `./monorepo-js${capturingGroups[2] ?? '/'}`;
        } else if (!capturingGroups[2] || capturingGroups[2].startsWith('/src/index')) {
          return `@monorepo/$1`;
        } else if (capturingGroups[2].startsWith('/package.json')) {
          return `@monorepo/$1$2`;
        } else {
          return `@monorepo/$1/dist$2`;
        }
      }
    }
  };
import { default as advanced2, default as advanced4 } from '@monorepo/pkg-name';
import advanced7 from '@monorepo/pkg-name/dist/lib/sub-pkg/file-name.js';
import advanced5 from '@monorepo/pkg-name/dist/src/file-name';
import advanced6 from '@monorepo/pkg-name/dist/src/no-ext';
import advanced3 from '@monorepo/pkg-name/package.json';
import fs from 'node:fs';
import { name as pkgName } from 'package';
import advanced1 from 'package/do/not/replace';
import { secondary } from '..';
import { tertiary } from '../..';
import { primary } from './index.mjs';
import jsConfig from './jsconfig.json';
import advanced8 from './monorepo-js/index.mjs';
import advanced13 from './monorepo-js/lib/sub-pkg/file-name.js';
import advanced9 from './monorepo-js/package.json';
import advanced11 from './monorepo-js/src/file-name.mjs';
import advanced10 from './monorepo-js/src/index.mjs';
import advanced12 from './monorepo-js/src/no-ext';
import projectConfig from './project.config.mjs';
import dirImport from './some-dir/index.mjs';
import styles from './src/less/styles.less.mjs';
import { add, double } from './src/numbers.mjs';
import { curry } from './src/typed/curry.ts.mjs';
import dirImport2 from '/some-dir';

// Note that, unless otherwise configured, babel deletes type-only imports

export { quadruple, triple } from './lib/num-utils.mjs';

// Note that, unless otherwise configured, babel deletes type-only imports

const thing = await import('./thing.mjs');
const anotherThing = require('./another-thing');
const thing2 = await import(
  _rewrite(someFn(`./${someVariable}`) + '.json', _rewrite_options)
);
const anotherThing2 = require(_rewrite(someOtherVariable, _rewrite_options));
