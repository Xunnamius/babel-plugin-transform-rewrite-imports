import { name as pkgName } from 'package';
import fs from 'node:fs';
import { primary } from './index.mjs';
import { secondary } from '../index.mjs';
import { tertiary } from '../../index.mjs';
import dirImport from '/some-dir/index';
import jsConfig from './jsconfig.json';
import projectConfig from './project.config.cjs';
import projectConfig2 from './project.config.mjs';
import { add, double } from './src/numbers.mjs';
import { curry } from './src/typed/curry.ts.mjs';
import styles from './src/less/styles.less.mjs';

// Note that, by default, babel-preset-typescript deletes type-only imports

export { triple, quadruple } from './lib/num-utils.mjs';

// Note that, by default, babel-preset-typescript deletes type-only imports

const thing = await import('./thing.mjs');
const anotherThing = require('./another-thing.mjs');
const thing2 = await import(someFn(`./${someVariable}`) + '.json');
const anotherThing2 = require(someOtherVariable);
