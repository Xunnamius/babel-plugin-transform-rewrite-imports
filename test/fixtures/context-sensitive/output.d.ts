import type { somethingOrOther } from 'rewritten-for-good:package.json';
import type { thatThing } from './no-ext.good';
export declare function runWithInheritedIo(
  ...[file, args, options]: Parameters<typeof run>
): Promise<
  {
    all: string | unknown[] | string[] | Uint8Array | undefined;
    stdio: import('rewritten-for-good:node_modules/execa/types/return/result-stdio.js').MapResultStdio<
      | readonly [
          import('rewritten-for-good:node_modules/execa/types/stdio/type.js').StdinOptionCommon<
            false,
            false
          >,
          import('rewritten-for-good:node_modules/execa/types/stdio/type.js').StdoutStderrOptionCommon<
            false,
            false
          >,
          import('rewritten-for-good:node_modules/execa/types/stdio/type.js').StdoutStderrOptionCommon<
            false,
            false
          >,
          ...import('rewritten-for-good:node_modules/execa/types/stdio/type.js').StdioExtraOptionCommon<false>[]
        ]
      | readonly [undefined, undefined, undefined]
      | readonly ['pipe', 'pipe', 'pipe']
      | readonly ['inherit', 'inherit', 'inherit']
      | readonly ['ignore', 'ignore', 'ignore']
      | readonly ['overlapped', 'overlapped', 'overlapped'],
      RunOptions
    >;
    ipcOutput:
      | []
      | (
          | string
          | number
          | boolean
          | object
          | readonly import('rewritten-for-good:node_modules/execa/types/ipc.js').JsonMessage[]
          | {
              readonly [
                key: string
              ]: import('rewritten-for-good:node_modules/execa/types/ipc.js').JsonMessage;
              readonly [
                key: number
              ]: import('rewritten-for-good:node_modules/execa/types/ipc.js').JsonMessage;
            }
          | null
        )[];
    pipedFrom: Result<Options>[];
    command: string;
    escapedCommand: string;
    cwd: string;
    durationMs: number;
    failed: boolean;
    timedOut: boolean;
    isCanceled: boolean;
    isGracefullyCanceled: boolean;
    isMaxBuffer: boolean;
    isTerminated: boolean;
    isForcefullyTerminated: boolean;
    exitCode?: number | undefined;
    signal?: keyof import('os').SignalConstants | undefined;
    signalDescription?: string | undefined;
    message: string;
    shortMessage: string;
    originalMessage: string;
    cause: unknown;
    code: string;
    readonly name: Error['name'];
    stack: Error['stack'];
    stdout: string;
    stderr: string;
  } & {
    stdout: never;
    stderr: never;
    all: never;
  }
>;
