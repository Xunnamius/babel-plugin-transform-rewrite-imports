module.exports = {
  /**
   * @type {import('../../../../src/index').Options}
   */
  pluginOptions: {
    replaceExtensions: {
      '.ts': '.xts'
    }
  },
  // TODO: move to shared options.json one level up once bug in bpt is fixed
  babelOptions: {
    filename: '/fake/filepath.ts',
    presets: [
      [
        '@babel/preset-typescript',
        {
          allowDeclareFields: true,
          onlyRemoveTypeImports: true
        }
      ]
    ]
  }
};
