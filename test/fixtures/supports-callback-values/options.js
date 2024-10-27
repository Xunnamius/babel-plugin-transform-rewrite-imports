module.exports = {
  /**
   * @type {import('../../../src/index').Options}
   */
  pluginOptions: {
    // If the specifier ends with "/no-ext", do not append any extension
    appendExtension: ({ specifier }) => {
      return specifier.endsWith('/no-ext') ||
        specifier.endsWith('..') ||
        specifier === './another-thing'
        ? undefined
        : '.mjs';
    },
    replaceExtensions: {
      // Rewrite imports of packages in a monorepo to use their actual names
      //         v capturing group #1: capturingGroups[1]
      '^packages/([^/]+)(/.+)?': ({ specifier, capturingGroups }) => {
        //              ^ capturing group #2: capturingGroups[2]
        if (specifier === 'packages/root' || specifier.startsWith('packages/root/')) {
          return `./monorepo-js${capturingGroups[2] ?? '/'}`;
        } else if (!capturingGroups[2] || capturingGroups[2].startsWith('/src/index')) {
          return `@monorepo/$1`;
        } else if (capturingGroups[2].startsWith('/package.json')) {
          return `@monorepo/$1$2`;
        } else {
          return `@monorepo/$1/dist$2`;
        }
      }
    }
  }
};
