const _rewrite = (specifier, options) => {
    if (typeof specifier !== 'string') {
      throw new TypeError(
        `rewrite error: expected specifier of type string, not ${typeof specifier}`
      );
    }
    let replacementMap;
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
              capturingGroups,
              filepath: '/fake/filepath.ts'
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
              capturingGroups: [],
              filepath: '/fake/filepath.ts'
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
    appendExtension: '.mjs',
    recognizedExtensions: ['.ts', 'numbers', 'thing']
  };
import { name as pkgName } from 'package';
import fs from 'node:fs';
import { primary } from './index.mjs';
import { secondary } from '../index.mjs';
import { tertiary } from '../../index.mjs';
import dirImport from '/some-dir/index';
import jsConfig from './jsconfig.json.mjs';
import projectConfig from './project.config.cjs.mjs';
import projectConfig2 from './project.config.mjs.mjs';
import { add, double } from './src/numbers';
import { curry } from './src/typed/curry.ts';
import styles from './src/less/styles.less.mjs';

// Note that, by default, babel-preset-typescript deletes type-only imports

export { triple, quadruple } from './lib/num-utils.mjs';

// Note that, by default, babel-preset-typescript deletes type-only imports

const thing = await import('./thing');
const anotherThing = require('./another-thing');
const thing2 = await import(
  _rewrite(someFn(`./${someVariable}`) + '.mjs', _rewrite_options)
);
const anotherThing2 = require(_rewrite(someOtherVariable, _rewrite_options));
