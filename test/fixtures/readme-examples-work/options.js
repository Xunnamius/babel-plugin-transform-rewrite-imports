const { defaultRecognizedExtensions } = require('../../../src/index.ts');

module.exports = {
  /**
   * @type {import('../../../src/index').Options}
   */
  pluginOptions: {
    appendExtension: '.mjs',
    recognizedExtensions: [...defaultRecognizedExtensions, '.css'],
    replaceExtensions: {
      '.ts': '.mjs',
      '^package$': '/absolute/path/to/project/package.json',
      '(.+?)\\.less$': '$1.css'
    }
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
