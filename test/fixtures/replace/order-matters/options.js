const { defaultRecognizedExtensions } = require('babel-plugin-transform-rewrite-imports');

module.exports = {
  /**
   * @type {import('../../../..').Options}
   */
  pluginOptions: {
    appendExtension: '.mjs',
    // Add .css to recognizedExtensions so .mjs isn't automatically appended
    recognizedExtensions: [...defaultRecognizedExtensions, '.css'],
    replaceExtensions: {
      '.node.xyz': '.cjs',
      '.xyz': '.mjs',

      // The following key replaces the entire specifier when matched
      '^package$': '/x/y/z/package.json',
      // If .css wasn't in recognizedExtensions, my-utils/src/file.less would
      // become my-utils/src/file.css.mjs instead of my-utils/src/file.css
      '(.+?)\\.less$': '$1.css'
    }
  }
};
