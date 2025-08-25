module.exports = {
  /**
   * @type {import('../../../src/index').Options}
   */
  pluginOptions: {
    appendExtension: '.mts',
    recognizedExtensions: ['.less']
  },
  babelOptions: {
    filename: '/fake/filepath.ts',
    presets: [
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
};
