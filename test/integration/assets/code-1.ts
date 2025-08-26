import fs from 'node:fs';

import { name as pkgName } from 'package';

import { primary } from '.';
import { secondary } from '..';
import { tertiary } from '../..';
import jsConfig from './jsconfig.json';
import projectConfig from './project.config.cjs';
import projectConfig2 from './project.config.mjs';
import styles from './src/less/styles.less';
import { add, double } from './src/numbers';
import { curry } from './src/typed/curry.ts';
import dirImport from '../../../../../some-dir/index';

// Note that, unless otherwise configured, babel deletes type-only imports
import type * as AllTypes from './lib/something.mjs';

export { quadruple, triple } from './lib/num-utils';

// Note that, unless otherwise configured, babel deletes type-only imports
export type { NamedType } from './lib/something';

const thing = await import('./thing');
const anotherThing = require('./another-thing');

const thing2 = await import(someFn(`./${someVariable}`) + '.json');
const anotherThing2 = require(someOtherVariable);
