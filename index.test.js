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

	it('should be a number', () => {
		const input = `10`;
		const output = `10`;

		const tokens = [
			{ type: 'number', value: '10' },
		];

		const ast = {
			type: 'Program',
			body: [{
				type: 'NumberLiteral',
				value: '10'
			}]
		};

		const newAst = {
			type: 'Program',
			body: [{
				type: 'NumberLiteral',
				value: '10'
			}]
		};

		assert.deepStrictEqual(tokenizer(input), tokens);
		assert.deepStrictEqual(parser(tokens), ast);
		assert.deepStrictEqual(transformer(ast), newAst);
		assert.deepStrictEqual(codeGenerator(newAst), output);
		assert.deepStrictEqual(compiler(input), output);
	});

	it('should be a operation', () => {
		const input = `10 + 10`;
		const output = `10 + 10`;

		const tokens = [
			{ type: 'number', value: '10' },
			{ type: 'operation', value: '+' },
			{ type: 'number', value: '10' },
		];

		const ast = {
			type: 'Program',
			body: [{
				type: 'OperationExpression',
				operator: '+',
				values: [{
					type: 'NumberLiteral',
					value: '10',
				}, {
					type: 'NumberLiteral',
					value: '10'
				}]
			}]
		};

		const newAst = {
			type: 'Program',
			body: [{
				type: 'OperationStatement',
				expression: {
					type: 'OperationExpression',
					operator: '+',
					values: [{
						type: 'NumberLiteral',
						value: '10',
					}, {
						type: 'NumberLiteral',
						value: '10'
					}]
				}
			}]
		};

		assert.deepStrictEqual(tokenizer(input), tokens);
		assert.deepStrictEqual(parser(tokens), ast);
		assert.deepStrictEqual(transformer(ast), newAst);
		assert.deepStrictEqual(codeGenerator(newAst), output);
		assert.deepStrictEqual(compiler(input), output);
	});

	it('should be a multiple operation', () => {
		const input = `10 + 10 + 10`;
		const output = `10 + 10 + 10`;

		const tokens = [
			{ type: 'number', value: '10' },
			{ type: 'operation', value: '+' },
			{ type: 'number', value: '10' },
			{ type: 'operation', value: '+' },
			{ type: 'number', value: '10' },
		];

		const ast = {
			type: 'Program',
			body: [{
				type: 'OperationExpression',
				operator: '+',
				values: [{
					type: 'NumberLiteral',
					value: '10',
				}, {
					type: 'NumberLiteral',
					value: '10'
				}, {
					type: 'NumberLiteral',
					value: '10'
				}]
			}]
		};

		const newAst = {
			type: 'Program',
			body: [{
				type: 'OperationStatement',
				expression: {
					type: 'OperationExpression',
					operator: '+',
					values: [{
						type: 'NumberLiteral',
						value: '10',
					}, {
						type: 'NumberLiteral',
						value: '10'
					}, {
						type: 'NumberLiteral',
						value: '10'
					}]
				}
			}]
		};

		assert.deepStrictEqual(tokenizer(input), tokens);
		assert.deepStrictEqual(parser(tokens), ast);
		assert.deepStrictEqual(transformer(ast), newAst);
		assert.deepStrictEqual(codeGenerator(newAst), output);
		assert.deepStrictEqual(compiler(input), output);
	});

	it('should be a sub operation', () => {
		const input = `1 - 1 - 1`;
		const output = `1 - 1 - 1`;

		const tokens = [
			{ type: 'number', value: '1' },
			{ type: 'operation', value: '-' },
			{ type: 'number', value: '1' },
			{ type: 'operation', value: '-' },
			{ type: 'number', value: '1' },
		];

		assert.deepStrictEqual(tokenizer(input), tokens);
	});
});
