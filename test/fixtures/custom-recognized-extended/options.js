const { defaultRecognizedExtensions } = require('../../../src/index.ts');

module.exports = {
  /**
   * @type {import('../../..').Options}
   */
  pluginOptions: {
    appendExtension: '.mts',
    recognizedExtensions: [...defaultRecognizedExtensions, '.ts', '.less'],
  }
};
