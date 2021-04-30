'use strict';
const _ = require('lodash');
const { lexer } = require('./lexer');

function tokenizer(input) {
  let current = 0;
  let tokens = [];

  while (current < input.length) {
    let char = input[current];

		let NUMBERS = /\-|[0-9]/;

		if (['+', '-', '*', '/'].includes(char) && !NUMBERS.test(input[current + 1])) {
      tokens.push({ type: 'operation', value: char });
      current++;
      continue;
    }

    if (NUMBERS.test(char)) {
      let value = '';

      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({ type: 'number', value });

      continue;
    }

		// BREAKLINE and WHITESPACE has the same result
    if (/\n|\s/.test(char)) {
      current++;
      continue;
    }

    if (char === '"') {
      let value = '';

      char = input[++current];

      while (char !== '"') {
        value += char;
        char = input[++current];
      }

      char = input[++current];

      tokens.push({ type: 'string', value });

      continue;
    }

		let ASSIGNMENT = /[a-z]|[A-Z]|\_/;
		if (ASSIGNMENT.test(char)) {
			let value = '';

			while (ASSIGNMENT.test(char)) {
				value += char;
				char = input[++current];
			}

			tokens.push({ type: 'id', value });

			continue;
		}

		if (/\=/.test(char)) {
			tokens.push({ type: 'equal', value: '=' });
			current++;
			continue;
		}

    throw new TypeError('Unknown char: "' + char + '"');
  }

  return tokens;
}

function copy(o) {
	let out = {};
	if (o) {
		Object.keys(o).forEach(k => out[k] = o[k]);
	}
	return out;
}

