import assert from 'node:assert';

process.removeAllListeners('warning');

const someVariable = 'import';
const someOtherVariable = `./import-3`;
const someFn = (str: string) => `${str}-2`;

const import1 = await import(`./import-1`);
const import2 = await import(someFn(`./${someVariable}`) + '.json', {
  with: { type: 'json' }
});
const import3 = await import(someOtherVariable);

assert.deepStrictEqual(import1.default, { data: 'import-1' });
assert.deepStrictEqual(import2.default, { data: 'import-2' });
assert.deepStrictEqual(import3.default, { data: 'import-3' });
