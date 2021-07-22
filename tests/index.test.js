const assert = require('assert');
const { Compiler } = require('../');

describe('Compiler basic instructions', () => {
	let compiler = new Compiler('1 + 1');

	it('should have an input', () => {
		assert.equal(compiler.input, '1 + 1');
	});

	it('should have an output', () => {
		compiler.run();
		assert.equal(compiler.output, '1 + 1');
	});
});

describe('Compiler terminations', () => {
	let compiler = new Compiler('3 * 3;');

	it('should have an input', () => {
		assert.equal(compiler.input, '3 * 3;');
	});

	it('should have an output', () => {
		compiler.run();
		assert.equal(compiler.output, '3 * 3;');
	});
});

describe('Compiler multiple terminations', () => {
	let compiler = new Compiler('3 * 3; 1 + 1;');

	it('should have an input', () => {
		assert.equal(compiler.input, '3 * 3; 1 + 1;');
	});

	it('should have an output', () => {
		compiler.run();
		assert.equal(compiler.output, '3 * 3;1 + 1;');
	});
});
