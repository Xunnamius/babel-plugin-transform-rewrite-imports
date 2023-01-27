const { defaultRecognizedExtensions } = require('../../../src/index.ts');

module.exports = {
  /**
   * @type {import('../../..').Options}
   */
  pluginOptions: {
    appendExtension: '.mjs',
    recognizedExtensions: [...defaultRecognizedExtensions, '.css'],
    replaceExtensions: {
      '.ts': '.mjs',
      '^package$': '/absolute/path/to/project/package.json',
      '(.+?)\\.less$': '$1.css'
    }
  }
};
