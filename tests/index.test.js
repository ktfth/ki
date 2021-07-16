const assert = require('assert');
const { Parser } = require('../');

describe('Parser', () => {
	let parser = new Parser([
		{ type: 'number', value: '1' },
		{ type: 'operation', value: '+' },
		{ type: 'number', value: '1' },
	]);

	it('should have tokens', () => {
		assert.deepEqual(parser.tokens, [
			{ type: 'number', value: '1' },
			{ type: 'operation', value: '+' },
			{ type: 'number', value: '1' },
		]);
	});

	it('should have current', () => {
		assert.equal(parser.current, 0);
	});
});
