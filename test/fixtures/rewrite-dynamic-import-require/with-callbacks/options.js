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
  }
};
