const assert = require('assert');
const { Tokenizer } = require('../');

describe('Tokenizer', () => {
	it('should have an input', () => {
		let tokenizer = new Tokenizer('1 + 1');
		assert.equal(tokenizer.input, '1 + 1');
	});

	it('should have a current pointer', () => {
		let tokenizer = new Tokenizer('1 + 1');
		assert.equal(tokenizer.current, 0);
	});

	it('should have tokens', () => {
		let tokenizer = new Tokenizer('1 + 1');
		assert.deepEqual(tokenizer.tokens, []);
	})
});
