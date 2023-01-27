const someVariable = 'import';
const someOtherVariable = `${__dirname}/import-3`;
const someFn = (str) => `${str}-2`;

expect.hasAssertions();

const import1 = require(`${__dirname}/import-1`);
const import2 = require(someFn(`${__dirname}/${someVariable}`) + '.json');
const import3 = require(someOtherVariable);

expect(import1).toEqual({ data: 'import-1' });
expect(import2).toEqual({ data: 'import-2' });
expect(import3).toEqual({ data: 'import-3' });
