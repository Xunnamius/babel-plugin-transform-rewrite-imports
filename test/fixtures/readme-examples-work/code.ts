import { name as pkgName } from 'package';
import fs from 'node:fs';
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