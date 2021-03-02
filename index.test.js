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
  it('should compile the minimal language behavior', () => {
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
  });

  it('should register a function', () => {
    const input = `
      fun greeting() {
        return "hello world!";
      }
    `;

    const output = `function greeting(){return "hello world!";}`;

    const tokens = [
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'greeting' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'return' },
      { type: 'string', value: 'hello world!' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'FunctionExpression',
        name: 'greeting',
        params: [],
        block: [{
          type: 'ReturnExpression',
          name: 'return',
          values: [{
            type: 'StringLiteral',
            value: 'hello world!'
          }]
        }]
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'FunctionStatement',
        expression: {
          type: 'FunctionExpression',
          name: 'greeting',
          params: [],
          block: [{
            type: 'ReturnStatement',
            name: 'return',
            expression: {
              type: 'ReturnExpression',
              values: [{
                type: 'StringLiteral',
                value: 'hello world!'
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

  it('should call a function', () => {
    const input = `
      fun greeting() {
        return "hello world!";
      }
      print(greeting());
    `;

    const output = `function greeting(){return "hello world!";}\nconsole.log(greeting());`;

    const tokens = [
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'greeting' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'return' },
      { type: 'string', value: 'hello world!' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
      { type: 'keyword', value: 'print' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'greeting' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: ')' },
      { type: 'delimiter', value: ';' }
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'FunctionExpression',
        name: 'greeting',
        params: [],
        block: [{
          type: 'ReturnExpression',
          name: 'return',
          values: [{
            type: 'StringLiteral',
            value: 'hello world!'
          }]
        }]
      }, {
        type: 'CallExpression',
        name: 'print',
        params: [{
          type: 'CallExpression',
          name: 'greeting',
          params: []
        }]
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'FunctionStatement',
        expression: {
          type: 'FunctionExpression',
          name: 'greeting',
          params: [],
          block: [{
            type: 'ReturnStatement',
            name: 'return',
            expression: {
              type: 'ReturnExpression',
              values: [{
                type: 'StringLiteral',
                value: 'hello world!'
              }]
            }
          }]
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
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              arguments: [],
              callee: {
                type: 'Identifier',
                name: 'greeting'
              }
            }
          }]
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast, 'producing a different ast');
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should a function receive argument', () => {
    const input = `
      fun greeting(name) {
        return name;
      }
    `;

    const output = `function greeting(name){return name;}`;

    const tokens = [
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'greeting' },
      { type: 'paren', value: '(' },
      { type: 'param', value: 'name' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'return' },
      { type: 'keyword', value: 'name' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'FunctionExpression',
        name: 'greeting',
        params: [{
          type: 'Argument',
          value: 'name'
        }],
        block: [{
          type: 'ReturnExpression',
          name: 'return',
          values: [{
            type: 'Accessment',
            value: 'name'
          }]
        }]
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'FunctionStatement',
        expression: {
          type: 'FunctionExpression',
          name: 'greeting',
          params: [{
            type: 'Argument',
            value: 'name'
          }],
          block: [{
            type: 'ReturnStatement',
            name: 'return',
            expression: {
              type: 'ReturnExpression',
              values: [{
                type: 'Accessment',
                value: 'name'
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

  it('should a function receive multiple arguments', () => {
    const input = `
      fun greeting(firstName, lastName) {}
    `;

    const output = `function greeting(firstName, lastName){}`;

    const tokens = [
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'greeting' },
      { type: 'paren', value: '(' },
      { type: 'param', value: 'firstName' },
      { type: 'comma', value: ',' },
      { type: 'param', value: 'lastName' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'block', value: '}' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'FunctionExpression',
        name: 'greeting',
        params: [{
          type: 'Argument',
          value: 'firstName'
        }, {
          type: 'Argument',
          value: 'lastName'
        }],
        block: []
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'FunctionStatement',
        expression: {
          type: 'FunctionExpression',
          name: 'greeting',
          params: [{
            type: 'Argument',
            value: 'firstName'
          }, {
            type: 'Argument',
            value: 'lastName'
          }],
          block: []
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should a function receive multiple arguments and return a statement', () => {
    const input = `
      fun greeting(firstName, lastName) {
        return firstName + " " + lastName;
      }
    `;

    const output = `function greeting(firstName, lastName){return firstName + " " + lastName;}`;

    const tokens = [
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'greeting' },
      { type: 'paren', value: '(' },
      { type: 'param', value: 'firstName' },
      { type: 'comma', value: ',' },
      { type: 'param', value: 'lastName' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'return' },
      { type: 'keyword', value: 'firstName' },
      { type: 'operation', value: '+' },
      { type: 'string', value: ' ' },
      { type: 'operation', value: '+' },
      { type: 'keyword', value: 'lastName' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'FunctionExpression',
        name: 'greeting',
        params: [{
          type: 'Argument',
          value: 'firstName'
        }, {
          type: 'Argument',
          value: 'lastName'
        }],
        block: [{
          type: 'ReturnExpression',
          name: 'return',
          values: [{
            type: 'Accessment',
            value: 'firstName'
          }, {
            type: 'StringLiteral',
            value: ' '
          }, {
            type: 'Accessment',
            value: 'lastName'
          }]
        }]
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'FunctionStatement',
        expression: {
          type: 'FunctionExpression',
          name: 'greeting',
          params: [{
            type: 'Argument',
            value: 'firstName'
          }, {
            type: 'Argument',
            value: 'lastName'
          }],
          block: [{
            type: 'ReturnStatement',
            name: 'return',
            expression: {
              type: 'ReturnExpression',
              values: [{
                type: 'Accessment',
                value: 'firstName'
              }, {
                type: 'StringLiteral',
                value: ' '
              }, {
                type: 'Accessment',
                value: 'lastName'
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

  it('should a function receive multiple arguments, return a statement and can be called', () => {
    const input = `
      fun greeting(firstName, lastName) {
        return firstName + " " + lastName;
      }
      print(greeting("John", "Doe"));
    `;

    const output = `function greeting(firstName, lastName){return firstName + " " + lastName;}\nconsole.log(greeting("John", "Doe"));`;

    const tokens = [
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'greeting' },
      { type: 'paren', value: '(' },
      { type: 'param', value: 'firstName' },
      { type: 'comma', value: ',' },
      { type: 'param', value: 'lastName' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'return' },
      { type: 'keyword', value: 'firstName' },
      { type: 'operation', value: '+' },
      { type: 'string', value: ' ' },
      { type: 'operation', value: '+' },
      { type: 'keyword', value: 'lastName' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
      { type: 'keyword', value: 'print' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'greeting' },
      { type: 'paren', value: '(' },
      { type: 'string', value: 'John' },
      { type: 'comma', value: ',' },
      { type: 'string', value: 'Doe' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: ')' },
      { type: 'delimiter', value: ';' }
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'FunctionExpression',
        name: 'greeting',
        params: [{
          type: 'Argument',
          value: 'firstName'
        }, {
          type: 'Argument',
          value: 'lastName'
        }],
        block: [{
          type: 'ReturnExpression',
          name: 'return',
          values: [{
            type: 'Accessment',
            value: 'firstName'
          }, {
            type: 'StringLiteral',
            value: ' '
          }, {
            type: 'Accessment',
            value: 'lastName'
          }]
        }]
      }, {
        type: 'CallExpression',
        name: 'print',
        params: [{
          type: 'CallExpression',
          name: 'greeting',
          params: [{
            type: 'StringLiteral',
            value: 'John'
          }, {
            type: 'StringLiteral',
            value: 'Doe'
          }]
        }]
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'FunctionStatement',
        expression: {
          type: 'FunctionExpression',
          name: 'greeting',
          params: [{
            type: 'Argument',
            value: 'firstName'
          }, {
            type: 'Argument',
            value: 'lastName'
          }],
          block: [{
            type: 'ReturnStatement',
            name: 'return',
            expression: {
              type: 'ReturnExpression',
              values: [{
                type: 'Accessment',
                value: 'firstName'
              }, {
                type: 'StringLiteral',
                value: ' '
              }, {
                type: 'Accessment',
                value: 'lastName'
              }]
            }
          }]
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
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              arguments: [{
                type: 'StringLiteral',
                value: 'John'
              }, {
                type: 'StringLiteral',
                value: 'Doe'
              }],
              callee: {
                type: 'Identifier',
                name: 'greeting'
              }
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

  it('should a function return a sum', () => {
    const input = `
      fun sum(a, b) {
        return a + b;
      }
    `;

    const output = `function sum(a, b){return a + b;}`;

    const tokens = [
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'sum' },
      { type: 'paren', value: '(' },
      { type: 'param', value: 'a' },
      { type: 'comma', value: ',' },
      { type: 'param', value: 'b' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'return' },
      { type: 'keyword', value: 'a' },
      { type: 'operation', value: '+' },
      { type: 'keyword', value: 'b' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'FunctionExpression',
        name: 'sum',
        params: [{
          type: 'Argument',
          value: 'a'
        }, {
          type: 'Argument',
          value: 'b'
        }],
        block: [{
          type: 'ReturnExpression',
          name: 'return',
          values: [{
            type: 'Accessment',
            value: 'a'
          }, {
            type: 'Accessment',
            value: 'b'
          }]
        }]
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'FunctionStatement',
        expression: {
          type: 'FunctionExpression',
          name: 'sum',
          params: [{
            type: 'Argument',
            value: 'a'
          }, {
            type: 'Argument',
            value: 'b'
          }],
          block: [{
            type: 'ReturnStatement',
            name: 'return',
            expression: {
              type: 'ReturnExpression',
              values: [{
                type: 'Accessment',
                value: 'a'
              }, {
                type: 'Accessment',
                value: 'b'
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
  });
});
