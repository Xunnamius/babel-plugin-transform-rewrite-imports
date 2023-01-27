// * Comment out elements of the below X_UNDER_TEST arrays to limit the tests
// * that get run. Use test titles to determine how to manipulate these knobs.
// *
// * You can also use https://jestjs.io/docs/cli#--testnamepatternregex to match
// * against test titles via the number prefixed to each title. Numeric prefixes
// * are stable with respect to the settings configured below. That is: the
// * numbers will only change when the configuration below changes.

import browserslist from 'browserslist';
import fs from 'node:fs';
import { name as pkgName, version as pkgVersion } from 'package';

import {
  dummyNpmPackageFixture,
  npmCopySelfFixture,
  nodeRunTestFixture,
  dummyFilesFixture,
  type FixtureOptions
} from 'testverse/setup';

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

export const defaultFixtureOptions = {
  performCleanup: true,
  initialFileContents: {
    'package.json': `{"name":"dummy-pkg","dependencies":{"${pkgName}":"${pkgVersion}"}}`,
    'babel.config.js': `
      module.exports = {
        parserOpts: { strictMode: true },
        plugins: [
          '@babel/plugin-proposal-export-default-from',
          '@babel/plugin-syntax-import-assertions',
          [
            '${pkgName}',
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
  },
  use: [
    dummyNpmPackageFixture(),
    npmCopySelfFixture(),
    dummyFilesFixture(),
    nodeRunTestFixture()
  ]
} as Partial<FixtureOptions> & {
  initialFileContents: FixtureOptions['initialFileContents'];
};
