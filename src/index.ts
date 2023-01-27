import { name as pkgName } from '../package.json';
import debugFactory from 'debug';
import template from '@babel/template';
import * as util from '@babel/types';

import type { NodePath, PluginObj, PluginPass } from '@babel/core';

const debugNamespace = `${pkgName}:index`;

export type Options = {
  appendExtension?: string;
  recognizedExtensions?: string[];
  replaceExtensions?: Record<string, string>;
  silent?: boolean;
  verbose?: boolean;
};

type State = PluginPass & { opts: Options };

const log = debugFactory(debugNamespace);
const debug = debugFactory(`${debugNamespace}:debug`);

// eslint-disable-next-line no-console
log.log = console.info.bind(console);

if (!process.env.DEBUG && process.env.NODE_ENV != 'test') {
  debugFactory.enable(`${debugNamespace},${debugNamespace}:*,-${debugNamespace}:debug`);
}

const globalMetadata: {
  [path: string]: {
    totalImports: number;
    transformedImports: string[];
  };
} = {};

export const defaultRecognizedExtensions = [
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json'
] as const;

let reporterTimeout: NodeJS.Timeout | undefined;

export default function transformRewriteImports(): PluginObj<State> {
  let rewriteOptionsObjIdentifier: util.Identifier | undefined = undefined;
  let rewriteFnIdentifier: util.Identifier | undefined = undefined;

  return {
    name: 'transform-rewrite-imports',
    visitor: {
      Program: {
        enter() {
          rewriteOptionsObjIdentifier = undefined;
          rewriteFnIdentifier = undefined;

          clearTimeout(reporterTimeout);
        },
        exit(_, state) {
          reporterTimeout = setTimeout(() => {
            if (!state.opts.silent || debug.enabled) {
              let totalGlobalImports = 0;
              let totalTransformedImports = 0;
              let totalFiles = 0;
              const globalMetadataEntries = Object.entries(globalMetadata);

              globalMetadataEntries.forEach(([path, metadata]) => {
                if (state.opts.verbose) {
                  log(
                    `rewrote ${metadata.transformedImports.length} of ${metadata.totalImports} imports in file ${path}`
                  );

                  metadata.transformedImports.forEach((transformedImport) => {
                    log(`  ${transformedImport}`);
                  });
                }

                totalGlobalImports += metadata.totalImports;
                totalTransformedImports += metadata.transformedImports.length;
                totalFiles += 1;
              });

              if (!(state.opts.appendExtension || state.opts.replaceExtensions)) {
                log(`(${pkgName} was loaded without configuration, making it a noop)`);
              } else {
                log(
                  `${
                    state.opts.verbose && globalMetadataEntries.length ? '---\n' : ''
                  }rewrote ${totalTransformedImports} of ${totalGlobalImports} imports across ${totalFiles} files`
                );
              }
            }
          }, 100);
        }
      },
      ImportDeclaration: declarationHandler,
      ExportAllDeclaration: declarationHandler,
      ExportNamedDeclaration: declarationHandler,
      // ? dynamic imports and require statements
      CallExpression(path, state) {
        const isDynamicImport = path.node.callee?.type == 'Import';
        const isRequire =
          path.node.callee?.type == 'Identifier' && path.node.callee?.name == 'require';

        const firstArgument = path.node.arguments?.[0] as
          | (typeof path.node.arguments)[0]
          | undefined;

        const firstArgumentIsStringLiteral = firstArgument?.type == 'StringLiteral';

        const { appendExtension, recognizedExtensions, replaceExtensions } = {
          ...state.opts,
          recognizedExtensions: (state.opts.recognizedExtensions ||
            defaultRecognizedExtensions) as string[]
        };

        if (isDynamicImport || isRequire) {
          const metadata = getLocalMetadata(state);
          metadata.totalImports += 1;

          if (appendExtension || replaceExtensions) {
            const specifierType = isDynamicImport ? 'dynamic import' : 'require';

            if (!firstArgument) {
              log.extend('<warn>')(
                `[${getFilenameFromState(
                  state
                )}]: a ${specifierType} statement has no arguments!`
              );
            } else if (firstArgumentIsStringLiteral) {
              const importPath = (firstArgument as util.StringLiteral).value;
              const rewrittenPath = rewrite(importPath, {
                appendExtension,
                recognizedExtensions,
                replaceExtensions
              });

              if (importPath == rewrittenPath) {
                debug(
                  `[${getFilenameFromState(
                    state
                  )}]: ${specifierType} evaluated but unchanged: "${importPath}"`
                );
              } else {
                path.node.arguments[0] = util.stringLiteral(rewrittenPath);
                metadata.transformedImports.push(
                  `${specifierType} "${importPath}" => "${rewrittenPath}"`
                );
              }
            } else {
              const globalScope = path.scope.getProgramParent();

              if (!rewriteFnIdentifier) {
                const rewriteFnAst = template.expression.ast(rewrite.toString());
                rewriteFnIdentifier = globalScope.generateUidIdentifier('_rewrite');

                globalScope.push({
                  id: rewriteFnIdentifier,
                  init: rewriteFnAst,
                  kind: 'const'
                });
              }

              if (!rewriteOptionsObjIdentifier) {
                const rewriteOptionsObjAst = template.expression.ast(
                  JSON.stringify({
                    appendExtension,
                    recognizedExtensions,
                    replaceExtensions
                  })
                );

                rewriteOptionsObjIdentifier =
                  globalScope.generateUidIdentifier('_rewrite_options');

                globalScope.push({
                  id: rewriteOptionsObjIdentifier,
                  init: rewriteOptionsObjAst,
                  kind: 'const'
                });
              }

              path
                .get('arguments')[0]
                .replaceWith(
                  util.callExpression(rewriteFnIdentifier, [
                    firstArgument,
                    rewriteOptionsObjIdentifier
                  ])
                );

              metadata.transformedImports.push(
                `${specifierType} first argument wrapped with rewrite function`
              );
            }
          }
        }
      }
    }
  };
}

