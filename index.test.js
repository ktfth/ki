'use strict';
const assert = require('assert');
const {
  tokenizer,
  parser,
  traverser,
  transformer,
  codeGenerator,
  compiler
} = require('./');

describe('Ki', () => {
	it('should be a string', () => {
		const input = `"hello world"`;
		const output = `"hello world"`;

		const tokens = [
			{ type: 'string', value: 'hello world' }
		];

		assert.deepStrictEqual(tokenizer(input), tokens);
	});
});
