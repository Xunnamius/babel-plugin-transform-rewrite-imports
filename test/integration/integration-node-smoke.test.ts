/* eslint-disable jest/require-hook */
/* eslint-disable jest/no-conditional-in-test, jest/no-conditional-expect */

// * These are tests that ensure this plugin works (1) with the babel versions
// * we claim it does, (2) with the node versions we claim it does, (3) when
// * generating both ESM and CJS source code.

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { Script, createContext } from 'node:vm';
import debugFactory from 'debug';
import mergeWith from 'lodash.mergewith';

import { name as pkgName, exports as pkgExports } from 'package';
import { run, withMockedFixture } from 'testverse/setup';

import {
  defaultFixtureOptions,
  BABEL_VERSIONS_UNDER_TEST,
  NODE_VERSIONS_UNDER_TEST
} from 'testverse/integration/test-config';

const TEST_IDENTIFIER = 'node-smoke';
const debug = debugFactory(`${pkgName}:${TEST_IDENTIFIER}`);

const pkgMainPath = `${__dirname}/../../${pkgExports['.'].default}`;

debug('NODE_VERSIONS_UNDER_TEST: %O', NODE_VERSIONS_UNDER_TEST);
debug('BABEL_VERSIONS_UNDER_TEST: %O', BABEL_VERSIONS_UNDER_TEST);

beforeAll(async () => {
  if (!existsSync(pkgMainPath)) {
    debug(`unable to find main export: ${pkgMainPath}`);
    throw new Error('must build distributables first (try `npm run build-dist`)');
  }
});

let counter = 1;

for (const nodeVersion of NODE_VERSIONS_UNDER_TEST) {
  for (const pkgs of BABEL_VERSIONS_UNDER_TEST) {
    const pkgsString = pkgs.join(', ');

    const count = counter++;
    const title = `${count}. works with ${pkgsString[0]} using ${nodeVersion}`;

    debug(`registered test: ${title}`);

    // eslint-disable-next-line jest/valid-title
    (process.env.NO_CONCURRENT ? it : it.concurrent)(title, async () => {
      // eslint-disable-next-line jest/no-standalone-expect
      expect.hasAssertions();

      debug(`started running test: ${title}`);

      const fixtureOptions = mergeWith({}, defaultFixtureOptions, {
        npmInstall: pkgs.filter((p) => !p.startsWith('node:')),
        runWith: {
          binary: 'npx',
          args: [
            'node',
            path.join('node_modules', '@babel', 'cli', 'bin', 'babel.js'),
            'code-1.ts',
            'code-2.cjs',
            'code-3.ts',
            '--extensions',
            '.ts,.cjs',
            '--out-dir',
            '.'
          ]
        }
      });

      await withMockedFixture({
        testIdentifier: TEST_IDENTIFIER,
        options: fixtureOptions,
        fn: async (context) => {
          if (!context.testResult) {
            throw new Error('must use node-run-test fixture');
          }

          expect.hasAssertions();

          const codePath1 = `${context.root}/code-1.js`;
          const codePath2 = `${context.root}/code-2.js`;
          const codePath3 = `${context.root}/code-3.js`;

          expect(readFileSync(codePath1, 'utf8')).toBe(
            readFileSync(`${__dirname}/assets/output-1.js`, 'utf8')
          );

          new Script(readFileSync(codePath2, 'utf8'), {
            filename: codePath2
          }).runInContext(
            createContext({
              expect,
              require,
              __dirname: path.dirname(codePath2),
              __filename: codePath2
            }),
            {
              displayErrors: true,
              breakOnSigint: true,
              microtaskMode: 'afterEvaluate'
            }
          );

          const result = await run(
            'npx',
            ['node', '--input-type=module', '-e', readFileSync(codePath3, 'utf8')],
            { cwd: context.root }
          );

          expect(result.stderr).toBeEmpty();
          expect(result.stdout).toBeEmpty();
          expect(result.exitCode).toBe(0);
        }
      });
    });
  }
}

debug('finished registering tests');
debug(`registered a total of ${counter} tests!`);