function declarationHandler(
  path:
    | NodePath<util.ImportDeclaration>
    | NodePath<util.ExportAllDeclaration>
    | NodePath<util.ExportNamedDeclaration>,
  state: State
) {
  const metadata = getLocalMetadata(state);
  metadata.totalImports += 1;

  if (path.node.source && (state.opts.appendExtension || state.opts.replaceExtensions)) {
    const importPath = path.node.source.value;
    const specifierType = path.node.type.startsWith('Import') ? 'import' : 'export';

    const rewrittenPath = rewrite(importPath, {
      ...state.opts,
      recognizedExtensions: (state.opts.recognizedExtensions ||
        defaultRecognizedExtensions) as string[]
    });

    if (importPath == rewrittenPath) {
      debug(
        `[${getFilenameFromState(
          state
        )}]: ${specifierType} evaluated but unchanged: "${importPath}"`
      );
    } else {
      path.node.source = util.stringLiteral(rewrittenPath);
      metadata.transformedImports.push(
        `${specifierType} "${importPath}" => "${rewrittenPath}"`
      );
    }
  }
}

function getLocalMetadata(state: State) {
  const key = getFilenameFromState(state);

  return (globalMetadata[key] = globalMetadata[key] || {
    totalImports: 0,
    transformedImports: []
  });
}

function getFilenameFromState(state: State) {
  return state.filename || '<no path>';
}

/**
 * This function rewrites an import/require specifier `importPath` given a
 * `replaceMap` and an `options` object. Throws if `importPath` is not a string.
 */
// ! This function is stringified and injected when transforming dynamic imports
// ! so there must be no references to variables external to the function. Also,
// ! no coverage data is available since istanbul clobbers the resulting AST.
// istanbul ignore next
const rewrite = (
  importPath: unknown,
  options: Pick<Options, 'appendExtension' | 'replaceExtensions'> &
    Required<Pick<Options, 'recognizedExtensions'>>
) => {
  if (typeof importPath != 'string') {
    throw new TypeError(
      `rewrite error: expected import specifier of type string, not ${typeof importPath}`
    );
  }

  let finalImportPath = importPath;
  let replacementMap: [target: RegExp | string, replacement: string] | undefined;
  // ? https://github.com/microsoft/TypeScript/issues/9998
  replacementMap = undefined as typeof replacementMap;

  if (options.replaceExtensions) {
    Object.entries(options.replaceExtensions).some(([target, replacement]) => {
      if (target.startsWith('^') || target.endsWith('$')) {
        const targetRegExp = new RegExp(target);

        if (targetRegExp.test(finalImportPath)) {
          replacementMap = [targetRegExp, replacement];
          return true;
        }
      } else if (finalImportPath.endsWith(target)) {
        replacementMap = [target, replacement];
        return true;
      }
    });
  }

  if (replacementMap) {
    const [target, replacement] = replacementMap;
    finalImportPath = finalImportPath.replace(target, replacement);
  }

  const isRelative =
    finalImportPath.startsWith('./') ||
    finalImportPath.startsWith('../') ||
    finalImportPath == '.' ||
    finalImportPath == '..';

  if (options.appendExtension && isRelative) {
    const endsWithSlash = finalImportPath.endsWith('/');

    if (/(^\.?\.\/?$)|(\/\.?\.\/?$)/.test(finalImportPath)) {
      finalImportPath += `${endsWithSlash ? '' : '/'}index${options.appendExtension}`;
    } else {
      const hasRecognizedExtension =
        !endsWithSlash &&
        options.recognizedExtensions.some((extension) => {
          return finalImportPath.endsWith(extension);
        });

      if (!hasRecognizedExtension) {
        finalImportPath = endsWithSlash
          ? finalImportPath + `index${options.appendExtension}`
          : finalImportPath + options.appendExtension;
      }
    }
  }

  return finalImportPath;
};
