/* eslint-disable jest/require-hook */

// * These are tests that ensure this plugin works (1) with the babel versions
// * we claim it does, (2) with the node versions we claim it does, (3) when
// * generating both ESM and CJS source code.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createContext, Script } from 'node:vm';

import { toAbsolutePath, toDirname } from '@-xun/fs';
import { run } from '@-xun/run';
import { createDebugLogger } from 'rejoinder';

import { exports as packageExports, name as packageName } from 'rootverse:package.json';

import {
  ensurePackageHasBeenBuilt,
  reconfigureJestGlobalsToSkipTestsInThisFileIfRequested
} from 'testverse:util.ts';

import {
  BABEL_VERSIONS_UNDER_TEST,
  NODE_VERSIONS_UNDER_TEST,
  withMockedFixtures
} from 'testverse:integration/.config.ts';

const TEST_IDENTIFIER = `${packageName.split('/').at(-1)!}-smoke`;

const debug = createDebugLogger({
  namespace: 'babel-plugin-transform-rewrite-imports'
}).extend(TEST_IDENTIFIER);

const nodeVersion = process.env.XPIPE_MATRIX_NODE_VERSION || process.version;

debug('nodeVersion: %O (process.version=%O)', nodeVersion, process.version);

debug('NODE_VERSIONS_UNDER_TEST: %O', NODE_VERSIONS_UNDER_TEST);
debug('BABEL_VERSIONS_UNDER_TEST: %O', BABEL_VERSIONS_UNDER_TEST);

reconfigureJestGlobalsToSkipTestsInThisFileIfRequested({ it: true, test: true });

beforeAll(async () => {
  await ensurePackageHasBeenBuilt(
    toDirname(toAbsolutePath(require.resolve('rootverse:package.json'))),
    packageName,
    packageExports
  );
});

let counter = 1;

for (const nodeVersion of NODE_VERSIONS_UNDER_TEST) {
  for (const pkgs of BABEL_VERSIONS_UNDER_TEST) {
    const pkgsString = pkgs.join(', ');

    const count = counter++;
    const title = `${count}. works with ${pkgs[0]!} using ${nodeVersion}`;

    debug(`registered test: ${title}`);
    debug(`packages under test: ${pkgsString}`);

    // eslint-disable-next-line jest/valid-title
    it(title, async () => {
      expect.hasAssertions();

      debug(`started running test: ${title}`);

      await withMockedFixtures(
        async (context) => {
          const codePath1 = `${context.root}/code-1.js`;
          const codePath2 = `${context.root}/code-2.js`;
          const codePath3 = `${context.root}/code-3.js`;

          function read(path: string) {
            return readFileSync(path, 'utf8').replaceAll(
              '/fake/filepath.ts',
              `${context.root}/code-1.ts`
            );
          }

          expect(read(codePath1)).toBe(read(`${__dirname}/assets/output-1.js`).trim());

          new Script(read(codePath2), {
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
              // @ts-expect-error: need to investigate if this is still needed
              microtaskMode: 'afterEvaluate'
            }
          );

          const result = await run(
            'npx',
            ['node', '--input-type=module', '-e', read(codePath3)],
            { cwd: context.root }
          );

          expect(result.stderr).toBeEmpty();
          expect(result.stdout).toBeEmpty();
          expect(result.exitCode).toBe(0);
        },
        {
          additionalPackagesToInstall: pkgs.filter((p) => !p.startsWith('node:')),
          identifier: TEST_IDENTIFIER
        }
      );
    });
  }
}

debug('finished registering tests');
debug(`registered a total of ${counter} tests!`);
