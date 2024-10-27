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
    appendExtension: '.mjs',
    recognizedExtensions: ['.js', '.jsx', '.mjs', '.cjs', '.json']
  };
import fs from 'node:fs';
import { name as pkgName } from 'package';
import { tertiary } from '../../index.mjs';
import { secondary } from '../index.mjs';
import { primary } from './index.mjs';
import jsConfig from './jsconfig.json';
import projectConfig from './project.config.cjs';
import projectConfig2 from './project.config.mjs';
import styles from './src/less/styles.less.mjs';
import { add, double } from './src/numbers.mjs';
import { curry } from './src/typed/curry.ts.mjs';
import dirImport from '/some-dir/index';

// Note that, unless otherwise configured, babel deletes type-only imports

export { quadruple, triple } from './lib/num-utils.mjs';

// Note that, unless otherwise configured, babel deletes type-only imports

const thing = await import('./thing.mjs');
const anotherThing = require('./another-thing.mjs');
const thing2 = await import(
  _rewrite(someFn(`./${someVariable}`) + '.json', _rewrite_options)
);
const anotherThing2 = require(_rewrite(someOtherVariable, _rewrite_options));
