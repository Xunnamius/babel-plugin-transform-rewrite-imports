// TODO: replace with 'package'
import { name as pkgName } from '../package.json';
import debugFactory from 'debug';
import template from '@babel/template';
import * as util from '@babel/types';

import type { NodePath, PluginObj, PluginPass } from '@babel/core';

const debugNamespace = `${pkgName}:index`;

/**
 * A callback function provided as a value to `Options.appendExtension` or to an
 * entry in `Options.replaceExtensions`.
 */
export type Callback<ReturnType> = (context: {
  /**
   * The import/export specifier being evaluated by Babel.
   */
  specifier: string;
  /**
   * An array of capturing groups returned by `String.prototype.match()` or an
   * empty array if the matcher string was not a regular expression.
   */
  capturingGroups: string[];
  /**
   * The absolute path of the file containing the specifier being evaluated by
   * Babel.
   */
  filepath: string;
}) => ReturnType;

/**
 * The options that can be passed to this plugin from babel.
 */
export type Options = {
  /**
   * This string will be appended to all relative import specifiers that do not
   * already have a recognized extension. Also accepts a callback function for
   * advanced use cases.
   *
   * @default undefined
   */
  appendExtension?: string | Callback<string | undefined>;
  /**
   * Members of this array will be considered a "recognized extension".
   *
   * @default defaultRecognizedExtensions
   */
  recognizedExtensions?: string[];
  /**
   * Map of specifiers to their replacements. Specifiers can be strings or
   * regular expressions (i.e. strings that start with ^ and/or end with $). If
   * a specifier is a regular expression, capturing group notation can be used
   * in the replacement. Replacements can either be a string or a callback
   * function that returns a string.
   *
   * @default {}
   */
  replaceExtensions?: Record<string, string | Callback<string>>;
  /**
   * If true, this plugin will generate no output.
   *
   * @default false
   */
  silent?: boolean;
  /**
   * If true, this plugin will generate more output than usual.
   *
   * @default false
   */
  verbose?: boolean;
};

type State = PluginPass & { opts: Options };

const debug = debugFactory(debugNamespace);

const globalMetadata: {
  [path: string]: {
    totalImports: number;
    transformedImports: string[];
  };
} = {};

/**
 * The default value of `Options.recognizedExtensions`.
 */
export const defaultRecognizedExtensions = [
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json'
] as const;

let reporterTimeout: NodeJS.Timeout | undefined;

