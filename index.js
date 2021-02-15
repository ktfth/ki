'use strict';
const assert = require('assert');

// Introduction
//
// That language are created to be small, flexible and sophisticated
// with all features like:
//   - variables context control
//   - functions, lambdas and pattern matching
//   - procedures and parallel processing
//   - modular
//   - expressive

function tokenizer(input) {
  let current = 0;
  let tokens = [];

  while (current < input.length) {
    let char = input[current];

    if (char === '(') {
      tokens.push({
        type: 'paren',
        value: '(',
      });
      current++;
      continue;
    }

    if (char === ')') {
      tokens.push({
        type: 'paren',
        value: ')',
      });
      current++;
      continue;
    }

    let WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    let BREAKLINE = /\n/;
    if (BREAKLINE.test(char)) {
      current++;
      continue;
    }

    let ASSIGNMENT = /\=/;
    if (ASSIGNMENT.test(char)) {
      tokens.push({ type: 'assignment', value: '=' });
      current++;
      continue;
    }

    let DELIMITER = /\;/;
    if (DELIMITER.test(char)) {
      tokens.push({ type: 'delimiter', value: ';' });
      current++;
      continue;
    }

    let NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let value = '';

      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({ type: 'number', value });

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

    let LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      let value = '';

      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }

      if (value === 'let' || value === 'print') {
        tokens.push({ type: 'keyword', value });
      } else {
        tokens.push({ type: 'name', value });
      }

      continue;
    }

    throw new TypeError('Unknown char: "' + char + '"');
  }

  return tokens;
}

function parser(tokens) {
  let current = 0;
  let _cacheToken = null;
  let _cacheNodes = [];

  function walk(isParam = false) {
    let token = tokens[current];

    if (token.type === 'number') {
      current++;

      return {
        type: 'NumberLiteral',
        value: token.value,
      };
    }

    if (token.type === 'string') {
      current++;

      return {
        type: 'StringLiteral',
        value: token.value,
      };
    }

    if (
      token.type === 'keyword' &&
      token.value === 'let'
    ) {
      token = tokens[++current];

      let node = {
        type: 'AssignmentExpression',
        name: token.value,
      };

      token = tokens[++current];

      if (token.type === 'assignment') {
        token = tokens[++current];
        node.value = walk();
      }

      if (
        token.type === 'delimiter' &&
        token.value === ';'
      ) {
        current++;
      }

      _cacheNodes.push(node);

      return node;
    }

    if (
      token.type === 'paren' &&
      token.value === '('
    ) {
      token = tokens[++current];

      let node = {
        type: 'CallExpression',
        name: token.value,
        params: [],
      };

      if (_cacheToken !== null) {
        node.name = _cacheToken.value;
        _cacheToken = null;
      }

      while (
        (token.type !== 'paren') ||
        (token.type === 'paren' && token.value !== ')')
      ) {
        node.params.push(walk(true));
        token = tokens[++current];
      }

      current++;

      return node;
    }

    function copy(obj) {
      let out = {};
      Object.keys(obj).forEach(k => out[k] = obj[k]);
      return out;
    }

    if (isParam && _cacheNodes.length) {
      let currentNode = null;
      if (!currentNode && _cacheNodes.length !== 0) {
        currentNode = copy(_cacheNodes[_cacheNodes.length - 1]);
        if (currentNode.type === 'AssignmentExpression') {
          currentNode.type = 'Accessment';
        }
        _cacheNodes.pop();
      }
      return currentNode;
    }

    if (
      token.type === 'delimiter' &&
      token.value === ';'
    ) {
      token = tokens[++current];
      return;
    }

    if (
      token.type === 'keyword' &&
      token.value === 'print'
    ) {
      _cacheToken = token;
      token = tokens[++current];
      return;
    }

    throw new TypeError(token.type);
  }

  let ast = {
    type: 'Program',
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
    ast.body = ast.body.filter(v => v !== undefined);
  }

  return ast;
}

function traverser(ast, visitor) {
  function traverseArray(array, parent) {
    array.forEach(child => {
      traverseNode(child, parent);
    });
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
      case 'CallExpression':
        traverseArray(node.params, node);
        break;
      case 'AssignmentExpression':
      case 'Accessment':
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
    Accessment: {
      enter(node, parent) {
        parent._context.push({
          type: 'Accessment',
          value: node.name,
        });
      }
    },

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

    CallExpression: {
      enter(node, parent) {
        let expression = {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: node.name,
          },
          arguments: []
        };

        node._context = expression.arguments;

        if (parent.type !== 'CallExpression') {
          expression = {
            type: 'ExpressionStatement',
            expression: expression,
          }
        }

        parent._context.push(expression);
      }
    },

    AssignmentExpression: {
      enter(node, parent) {
        let expression = {
          type: 'AssignmentStatement',
          expression: {
            type: 'AssignmentExpression',
            register: {
              type: node.value.type,
              name: node.name,
              value: node.value.value
            }
          }
        };

        parent._context.push(expression);
      }
    },
  });

  return newAst;
}

function codeGenerator(node) {
  switch (node.type) {
    case 'Program':
      return node.body.map(codeGenerator)
        .join('\n');
    case 'ExpressionStatement':
      return (
        codeGenerator(node.expression) +
        ';'
      );
    case 'CallExpression':
      return (
        codeGenerator(node.callee) +
        '(' +
        node.arguments.map(codeGenerator)
          .join(', ') +
        ')'
      );
    case 'AssignmentStatement':
      return (
        'var ' +
        node.expression.register.name +
        ' = ' + node.expression.register.value +
        ';'
      );
    case 'Accessment':
      return node.value;
    case 'Identifier':
      if (node.name === 'print') node.name = 'console.log';
      return node.name;
    case 'StringLiteral':
      return '"' + node.value + '"';
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

const input = `
  let x = 10;
  print(x);
`;

const output = `var x = 10;\nconsole.log(x);`;

const tokens = [
  { type: 'keyword', value: 'let' },
  { type: 'name', value: 'x' },
  { type: 'assignment', value: '=' },
  { type: 'number', value: '10' },
  { type: 'delimiter', value: ';' },
  { type: 'keyword', value: 'print' },
  { type: 'paren', value: '(' },
  { type: 'name', value: 'x' },
  { type: 'paren', value: ')' },
  { type: 'delimiter', value: ';' }
];

const ast = {
  type: 'Program',
  body: [{
    type: 'AssignmentExpression',
    name: 'x',
    value: {
      type: 'NumberLiteral',
      value: '10'
    }
  }, {
    type: 'CallExpression',
    name: 'print',
    params: [{
      type: 'Accessment',
      name: 'x',
      value: {
        type: 'NumberLiteral',
        value: '10'
      }
    }]
  }]
};

const newAst = {
  type: 'Program',
  body: [{
    type: 'AssignmentStatement',
    expression: {
      type: 'AssignmentExpression',
      register: {
        type: 'NumberLiteral',
        name: 'x',
        value: '10'
      }
    }
  }, {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'print'
      },
      arguments: [{
        type: 'Accessment',
        value: 'x'
      }]
    }
  }]
};

assert.deepStrictEqual(tokenizer(input), tokens);
assert.deepStrictEqual(parser(tokens), ast);
assert.deepStrictEqual(transformer(ast), newAst);
assert.deepStrictEqual(codeGenerator(newAst), output);
assert.deepStrictEqual(compiler(input), output);

module.exports = {
  tokenizer,
  parser,
  traverser,
  transformer,
  codeGenerator,
  compiler,
};
