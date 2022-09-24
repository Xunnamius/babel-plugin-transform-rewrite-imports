import { existsSync, lstatSync } from 'node:fs';
import { resolve, extname, dirname } from 'node:path';
import * as util from '@babel/types';

import type { PluginObj, PluginPass } from '@babel/core';

export type Options = {
  opts: {
    test?: (string | RegExp)[];
    include?: (string | RegExp)[];
    exclude?: (string | RegExp)[];
    transformBuiltins?: boolean;
    silent?: boolean;
    verbose?: boolean;
    monorepo?: boolean | string;
  };
};

type State = PluginPass & Options;

const _metadata: {
  [path: string]: {
    total: number;
    transformed: string[];
    iTests: RegExp[];
    eTests: RegExp[];
  };
} = {};

// const getMetadata = (state: State) => {
//   const key = state.filename || '<no path>';

//   return (_metadata[key] = _metadata[key] || {
//     total: 0,
//     transformed: [],
//     iTests: [
//       ...(state.opts.transformBuiltins !== false ? getBuiltinInclusionTests() : []),
//       ...(state.opts.test?.map(strToRegex) ||
//         getDefaultInclusionTests(state.opts.monorepo ?? false)),
//       ...(state.opts.include?.map(strToRegex) || [])
//     ],
//     eTests: state.opts.exclude?.map(strToRegex) || []
//   });
// };

// const isActiveExtension = (module, observedScriptExtensions) =>
//   observedScriptExtensions.indexOf(extname(module).replace(/[^a-z]/, '')) > -1;

// const isNodeModule = (module) => {
//   if (module.startsWith('.') || module.startsWith('/')) {
//     return false;
//   }

//   try {
//     require.resolve(module);
//     return true;
//   } catch (e) {
//     if (e.code === 'MODULE_NOT_FOUND') {
//       return false;
//     }
//     console.error(e);
//   }
// };

// const skipModule = (module, { replace, extension, observedScriptExtensions }) =>
//   !module.startsWith('.') ||
//   isNodeModule(module) ||
//   (replace &&
//   (isActiveExtension(module, observedScriptExtensions) ||
//     extname(module) === `.${extension}`)
//     ? extname(module) === `.${extension}`
//     : extname(module).length &&
//       (isActiveExtension(module, observedScriptExtensions) ||
//         extname(module) === `.${extension}`) &&
//       extname(module) === `.${extension}`);

// const makeDeclaration =
//   ({
//     declaration,
//     args,
//     replace = false,
//     extension = 'js',
//     observedScriptExtensions = ['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs']
//   }) =>
//   (
//     path,
//     {
//       file: {
//         opts: { filename }
//       }
//     }
//   ) => {
//     const { node } = path;
//     const { source, exportKind, importKind } = node;

//     const isTypeOnly = exportKind === 'type' || importKind === 'type';

//     if (!source || isTypeOnly) {
//       return;
//     }

//     const module = source && source.value;

//     if (skipModule(module, { replace, extension, observedScriptExtensions })) {
//       return;
//     }

//     const dirPath = resolve(dirname(filename), module);

//     const hasModuleExt =
//       extname(module).length && isActiveExtension(module, observedScriptExtensions);
//     const newModuleName = hasModuleExt
//       ? module.slice(0, -extname(module).length)
//       : module;

//     const pathLiteral = () => {
//       if (existsSync(dirPath) && lstatSync(dirPath).isDirectory()) {
//         return `${module}${newModuleName.endsWith('/') ? '' : '/'}index.${extension}`;
//       }

//       return `${newModuleName}.${extension}`;
//     };

//     path.replaceWith(declaration(...args(path), stringLiteral(pathLiteral())));
//   };

export default function (): PluginObj<State> {
  return {
    name: 'transform-rewrite-imports',
    visitor: {
      // Program: {
      //   enter(_, state) {
      //     // ? Create it if it doesn't exist already, or do it later
      //     getMetadata(state);
      //   },
      //   exit(_, state) {
      //     if (state.opts.silent === false) {
      //       const { total, transformed } = getMetadata(state);
      //       const details =
      //         `${transformed.length}/${total}` +
      //         (state.opts.verbose && transformed.length
      //           ? ` [${transformed.join(', ')}]`
      //           : '');
      //       if (state.opts.verbose || transformed.length)
      //         // eslint-disable-next-line no-console
      //         console.log(
      //           `target: ${state.filename}\nimports transformed: ${details}\n---`
      //         );
      //     }
      //   }
      // },
      // ImportDeclaration: makeDeclaration({
      //   ...options,
      //   declaration: importDeclaration,
      //   args: ({ node: { specifiers } }) => [specifiers]
      // }),
      // ExportNamedDeclaration: makeDeclaration({
      //   ...options,
      //   declaration: exportNamedDeclaration,
      //   args: ({ node: { declaration, specifiers } }) => [declaration, specifiers]
      // }),
      // ExportAllDeclaration: makeDeclaration({
      //   ...options,
      //   declaration: exportAllDeclaration,
      //   args: () => []
      // })
    }
  };
}
