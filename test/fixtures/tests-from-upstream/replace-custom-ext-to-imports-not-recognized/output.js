import { oneBackLevel } from '../index.jsx';
import { oneBackLevelIndex } from '../index.jsx';
import { twoBackLevel } from '../../index.jsx';
import { twoBackLevelIndex } from '../../index.jsx';
import { somethingBack } from '../lib/something.jsx';
import { somethingBackTest } from '../lib/something.test.jsx';
import { export1, export2 as alias2 } from './lib/something.jsx';
import { export1Test, export2 as alias2Test } from './lib/something.test.jsx';
import { something } from './lib/something.jsx';
import { somethingTest } from './lib/something.test.jsx';
import { something as other } from './lib/something.jsx';
import { something as otherTest } from './lib/something.test.jsx';
import anotherImport from './lib/something.jsx';
import anotherImportTest from './lib/something.test.jsx';
import another, { otherImport } from './lib/something.jsx';
import anotherTest, { otherImportTest } from './lib/something.test.jsx';
import * as Something from './lib/something.jsx';
import * as SomethingTest from './lib/something.test.jsx';
import { transform } from '@babel/core';
import {
  replacer_export1,
  replacer_export2 as replacer_alias2
} from './lib/something.jsx';
import {
  replacer_export1Test,
  replacer_export2 as replacer_alias2Test
} from './lib/something.test.jsx';
import { replacer_something } from './lib/something.jsx';
import { replacer_somethingTest } from './lib/something.test.jsx';
import { replacer_something as replacer_other } from './lib/something.jsx';
import { replacer_something as replacer_otherTest } from './lib/something.test.jsx';
import replacer_anotherImport from './lib/something.jsx';
import replacer_anotherImportTest from './lib/something.test.jsx';
import replacer_another, { replacer_otherImport } from './lib/something.jsx';
import replacer_anotherTest, { replacer_otherImportTest } from './lib/something.test.jsx';
import * as replacer_Something from './lib/something.jsx';
import * as replacer_SomethingTest from './lib/something.test.jsx';