/**
 * A babel plugin that reliably rewrites import (and export) specifiers.
 */
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
          // istanbul ignore next
          if (process.env.NODE_ENV !== 'test') {
            reporterTimeout = setTimeout(() => {
              if (!state.opts.silent) {
                let totalGlobalImports = 0;
                let totalTransformedImports = 0;
                let totalFiles = 0;
                const globalMetadataEntries = Object.entries(globalMetadata);

                globalMetadataEntries.forEach(([path, metadata]) => {
                  if (state.opts.verbose) {
                    // eslint-disable-next-line no-console
                    console.log(
                      `└── Rewrote ${metadata.transformedImports.length} of ${metadata.totalImports} imports in file ${path}`
                    );

                    metadata.transformedImports.forEach((transformedImport) => {
                      // eslint-disable-next-line no-console
                      console.log(`  » ${transformedImport}`);
                    });
                  }

                  totalGlobalImports += metadata.totalImports;
                  totalTransformedImports += metadata.transformedImports.length;
                  totalFiles += 1;
                });

                if (!state.opts.appendExtension && !state.opts.replaceExtensions) {
                  // eslint-disable-next-line no-console
                  console.log(
                    `(${pkgName} was loaded without any meaningful configuration, making it a noop)`
                  );
                } else {
                  // eslint-disable-next-line no-console
                  console.log(
                    `${
                      state.opts.verbose && globalMetadataEntries.length
                        ? '  ---\n  '
                        : '└── '
                    }Rewrote ${totalTransformedImports} of ${totalGlobalImports} imports ${
                      totalFiles === 1 ? 'in 1 file' : `across ${totalFiles} files`
                    }`
                  );
                }
              }
            }, 100);
          }
        }
      },
      ImportDeclaration: declarationHandler,
      ExportAllDeclaration: declarationHandler,
      ExportNamedDeclaration: declarationHandler,
      // ? Type-only imports using dynamic-import-style syntax
      TSImportType(path, state) {
        const { appendExtension, recognizedExtensions, replaceExtensions } = {
          ...state.opts,
          recognizedExtensions: (state.opts.recognizedExtensions ||
            defaultRecognizedExtensions) as string[]
        };

        const { argument: specifier } = path.node;
        const specifierType = 'type-only dynamic import';

        const metadata = getLocalMetadata(state);
        metadata.totalImports += 1;

        if (appendExtension || replaceExtensions) {
          const filepath = getFilenameFromState(state);

          const importPath = specifier.value;
          const rewrittenPath = rewrite(importPath, {
            appendExtension,
            recognizedExtensions,
            replaceExtensions,
            filepath
          });

          if (importPath === rewrittenPath) {
            debug(
              `[%O]: %O evaluated but unchanged: "%O"`,
              filepath,
              specifierType,
              importPath
            );
          } else {
            path.node.argument = util.stringLiteral(rewrittenPath);
            const debugString = `[TSImportType]: ${specifierType} "${importPath}" => "${rewrittenPath}"`;
            metadata.transformedImports.push(debugString);
            debug(debugString);
          }
        }
      },
      // ? Dynamic imports and require statements
      CallExpression(path, state) {
        const isDynamicImport = path.node.callee?.type === 'Import';
        const isRequire =
          path.node.callee?.type === 'Identifier' && path.node.callee?.name === 'require';

        const firstArgument = path.node.arguments?.[0] as
          | (typeof path.node.arguments)[0]
          | undefined;

        const firstArgumentIsStringLiteral = firstArgument?.type === 'StringLiteral';

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
            const filepath = getFilenameFromState(state);

            if (!firstArgument) {
              // TODO: replace this (and others) with rejoinder
              // eslint-disable-next-line no-console
              console.warn(
                `[${filepath}]: warning: a ${specifierType} statement has no arguments!`
              );
            } else if (firstArgumentIsStringLiteral) {
              const importPath = (firstArgument as util.StringLiteral).value;
              const rewrittenPath = rewrite(importPath, {
                appendExtension,
                recognizedExtensions,
                replaceExtensions,
                filepath
              });

              if (importPath === rewrittenPath) {
                debug(
                  `[%O]: %O evaluated but unchanged: "%O"`,
                  filepath,
                  specifierType,
                  importPath
                );
              } else {
                path.node.arguments[0] = util.stringLiteral(rewrittenPath);
                const debugString = `[CallExpression]: ${specifierType} "${importPath}" => "${rewrittenPath}"`;
                metadata.transformedImports.push(debugString);
                debug(debugString);
              }
            } else {
              const globalScope = path.scope.getProgramParent();

              if (!rewriteFnIdentifier) {
                const injectedRewriter = rewrite
                  .toString()
                  // ? We need to inline the value of options.filepath since it
                  // ? is not resolvable at runtime
                  .replaceAll(/\boptions\.filepath\b/g, `'${filepath}'`);

                debug('[CallExpression]: injectedRewriter: %O', injectedRewriter);

                const rewriteFnAst = template.expression.ast(injectedRewriter);
                rewriteFnIdentifier = globalScope.generateUidIdentifier('_rewrite');

                globalScope.push({
                  id: rewriteFnIdentifier,
                  init: rewriteFnAst,
                  kind: 'const'
                });
              }

              if (!rewriteOptionsObjIdentifier) {
                const functionExpressionCache: Record<string, string> = {};

                let rewriteOptionsObjString = JSON.stringify(
                  {
                    appendExtension,
                    recognizedExtensions,
                    replaceExtensions
                  },
                  (_key, value) => {
                    // ? Stringify any function expressions we encounter
                    if (typeof value === 'function') {
                      const fnExprString = value.toString();
                      const fnExprId = `%&^#%%${pkgName}%%${
                        Object.keys(functionExpressionCache).length + 1
                      }#^&%`;

                      functionExpressionCache[fnExprId] = fnExprString;
                      return fnExprId;
                    }

                    return value;
                  }
                );

                // ? Unwrap the stringified functions back into real expressions
                Object.entries(functionExpressionCache).forEach(
                  ([fnExprId, fnExprString]) => {
                    rewriteOptionsObjString = rewriteOptionsObjString.replaceAll(
                      `"${fnExprId}"`,
                      fnExprString
                    );
                  }
                );

                // ? Convert the JSON-ish string into a JS object
                const rewriteOptionsObjAst = template.expression.ast(
                  rewriteOptionsObjString
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

              const debugString = `[CallExpression]: ${specifierType} first argument wrapped with rewrite function`;
              metadata.transformedImports.push(debugString);
              debug(debugString);
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
    const filepath = getFilenameFromState(state);

    const rewrittenPath = rewrite(importPath, {
      ...state.opts,
      recognizedExtensions: (state.opts.recognizedExtensions ||
        defaultRecognizedExtensions) as string[],
      filepath
    });

    if (importPath === rewrittenPath) {
      debug(
        `[${getFilenameFromState(
          state
        )}]: ${specifierType} evaluated but unchanged: "${importPath}"`
      );
    } else {
      path.node.source = util.stringLiteral(rewrittenPath);
      const debugString = `[declarationHandler]: ${specifierType} "${importPath}" => "${rewrittenPath}"`;
      metadata.transformedImports.push(debugString);
      debug(debugString);
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
  return state.filename || '<no filepath was set in your babel configuration>';
}

/**
 * This function rewrites an import/require specifier `importPath` given a
 * `replaceMap` and an `options` object. Throws if `importPath` is not a string.
 */
// ! This function is stringified and injected when transforming dynamic imports
// ! so there must be no references to variables external to its scope. Also, no
// ! coverage data is available since istanbul clobbers the resulting AST.
//
// ! Note that all references to options.filepath are replaced by an inlined
// ! string literal when this function is stringified.
// istanbul ignore next
const rewrite = (
  specifier: unknown,
  options: Pick<Options, 'appendExtension' | 'replaceExtensions'> &
    Required<Pick<Options, 'recognizedExtensions'>> & { filepath: string }
) => {
  if (typeof specifier !== 'string') {
    throw new TypeError(
      `rewrite error: expected specifier of type string, not ${typeof specifier}`
    );
  }

  let replacementMap:
    | [
        target: RegExp | string,
        replacement: string | Callback<string>,
        capturingGroups: string[]
      ]
    | undefined;
  // ? https://github.com/microsoft/TypeScript/issues/9998
  replacementMap = undefined as typeof replacementMap;

  if (options.replaceExtensions) {
    Object.entries(options.replaceExtensions).some(([target, replacement]) => {
      if (target.startsWith('^') || target.endsWith('$')) {
        const targetRegExp = new RegExp(target);
        const capturingGroups = Array.from(specifier.match(targetRegExp) || []);

        if (capturingGroups.length) {
          replacementMap = [targetRegExp, replacement, capturingGroups];
          return true;
        }
      } else if (specifier.endsWith(target)) {
        replacementMap = [target, replacement, []];
        return true;
      }
    });
  }

  let finalImportPath = specifier;

  if (replacementMap) {
    const [target, replacement, capturingGroups] = replacementMap;

    finalImportPath = finalImportPath.replace(
      target,
      typeof replacement === 'string'
        ? replacement
        : replacement({ specifier, capturingGroups, filepath: options.filepath })
    );
  }

  const isRelative =
    finalImportPath.startsWith('./') ||
    finalImportPath.startsWith('.\\') ||
    finalImportPath.startsWith('../') ||
    finalImportPath.startsWith('..\\') ||
    finalImportPath === '.' ||
    finalImportPath === '..';

  if (options.appendExtension && isRelative) {
    const endsWithSlash = /(\/|\\)$/.test(finalImportPath);
    const basenameIsDots = /(^\.?\.(\/|\\)?$)|((\/|\\)\.?\.(\/|\\)?$)/.test(
      finalImportPath
    );

    const extensionToAppend =
      typeof options.appendExtension === 'string'
        ? options.appendExtension
        : options.appendExtension({
            specifier,
            capturingGroups: [],
            filepath: options.filepath
          });

    if (extensionToAppend !== undefined) {
      if (basenameIsDots) {
        finalImportPath += `${endsWithSlash ? '' : '/'}index${extensionToAppend}`;
      } else {
        const hasRecognizedExtension =
          !endsWithSlash &&
          options.recognizedExtensions.some((extension) => {
            return finalImportPath.endsWith(extension);
          });

        if (!hasRecognizedExtension) {
          finalImportPath = endsWithSlash
            ? finalImportPath + `index${extensionToAppend}`
            : finalImportPath + extensionToAppend;
        }
      }
    }
  }

  return finalImportPath;
};
