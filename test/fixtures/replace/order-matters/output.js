const _rewrite = (importPath, options) => {
    if (typeof importPath != 'string') {
      throw new TypeError(
        `rewrite error: expected import specifier of type string, not ${typeof importPath}`
      );
    }
    let finalImportPath = importPath;
    let replacementMap;
    replacementMap = undefined;
    if (options.replaceExtensions) {
      Object.entries(options.replaceExtensions).some(([target, replacement]) => {
        if (target.startsWith('^') || target.endsWith('$')) {
          const targetRegExp = new RegExp(target);
          if (targetRegExp.test(finalImportPath)) {
            replacementMap = [targetRegExp, replacement];
            return true;
          }
        } else if (finalImportPath.endsWith(target)) {
          replacementMap = [target, replacement];
          return true;
        }
      });
    }
    if (replacementMap) {
      const [target, replacement] = replacementMap;
      finalImportPath = finalImportPath.replace(target, replacement);
    }
    const isRelative =
      finalImportPath.startsWith('./') ||
      finalImportPath.startsWith('../') ||
      finalImportPath == '.' ||
      finalImportPath == '..';
    if (options.appendExtension && isRelative) {
      const endsWithSlash = finalImportPath.endsWith('/');
      if (/(^\.?\.\/?$)|(\/\.?\.\/?$)/.test(finalImportPath)) {
        finalImportPath += `${endsWithSlash ? '' : '/'}index${options.appendExtension}`;
      } else {
        const hasRecognizedExtension =
          !endsWithSlash &&
          options.recognizedExtensions.some((extension) => {
            return finalImportPath.endsWith(extension);
          });
        if (!hasRecognizedExtension) {
          finalImportPath = endsWithSlash
            ? finalImportPath + `index${options.appendExtension}`
            : finalImportPath + options.appendExtension;
        }
      }
    }
    return finalImportPath;
  },
  _rewrite_options = {
    appendExtension: '.mjs',
    recognizedExtensions: ['.js', '.jsx', '.mjs', '.cjs', '.json', '.css'],
    replaceExtensions: {
      '.node.xyz': '.cjs',
      '.xyz': '.mjs',
      '^package$': '/x/y/z/package.json',
      '(.+?)\\.less$': '$1.css'
    }
  };
import { name as pkgName } from '/x/y/z/package.json';
import fs from 'node:fs';
import { primary } from './index.mjs';
import { secondary } from '../index.mjs';
import { tertiary } from '../../index.mjs';
import dirImport from './some-dir/index.mjs';
import jsConfig from './jsconfig.json';
import projectConfig1 from './project.config.cjs';
import projectConfig2 from './project.config.mjs';
import { add, double } from './src/numbers.mjs';
import { curry } from './src/typed/curry.ts.mjs';
import { curry2 } from './src/typed/curry.mjs';
import styles from './src/less/styles.css';

// Note that, unless otherwise configured, babel deletes type-only imports

export { triple, quadruple } from './lib/num-utils.mjs';

// Note that, unless otherwise configured, babel deletes type-only imports

const thing = await import('./thing.cjs');
const anotherThing = require('./another-thing.mjs');
const thing2 = await import(
  _rewrite(someFn(`./${someVariable}`) + '.json', _rewrite_options)
);
const anotherThing2 = require(_rewrite(someOtherVariable, _rewrite_options));
