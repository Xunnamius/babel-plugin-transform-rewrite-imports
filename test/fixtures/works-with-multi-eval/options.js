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
    comments: false,
    presets: [
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
