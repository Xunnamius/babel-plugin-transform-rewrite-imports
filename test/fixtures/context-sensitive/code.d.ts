import type { somethingOrOther } from "# package.json";
import type { thatThing } from './no-ext';

export declare function runWithInheritedIo(...[file, args, options]: Parameters<typeof run>): Promise<{
  all: string | unknown[] | string[] | Uint8Array | undefined;
  stdio: import("# node_modules/execa/types/return/result-stdio.js", { with: { "resolution-mode": "import" } }).MapResultStdio<readonly [import("# node_modules/execa/types/stdio/type.js", { with: { "resolution-mode": "import" } }).StdinOptionCommon<false, false>, import("# node_modules/execa/types/stdio/type.js", { with: { "resolution-mode": "import" } }).StdoutStderrOptionCommon<false, false>, import("# node_modules/execa/types/stdio/type.js", { with: { "resolution-mode": "import" } }).StdoutStderrOptionCommon<false, false>, ...import("# node_modules/execa/types/stdio/type.js", { with: { "resolution-mode": "import" } }).StdioExtraOptionCommon<false>[]] | readonly [undefined, undefined, undefined] | readonly ["pipe", "pipe", "pipe"] | readonly ["inherit", "inherit", "inherit"] | readonly ["ignore", "ignore", "ignore"] | readonly ["overlapped", "overlapped", "overlapped"], RunOptions>;
  ipcOutput: [] | (string | number | boolean | object | readonly import("# node_modules/execa/types/ipc.js", { with: { "resolution-mode": "import" } }).JsonMessage[] | {
      readonly [key: string]: import("# node_modules/execa/types/ipc.js", { with: { "resolution-mode": "import" } }).JsonMessage;
      readonly [key: number]: import("# node_modules/execa/types/ipc.js", { with: { "resolution-mode": "import" } }).JsonMessage;
  } | null)[];
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
  signal?: keyof import("os").SignalConstants | undefined;
  signalDescription?: string | undefined;
  message: string;
  shortMessage: string;
  originalMessage: string;
  cause: unknown;
  code: string;
  readonly name: Error["name"];
  stack: Error["stack"];
  stdout: string;
  stderr: string;
} & {
  stdout: never;
  stderr: never;
  all: never;
}>;
