'use strict';
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

    throw new TypeError('Unknown char: "' + char + '"');
  }

  return tokens;
}

function parser(tokens) {
  let current = 0;

  function walk(opts={}) {
    let token = tokens[current];

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

    if (
      token !== undefined &&
      (
				token.type === 'operation' &&
				token.value === '+'
			)
    ) {
			// Checking the usage of resources #DEBUG#
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
			// Checking the usage of resources #DEBUG#
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
			// Checking the usage of resources #DEBUG#
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
			// Checking the usage of resources #DEBUG#
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

    throw new TypeError(token.type);
  }

  let ast = {
    type: 'Program',
    body: [],
  };

	function copy(o) {
		let out = {};
		Object.keys(o).forEach(k => out[k] = o[k]);
		return out;
	}

  while (current < tokens.length) {
    ast.body.push(walk());
		ast.body = ast.body.filter(b => b !== undefined);

		let operationExclude = [];

		ast.body = ast.body.map((b, i) => {
			if (b.type === 'OperationExpression' && ast.body[i + 1] !== undefined && ast.body[i + 1].type === 'OperationExpression') {
				if (JSON.stringify(b.values[b.values.length - 1]) === JSON.stringify(ast.body[i + 1].values[0])) {
					b.values.pop();
					b.values.push(ast.body[i + 1]);
					operationExclude.push(i + 1);
				}

				if (
					b.values[b.values.length - 1].type === 'OperationExpression' &&
					ast.body[i + 1] !== undefined &&
					ast.body[i + 1].type === 'OperationExpression'
				) {
					let bValues = b.values[b.values.length - 1];
					if (JSON.stringify(bValues.values[bValues.values.length - 1]) === JSON.stringify(ast.body[i + 1].values[0])) {
						bValues.values.pop();
						bValues.values.push(copy(ast.body[i + 1]));
						operationExclude.push(i + 1);
					}
				}
			}
			return b;
		});

		ast.body = ast.body.filter((v, i) => {
			if (operationExclude.indexOf(i) === -1) {
				return v;
			}
		});
  }

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
						v.values = v.values.map(w => {
							if (w.type === 'OperationExpression') {
								w = {
									type: 'OperationStatement',
									expression: w
								}
							}
							return w;
						});
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
		case 'OperationStatement':
			return (
				node.expression.values.map(codeGenerator).join(' ' + node.expression.operator + ' ')
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
