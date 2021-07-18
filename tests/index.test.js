const assert = require('assert');
const { Compiler } = require('../');

describe('Compiler', () => {
	let compiler = new Compiler('1 + 1');

	it('should have an input', () => {
		assert.equal(compiler.input, '1 + 1');
	});
});
