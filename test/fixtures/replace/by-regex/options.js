module.exports = {
  /**
   * @type {import('../../../../src/index').Options}
   */
  pluginOptions: {
    replaceExtensions: {
      '\\.m?(t|j)s$': '.xxx',
      '^node:(.).+': '@internal/$1'
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
