import pluginTester from 'babel-plugin-tester';
import plugin from 'universe/index';

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
  }
});
