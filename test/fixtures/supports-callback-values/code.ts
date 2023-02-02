import { name as pkgName } from 'package';
import fs from 'node:fs';
import { primary } from '.';
import { secondary } from '..';
import { tertiary } from '../..';
import dirImport from './some-dir/';
import dirImport2 from '/some-dir';
import jsConfig from './jsconfig.json';
import projectConfig from './project.config.mjs';
import { add, double } from './src/numbers';
import { curry } from './src/typed/curry.ts';
import styles from './src/less/styles.less';

import advanced1  from 'package/do/not/replace';
import advanced2  from 'packages/pkg-name';
import advanced3  from 'packages/pkg-name/package.json';
import advanced4  from 'packages/pkg-name/src/index';
import advanced5  from 'packages/pkg-name/src/file-name';
import advanced6  from 'packages/pkg-name/src/no-ext';
import advanced7  from 'packages/pkg-name/lib/sub-pkg/file-name.js';
import advanced8  from 'packages/root';
import advanced9  from 'packages/root/package.json';
import advanced10 from 'packages/root/src/index';
import advanced11 from 'packages/root/src/file-name';
import advanced12 from 'packages/root/src/no-ext';
import advanced13 from 'packages/root/lib/sub-pkg/file-name.js';

// Note that, unless otherwise configured, babel deletes type-only imports
import type * as AllTypes from './lib/something.mjs';

export { triple, quadruple } from './lib/num-utils';

// Note that, unless otherwise configured, babel deletes type-only imports
export type { NamedType } from './lib/something';

const thing = await import('./thing');
const anotherThing = require('./another-thing');
const thing2 = await import(someFn(`./${someVariable}`) + '.json');
const anotherThing2 = require(someOtherVariable);
