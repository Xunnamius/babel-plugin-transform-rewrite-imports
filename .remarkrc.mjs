// @ts-check

import assert from 'node:assert';

import { deepMergeConfig } from '@-xun/symbiote/assets';
import { assertEnvironment, moduleExport } from '@-xun/symbiote/assets/.remarkrc.mjs';
import { isRecord } from '@-xun/types';
import { createDebugLogger } from 'rejoinder';

const debug = createDebugLogger({ namespace: 'symbiote:config:remarkrc' });

const config = deepMergeConfig(moduleExport(await assertEnvironment()), {
  // Any custom configs here will be deep merged with moduleExport
});

assert(Array.isArray(config.plugins));

const listItemStylePlugin = config.plugins.find(
  (plugin) => Array.isArray(plugin) && plugin[0] === 'remark-lint-list-item-style'
);

if (
  Array.isArray(listItemStylePlugin) &&
  listItemStylePlugin[1] &&
  isRecord(listItemStylePlugin[1]) &&
  (Array.isArray(listItemStylePlugin[1].ignoredFirstWords) ||
    listItemStylePlugin[1].ignoredFirstWords === undefined)
) {
  listItemStylePlugin[1].ignoredFirstWords = [
    ...(listItemStylePlugin[1].ignoredFirstWords || []),
    /transform-rewrite-imports/
  ];
}

export default config;

debug('exported config: %O', config);
