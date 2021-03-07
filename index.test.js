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

  it('should call the function with assigment inside of the scope', () => {
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
});
