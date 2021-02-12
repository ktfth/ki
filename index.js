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
    }

    // throw new TypeError('Unknown char: "' + char + '"');
  }

  return tokens;
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
assert.deepStrictEqual(tokenize(input), tokens);
