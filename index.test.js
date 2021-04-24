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

		const ast = {
			type: 'Program',
			body: [{
				type: 'OperationExpression',
				operator: '-',
				values: [{
					type: 'NumberLiteral',
					value: '1',
				}, {
					type: 'NumberLiteral',
					value: '1'
				}, {
					type: 'NumberLiteral',
					value: '1'
				}]
			}]
		};

		const newAst = {
			type: 'Program',
			body: [{
				type: 'OperationStatement',
				expression: {
					type: 'OperationExpression',
					operator: '-',
					values: [{
						type: 'NumberLiteral',
						value: '1',
					}, {
						type: 'NumberLiteral',
						value: '1'
					}, {
						type: 'NumberLiteral',
						value: '1'
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

	it('should be a negative number', () => {
		const input = `-1 + 1`;
		const output = `-1 + 1`;

		const tokens = [
			{ type: 'number', value: '-1' },
			{ type: 'operation', value: '+' },
			{ type: 'number', value: '1' },
		];

		const ast = {
			type: 'Program',
			body: [{
				type: 'OperationExpression',
				operator: '+',
				values: [{
					type: 'NumberLiteral',
					value: '-1',
				}, {
					type: 'NumberLiteral',
					value: '1'
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
						value: '-1',
					}, {
						type: 'NumberLiteral',
						value: '1'
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

	it('should be mult operation', () => {
		const input = `5 * 5`;
		const output = `5 * 5`;

		const tokens = [
			{ type: 'number', value: '5' },
			{ type: 'operation', value: '*' },
			{ type: 'number', value: '5' },
		];

		const ast = {
			type: 'Program',
			body: [{
				type: 'OperationExpression',
				operator: '*',
				values: [{
					type: 'NumberLiteral',
					value: '5',
				}, {
					type: 'NumberLiteral',
					value: '5'
				}]
			}]
		};

		const newAst = {
			type: 'Program',
			body: [{
				type: 'OperationStatement',
				expression: {
					type: 'OperationExpression',
					operator: '*',
					values: [{
						type: 'NumberLiteral',
						value: '5',
					}, {
						type: 'NumberLiteral',
						value: '5'
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

	it('should be div operation', () => {
		const input = `6 / 2`;
		const output = `6 / 2`;

		const tokens = [
			{ type: 'number', value: '6' },
			{ type: 'operation', value: '/' },
			{ type: 'number', value: '2' },
		];

		const ast = {
			type: 'Program',
			body: [{
				type: 'OperationExpression',
				operator: '/',
				values: [{
					type: 'NumberLiteral',
					value: '6',
				}, {
					type: 'NumberLiteral',
					value: '2'
				}]
			}]
		};

		const newAst = {
			type: 'Program',
			body: [{
				type: 'OperationStatement',
				expression: {
					type: 'OperationExpression',
					operator: '/',
					values: [{
						type: 'NumberLiteral',
						value: '6',
					}, {
						type: 'NumberLiteral',
						value: '2'
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

	it('should be a multiple expression operation', () => {
		const input = `2 + 5 * 2`;
		const output = `2 + 5 * 2`;

		const tokens = [
			{ type: 'number', value: '2' },
			{ type: 'operation', value: '+' },
			{ type: 'number', value: '5' },
			{ type: 'operation', value: '*' },
			{ type: 'number', value: '2' },
		];

		const ast = {
			type: 'Program',
			body: [{
				type: 'OperationExpression',
				operator: '+',
				values: [{
					type: 'NumberLiteral',
					value: '2',
				}, {
					type: 'OperationExpression',
					operator: '*',
					values: [{
						type: 'NumberLiteral',
						value: '5',
					}, {
						type: 'NumberLiteral',
						value: '2'
					}]
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
						value: '2',
					}, {
						type: 'OperationStatement',
						expression: {
							type: 'OperationExpression',
							operator: '*',
							values: [{
								type: 'NumberLiteral',
								value: '5',
							}, {
								type: 'NumberLiteral',
								value: '2'
							}]
						}
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

	it('should be a multiple expression operation with deep level', () => {
		const input = `2 + 5 * 2 - 1`;
		const output = `2 + 5 * 2 - 1`;

		const tokens = [
			{ type: 'number', value: '2' },
			{ type: 'operation', value: '+' },
			{ type: 'number', value: '5' },
			{ type: 'operation', value: '*' },
			{ type: 'number', value: '2' },
			{ type: 'operation', value: '-' },
			{ type: 'number', value: '1' },
		];

		const ast = {
			type: 'Program',
			body: [{
				type: 'OperationExpression',
				operator: '+',
				values: [{
					type: 'NumberLiteral',
					value: '2',
				}, {
					type: 'OperationExpression',
					operator: '*',
					values: [{
						type: 'NumberLiteral',
						value: '5',
					}, {
						type: 'OperationExpression',
						operator: '-',
						values: [{
							type: 'NumberLiteral',
							value: '2'
						}, {
							type: 'NumberLiteral',
							value: '1'
						}]
					}]
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
						value: '2',
					}, {
						type: 'OperationStatement',
						expression: {
							type: 'OperationExpression',
							operator: '*',
							values: [{
								type: 'NumberLiteral',
								value: '5',
							}, {
								type: 'OperationStatement',
								expression: {
									type: 'OperationExpression',
									operator: '-',
									values: [{
										type: 'NumberLiteral',
										value: '2',
									}, {
										type: 'NumberLiteral',
										value: '1'
									}]
								}
							}]
						}
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

	it('should be a deep multiple operation', () => {
		const input = `2 + 5 * 2 - 1 + 3`;
		const output = `2 + 5 * 2 - 1 + 3`;

		assert.deepStrictEqual(compiler(input), output);
	});
});
