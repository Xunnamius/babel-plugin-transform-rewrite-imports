import { oneBackLevel } from '../index.js';
import { oneBackLevelIndex } from '../index.js';
import { twoBackLevel } from '../../index.js';
import { twoBackLevelIndex } from '../../index.js';
import { somethingBack } from '../lib/something.js';
import { somethingBackTest } from '../lib/something.test.js';
import { export1, export2 as alias2 } from './lib/something.js';
import { export1Test, export2 as alias2Test } from './lib/something.test.js';
import { something } from './lib/something.js';
import { somethingTest } from './lib/something.test.js';
import { something as other } from './lib/something.js';
import { something as otherTest } from './lib/something.test.js';
import anotherImport from './lib/something.js';
import anotherImportTest from './lib/something.test.js';
import another, { otherImport } from './lib/something.js';
import anotherTest, { otherImportTest } from './lib/something.test.js';
import * as Something from './lib/something.js';
import * as SomethingTest from './lib/something.test.js';
import { transform } from '@babel/core';
import {
  replacer_export1,
  replacer_export2 as replacer_alias2
} from './lib/something.js';
import {
  replacer_export1Test,
  replacer_export2 as replacer_alias2Test
} from './lib/something.test.js';
import { replacer_something } from './lib/something.js';
import { replacer_somethingTest } from './lib/something.test.js';
import { replacer_something as replacer_other } from './lib/something.js';
import { replacer_something as replacer_otherTest } from './lib/something.test.js';
import replacer_anotherImport from './lib/something.js';
import replacer_anotherImportTest from './lib/something.test.js';
import replacer_another, { replacer_otherImport } from './lib/something.js';
import replacer_anotherTest, { replacer_otherImportTest } from './lib/something.test.js';
import * as replacer_Something from './lib/something.js';
import * as replacer_SomethingTest from './lib/something.test.js';