function parser(tokens) {
  let current = 0;

  function walk(opts={}) {
    let token = tokens[current];

    if (
      token !== undefined &&
      (
				token.type === 'operation' &&
				token.value === '+'
			)
    ) {
      let node = {
        type: 'OperationExpression',
        operator: token.value,
        values: []
      };

			token = tokens[--current];
			let w = walk({ isSub: true });
			node.values.push(w);

			while (
				tokens[current] !== undefined &&
				(
					tokens[current]['type'] === 'operation' &&
					tokens[current]['value'] === '+'
				)
			) {
				token = tokens[current++];
				node.values.push(walk({ isSub: true }));
			}

      return node;
    }

		if (
      token !== undefined &&
      (
				token.type === 'operation' &&
				token.value === '-'
			)
    ) {
      let node = {
        type: 'OperationExpression',
        operator: token.value,
        values: []
      };

			token = tokens[--current];
			let w = walk({ isSub: true });
			node.values.push(w);

			while (
				tokens[current] !== undefined &&
				(
					tokens[current]['type'] === 'operation' &&
					tokens[current]['value'] === '-'
				)
			) {
				token = tokens[current++];
				node.values.push(walk({ isSub: true }));
			}

      return node;
    }

		if (
      token !== undefined &&
      (
				token.type === 'operation' &&
				token.value === '*'
			)
    ) {
      let node = {
        type: 'OperationExpression',
        operator: token.value,
        values: []
      };

			token = tokens[--current];
			let w = walk({ isSub: true });
			node.values.push(w);

			while (
				tokens[current] !== undefined &&
				(
					tokens[current]['type'] === 'operation' &&
					tokens[current]['value'] === '*'
				)
			) {
				token = tokens[current++];
				node.values.push(walk({ isSub: true }));
			}

      return node;
    }

		if (
      token !== undefined &&
      (
				token.type === 'operation' &&
				token.value === '/'
			)
    ) {
      let node = {
        type: 'OperationExpression',
        operator: token.value,
        values: []
      };

			token = tokens[--current];
			let w = walk({ isSub: true });
			node.values.push(w);

			while (
				tokens[current] !== undefined &&
				(
					tokens[current]['type'] === 'operation' &&
					tokens[current]['value'] === '/'
				)
			) {
				token = tokens[current++];
				node.values.push(walk({ isSub: true }));
			}

      return node;
    }

		if (
			token !== undefined &&
			(
				token.type === 'id'
			)
		) {
			let node = {
				type: 'AssignmentExpression',
				name: token.value,
				value: {}
			};

			token = tokens[++current];

			node.operator = token.value;

			token = tokens[++current];

			if (
				tokens[current + 1] !== undefined &&
				tokens[current + 1].type === 'operation'
			) {
				token = tokens[++current];
			}

			node.value = walk({ isSub: true });

			return node;
		}

		if (
			token !== undefined &&
			token.type === 'number'
		) {
			if (tokens[current + 1] !== undefined && tokens[current + 1]['type'] === 'operation' && !opts.isSub) {
				current += 1;
				return;
			}
			if (tokens[current - 1] !== undefined && tokens[current - 1]['type'] === 'operation' && !opts.isSub) {
				current += 1;
				return;
			}
      return lexer(token, () => current++);
    }

    if (token !== undefined && token.type === 'string') {
      return lexer(token, () => current++);
    }

    throw new TypeError(token.type);
  }

  let ast = {
    type: 'Program',
    body: [],
  };

	let operationNode = undefined;

  while (current < tokens.length) {
    ast.body.push(walk());
		ast.body = ast.body.filter(b => b !== undefined);

		let operationExclude = [];
		let assignmentExclude = [];

		ast.body = ast.body.map((b, i) => {
			if (b.type === 'OperationExpression' && ast.body[i + 1] !== undefined && ast.body[i + 1].type === 'OperationExpression') {
				let a1 = copy(b.values[b.values.length - 1]);
				let b1 = ast.body[i + 1].values[0];
				if (_.isEqual(a1, b1)) {
					b.values.pop();
					b.values.push(ast.body[i + 1]);
					operationExclude.push(i + 1);
				}

				let bValues = b.values[b.values.length - 1];

				decoupleOperation:
				while (
					bValues !== undefined &&
					bValues.type === 'OperationExpression' &&
					ast.body[i + 1] !== undefined &&
					ast.body[i + 1].type === 'OperationExpression'
				) {
					let a2 = copy(bValues.values[bValues.values.length - 1]);
					let b2 = copy(ast.body[i + 1].values[0]);

					operationNode = b.values[b.values.length - 1];

					if (
						a2.values === undefined &&
						operationNode !== undefined &&
						_.isEqual(operationNode, ast.body[i + 1])
					) {
						break;
					}

					if (
						a2.values === undefined &&
						operationNode !== undefined &&
						operationNode.values !== undefined &&
						_.isEqual(
							operationNode.values[operationNode.values.length - 1],
							ast.body[i + 1]
						)
					) {
						break;
					}

					while (
						operationNode !== undefined &&
						operationNode.values !== undefined
					) {
						if (
							a2.values === undefined &&
							operationNode.values !== undefined &&
							operationNode.values[operationNode.values.length - 1] !== undefined &&
							_.isEqual(
								operationNode.values[operationNode.values.length - 1],
								ast.body[i + 1]
							)
						) {
							break decoupleOperation;
						}

						if (operationNode !== undefined && operationNode.values !== undefined) {
							operationNode = operationNode.values[operationNode.values.length - 1];
						}
					}

					if (_.isEqual(a2, b2)) {
						bValues.values.pop();
						bValues.values.push(copy(ast.body[i + 1]));
						operationExclude.push(i + 1);
					}
					bValues = copy(bValues.values[bValues.values.length - 1]);
				}
			}
			return b;
		});

		ast.body = ast.body.filter((v, i) => {
			if (operationExclude.indexOf(i) === -1) {
				return v;
			}
		});

		ast.body = ast.body.map((b, i) => {
			if (b.type === 'AssignmentExpression' && ast.body[i + 1] !== undefined && ast.body[i + 1].type === 'OperationExpression') {
				if (b.value.type !== 'OperationExpression') {
					b.value = ast.body[i + 1];
				}

				if (b.value.type === 'OperationExpression') {
					let a1 = copy(b.value.values[b.value.values.length - 1]);
					let b1 = copy(ast.body[i + 1].values[0]);
					if (_.isEqual(a1, b1)) {
						b.value.values.pop();
						b.value.values.push(copy(ast.body[i + 1]));
					}
				}
			}
			return b;
		});
  }

	let body = [];

	let hasAssignmentExpression = false;

	for (let i = 0; i < ast.body.length; i += 1) {
		if (ast.body[i].type === 'AssignmentExpression') {
			body.push(ast.body[i]);
			hasAssignmentExpression = true;
		} else if (hasAssignmentExpression && ast.body[i].type !== 'OperationExpression') {
			body.push(ast.body[i]);
			hasAssignmentExpression = false;
		} else if (hasAssignmentExpression && ast.body[i].type === 'OperationExpression') {
			hasAssignmentExpression = false;
		} else {
			body.push(ast.body[i]);
		}
	}

	ast.body = body;

  return ast;
}

