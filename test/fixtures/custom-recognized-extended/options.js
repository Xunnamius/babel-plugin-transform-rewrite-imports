const { defaultRecognizedExtensions } = require('../../../src/index.ts');

module.exports = {
  /**
   * @type {import('../../../src/index').Options}
   */
  pluginOptions: {
    appendExtension: '.mts',
    recognizedExtensions: [...defaultRecognizedExtensions, '.ts', '.less'],
  }
};
