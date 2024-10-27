module.exports = {
  title: 'facilitates context-sensitive rewrites of specifiers',
  "fixtureOutputExt": ".d.ts",
  /**
   * @type {import('../../../src/index').Options}
   */
  pluginOptions: {
    appendExtension: ({ filepath }) => {
      return filepath === '/fake/expected/filepath.ts' ? '.good' : '.bad';
    },
    replaceExtensions: {
      '^# (.+)$': ({ filepath, capturingGroups }) =>
        (filepath === '/fake/expected/filepath.ts'
          ? 'rewritten-for-good'
          : 'rewritten-for-BAD') +
        ':' +
        capturingGroups[1]
    }
  },
  babelOptions: {
    filename: '/fake/expected/filepath.ts',
    plugins: [['@babel/plugin-syntax-typescript', { dts: true }]]
  }
};
