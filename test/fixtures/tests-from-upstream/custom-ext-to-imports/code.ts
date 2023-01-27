import { oneBackLevel } from '..';
import { oneBackLevelIndex } from '../';
import { twoBackLevel } from '../..';
import { twoBackLevelIndex } from '../../';
import { somethingBack } from '../lib/something';
import { somethingBackTest } from '../lib/something.test';
import { export1, export2 as alias2 } from './lib/something';
import { export1Test, export2 as alias2Test } from './lib/something.test';
import { something } from './lib/something';
import { somethingTest } from './lib/something.test';
import { something as other } from './lib/something';
import { something as otherTest } from './lib/something.test';
import anotherImport from './lib/something';
import anotherImportTest from './lib/something.test';
import another, { otherImport } from './lib/something';
import anotherTest, { otherImportTest } from './lib/something.test';
import * as Something from './lib/something';
import * as SomethingTest from './lib/something.test';
import { transform } from '@babel/core';
import {
  replacer_export1,
  replacer_export2 as replacer_alias2
} from './lib/something.ts';
import {
  replacer_export1Test,
  replacer_export2 as replacer_alias2Test
} from './lib/something.test.ts';
import { replacer_something } from './lib/something.ts';
import { replacer_somethingTest } from './lib/something.test.ts';
import { replacer_something as replacer_other } from './lib/something.ts';
import { replacer_something as replacer_otherTest } from './lib/something.test.ts';
import replacer_anotherImport from './lib/something.ts';
import replacer_anotherImportTest from './lib/something.test.ts';
import replacer_another, { replacer_otherImport } from './lib/something.ts';
import replacer_anotherTest, { replacer_otherImportTest } from './lib/something.test.ts';
import * as replacer_Something from './lib/something.ts';
import * as replacer_SomethingTest from './lib/something.test.ts';
