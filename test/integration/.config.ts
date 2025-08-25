// * Comment out elements of the below X_UNDER_TEST arrays to limit the tests
// * that get run. Use test titles to determine how to manipulate these knobs.
// *
// * You can also use https://jestjs.io/docs/cli#--testnamepatternregex to match
// * against test titles via the number prefixed to each title. Numeric prefixes
// * are stable with respect to the settings configured below. That is: the
// * numbers will only change when the configuration below changes.

import fs from 'node:fs';

import { toAbsolutePath, toPath } from '@-xun/fs';
import browserslist from 'browserslist';

import { name as packageName } from 'rootverse:package.json';

import {
  dummyFilesFixture,
  dummyNpmPackageFixture,
  mockFixturesFactory,
  npmCopyPackageFixture,
  runTestFixture
} from 'testverse:util.ts';

const otherPackages = [
  '@babel/plugin-proposal-export-default-from',
  '@babel/plugin-syntax-import-assertions',
  '@babel/preset-env',
  '@babel/preset-typescript'
];

export const BABEL_VERSIONS_UNDER_TEST = [
  // * [babel@version, ...otherPackages]
  // ? Current minimum version
  ['@babel/cli@7.11.6', ...otherPackages],
  // ? Latest version
  ['@babel/cli@latest', ...otherPackages]
];

// * [node@version, ...]
export const NODE_VERSIONS_UNDER_TEST = browserslist('maintained node versions').map(
  (v) => v.split(' ').join('@')
);

export const withMockedFixtures = mockFixturesFactory(
  [dummyNpmPackageFixture, npmCopyPackageFixture, dummyFilesFixture, runTestFixture],
  {
    performCleanup: true,
    packageUnderTest: {
      attributes: { polyrepo: true, cjs: true },
      json: { name: 'dummy-package' },
      root: toAbsolutePath('/does/not/exist')
    },
    runWith: {
      binary: 'npx',
      args: [
        'node',
        toPath('node_modules', '@babel', 'cli', 'bin', 'babel.js'),
        'code-1.ts',
        'code-2.cjs',
        'code-3.ts',
        '--extensions',
        '.ts,.cjs',
        '--out-dir',
        '.'
      ]
    },
    initialVirtualFiles: {
      'package.json': {
        name: 'dummy-pkg',
        dependencies: { '${packageName}': '${packageVersion}' }
      },
      'babel.config.js': `
      module.exports = {
        parserOpts: { strictMode: true },
        plugins: [
          '@babel/plugin-proposal-export-default-from',
          '@babel/plugin-syntax-import-assertions',
          [
            '${packageName}',
            { appendExtension: '.js' }
          ]
        ],
        presets: [
          [
            '@babel/preset-env',
            {
              // ? Leave import syntax alone
              modules: false,
              targets: 'maintained node versions'
            }
          ],
          [
            '@babel/preset-typescript',
            {
              allowDeclareFields: true,
              // ? This needs to be here or unused imports are elided
              onlyRemoveTypeImports: true
            }
          ]
        ]
      };
    `,
      'code-1.ts': fs.readFileSync(`${__dirname}/assets/code-1.ts`, 'utf8'),
      'code-2.cjs': fs.readFileSync(`${__dirname}/assets/code-2.cjs`, 'utf8'),
      'code-3.ts': fs.readFileSync(`${__dirname}/assets/code-3.ts`, 'utf8'),
      'import-1.js': fs.readFileSync(`${__dirname}/assets/import-1.js`, 'utf8'),
      'import-2.json': fs.readFileSync(`${__dirname}/assets/import-2.json`, 'utf8'),
      'import-3.js': fs.readFileSync(`${__dirname}/assets/import-3.js`, 'utf8')
    }
  }
);
