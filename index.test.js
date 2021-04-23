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

		const ast = {
			type: 'Program',
			body: [{
				type: 'StringLiteral',
				value: 'hello world'
			}]
		};

		const newAst = {
			type: 'Program',
			body: [{
				type: 'StringLiteral',
				value: 'hello world'
			}]
		};

		assert.deepStrictEqual(tokenizer(input), tokens);
		assert.deepStrictEqual(parser(tokens), ast);
		assert.deepStrictEqual(transformer(ast), newAst);
		assert.deepStrictEqual(codeGenerator(newAst), output);
		assert.deepStrictEqual(compiler(input), output);
	});
});
