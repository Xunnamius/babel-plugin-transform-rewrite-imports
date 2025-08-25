// * These tests ensure the exported interfaces under test function as expected.

import { pluginTester } from 'babel-plugin-tester';

import plugin from 'universe';

// eslint-disable-next-line jest/require-hook
pluginTester({
  plugin,
  fixtures: 'fixtures',
  babelOptions: {
    parserOpts: { strictMode: true },
    plugins: ['@babel/plugin-proposal-export-default-from'],
    presets: [
      [
        '@babel/preset-env',
        {
          // ? Leave import syntax alone
          modules: false,
          targets: 'maintained node versions'
        }
      ]
    ]
  }
});
