module.exports = {
  /**
   * @type {import('../../../../src/index').Options}
   */
  pluginOptions: {
    replaceExtensions: {
      '\\.m?(t|j)s$': '.xxx',
      '^node:(.).+': '@internal/$1'
    }
  }
};
