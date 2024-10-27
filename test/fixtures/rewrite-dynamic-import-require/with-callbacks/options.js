module.exports = {
  /**
   * @type {import('../../../../src/index').Options}
   */
  pluginOptions: {
    appendExtension: ({ specifier }) =>
      specifier.endsWith('import-1') ? '.json' : '.js',
    replaceExtensions: {
      'xxx-(is-[^-]+)(-\\d)(\.[^.]+)?$': ({ capturingGroups }) => {
        if (capturingGroups[1] !== 'is-json') {
          throw new Error('test failed: cannot find "is-json" in string');
        }
        return 'import$2';
      }
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
