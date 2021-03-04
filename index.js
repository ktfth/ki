'use strict';

function tokenizer(input) {
  let current = 0;
  let tokens = [];
  let isPastAFn = false;
  let isPastAReturn = false;

  while (current < input.length) {
    let char = input[current];

    if (char === '+') {
      tokens.push({
        type: 'operation',
        value: '+'
      });
      current++;
      continue;
    }

    if (char === ',') {
      tokens.push({
        type: 'comma',
        value: ',',
      });
      current++;
      continue;
    }

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

    if (char === '{') {
      tokens.push({
        type: 'block',
        value: '{'
      });
      current++;
      continue;
    }

    if (char === '}') {
      tokens.push({
        type: 'block',
        value: '}'
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

      if (
        value === 'let' ||
        value === 'print' ||
        value === 'fun' ||
        value === 'return' ||
        (tokens.filter(t => t.value === value).length > 0 && isPastAFn)
      ) {
        if (value === 'fun') isPastAFn = true;
        if (value === 'return') isPastAReturn = true;
        tokens.push({ type: 'keyword', value });
      } else if (
        isPastAFn &&
        (tokens[tokens.length - 1].type === 'paren' &&
        tokens[tokens.length - 1].value === '(') ||
        (tokens[tokens.length - 1] !== undefined && tokens[tokens.length - 1].type === 'comma' &&
        tokens[tokens.length - 1].value === ',')
      ) {
        tokens.push({ type: 'param', value });
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
  let _cacheNode = {};
  let _cacheNodesFn = [];
  let isPastAReturnExpression = false;

  function walk(isParam = false, isParamFn=false) {
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

    if (token.type === 'param') {
      current++;

      return {
        type: 'Argument',
        value: token.value
      };
    }

    const specialTokens = [
      'let',
      'fun',
      'return',
      'print'
    ];

    if (
      token.type === 'keyword' &&
      tokens.filter(t => t.type === 'param' && t.value === token.value).length > 0
    ) {
      current++;

      return {
        type: 'Accessment',
        value: token.value
      };
    }

    if (
      token.type === 'keyword' &&
      specialTokens.indexOf(token.value) === -1
    ) {
      let node = {
        type: 'CallExpression',
        name: token.value,
        params: [],
      };

      token = tokens[++current];

      let currentTokens = tokens.slice(current);
      let paramsIndex = -1;
      currentTokens.forEach((v, i) => {
        if (
          v.type === 'paren' &&
          v.value === ')'
        ) {
          paramsIndex = i;
        }
      });
      let currentParams = currentTokens
        .slice(1, paramsIndex)
        .filter(v => v.type !== 'comma' && v.value !== ',');

      if (
        token.type === 'paren' &&
        token.value === '('
      ) {
        token = tokens[++current];

        while (
          (token !== undefined && token.type !== 'paren') ||
          ((token !== undefined && token.type === 'paren') && (token !== undefined && token.value !== ')'))
        ) {
          node.params.push(walk());
          token = tokens[++current];
        }

        node.params = node.params.filter(p => p !== undefined).slice(0, currentParams.length);
      }

      return node;
    }

    if (
      token.type === 'assignment' &&
      token.value === '='
    ) {
      let leftToken = tokens[current - 1];

      let node = {
        type: 'ScopeAssignmentExpression',
        name: leftToken.value,
        values: []
      };

      token = tokens[++current];

      while (
        token !== undefined &&
        (
          token.type === 'keyword' ||
          token.type === 'accessment' ||
          token.type === 'number' ||
          token.type === 'string'
        )
      ) {
        if (token.type !== 'operation') {
          node.values.push(walk());
        }

        token = tokens[++current];

        if (
          (tokens[current + 1] !== undefined && tokens[current + 1].type === 'delimiter') &&
          (tokens[current + 1] !== undefined && tokens[current + 1].value === ';')
        ) {
          node.values.push(walk());
          break;
        }
      }

      return node;
    }

    if (token.type === 'operation') {
      current++;
      return;
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
      token.type === 'keyword' &&
      token.value === 'fun'
    ) {
      token = tokens[++current];

      let node = {
        type: 'FunctionExpression',
        name: token.value,
        params: [],
        block: [],
      };

      token = tokens[++current];

      if (
        token.type === 'paren' &&
        token.value === '('
      ) {
        token = tokens[++current];

        while (
          (token.type !== 'paren') ||
          (token.type === 'paren' && token.value !== ')')
        ) {
          node.params.push(walk(true, true));
          token = tokens[++current];
          if (
            token.type === 'block' &&
            token.value === '{'
          ) {
            isParamFn = true;
            break;
          }
        }

        current++;
      }

      if (
        token.type === 'block' &&
        token.value === '{'
      ) {
        token = tokens[current++];

        while (
          (token !== undefined && token.type !== 'block') ||
          ((token !== undefined && token.type === 'block') && (token !== undefined && token.value !== '}'))
        ) {
          if (
            token.type === 'keyword' &&
            token.value === 'return'
          ) {
            isPastAReturnExpression = true;
            node.block.push({
              type: 'ReturnExpression',
              name: 'return',
              values: []
            });
            if (node.block.filter(b => b.type === 'ReturnExpression').length > 0) {
              node.block.map(b => {
                if (b.type === 'ReturnExpression') {
                  b.values.push(walk());
                }
                return b;
              });
            }
          } else if (node.block.filter(b => b !== undefined && b.type === 'ReturnExpression').length > 0) {
            node.block.map(b => {
              if (b.type === 'ReturnExpression') {
                b.values.push(walk());
              }
              return b;
            });
          } else {
            node.block.push(walk());
          }
          token = tokens[++current];
        }
        current++;
      }

      node.block = node.block.map(b => {
        if (
          b !== undefined &&
          b.values !== undefined &&
          b.values.filter(v => v !== undefined && v.type === 'ReturnExpression').length > 0
        ) {
          b = b.values[0];
        }
        return b;
      });

      _cacheNode = node;

      if (isParamFn) {
        return node;
      }

      return;
    }

    if (
      token.type === 'block' &&
      token.value === '{'
    ) {
      token = tokens[++current];

      let node = {};

      if (_cacheNode) {
        node = _cacheNode;
        _cacheNode = {};
      }

      while (
        (token.type !== 'block') ||
        (token.type === 'block' && token.value !== '}')
      ) {
        node.block.push(walk());
        token = tokens[++current];
      }

      current++;

      return node;
    }

    if (
      token.type === 'keyword' &&
      token.value === 'return'
    ) {
      current++;
      return {
        type: 'ReturnExpression',
        name: 'return',
        values: [walk()]
      };
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
        (token !== undefined && token.type !== 'paren') ||
        (token !== undefined && token.type === 'paren' && token.value !== ')')
      ) {
        node.params.push(walk(true));
        node.params = node.params.filter(v => v !== undefined);
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

    // if (
    //   token.type === 'block' &&
    //   token.value === '}'
    // ) {
    //   return;
    // }

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
      case 'FunctionExpression':
      case 'ReturnExpression':
      case 'Argument':
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

        if (parent.type !== 'CallExpression' || parent.type === 'CallExpression') {
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

    FunctionExpression: {
      enter(node, parent) {
        let expression = {
          type: 'FunctionStatement',
          expression: {
            type: 'FunctionExpression',
            name: node.name,
            params: node.params,
            block: node.block,
          }
        };

        expression.expression.block = expression.expression.block.map(block => {
          if (block.type === 'ScopeAssignmentExpression') {
            block = {
              type: 'ScopeAssignmentStatement',
              expression: {
                type: 'ScopeAssignmentExpression',
                name: block.name,
                registers: block.values
              }
            };
          }
          if (block.type === 'ReturnExpression') {
            block = {
              type: 'ReturnStatement',
              name: block.name,
              expression: {
                type: 'ReturnExpression',
                values: block.values
              }
            };
          }

          return block;
        });

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
    case 'ExpressionStatement':
      if (node.expression.arguments.length) {
        isArgument = true;
        if (!insideArguments.length) {
          insideArguments = node.expression.arguments;
        }
      }
      if (!isArgument) {
        return (
          codeGenerator(node.expression)
        );
      } if (isArgument) {
        isArgument = false;
        if (
          (insideArguments[0].expression === undefined) &&
          (insideArguments[0].type !== undefined && insideArguments[0].type !== "Accessment")
        ) {
          return (
            codeGenerator(node.expression)
          );
        }
        return (
          codeGenerator(node.expression) +
          ';'
        );
      }
    case 'CallExpression':
      return (
        codeGenerator(node.callee) +
        '(' +
        node.arguments.map(codeGenerator)
          .join(', ') +
        ')'
      );
    case 'ScopeAssignmentStatement':
      let out = [];
      node.expression.registers.forEach(r => {
        out.push(r.value);
      });
      return '' + node.expression.name + ' = ' + out.join(' + ') + ';';
    case 'AssignmentStatement':
      return (
        'var ' +
        node.expression.register.name +
        ' = ' + node.expression.register.value +
        ';'
      );
    case 'Accessment':
      return node.value;
    case 'FunctionStatement':
      return (
        'function ' +
        node.expression.name +
        '(' +
        node.expression.params.map(codeGenerator)
          .join(', ') +
        ')' +
        '{' +
        node.expression.block.map(codeGenerator)
          .join('\n') +
        '}'
      );
    case 'Argument':
      return node.value;
    case 'ReturnStatement':
      let accessment = [];
      let otherConditions = [];
      node.expression.values.forEach(t => {
        if (t.type === 'Accessment') {
          accessment.push('' + t.value + '');
        }
      });
      node.expression.values.forEach(t => {
        if (t.type !== 'Accessment') {
          otherConditions.push('' + node.name + ' "' + t.value + '";');
        }
      });
      if (accessment.length && !otherConditions.length) {
        return node.name + ' ' + accessment.join(' + ') + ';';
      }
      if (otherConditions.length && !accessment.length) {
        return otherConditions.join('');
      }
      if (accessment.length && otherConditions.length) {
        let out = [];
        node.expression.values.forEach(t => {
          if (t.type === 'Accessment') {
            out.push('' + t.value + '');
          } else if (t.type !== 'Accessment') {
            out.push(' + "' + t.value + '" + ');
          }
        });
        return '' + node.name + ' ' + out.join('') + ';';
      }
    case 'Identifier':
      if (node.name === 'print') node.name = 'console.log';
      return node.name;
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
