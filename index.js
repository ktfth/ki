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

function tokenize(input) {
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

function transformer(ast, visitor) {
  return ast;
}

const input = `
  let x = 10;
  print(x);
`;

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

assert.deepStrictEqual(tokenize(input), tokens);
assert.deepStrictEqual(parser(tokens), ast);
assert.deepStrictEqual(transformer(ast), newAst);
