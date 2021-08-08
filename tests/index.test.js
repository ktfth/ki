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

describe('Compiler variables', () => {
	let compiler = new Compiler('var a = 10;');

	it('should have an input', () => {
		assert.equal(compiler.input, 'var a = 10;');
	});

	it('should have an output', () => {
		compiler.run();
		assert.equal(compiler.output, 'var a = 10;');
	});
});

describe('Compiler variables special chars', () => {
  let compiler = new Compiler('var a1 = 10;');

  it('should have an input', () => {
    assert.equal(compiler.input, 'var a1 = 10;');
  });

  it('should have an output', () => {
    compiler.run();
    assert.equal(compiler.output, 'var a1 = 10;');
  });
});