function traverser(ast, visitor) {
  function traverseArray(array, parent) {
    if (array !== undefined) {
      array.forEach(child => {
        traverseNode(child, parent);
      });
    }
  }

  function traverseNode(node, parent) {
    let methods = visitor[node.type];

    if (methods && methods.enter) {
      methods.enter(node, parent);
    }

    switch (node.type) {
      case 'Program':
        traverseArray(node.body, node);
        break;
			case 'AssignmentExpression':
      case 'OperationExpression':
      case 'NumberLiteral':
      case 'StringLiteral':
        break;
      default:
        throw new TypeError(node.type);
    }

    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }

  traverseNode(ast, null);
}

function transformer(ast) {
  let newAst = {
    type: 'Program',
    body: [],
  };

  ast._context = newAst.body;

  traverser(ast, {
    NumberLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'NumberLiteral',
          value: node.value,
        });
      }
    },

    StringLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'StringLiteral',
          value: node.value
        });
      }
    },

    OperationExpression: {
      enter(node, parent) {
				let expression = {
					type: 'OperationStatement',
					expression: {
						type: 'OperationExpression',
						operator: node.operator,
						values: node.values,
					}
				};
				expression.expression.values = expression.expression.values.map(v => {
					if (v.type === 'OperationExpression') {
						let value = v;
						while (value !== undefined && value.values !== undefined) {
							for (let i = 0; i < value.values.length; i += 1) {
								let w = value.values[i];
								if (w.type === 'OperationExpression') {
									value.values[i] = {
										type: 'OperationStatement',
										expression: w
									};
								}
							}
							value = copy(value.values[1].expression);
						}
						v = {
							type: 'OperationStatement',
							expression: v
						};
					}
					return v;
				});
				parent._context.push(expression);
			}
    },

		AssignmentExpression: {
			enter(node, parent) {
				let expression = {
					type: 'AssignmentStatement',
					expression: {
						type: 'AssignmentExpression',
						operator: node.operator,
						name: node.name,
						value: node.value
					}
				};
				if (expression.expression.value.type === 'OperationExpression') {
					expression.expression.value.values = expression.expression.value.values.map(v => {
						if (v.type === 'OperationExpression') {
							let value = v;
							while (value !== undefined && value.values !== undefined) {
								for (let i = 0; i < value.values.length; i += 1) {
									let w = value.values[i];
									if (w.type === 'OperationExpression') {
										value.values[i] = {
											type: 'OperationStatement',
											expression: w
										};
									}
								}
								value = copy(value.values[1].expression);
							}
							v = {
								type: 'OperationStatement',
								expression: v
							};
						}
						return v;
					});
					expression.expression.value = {
						type: 'OperationStatement',
						expression: expression.expression.value
					};
				}
				parent._context.push(expression);
			}
		}
  });

  return newAst;
}

function codeGenerator(node) {
  let isArgument = false;
  let insideArguments = [];
  switch (node.type) {
    case 'Program':
      return node.body.map(codeGenerator)
        .join('\n');
		case 'AssignmentStatement':
			return (
				node.expression.name +
				' ' + node.expression.operator + ' ' +
				codeGenerator(node.expression.value)
			);
		case 'OperationStatement':
			return (
				node.expression.values.map(codeGenerator).join(' ' + node.expression.operator + ' ')
			);
		case 'OperationExpression':
			return (
				node.values.map(codeGenerator).join(' ' + node.operator + ' ')
			);
    case 'StringLiteral':
      return '"' + node.value + '"';
    case 'NumberLiteral':
      return '' + node.value + '';
    default:
      throw new TypeError(node.type);
  }
}

function compiler(input) {
  let tokens = tokenizer(input);
  let ast = parser(tokens);
  let newAst = transformer(ast);
  let output = codeGenerator(newAst);

  return output;
}

module.exports = {
  tokenizer,
  parser,
  traverser,
  transformer,
  codeGenerator,
  compiler,
};
