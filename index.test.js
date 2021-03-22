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
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should a function return a sum and receive arguments on call', () => {
    const input = `
      fun sum(a, b) {
        return a + b;
      }

      print(sum(10, 10));
    `;

    const output = `function sum(a, b){return a + b;}\nconsole.log(sum(10, 10));`;

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
      { type: 'keyword', value: 'print' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'sum' },
      { type: 'paren', value: '(' },
      { type: 'number', value: '10' },
      { type: 'comma', value: ',' },
      { type: 'number', value: '10' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: ')' },
      { type: 'delimiter', value: ';' }
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
      }, {
        type: 'CallExpression',
        name: 'print',
        params: [{
          type: 'CallExpression',
          name: 'sum',
          params: [{
            type: 'NumberLiteral',
            value: '10'
          }, {
            type: 'NumberLiteral',
            value: '10'
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
                type: 'NumberLiteral',
                value: '10'
              }, {
                type: 'NumberLiteral',
                value: '10'
              }],
              callee: {
                type: 'Identifier',
                name: 'sum'
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

  it('should manipulate code inside function blocks', () => {
    const input = `
      fun addTen(v) {
        v = v + 10;
        return v;
      }
    `;

    const output = `function addTen(v){v = v + 10;\nreturn v;}`;

    const tokens = [
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'addTen' },
      { type: 'paren', value: '(' },
      { type: 'param', value: 'v' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'v' },
      { type: 'assignment', value: '=' },
      { type: 'keyword', value: 'v' },
      { type: 'operation', value: '+' },
      { type: 'number', value: '10' },
      { type: 'delimiter', value: ';' },
      { type: 'keyword', value: 'return' },
      { type: 'keyword', value: 'v' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'FunctionExpression',
        name: 'addTen',
        params: [{
          type: 'Argument',
          value: 'v'
        }],
        block: [{
          type: 'ScopeAssignmentExpression',
          name: 'v',
          values: [{
            type: 'Accessment',
            value: 'v'
          }, {
            type: 'NumberLiteral',
            value: '10'
          }]
        }, {
          type: 'ReturnExpression',
          name: 'return',
          values: [{
            type: 'Accessment',
            value: 'v'
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
          name: 'addTen',
          params: [{
            type: 'Argument',
            value: 'v'
          }],
          block: [{
            type: 'ScopeAssignmentStatement',
            expression: {
              type: 'ScopeAssignmentExpression',
              name: 'v',
              registers: [{
                type: 'Accessment',
                value: 'v'
              }, {
                type: 'NumberLiteral',
                value: '10'
              }]
            }
          }, {
            type: 'ReturnStatement',
            name: 'return',
            expression: {
              type: 'ReturnExpression',
              values: [{
                type: 'Accessment',
                value: 'v'
              }]
            }
          }]
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst, 'transformation to the new ast');
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should receive multiple arguments for a operation', () => {
    const input = `
      fun addTenTwoTimes(v) {
        v = v + 10 + 10;
        return v;
      }
    `;

    const output = `function addTenTwoTimes(v){v = v + 10 + 10;\nreturn v;}`;

    const tokens = [
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'addTenTwoTimes' },
      { type: 'paren', value: '(' },
      { type: 'param', value: 'v' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'v' },
      { type: 'assignment', value: '=' },
      { type: 'keyword', value: 'v' },
      { type: 'operation', value: '+' },
      { type: 'number', value: '10' },
      { type: 'operation', value: '+' },
      { type: 'number', value: '10' },
      { type: 'delimiter', value: ';' },
      { type: 'keyword', value: 'return' },
      { type: 'keyword', value: 'v' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'FunctionExpression',
        name: 'addTenTwoTimes',
        params: [{
          type: 'Argument',
          value: 'v'
        }],
        block: [{
          type: 'ScopeAssignmentExpression',
          name: 'v',
          values: [{
            type: 'Accessment',
            value: 'v'
          }, {
            type: 'NumberLiteral',
            value: '10'
          }, {
            type: 'NumberLiteral',
            value: '10'
          }]
        }, {
          type: 'ReturnExpression',
          name: 'return',
          values: [{
            type: 'Accessment',
            value: 'v'
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
          name: 'addTenTwoTimes',
          params: [{
            type: 'Argument',
            value: 'v'
          }],
          block: [{
            type: 'ScopeAssignmentStatement',
            expression: {
              type: 'ScopeAssignmentExpression',
              name: 'v',
              registers: [{
                type: 'Accessment',
                value: 'v'
              }, {
                type: 'NumberLiteral',
                value: '10'
              }, {
                type: 'NumberLiteral',
                value: '10'
              }]
            }
          }, {
            type: 'ReturnStatement',
            name: 'return',
            expression: {
              type: 'ReturnExpression',
              values: [{
                type: 'Accessment',
                value: 'v'
              }]
            }
          }]
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast, 'parsing tokens to ast');
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should register more than one function', () => {
    const input = `
      fun a() {}
      fun b() {}
    `;

    const output = `function a(){}\nfunction b(){}`;

    const tokens = [
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'a' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'block', value: '}' },
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'b' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'block', value: '}' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'FunctionExpression',
        name: 'a',
        params: [],
        block: []
      }, {
        type: 'FunctionExpression',
        name: 'b',
        params: [],
        block: []
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'FunctionStatement',
        expression: {
          type: 'FunctionExpression',
          name: 'a',
          params: [],
          block: []
        }
      }, {
        type: 'FunctionStatement',
        expression: {
          type: 'FunctionExpression',
          name: 'b',
          params: [],
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

  it('should call an function inside a function block', () => {
    const input = `
      fun sum(a, b) {
        return a + b;
      }

      fun addTen(v) {
        v = sum(v, 10);
        return v;
      }
    `;

    const output = `function sum(a, b){return a + b;}\nfunction addTen(v){v = sum(v, 10);\nreturn v;}`;

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
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'addTen' },
      { type: 'paren', value: '(' },
      { type: 'param', value: 'v' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'v' },
      { type: 'assignment', value: '=' },
      { type: 'keyword', value: 'sum' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'v' },
      { type: 'comma', value: ',' },
      { type: 'number', value: '10' },
      { type: 'paren', value: ')' },
      { type: 'delimiter', value: ';' },
      { type: 'keyword', value: 'return' },
      { type: 'keyword', value: 'v' },
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
      }, {
        type: 'FunctionExpression',
        name: 'addTen',
        params: [{
          type: 'Argument',
          value: 'v'
        }],
        block: [{
          type: 'ScopeAssignmentExpression',
          name: 'v',
          values: [{
            type: 'CallExpression',
            name: 'sum',
            params: [{
              type: 'Accessment',
              value: 'v'
            }, {
              type: 'NumberLiteral',
              value: '10'
            }]
          }]
        }, {
          type: 'ReturnExpression',
          name: 'return',
          values: [{
            type: 'Accessment',
            value: 'v'
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
      }, {
        type: 'FunctionStatement',
        expression: {
          type: 'FunctionExpression',
          name: 'addTen',
          params: [{
            type: 'Argument',
            value: 'v'
          }],
          block: [{
            type: 'ScopeAssignmentStatement',
            expression: {
              type: 'ScopeAssignmentExpression',
              name: 'v',
              registers: [{
                type: 'ExpressionStatement',
                expression: {
                  type: 'CallExpression',
                  callee: {
                    type: 'Identifier',
                    name: 'sum'
                  },
                  arguments: [{
                    type: 'Accessment',
                    value: 'v'
                  }, {
                    type: 'NumberLiteral',
                    value: '10'
                  }]
                }
              }]
            }
          }, {
            type: 'ReturnStatement',
            name: 'return',
            expression: {
              type: 'ReturnExpression',
              values: [{
                type: 'Accessment',
                value: 'v'
              }]
            }
          }]
        }
      }]
    };

    // console.log(JSON.stringify(transformer(ast), null, 2));

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst, 'transformation of new ast');
    assert.deepStrictEqual(codeGenerator(newAst), output);
  });

  it('should create a variable inside function scope', () => {
    const input = `
      fun hello() {
        let say = "hi";
        return say;
      }
    `;

    const output = `function hello(){var say = "hi";\nreturn say;}`;

    const tokens = [
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'hello' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'say' },
      { type: 'assignment', value: '=' },
      { type: 'string', value: 'hi' },
      { type: 'delimiter', value: ';' },
      { type: 'keyword', value: 'return' },
      { type: 'keyword', value: 'say' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'FunctionExpression',
        name: 'hello',
        params: [],
        block: [{
          type: 'AssignmentExpression',
          name: 'say',
          value: {
            type: 'StringLiteral',
            value: 'hi'
          }
        }, {
          type: 'ReturnExpression',
          name: 'return',
          values: [{
            type: 'Accessment',
            value: 'say'
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
          name: 'hello',
          params: [],
          block: [{
            type: 'AssignmentStatement',
            expression: {
              type: 'AssignmentExpression',
              register: {
                type: 'StringLiteral',
                name: 'say',
                value: 'hi'
              }
            }
          }, {
            type: 'ReturnStatement',
            name: 'return',
            expression: {
              type: 'ReturnExpression',
              values: [{
                type: 'Accessment',
                value: 'say'
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

  it('should call the function with assignment inside of the scope', () => {
    const input = `
      fun hello() {
        let say = "hi";
        return say;
      }
      print(hello());
    `;

    const output = `function hello(){var say = "hi";\nreturn say;}\nconsole.log(hello());`;

    const tokens = [
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'hello' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'say' },
      { type: 'assignment', value: '=' },
      { type: 'string', value: 'hi' },
      { type: 'delimiter', value: ';' },
      { type: 'keyword', value: 'return' },
      { type: 'keyword', value: 'say' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
      { type: 'keyword', value: 'print' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'hello' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: ')' },
      { type: 'delimiter', value: ';' }
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'FunctionExpression',
        name: 'hello',
        params: [],
        block: [{
          type: 'AssignmentExpression',
          name: 'say',
          value: {
            type: 'StringLiteral',
            value: 'hi'
          }
        }, {
          type: 'ReturnExpression',
          name: 'return',
          values: [{
            type: 'Accessment',
            value: 'say'
          }]
        }]
      }, {
        type: 'CallExpression',
        name: 'print',
        params: [{
          type: 'CallExpression',
          name: 'hello',
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
          name: 'hello',
          params: [],
          block: [{
            type: 'AssignmentStatement',
            expression: {
              type: 'AssignmentExpression',
              register: {
                type: 'StringLiteral',
                name: 'say',
                value: 'hi'
              }
            }
          }, {
            type: 'ReturnStatement',
            name: 'return',
            expression: {
              type: 'ReturnExpression',
              values: [{
                type: 'Accessment',
                value: 'say'
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
              callee: {
                type: 'Identifier',
                name: 'hello'
              },
              arguments: []
            }
          }]
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast, 'parsing the ast');
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should call multiple times a function', () => {
    const input = `
      fun hello() {
        return "hi";
      }
      print(hello(), hello());
    `;

    const output = `function hello(){return "hi";}\nconsole.log(hello(), hello());`;

    const tokens = [
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'hello' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'return' },
      { type: 'string', value: 'hi' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
      { type: 'keyword', value: 'print' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'hello' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'comma', value: ',' },
      { type: 'keyword', value: 'hello' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: ')' },
      { type: 'delimiter', value: ';' }
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'FunctionExpression',
        name: 'hello',
        params: [],
        block: [{
          type: 'ReturnExpression',
          name: 'return',
          values: [{
            type: 'StringLiteral',
            value: 'hi'
          }]
        }]
      }, {
        type: 'CallExpression',
        name: 'print',
        params: [{
          type: 'CallExpression',
          name: 'hello',
          params: []
        }, {
          type: 'CallExpression',
          name: 'hello',
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
          name: 'hello',
          params: [],
          block: [{
            type: 'ReturnStatement',
            name: 'return',
            expression: {
              type: 'ReturnExpression',
              values: [{
                type: 'StringLiteral',
                value: 'hi'
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
              callee: {
                type: 'Identifier',
                name: 'hello'
              },
              arguments: []
            }
          }, {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'hello'
              },
              arguments: []
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

  it('should register a function inside another function', () => {
    const input = `
      fun hello() {
        fun world() {}
      }
    `;

    const output = `function hello(){function world(){}}`;

    const tokens = [
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'hello' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'world' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'block', value: '}' },
      { type: 'block', value: '}' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'FunctionExpression',
        name: 'hello',
        params: [],
        block: [{
          type: 'FunctionExpression',
          name: 'world',
          params: [],
          block: []
        }]
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'FunctionStatement',
        expression: {
          type: 'FunctionExpression',
          name: 'hello',
          params: [],
          block: [{
            type: 'FunctionStatement',
            expression: {
              type: 'FunctionExpression',
              name: 'world',
              params: [],
              block: []
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

  it('should register a function inside another two', () => {
    const input = `
      fun hello() {
        fun world() {
          fun hi() {}
        }
      }
    `;

    const output = `function hello(){function world(){function hi(){}}}`;

    const tokens = [
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'hello' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'world' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'hi' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'block', value: '}' },
      { type: 'block', value: '}' },
      { type: 'block', value: '}' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'FunctionExpression',
        name: 'hello',
        params: [],
        block: [{
          type: 'FunctionExpression',
          name: 'world',
          params: [],
          block: [{
            type: 'FunctionExpression',
            name: 'hi',
            params: [],
            block: []
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
          name: 'hello',
          params: [],
          block: [{
            type: 'FunctionStatement',
            expression: {
              type: 'FunctionExpression',
              name: 'world',
              params: [],
              block: [{
                type: 'FunctionStatement',
                expression: {
                  type: 'FunctionExpression',
                  name: 'hi',
                  params: [],
                  block: []
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

  it('should be have an boolean', () => {
    const input = `
      let isKiTrueTest = true;
    `;

    const output = `var isKiTrueTest = true;`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'isKiTrueTest' },
      { type: 'assignment', value: '=' },
      { type: 'boolean', value: 'true' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'isKiTrueTest',
        value: {
          type: 'BooleanLiteral',
          value: 'true'
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'AssignmentStatement',
        expression: {
          type: 'AssignmentExpression',
          register: {
            type: 'BooleanLiteral',
            name: 'isKiTrueTest',
            value: 'true'
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should be another state of a boolean', () => {
    const input = `
      let isKiFalseTest = false;
    `;

    const output = `var isKiFalseTest = false;`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'isKiFalseTest' },
      { type: 'assignment', value: '=' },
      { type: 'boolean', value: 'false' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'isKiFalseTest',
        value: {
          type: 'BooleanLiteral',
          value: 'false'
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'AssignmentStatement',
        expression: {
          type: 'AssignmentExpression',
          register: {
            type: 'BooleanLiteral',
            name: 'isKiFalseTest',
            value: 'false'
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should register an object', () => {
    const input = `
      let kiObj = {};
    `;

    const output = `var kiObj = {};`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'kiObj' },
      { type: 'assignment', value: '=' },
      { type: 'block', value: '{' },
      { type: 'block', value: '}' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'kiObj',
        value: {
          type: 'ObjectLiteral',
          values: []
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'AssignmentStatement',
        expression: {
          type: 'AssignmentExpression',
          register: {
            type: 'ObjectLiteral',
            name: 'kiObj',
            values: []
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should register an object with values', () => {
    const input = `
      let kiObj = { a: 1, b: 2, c: 3 };
    `;

    const output = `var kiObj = {a:1, b:2, c:3};`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'kiObj' },
      { type: 'assignment', value: '=' },
      { type: 'block', value: '{' },
      { type: 'param', value: 'a' },
      { type: 'colon', value: ':' },
      { type: 'number', value: '1' },
      { type: 'comma', value: ',' },
      { type: 'param', value: 'b' },
      { type: 'colon', value: ':' },
      { type: 'number', value: '2' },
      { type: 'comma', value: ',' },
      { type: 'param', value: 'c' },
      { type: 'colon', value: ':' },
      { type: 'number', value: '3' },
      { type: 'block', value: '}' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'kiObj',
        value: {
          type: 'ObjectLiteral',
          values: [{
            type: 'PropAssignmentExpression',
            name: 'a',
            value: {
              type: 'NumberLiteral',
              value: '1'
            }
          }, {
            type: 'PropAssignmentExpression',
            name: 'b',
            value: {
              type: 'NumberLiteral',
              value: '2'
            }
          }, {
            type: 'PropAssignmentExpression',
            name: 'c',
            value: {
              type: 'NumberLiteral',
              value: '3'
            }
          }]
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'AssignmentStatement',
        expression: {
          type: 'AssignmentExpression',
          register: {
            type: 'ObjectLiteral',
            name: 'kiObj',
            values: [{
              type: 'PropAssignmentExpression',
              name: 'a',
              value: {
                type: 'NumberLiteral',
                value: '1'
              }
            }, {
              type: 'PropAssignmentExpression',
              name: 'b',
              value: {
                type: 'NumberLiteral',
                value: '2'
              }
            }, {
              type: 'PropAssignmentExpression',
              name: 'c',
              value: {
                type: 'NumberLiteral',
                value: '3'
              }
            }]
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should access data on the object', () => {
    const input = `
      let kiObj = { a: 1, b: 2, c: 3 };
      print(kiObj.a);
    `

    const output = `var kiObj = {a:1, b:2, c:3};\nconsole.log(kiObj.a);`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'kiObj' },
      { type: 'assignment', value: '=' },
      { type: 'block', value: '{' },
      { type: 'param', value: 'a' },
      { type: 'colon', value: ':' },
      { type: 'number', value: '1' },
      { type: 'comma', value: ',' },
      { type: 'param', value: 'b' },
      { type: 'colon', value: ':' },
      { type: 'number', value: '2' },
      { type: 'comma', value: ',' },
      { type: 'param', value: 'c' },
      { type: 'colon', value: ':' },
      { type: 'number', value: '3' },
      { type: 'block', value: '}' },
      { type: 'delimiter', value: ';' },
      { type: 'keyword', value: 'print' },
      { type: 'paren', value: '(' },
      { type: 'name', value: 'kiObj' },
      { type: 'dot', value: '.' },
      { type: 'name', value: 'a' },
      { type: 'paren', value: ')' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'kiObj',
        value: {
          type: 'ObjectLiteral',
          values: [{
            type: 'PropAssignmentExpression',
            name: 'a',
            value: {
              type: 'NumberLiteral',
              value: '1'
            }
          }, {
            type: 'PropAssignmentExpression',
            name: 'b',
            value: {
              type: 'NumberLiteral',
              value: '2'
            }
          }, {
            type: 'PropAssignmentExpression',
            name: 'c',
            value: {
              type: 'NumberLiteral',
              value: '3'
            }
          }]
        }
      }, {
        type: 'CallExpression',
        name: 'print',
        params: [{
          type: 'Accessment',
          name: 'kiObj.a',
          value: {
            type: 'NumberLiteral',
            value: '1'
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
            type: 'ObjectLiteral',
            name: 'kiObj',
            values: [{
              type: 'PropAssignmentExpression',
              name: 'a',
              value: {
                type: 'NumberLiteral',
                value: '1'
              }
            }, {
              type: 'PropAssignmentExpression',
              name: 'b',
              value: {
                type: 'NumberLiteral',
                value: '2'
              }
            }, {
              type: 'PropAssignmentExpression',
              name: 'c',
              value: {
                type: 'NumberLiteral',
                value: '3'
              }
            }]
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
            value: 'kiObj.a'
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

  it('should call an function with object prop access', () => {
    const input = `
      let kiObj = { a:1, b:2, c:3 };
      fun getBValue() {
        return kiObj.b;
      }
    `;

    const output = `var kiObj = {a:1, b:2, c:3};\nfunction getBValue(){return kiObj.b;}`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'kiObj' },
      { type: 'assignment', value: '=' },
      { type: 'block', value: '{' },
      { type: 'param', value: 'a' },
      { type: 'colon', value: ':' },
      { type: 'number', value: '1' },
      { type: 'comma', value: ',' },
      { type: 'param', value: 'b' },
      { type: 'colon', value: ':' },
      { type: 'number', value: '2' },
      { type: 'comma', value: ',' },
      { type: 'param', value: 'c' },
      { type: 'colon', value: ':' },
      { type: 'number', value: '3' },
      { type: 'block', value: '}' },
      { type: 'delimiter', value: ';' },
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'getBValue' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'return' },
      { type: 'keyword', value: 'kiObj' },
      { type: 'dot', value: '.' },
      { type: 'keyword', value: 'b' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'kiObj',
        value: {
          type: 'ObjectLiteral',
          values: [{
            type: 'PropAssignmentExpression',
            name: 'a',
            value: {
              type: 'NumberLiteral',
              value: '1'
            }
          }, {
            type: 'PropAssignmentExpression',
            name: 'b',
            value: {
              type: 'NumberLiteral',
              value: '2'
            }
          }, {
            type: 'PropAssignmentExpression',
            name: 'c',
            value: {
              type: 'NumberLiteral',
              value: '3'
            }
          }]
        }
      }, {
        type: 'FunctionExpression',
        name: 'getBValue',
        params: [],
        block: [{
          type: 'ReturnExpression',
          name: 'return',
          values: [{
            type: 'Accessment',
            value: 'kiObj.b'
          }]
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
            type: 'ObjectLiteral',
            name: 'kiObj',
            values: [{
              type: 'PropAssignmentExpression',
              name: 'a',
              value: {
                type: 'NumberLiteral',
                value: '1'
              }
            }, {
              type: 'PropAssignmentExpression',
              name: 'b',
              value: {
                type: 'NumberLiteral',
                value: '2'
              }
            }, {
              type: 'PropAssignmentExpression',
              name: 'c',
              value: {
                type: 'NumberLiteral',
                value: '3'
              }
            }]
          }
        }
      }, {
        type: 'FunctionStatement',
        expression: {
          type: 'FunctionExpression',
          name: 'getBValue',
          params: [],
          block: [{
            type: 'ReturnStatement',
            name: 'return',
            expression: {
              type: 'ReturnExpression',
              values: [{
                type: 'Accessment',
                value: 'kiObj.b'
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

  it('should manipulate obj with print', () => {
    const input = `
      let kiObj = { a: 1, b: 2, c: 3 };

      fun getBValue() {
        return kiObj.b;
      }

      print(getBValue());
    `;

    const output = `var kiObj = {a:1, b:2, c:3};\nfunction getBValue(){return kiObj.b;}\nconsole.log(getBValue());`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'kiObj' },
      { type: 'assignment', value: '=' },
      { type: 'block', value: '{' },
      { type: 'param', value: 'a' },
      { type: 'colon', value: ':' },
      { type: 'number', value: '1' },
      { type: 'comma', value: ',' },
      { type: 'param', value: 'b' },
      { type: 'colon', value: ':' },
      { type: 'number', value: '2' },
      { type: 'comma', value: ',' },
      { type: 'param', value: 'c' },
      { type: 'colon', value: ':' },
      { type: 'number', value: '3' },
      { type: 'block', value: '}' },
      { type: 'delimiter', value: ';' },
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'getBValue' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'return' },
      { type: 'keyword', value: 'kiObj' },
      { type: 'dot', value: '.' },
      { type: 'keyword', value: 'b' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
      { type: 'keyword', value: 'print' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'getBValue' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: ')' },
      { type: 'delimiter', value: ';' }
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'kiObj',
        value: {
          type: 'ObjectLiteral',
          values: [{
            type: 'PropAssignmentExpression',
            name: 'a',
            value: {
              type: 'NumberLiteral',
              value: '1'
            }
          }, {
            type: 'PropAssignmentExpression',
            name: 'b',
            value: {
              type: 'NumberLiteral',
              value: '2'
            }
          }, {
            type: 'PropAssignmentExpression',
            name: 'c',
            value: {
              type: 'NumberLiteral',
              value: '3'
            }
          }]
        }
      }, {
        type: 'FunctionExpression',
        name: 'getBValue',
        params: [],
        block: [{
          type: 'ReturnExpression',
          name: 'return',
          values: [{
            type: 'Accessment',
            value: 'kiObj.b'
          }]
        }]
      }, {
        type: 'CallExpression',
        name: 'print',
        params: [{
          type: 'CallExpression',
          name: 'getBValue',
          params: []
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
            type: 'ObjectLiteral',
            name: 'kiObj',
            values: [{
              type: 'PropAssignmentExpression',
              name: 'a',
              value: {
                type: 'NumberLiteral',
                value: '1'
              }
            }, {
              type: 'PropAssignmentExpression',
              name: 'b',
              value: {
                type: 'NumberLiteral',
                value: '2'
              }
            }, {
              type: 'PropAssignmentExpression',
              name: 'c',
              value: {
                type: 'NumberLiteral',
                value: '3'
              }
            }]
          }
        }
      }, {
        type: 'FunctionStatement',
        expression: {
          type: 'FunctionExpression',
          name: 'getBValue',
          params: [],
          block: [{
            type: 'ReturnStatement',
            name: 'return',
            expression: {
              type: 'ReturnExpression',
              values: [{
                type: 'Accessment',
                value: 'kiObj.b'
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
              callee: {
                type: 'Identifier',
                name: 'getBValue'
              },
              arguments: []
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

  it('should be an minus operation', () => {
    const input = `
      let kiMinus = 10 - 10;
    `;

    const output = `var kiMinus = 10 - 10;`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'kiMinus' },
      { type: 'assignment', value: '=' },
      { type: 'number', value: '10' },
      { type: 'operation', value: '-' },
      { type: 'number', value: '10' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'kiMinus',
        value: {
          type: 'OperationExpression',
          operator: '-',
          values: [{
            type: 'NumberLiteral',
            value: '10'
          }, {
            type: 'NumberLiteral',
            value: '10'
          }]
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'AssignmentStatement',
        expression: {
          type: 'AssignmentExpression',
          register: {
            name: 'kiMinus',
            value: {
              type: 'OperationStatement',
              expression: {
                type: 'OperationExpression',
                operator: '-',
                values: [{
                  type: 'NumberLiteral',
                  value: '10'
                }, {
                  type: 'NumberLiteral',
                  value: '10'
                }]
              }
            }
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should be a sum operation', () => {
    const input = `
      let kiSum = 10 + 10;
    `;

    const output = `var kiSum = 10 + 10;`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'kiSum' },
      { type: 'assignment', value: '=' },
      { type: 'number', value: '10' },
      { type: 'operation', value: '+' },
      { type: 'number', value: '10' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'kiSum',
        value: {
          type: 'OperationExpression',
          operator: '+',
          values: [{
            type: 'NumberLiteral',
            value: '10'
          }, {
            type: 'NumberLiteral',
            value: '10'
          }]
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'AssignmentStatement',
        expression: {
          type: 'AssignmentExpression',
          register: {
            name: 'kiSum',
            value: {
              type: 'OperationStatement',
              expression: {
                type: 'OperationExpression',
                operator: '+',
                values: [{
                  type: 'NumberLiteral',
                  value: '10'
                }, {
                  type: 'NumberLiteral',
                  value: '10'
                }]
              }
            }
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should be a multiplication operation', () => {
    const input = `
      let kiMul = 10 * 10;
    `;

    const output = `var kiMul = 10 * 10;`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'kiMul' },
      { type: 'assignment', value: '=' },
      { type: 'number', value: '10' },
      { type: 'operation', value: '*' },
      { type: 'number', value: '10' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'kiMul',
        value: {
          type: 'OperationExpression',
          operator: '*',
          values: [{
            type: 'NumberLiteral',
            value: '10'
          }, {
            type: 'NumberLiteral',
            value: '10'
          }]
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'AssignmentStatement',
        expression: {
          type: 'AssignmentExpression',
          register: {
            name: 'kiMul',
            value: {
              type: 'OperationStatement',
              expression: {
                type: 'OperationExpression',
                operator: '*',
                values: [{
                  type: 'NumberLiteral',
                  value: '10'
                }, {
                  type: 'NumberLiteral',
                  value: '10'
                }]
              }
            }
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should be a division operation', () => {
    const input = `
      let kiDiv = 10 / 10;
    `;

    const output = `var kiDiv = 10 / 10;`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'kiDiv' },
      { type: 'assignment', value: '=' },
      { type: 'number', value: '10' },
      { type: 'operation', value: '/' },
      { type: 'number', value: '10' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'kiDiv',
        value: {
          type: 'OperationExpression',
          operator: '/',
          values: [{
            type: 'NumberLiteral',
            value: '10'
          }, {
            type: 'NumberLiteral',
            value: '10'
          }]
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'AssignmentStatement',
        expression: {
          type: 'AssignmentExpression',
          register: {
            name: 'kiDiv',
            value: {
              type: 'OperationStatement',
              expression: {
                type: 'OperationExpression',
                operator: '/',
                values: [{
                  type: 'NumberLiteral',
                  value: '10'
                }, {
                  type: 'NumberLiteral',
                  value: '10'
                }]
              }
            }
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should be an array', () => {
    const input = `
      let kiArr = [1, 2, 3];
    `;

    const output = `var kiArr = [1, 2, 3];`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'kiArr' },
      { type: 'assignment', value: '=' },
      { type: 'bracket', value: '[' },
      { type: 'number', value: '1' },
      { type: 'comma', value: ',' },
      { type: 'number', value: '2' },
      { type: 'comma', value: ',' },
      { type: 'number', value: '3' },
      { type: 'bracket', value: ']' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'kiArr',
        value: {
          type: 'ArrayLiteral',
          values: [{
            type: 'NumberLiteral',
            value: '1'
          }, {
            type: 'NumberLiteral',
            value: '2'
          }, {
            type: 'NumberLiteral',
            value: '3'
          }]
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'AssignmentStatement',
        expression: {
          type: 'AssignmentExpression',
          register: {
            name: 'kiArr',
            value: {
              type: 'ArrayLiteral',
              values: [{
                type: 'NumberLiteral',
                value: '1'
              }, {
                type: 'NumberLiteral',
                value: '2'
              }, {
                type: 'NumberLiteral',
                value: '3'
              }]
            }
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should be conditional if', () => {
    const input = `
      let isKiTrueTest = true;

      if (isKiTrueTest) {}
    `;

    const output = `var isKiTrueTest = true;\nif (isKiTrueTest){}`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'isKiTrueTest' },
      { type: 'assignment', value: '=' },
      { type: 'boolean', value: 'true' },
      { type: 'delimiter', value: ';' },
      { type: 'keyword', value: 'if' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'isKiTrueTest' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'block', value: '}' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'isKiTrueTest',
        value: {
          type: 'BooleanLiteral',
          value: 'true'
        }
      }, {
        type: 'ConditionalExpression',
        name: 'if',
        conditions: [{
          type: 'Accessment',
          name: 'isKiTrueTest'
        }],
        block: []
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'AssignmentStatement',
        expression: {
          type: 'AssignmentExpression',
          register: {
            type: 'BooleanLiteral',
            name: 'isKiTrueTest',
            value: 'true'
          }
        }
      }, {
        type: 'ConditionalStatement',
        expression: {
          type: 'ConditionalExpression',
          name: 'if',
          conditions: [{
            type: 'Accessment',
            name: 'isKiTrueTest'
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

  it('should be a conditional if with block of code', () => {
    const input = `
      let isKi = true;
      if (isKi) {
        isKi = false;
      }
    `;

    const output = `var isKi = true;\nif (isKi){isKi = false;}`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'isKi' },
      { type: 'assignment', value: '=' },
      { type: 'boolean', value: 'true' },
      { type: 'delimiter', value: ';' },
      { type: 'keyword', value: 'if' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'isKi' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'isKi' },
      { type: 'assignment', value: '=' },
      { type: 'boolean', value: 'false' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'isKi',
        value: {
          type: 'BooleanLiteral',
          value: 'true'
        }
      }, {
        type: 'ConditionalExpression',
        name: 'if',
        conditions: [{
          type: 'Accessment',
          name: 'isKi'
        }],
        block: [{
          type: 'Mutation',
          name: 'isKi',
          value: 'false'
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
            type: 'BooleanLiteral',
            name: 'isKi',
            value: 'true'
          }
        }
      }, {
        type: 'ConditionalStatement',
        expression: {
          type: 'ConditionalExpression',
          name: 'if',
          conditions: [{
            type: 'Accessment',
            name: 'isKi'
          }],
          block: [{
            type: 'Mutation',
            name: 'isKi',
            value: 'false'
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

  it('should a condition call a function', () => {
    const input = `
      let isKi = true;
      let message = "";
      fun logic() {
        return "logic statement";
      }
      if (isKi) {
        message = logic();
      }
    `;

    const output = `var isKi = true;\nvar message = "";\nfunction logic(){return "logic statement";}\nif (isKi){message = logic();}`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'isKi' },
      { type: 'assignment', value: '=' },
      { type: 'boolean', value: 'true' },
      { type: 'delimiter', value: ';' },
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'message' },
      { type: 'assignment', value: '=' },
      { type: 'string', value: '' },
      { type: 'delimiter', value: ';' },
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'logic' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'return' },
      { type: 'string', value: 'logic statement' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
      { type: 'keyword', value: 'if' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'isKi' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'message' },
      { type: 'assignment', value: '=' },
      { type: 'keyword', value: 'logic' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'isKi',
        value: {
          type: 'BooleanLiteral',
          value: 'true'
        }
      }, {
        type: 'AssignmentExpression',
        name: 'message',
        value: {
          type: 'StringLiteral',
          value: ''
        }
      }, {
        type: 'FunctionExpression',
        name: 'logic',
        params: [],
        block: [{
          type: 'ReturnExpression',
          name: 'return',
          values: [{
            type: 'StringLiteral',
            value: 'logic statement'
          }]
        }]
      }, {
        type: 'ConditionalExpression',
        name: 'if',
        conditions: [{
          type: 'Accessment',
          name: 'isKi'
        }],
        block: [{
          type: 'ScopeAssignmentExpression',
          name: 'message',
          value: {
            type: 'CallExpression',
            name: 'logic',
            params: []
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
            type: 'BooleanLiteral',
            name: 'isKi',
            value: 'true'
          }
        }
      }, {
        type: 'AssignmentStatement',
        expression: {
          type: 'AssignmentExpression',
          register: {
            type: 'StringLiteral',
            name: 'message',
            value: ''
          }
        }
      }, {
        type: 'FunctionStatement',
        expression: {
          type: 'FunctionExpression',
          name: 'logic',
          params: [],
          block: [{
            type: 'ReturnStatement',
            name: 'return',
            expression: {
              type: 'ReturnExpression',
              values: [{
                type: 'StringLiteral',
                value: 'logic statement'
              }]
            }
          }]
        }
      }, {
        type: 'ConditionalStatement',
        expression: {
          type: 'ConditionalExpression',
          name: 'if',
          conditions: [{
            type: 'Accessment',
            name: 'isKi'
          }],
          block: [{
            type: 'ScopeAssignmentStatement',
            expression: {
              type: 'ScopeAssignmentExpression',
              name: 'message',
              registers: [{
                type: 'ExpressionStatement',
                expression: {
                  type: 'CallExpression',
                  callee: {
                    type: 'Identifier',
                    name: 'logic'
                  },
                  arguments: []
                }
              }]
            }
          }]
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast, 'parsing failed for conditional');
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should be have a comparison statement', () => {
    const input = `
      true == true;
    `;

    const output = `true == true;`;

    const tokens = [
      { type: 'boolean', value: 'true' },
      { type: 'equal', value: '==' },
      { type: 'boolean', value: 'true' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'EqualExpression',
        value: '==',
        leftHand: {
          type: 'BooleanLiteral',
          value: 'true'
        },
        rightHand: {
          type: 'BooleanLiteral',
          value: 'true'
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'EqualStatement',
        expression: {
          type: 'EqualExpression',
          value: '==',
          leftHand: {
            type: 'BooleanLiteral',
            value: 'true'
          },
          rightHand: {
            type: 'BooleanLiteral',
            value: 'true'
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should be a strict comparison statement', () => {
    const input = `
      true === true;
    `;

    const output = `true === true;`;

    const tokens = [
      { type: 'boolean', value: 'true' },
      { type: 'strict-equal', value: '===' },
      { type: 'boolean', value: 'true' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'EqualExpression',
        value: '===',
        leftHand: {
          type: 'BooleanLiteral',
          value: 'true'
        },
        rightHand: {
          type: 'BooleanLiteral',
          value: 'true'
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'EqualStatement',
        expression: {
          type: 'EqualExpression',
          value: '===',
          leftHand: {
            type: 'BooleanLiteral',
            value: 'true'
          },
          rightHand: {
            type: 'BooleanLiteral',
            value: 'true'
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should be a not equal comparison statement', () => {
    const input = `
      true != false;
    `;

    const output = `true != false;`;

    const tokens = [
      { type: 'boolean', value: 'true' },
      { type: 'not-equal', value: '!=' },
      { type: 'boolean', value: 'false' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'NotEqualExpression',
        value: '!=',
        leftHand: {
          type: 'BooleanLiteral',
          value: 'true'
        },
        rightHand: {
          type: 'BooleanLiteral',
          value: 'false'
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'NotEqualStatement',
        expression: {
          type: 'NotEqualExpression',
          value: '!=',
          leftHand: {
            type: 'BooleanLiteral',
            value: 'true'
          },
          rightHand: {
            type: 'BooleanLiteral',
            value: 'false'
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should a not strict equal comparison statement', () => {
    const input = `
      true !== false;
    `;

    const output = `true !== false;`;

    const tokens = [
      { type: 'boolean', value: 'true' },
      { type: 'not-strict-equal', value: '!==' },
      { type: 'boolean', value: 'false' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'NotStrictEqualExpression',
        value: '!==',
        leftHand: {
          type: 'BooleanLiteral',
          value: 'true'
        },
        rightHand: {
          type: 'BooleanLiteral',
          value: 'false'
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'NotStrictEqualStatement',
        expression: {
          type: 'NotStrictEqualExpression',
          value: '!==',
          leftHand: {
            type: 'BooleanLiteral',
            value: 'true'
          },
          rightHand: {
            type: 'BooleanLiteral',
            value: 'false'
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should be a negation statement', () => {
    const input = `
      let isKi = false;

      !isKi;
    `;

    const output = `var isKi = false;\n!isKi;`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'isKi' },
      { type: 'assignment', value: '=' },
      { type: 'boolean', value: 'false' },
      { type: 'delimiter', value: ';' },
      { type: 'negation', value: '!' },
      { type: 'name', value: 'isKi' },
      { type: 'delimiter', value: ';' }
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'isKi',
        value: {
          type: 'BooleanLiteral',
          value: 'false'
        }
      }, {
        type: 'NegationExpression',
        value: '!',
        rightHand: {
          type: 'Accessment',
          name: 'isKi',
          value: {
            type: 'BooleanLiteral',
            value: 'false'
          }
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'AssignmentStatement',
        expression: {
          type: 'AssignmentExpression',
          register: {
            type: 'BooleanLiteral',
            name: 'isKi',
            value: 'false'
          }
        }
      }, {
        type: 'NegationStatement',
        expression: {
          type: 'NegationExpression',
          value: '!',
          rightHand: {
            type: 'Accessment',
            name: 'isKi',
            value: {
              type: 'BooleanLiteral',
              value: 'false'
            }
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should be a logica and', () => {
    const input = `
      true and false;
    `;

    const output = `true && false;`;

    const tokens = [
      { type: 'boolean', value: 'true' },
      { type: 'logic', value: 'and' },
      { type: 'boolean', value: 'false' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'LogicExpression',
        value: 'and',
        leftHand: {
          type: 'BooleanLiteral',
          value: 'true'
        },
        rightHand: {
          type: 'BooleanLiteral',
          value: 'false'
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'LogicStatement',
        expression: {
          type: 'LogicExpression',
          value: 'and',
          leftHand: {
            type: 'BooleanLiteral',
            value: 'true'
          },
          rightHand: {
            type: 'BooleanLiteral',
            value: 'false'
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should be a logic or', () => {
    const input = `
      true or false;
    `;

    const output = `true || false;`;

    const tokens = [
      { type: 'boolean', value: 'true' },
      { type: 'logic', value: 'or' },
      { type: 'boolean', value: 'false' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'LogicExpression',
        value: 'or',
        leftHand: {
          type: 'BooleanLiteral',
          value: 'true'
        },
        rightHand: {
          type: 'BooleanLiteral',
          value: 'false'
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'LogicStatement',
        expression: {
          type: 'LogicExpression',
          value: 'or',
          leftHand: {
            type: 'BooleanLiteral',
            value: 'true'
          },
          rightHand: {
            type: 'BooleanLiteral',
            value: 'false'
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should be a logic and with multiple cases', () => {
    const input = `
      true and true and false;
    `;

    const output = `true && true && false;`;

    const tokens = [
      { type: 'boolean', value: 'true' },
      { type: 'logic', value: 'and' },
      { type: 'boolean', value: 'true' },
      { type: 'logic', value: 'and' },
      { type: 'boolean', value: 'false' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'LogicExpression',
        value: 'and',
        leftHand: {
          type: 'LogicExpression',
          value: 'and',
          leftHand: {
            type: 'BooleanLiteral',
            value: 'true'
          },
          rightHand: {
            type: 'BooleanLiteral',
            value: 'true'
          }
        },
        rightHand: {
          type: 'BooleanLiteral',
          value: 'false'
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'LogicStatement',
        expression: {
          type: 'LogicExpression',
          value: 'and',
          leftHand: {
            type: 'LogicStatement',
            expression: {
              type: 'LogicExpression',
              value: 'and',
              leftHand: {
                type: 'BooleanLiteral',
                value: 'true'
              },
              rightHand: {
                type: 'BooleanLiteral',
                value: 'true'
              }
            }
          },
          rightHand: {
            type: 'BooleanLiteral',
            value: 'false'
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should be a logic or with multiple cases', () => {
    const input = `
      true or true or false;
    `;

    const output = `true || true || false;`;

    const tokens = [
      { type: 'boolean', value: 'true' },
      { type: 'logic', value: 'or' },
      { type: 'boolean', value: 'true' },
      { type: 'logic', value: 'or' },
      { type: 'boolean', value: 'false' },
      { type: 'delimiter', value: ';' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'LogicExpression',
        value: 'or',
        leftHand: {
          type: 'LogicExpression',
          value: 'or',
          leftHand: {
            type: 'BooleanLiteral',
            value: 'true'
          },
          rightHand: {
            type: 'BooleanLiteral',
            value: 'true'
          }
        },
        rightHand: {
          type: 'BooleanLiteral',
          value: 'false'
        }
      }]
    };

    const newAst = {
      type: 'Program',
      body: [{
        type: 'LogicStatement',
        expression: {
          type: 'LogicExpression',
          value: 'or',
          leftHand: {
            type: 'LogicStatement',
            expression: {
              type: 'LogicExpression',
              value: 'or',
              leftHand: {
                type: 'BooleanLiteral',
                value: 'true'
              },
              rightHand: {
                type: 'BooleanLiteral',
                value: 'true'
              }
            }
          },
          rightHand: {
            type: 'BooleanLiteral',
            value: 'false'
          }
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should a condition call a function', () => {
    const input = `
      let isKi = true;
      let message = "";
      fun logic() {
        return "logic statement";
      }
      if (isKi) {
        message = logic();
        print(message);
      }
    `;

    const output = `var isKi = true;\nvar message = "";\nfunction logic(){return "logic statement";}\nif (isKi){message = logic();console.log(message);}`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'isKi' },
      { type: 'assignment', value: '=' },
      { type: 'boolean', value: 'true' },
      { type: 'delimiter', value: ';' },
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'message' },
      { type: 'assignment', value: '=' },
      { type: 'string', value: '' },
      { type: 'delimiter', value: ';' },
      { type: 'keyword', value: 'fun' },
      { type: 'name', value: 'logic' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'return' },
      { type: 'string', value: 'logic statement' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
      { type: 'keyword', value: 'if' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'isKi' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'message' },
      { type: 'assignment', value: '=' },
      { type: 'keyword', value: 'logic' },
      { type: 'paren', value: '(' },
      { type: 'paren', value: ')' },
      { type: 'delimiter', value: ';' },
      { type: 'keyword', value: 'print' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'message' },
      { type: 'paren', value: ')' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'isKi',
        value: {
          type: 'BooleanLiteral',
          value: 'true'
        }
      }, {
        type: 'AssignmentExpression',
        name: 'message',
        value: {
          type: 'StringLiteral',
          value: ''
        }
      }, {
        type: 'FunctionExpression',
        name: 'logic',
        params: [],
        block: [{
          type: 'ReturnExpression',
          name: 'return',
          values: [{
            type: 'StringLiteral',
            value: 'logic statement'
          }]
        }]
      }, {
        type: 'ConditionalExpression',
        name: 'if',
        conditions: [{
          type: 'Accessment',
          name: 'isKi'
        }],
        block: [{
          type: 'ScopeAssignmentExpression',
          name: 'message',
          value: {
            type: 'CallExpression',
            name: 'logic',
            params: []
          }
        }, {
          type: 'CallExpression',
          name: 'print',
          params: [{
            type: 'Accessment',
            name: 'message',
          }]
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
            type: 'BooleanLiteral',
            name: 'isKi',
            value: 'true'
          }
        }
      }, {
        type: 'AssignmentStatement',
        expression: {
          type: 'AssignmentExpression',
          register: {
            type: 'StringLiteral',
            name: 'message',
            value: ''
          }
        }
      }, {
        type: 'FunctionStatement',
        expression: {
          type: 'FunctionExpression',
          name: 'logic',
          params: [],
          block: [{
            type: 'ReturnStatement',
            name: 'return',
            expression: {
              type: 'ReturnExpression',
              values: [{
                type: 'StringLiteral',
                value: 'logic statement'
              }]
            }
          }]
        }
      }, {
        type: 'ConditionalStatement',
        expression: {
          type: 'ConditionalExpression',
          name: 'if',
          conditions: [{
            type: 'Accessment',
            name: 'isKi'
          }],
          block: [{
            type: 'ScopeAssignmentStatement',
            expression: {
              type: 'ScopeAssignmentExpression',
              name: 'message',
              registers: [{
                type: 'ExpressionStatement',
                expression: {
                  type: 'CallExpression',
                  callee: {
                    type: 'Identifier',
                    name: 'logic'
                  },
                  arguments: []
                }
              }]
            }
          },{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'print'
              },
              arguments: [{
                type: 'Accessment',
                name: 'message',
              }]
            }
          }]
        }
      }]
    };

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast, 'parsing failed for conditional');
    assert.deepStrictEqual(transformer(ast), newAst);
    assert.deepStrictEqual(codeGenerator(newAst), output);
    assert.deepStrictEqual(compiler(input), output);
  });

  it('should be a elif condition', () => {
    const input = `
      let isKi = "sample";

      if (isKi === "not sample") {
        print("is not sample");
      } elif (isKi === "sample") {
        print("is sample");
      }
    `;

    const output = `var isKi = "sample";\nif (isKi === "not sample") {console.log("is not sample");} elif (isKi === "sample") {console.log("is sample");}`;

    const tokens = [
      { type: 'keyword', value: 'let' },
      { type: 'name', value: 'isKi' },
      { type: 'assignment', value: '=' },
      { type: 'string', value: 'sample' },
      { type: 'delimiter', value: ';' },
      { type: 'keyword', value: 'if' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'isKi' },
      { type: 'strict-equal', value: '===' },
      { type: 'string', value: 'not sample' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'print' },
      { type: 'paren', value: '(' },
      { type: 'string', value: 'is not sample' },
      { type: 'paren', value: ')' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
      { type: 'keyword', value: 'elif' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'isKi' },
      { type: 'strict-equal', value: '===' },
      { type: 'string', value: 'sample' },
      { type: 'paren', value: ')' },
      { type: 'block', value: '{' },
      { type: 'keyword', value: 'print' },
      { type: 'paren', value: '(' },
      { type: 'string', value: 'is sample' },
      { type: 'paren', value: ')' },
      { type: 'delimiter', value: ';' },
      { type: 'block', value: '}' },
    ];

    const ast = {
      type: 'Program',
      body: [{
        type: 'AssignmentExpression',
        name: 'isKi',
        value: {
          type: 'StringLiteral',
          value: 'sample'
        }
      }, {
        type: 'ConditionalExpression',
        name: 'if',
        conditions: [{
          type: 'EqualExpression',
          value: '===',
          leftHand: {
            type: 'Accessment',
            name: 'isKi'
          },
          rightHand: {
            type: 'StringLiteral',
            value: 'not sample'
          }
        }],
        block: [{
          type: 'CallExpression',
          name: 'print',
          params: [{
            type: 'StringLiteral',
            value: 'is not sample',
          }]
        }]
      }, {
        type: 'ConditionalExpression',
        name: 'elif',
        conditions: [{
          type: 'EqualExpression',
          value: '===',
          leftHand: {
            type: 'Accessment',
            name: 'isKi'
          },
          rightHand: {
            type: 'StringLiteral',
            value: 'sample'
          }
        }],
        block: [{
          type: 'CallExpression',
          name: 'print',
          params: [{
            type: 'StringLiteral',
            value: 'is sample',
          }]
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
            type: 'StringLiteral',
            name: 'isKi',
            value: 'sample'
          }
        }
      }, {
        type: 'ConditionalStatement',
        expression: {
          type: 'ConditionalExpression',
          name: 'if',
          conditions: [{
            type: 'EqualStatement',
            expression: {
              type: 'EqualExpression',
              value: '===',
              leftHand: {
                type: 'Accessment',
                name: 'isKi'
              },
              rightHand: {
                type: 'StringLiteral',
                value: 'not sample'
              }
            }
          }],
          block: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'print'
              },
              arguments: [{
                type: 'StringLiteral',
                value: 'is not sample',
              }]
            }
          }]
        }
      }, {
        type: 'ConditionalStatement',
        expression: {
          type: 'ConditionalExpression',
          name: 'elif',
          conditions: [{
            type: 'EqualStatement',
            expression: {
              type: 'EqualExpression',
              value: '===',
              leftHand: {
                type: 'Accessment',
                name: 'isKi'
              },
              rightHand: {
                type: 'StringLiteral',
                value: 'sample'
              }
            }
          }],
          block: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'print'
              },
              arguments: [{
                type: 'StringLiteral',
                value: 'is sample',
              }]
            }
          }]
        }
      }]
    };

    // console.log(JSON.stringify(transformer(ast), null, 2));

    assert.deepStrictEqual(tokenizer(input), tokens);
    assert.deepStrictEqual(parser(tokens), ast);
    assert.deepStrictEqual(transformer(ast), newAst);
  });
});
