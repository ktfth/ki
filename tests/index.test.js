const assert = require('assert');
const { Parser } = require('../');

describe('Parser', () => {
	it('should have tokens', () => {
		let parser = new Parser([
			{ type: 'number', value: '1' },
			{ type: 'operation', value: '+' },
			{ type: 'number', value: '1' },
		]);
		assert.deepEqual(parser.tokens, [
			{ type: 'number', value: '1' },
			{ type: 'operation', value: '+' },
			{ type: 'number', value: '1' },
		]);
	});
});
