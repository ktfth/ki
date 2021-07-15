const assert = require('assert');
const { Tokenizer } = require('../');

describe('Tokenizer', () => {
	it('should have an input', () => {
		let tokenizer = new Tokenizer('1 + 1');
		assert.equal(tokenizer.input, '1 + 1');
	});
});
