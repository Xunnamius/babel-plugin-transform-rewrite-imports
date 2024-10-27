/**
 * @type {import('babel-plugin-tester').PluginTesterOptions}
 */
module.exports = {
  /**
   * @type {import('../../../src/index').Options}
   */
  pluginOptions: {
    replaceExtensions: {
      '^../package.json$': '../../package.json'
    }
  },
  babelOptions: {
    filename: '/fake/filepath.ts',
    comments: false,
    presets: [
      [
        '@babel/preset-typescript',
        {
          allowDeclareFields: true,
          // ? This needs to be here or unused imports are elided
          onlyRemoveTypeImports: true
        }
      ],
      [
        '@babel/preset-env',
        {
          modules: 'cjs',
          targets: 'maintained node versions',
          useBuiltIns: 'usage',
          corejs: '3.27',
          shippedProposals: true
        },
        'preset-env-second-instance'
      ]
    ]
  }
};
