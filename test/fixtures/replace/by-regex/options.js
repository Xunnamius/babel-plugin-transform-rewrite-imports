module.exports = {
  /**
   * @type {import('../../../..').Options}
   */
  pluginOptions: {
    replaceExtensions: {
      '\\.m?(t|j)s$': '.xxx',
      '^node:(.).+': '@internal/$1'
    }
  }
};
