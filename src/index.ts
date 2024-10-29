// TODO: replace with 'package'
import { name as pkgName } from '../package.json';
import debugFactory from 'debug';
import template from '@babel/template';
import * as util from '@babel/types';

import type { NodePath, PluginObj, PluginPass } from '@babel/core';

const debugNamespace = pkgName;
const debug = debugFactory(debugNamespace);
const debugRewrite = debug.extend('rewrite');

export const defaultRequireLikeFunctions = [
  'require',
  'require.resolve',
  'System.import',
  'jest.genMockFromModule',
  'jest.mock',
  'jest.unmock',
  'jest.doMock',
  'jest.dontMock',
  'jest.requireActual'
] as const;

const globalMetadata: {
  [path: string]: {
    totalImports: number;
    transformedImports: string[];
  };
} = {};

let reporterTimeout: NodeJS.Timeout | undefined;

/**
 * The shape of the internal state of the Babel plugin itself.
 */
export type State = PluginPass & { opts: Options };

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
   * Members of this array will be considered as "require-like functions," or
   * functions that should be treated as if they were CJS `require(...)` (or ESM
   * `import(...)`) functions. This is useful when, for instance, you want
   * Jest's `jest.mock` and `jest.requireActual` functions to have their import
   * specifiers transformed.
   *
   * If not overridden, `requireLikeFunctions` defaults to
   * {@link defaultRequireLikeFunctions}.
   */
  requireLikeFunctions?: string[];
  /**
   * If `'only-if-necessary'`, the dynamic rewriter function will only be
   * injected into the AST if necessary. If `'never'`, support for arbitrary
   * dynamic imports that are not statically analyzable will be disabled and no
   * rewriter function injection will occur.
   *
   * @default 'only-if-necessary'
   */
  injectDynamicRewriter?: 'never' | 'only-if-necessary';
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
        exit(_, { opts: { silent, verbose, appendExtension, replaceExtensions } }) {
          // istanbul ignore next
          if (process.env.NODE_ENV !== 'test') {
            reporterTimeout = setTimeout(() => {
              if (!silent) {
                let totalGlobalImports = 0;
                let totalTransformedImports = 0;
                let totalFiles = 0;
                const globalMetadataEntries = Object.entries(globalMetadata);

                globalMetadataEntries.forEach(([path, metadata]) => {
                  if (verbose) {
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

                if (!appendExtension && !replaceExtensions) {
                  // eslint-disable-next-line no-console
                  console.log(
                    `(${pkgName} was loaded without any meaningful configuration, making it a noop)`
                  );
                } else {
                  // eslint-disable-next-line no-console
                  console.log(
                    `${
                      verbose && globalMetadataEntries.length ? '  ---\n  ' : '└── '
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
      ImportDeclaration: declarationHandler('ImportDeclaration'),
      ExportAllDeclaration: declarationHandler('ExportAllDeclaration'),
      ExportNamedDeclaration: declarationHandler('ExportNamedDeclaration'),
      // ? Type-only imports using dynamic-import-style syntax
      TSImportType(path, state) {
        const {
          appendExtension,
          recognizedExtensions = defaultRecognizedExtensions as unknown as string[],
          replaceExtensions
        } = state.opts;

        const { argument: specifier } = path.node;
        const importPath = specifier.value;
        const specifierType = 'type-only dynamic import';
        const filepath = getFilenameFromState(state);
        const metadata = getLocalMetadata(state);
        metadata.totalImports += 1;

        debug(`saw ${specifierType} %O within %O`, importPath, filepath);

        if (appendExtension || replaceExtensions) {
          const rewrittenPath = rewrite(importPath, {
            appendExtension,
            recognizedExtensions,
            replaceExtensions,
            filepath
          });

          if (importPath === rewrittenPath) {
            const [, ...debugArgs] = buildDebugString({
              kind: 'TSImportType',
              filepath,
              specifierType,
              messageOrSpecifier: 'evaluated but unchanged',
              resultSpecifier: rewrittenPath
            });

            debug(...debugArgs);
          } else {
            path.node.argument = util.stringLiteral(rewrittenPath);

            const [debugString, ...debugArgs] = buildDebugString({
              kind: 'TSImportType',
              filepath,
              specifierType,
              messageOrSpecifier: `"${importPath}"`,
              resultSpecifier: rewrittenPath
            });

            metadata.transformedImports.push(debugString);
            debug(...debugArgs);
          }
        }
      },
      // ? Dynamic imports and require statements
      CallExpression(path, state) {
        const calleePath = path.get('callee');
        const isDynamicImport = util.isImport(calleePath.node);

        const firstArgument = path.node.arguments?.[0] as
          | (typeof path.node.arguments)[0]
          | undefined;

        const firstArgumentIsStringLiteral = util.isStringLiteral(firstArgument);

        const {
          appendExtension,
          replaceExtensions,
          recognizedExtensions = defaultRecognizedExtensions as unknown as string[],
          requireLikeFunctions = defaultRequireLikeFunctions as unknown as string[],
          injectDynamicRewriter = 'only-if-necessary'
        } = state.opts;

        const isTargetCallExpressionIdentifier =
          util.isIdentifier(calleePath.node) &&
          requireLikeFunctions.includes(calleePath.node.name);

        debug(`isTargetCallExpressionIdentifier: %O`, isTargetCallExpressionIdentifier);

        const isTargetMemberExpressionFullname =
          util.isMemberExpression(calleePath.node) &&
          requireLikeFunctions.some((fullname) => calleePath.matchesPattern(fullname));

        debug(`isTargetMemberExpressionFullname: %O`, isTargetMemberExpressionFullname);

        const isRequireLike =
          isTargetCallExpressionIdentifier || isTargetMemberExpressionFullname;

        debug(`isRequireLike: %O`, isRequireLike);

        if (isDynamicImport || isRequireLike) {
          const filepath = getFilenameFromState(state);

          const importPath = firstArgumentIsStringLiteral
            ? firstArgument.value
            : '(not determinable)';

          const specifierType = isDynamicImport ? 'dynamic import' : 'require-like';
          const metadata = getLocalMetadata(state);

          metadata.totalImports += 1;
          debug(`saw ${specifierType} %O within %O`, importPath, filepath);

          if (appendExtension || replaceExtensions) {
            if (!firstArgument) {
              const [debugString] = buildDebugString({
                kind: 'CallExpression',
                filepath,
                specifierType,
                messageOrSpecifier:
                  'warning: a ${specifierType} statement has no arguments!',
                resultSpecifier: '(warning)'
              });

              // eslint-disable-next-line no-console
              console.warn(debugString);
            } else if (firstArgumentIsStringLiteral) {
              const rewrittenPath = rewrite(importPath, {
                appendExtension,
                recognizedExtensions,
                replaceExtensions,
                filepath
              });

              if (importPath === rewrittenPath) {
                const [, ...debugArgs] = buildDebugString({
                  kind: 'CallExpression',
                  filepath,
                  specifierType,
                  messageOrSpecifier: 'evaluated but unchanged',
                  resultSpecifier: rewrittenPath
                });

                debug(...debugArgs);
              } else {
                path.node.arguments[0] = util.stringLiteral(rewrittenPath);

                const [debugString, ...debugArgs] = buildDebugString({
                  kind: 'CallExpression',
                  filepath,
                  specifierType,
                  messageOrSpecifier: `"${importPath}"`,
                  resultSpecifier: rewrittenPath
                });

                metadata.transformedImports.push(debugString);
                debug(...debugArgs);
              }
            } else if (injectDynamicRewriter === 'never') {
              const [, ...debugArgs] = buildDebugString({
                kind: 'CallExpression',
                filepath,
                specifierType,
                messageOrSpecifier:
                  'warning: encountered an non-statically-analyzable dynamic import but injectDynamicRewriter === "never" so it was left unchanged',
                resultSpecifier: '(warning)'
              });

              debug(...debugArgs);
            } else {
              const globalScope = path.scope.getProgramParent();

              if (!rewriteFnIdentifier) {
                const injectedRewriter = rewrite
                  .toString()
                  // ? We need to inline the value of options.filepath since it
                  // ? is not resolvable at runtime
                  .replaceAll(/\boptions\.filepath\b/g, `'${filepath}'`)
                  // ? We also need to remove all debug calls
                  .replaceAll(/(\n\s*)?debugRewrite\([^)]*\);\s*(?=\n)/g, '');

                const [, ...debugArgs] = buildDebugString({
                  kind: 'CallExpression',
                  filepath,
                  specifierType,
                  messageOrSpecifier: 'injecting rewriter function into AST',
                  resultSpecifier: '(arbitrary dynamic)'
                });

                debug(...debugArgs);

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

              const [debugString, ...debugArgs] = buildDebugString({
                kind: 'CallExpression',
                filepath,
                specifierType,
                messageOrSpecifier: 'first argument wrapped with rewrite function',
                resultSpecifier: '(dynamic)'
              });

              metadata.transformedImports.push(debugString);
              debug(...debugArgs);
            }
          }
        }
      }
    }
  };
}

function declarationHandler(kind: string) {
  return function (
    path:
      | NodePath<util.ImportDeclaration>
      | NodePath<util.ExportAllDeclaration>
      | NodePath<util.ExportNamedDeclaration>,
    state: State
  ) {
    const metadata = getLocalMetadata(state);
    metadata.totalImports += 1;

    if (
      path.node.source &&
      (state.opts.appendExtension || state.opts.replaceExtensions)
    ) {
      const importPath = path.node.source.value;
      const specifierType = util.isImportDeclaration(path.node) ? 'import' : 'export';
      const filepath = getFilenameFromState(state);

      debug(`saw ${specifierType} %O within %O`, importPath, filepath);

      const {
        appendExtension,
        recognizedExtensions = defaultRecognizedExtensions as unknown as string[],
        replaceExtensions
      } = state.opts;

      const rewrittenPath = rewrite(importPath, {
        ...state.opts,
        appendExtension,
        recognizedExtensions,
        replaceExtensions,
        filepath
      });

      if (importPath === rewrittenPath) {
        const [, ...debugArgs] = buildDebugString({
          kind,
          filepath,
          specifierType,
          messageOrSpecifier: 'evaluated but unchanged',
          resultSpecifier: rewrittenPath
        });

        debug(...debugArgs);
      } else {
        path.node.source = util.stringLiteral(rewrittenPath);

        const [debugString, ...debugArgs] = buildDebugString({
          kind,
          filepath,
          specifierType,
          messageOrSpecifier: `"${importPath}"`,
          resultSpecifier: rewrittenPath
        });

        metadata.transformedImports.push(debugString);
        debug(...debugArgs);
      }
    }
  };
}

function buildDebugString({
  kind,
  filepath,
  specifierType,
  messageOrSpecifier,
  resultSpecifier
}: {
  kind: string;
  filepath: string;
  specifierType: string;
  messageOrSpecifier: string;
  resultSpecifier: string;
}) {
  return [
    `[${kind}]<${filepath}>: ${specifierType} specifier ${messageOrSpecifier} => ${resultSpecifier}`,
    `[${kind}]<%O>: ${specifierType} specifier ${messageOrSpecifier} => %O`,
    filepath,
    resultSpecifier
  ] as const;
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
 * This function rewrites an import/require `specifier` given a `replaceMap` and
 * an `options` object. Throws if `specifier` is not a string.
 */
// ! This function is stringified and injected when transforming dynamic imports
// ! so there must be no references to variables external to its scope. Also, no
// ! coverage data is available since istanbul clobbers the resulting AST.
//
// ! Note that all references to options.filepath are replaced by an inlined
// ! string literal when this function is stringified.
//
// ! Note that all instances of \s*debugRewrite([^)]*);\s* in the function body
// ! are deleted when this function is stringified.
// istanbul ignore next
const rewrite = (
  specifier: unknown,
  options: Pick<Options, 'appendExtension' | 'replaceExtensions'> &
    Required<Pick<Options, 'recognizedExtensions'>> & { filepath: string }
) => {
  debugRewrite('entered rewrite function for specifier: %O', specifier);

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

  if (options.replaceExtensions) {
    Object.entries(options.replaceExtensions).some(([target, replacement]) => {
      debugRewrite(
        'evaluating replaceExtensions entry: [key: %O, value: %O]',
        target,
        replacement
      );

      if (target.startsWith('^') || target.endsWith('$')) {
        const targetRegExp = new RegExp(target);
        const capturingGroups = Array.from(specifier.match(targetRegExp) || []);

        debugRewrite('entry key is regex: %O', targetRegExp);
        debugRewrite(
          'capturing groups match result on specifier: %O',
          capturingGroups.length === 0 ? 'no matches' : capturingGroups
        );

        if (capturingGroups.length) {
          replacementMap = [targetRegExp, replacement, capturingGroups];
          return true;
        }
      } else if (specifier.endsWith(target)) {
        replacementMap = [target, replacement, []];
        debugRewrite('entry key matches end of specifier: %O');
        return true;
      }
    });
  }

  debugRewrite('replacement map: %O', replacementMap);

  let finalImportPath = specifier;

  if (replacementMap) {
    const [target, replacement, capturingGroups] = replacementMap;

    debugRewrite('will call replacer as function: %O', typeof replacement !== 'string');

    finalImportPath = finalImportPath.replace(
      target,
      typeof replacement === 'string'
        ? replacement
        : replacement({ specifier, capturingGroups, filepath: options.filepath })
    );
  }

  debugRewrite('post-replacer result import path: %O', finalImportPath);

  const isRelative =
    finalImportPath.startsWith('./') ||
    finalImportPath.startsWith('.\\') ||
    finalImportPath.startsWith('../') ||
    finalImportPath.startsWith('..\\') ||
    finalImportPath === '.' ||
    finalImportPath === '..';

  debugRewrite('is relative: %O', isRelative);

  if (options.appendExtension && isRelative) {
    const endsWithSlash = /(\/|\\)$/.test(finalImportPath);
    const basenameIsDots = /(^\.?\.(\/|\\)?$)|((\/|\\)\.?\.(\/|\\)?$)/.test(
      finalImportPath
    );

    debugRewrite('might append extension');
    debugRewrite('ends with slash: %O', endsWithSlash);
    debugRewrite('basename is dots: %O', basenameIsDots);
    debugRewrite(
      'will call appendExtension as function: %O',
      typeof options.appendExtension !== 'string'
    );

    const extensionToAppend =
      typeof options.appendExtension === 'string'
        ? options.appendExtension
        : options.appendExtension({
            specifier,
            capturingGroups: [],
            filepath: options.filepath
          });

    debugRewrite(
      'extension to MAYBE append: %O',
      extensionToAppend ?? 'will not append any extension'
    );

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
          debugRewrite('extension was appended');
          finalImportPath = endsWithSlash
            ? finalImportPath + `index${extensionToAppend}`
            : finalImportPath + extensionToAppend;
        }
      }
    }
  }

  debugRewrite('post-append result FINAL import path: %O', finalImportPath);

  return finalImportPath;
};
