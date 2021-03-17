'use strict';

function tokenizer(input) {
  let current = 0;
  let tokens = [];
  let isPastAFn = false;
  let isPastAReturn = false;
  let isPastAIFStatement = false;

  while (current < input.length) {
    let char = input[current];

    if (['+', '-', '*', '/'].includes(char)) {
      tokens.push({ type: 'operation', value: char });
      current++;
      continue;
    }

    if (char === ',') {
      tokens.push({ type: 'comma', value: ',' });
      current++;
      continue;
    }

    if (['(', ')'].includes(char)) {
      tokens.push({ type: 'paren', value: char });
      current++;
      continue;
    }

    if (['{', '}'].includes(char)) {
      tokens.push({ type: 'block', value: char });
      current++;
      continue;
    }

    if (['[', ']'].includes(char)) {
      tokens.push({ type: 'bracket', value: char });
      current++;
      continue;
    }

    if (char === ':') {
      tokens.push({
        type: 'colon',
        value: ':'
      });
      current++;
      continue;
    }

    if (char === '.') {
      tokens.push({
        type: 'dot',
        value: '.'
      });
      current++;
      continue;
    }

    // BREAKLINE and WHITESPACE has the same result
    if (/\n|\s/.test(char)) {
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

    let ASSIGNMENT = /\=/;
    if (ASSIGNMENT.test(char)) {
      let value = '';

      while (ASSIGNMENT.test(char)) {
        value += char;
        char = input[++current];
      }

      if (value === '==') {
        tokens.push({ type: 'equal', value: '==' });
      } else {
        tokens.push({ type: 'assignment', value: '=' });
      }

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
        value === 'if' ||
        (tokens.filter(t => t.value === value).length > 0 && isPastAFn) ||
        (tokens.filter(t => t.value === value).length > 0 && isPastAIFStatement)
      ) {
        if (value === 'fun') isPastAFn = true;
        if (value === 'return') isPastAReturn = true;
        if (value === 'if') isPastAIFStatement = true;
        tokens.push({ type: 'keyword', value });
      } else if (
        isPastAFn &&
        (
          tokens[tokens.length - 1].type === 'paren' &&
          tokens[tokens.length - 1].value === '('
        ) ||
        (
          (tokens[tokens.length - 1] !== undefined && tokens[tokens.length - 1].type === 'comma' &&
          tokens[tokens.length - 1].value === ',')
        ) ||
        (
          tokens[tokens.length - 1] !== undefined && tokens[tokens.length - 1].type === 'block' &&
          tokens[tokens.length - 1].value === '{'
        )
      ) {
        tokens.push({ type: 'param', value });
      } else if (
        value === 'true' ||
        value === 'false'
      ) {
        tokens.push({ type: 'boolean', value });
      } else if (value === '==') {
        tokens.push({ type: 'equal', value });
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
  let _supplyCacheNode = {};
  let _cacheNodesFn = [];
  let _cacheCallExpression = {};
  let _cacheNodeEmptyWalk = {};
  let _cacheWNode = {};
  let _cacheValueNode = {};
  let _cacheAssignmentNodes = [];
  let _cacheBaseNodes = [];
  let isPastAReturnExpression = false;
  let hasPreviousNodeAssignExpression = false;

  function walk(
    isParam = false,
    isParamFn=false,
    forceReturn=false,
    isEmptyWalk=false
  ) {
    let token = tokens[current];

    if (token === undefined) {
      return;
    }

    if (token !== undefined && token.type === 'number') {
      current++;

      return {
        type: 'NumberLiteral',
        value: token.value,
      };
    }

    if (token !== undefined && token.type === 'string') {
      current++;

      return {
        type: 'StringLiteral',
        value: token.value,
      };
    }

    if (
      token !== undefined &&
      token.type === 'boolean'
    ) {
      current++;

      let node = {
        type: 'BooleanLiteral',
        value: token.value
      };

      return node;
    }

    if (token !== undefined && token.type === 'dot') {
      current++;
      return;
    }

    if (
      token.type === 'block' &&
      token.value === '{'
    ) {
      let lastToken = tokens[current - 1];

      if (
        lastToken !== undefined && lastToken.type === 'assignment' &&
        lastToken !== undefined && lastToken.value === '='
      ) {
        token = tokens[++current];

        let node = {
          type: 'ObjectLiteral',
          values: []
        };

        let acc = {
          type: 'PropAssignmentExpression',
        };

        while (
          (token !== undefined && token.type !== 'block') ||
          ((token !== undefined && token.type === 'block') && (token !== undefined && token.value !== '}'))
        ) {
          let w = walk();
          if (
            w !== undefined &&
            (
              w.type === 'CallExpression' ||
              w.type === 'ReturnExpression' ||
              w.type === 'FunctionExpression'
            )
          ) {
            _cacheWNode = w;
          }
          if (acc.name === undefined && (w !== undefined && w.type === 'Argument')) {
            acc.name = w.value;
          } else if (acc.value === undefined) {
            acc.value = w;
            if (
              (acc.value !== undefined && acc.value.type !== 'CallExpression') ||
              (acc.value !== undefined && acc.value.type !== 'ReturnExpression')
            ) {
              node.values.push(acc);
            }
            acc = {
              type: 'PropAssignmentExpression'
            };
          }
          token = tokens[++current];
        }

        if (
          token !== undefined && token.type === 'block' &&
          token !== undefined && token.value === '}'
        ) {
          token = tokens[++current];
        }

        function excludeValue(values=[], key='') {
          let out = [];

          for (let i = 0; i < values.length; i += 1) {
            let v = values[i];
            if (v.value.type !== key) {
              out.push(v);
            }
          }

          return out;
        }

        node.values = excludeValue(node.values, 'ReturnExpression');
        node.values = excludeValue(node.values, 'CallExpression');
        node.values = excludeValue(node.values, 'FunctionExpression');
        node.values = excludeValue(node.values, 'Accessment');

        return node;
      }
    }

    if (
      token.type === 'equal' &&
      token.value === '=='
    ) {
      let node = {
        type: 'EqualExpression',
        value: '==',
      };

      token = [--current];

      node.leftHand = walk();

      token = tokens[++current];

      node.rightHand = walk();

      return node;
    }

    if (
      token.type === 'bracket' &&
      token.value === '['
    ) {
      let lastToken = tokens[current - 1];

      if (
        lastToken !== undefined && lastToken.type === 'assignment' &&
        lastToken !== undefined && lastToken.value === '='
      ) {
        token = tokens[++current];

        let node = {
          type: 'ArrayLiteral',
          values: []
        };

        while (
          (token !== undefined && token.type !== 'bracket') ||
          ((token !== undefined && token.type === 'bracket') && (token !== undefined && token.value !== ']'))
        ) {
          let w = walk();
          node.values.push(w);
          token = tokens[++current];
        }

        if (
          token !== undefined && token.type === 'bracket' &&
          token !== undefined && token.value === ']'
        ) {
          token = tokens[++current];
        }

        node.values = node.values.filter(v => v !== undefined);

        return node;
      }
    }

    if (
      token !== undefined &&
      token.type === 'keyword' &&
      token.value === 'if'
    ) {
      let node = {
        type: 'ConditionalExpression',
        name: token.value,
        conditions: [],
        block: []
      };

      token = tokens[++current];

      if (
        token.type === 'paren' &&
        token.value === '('
      ) {
        token = tokens[++current];

        while (
          (token !== undefined && token.type !== 'paren') ||
          ((token !== undefined && token.type === 'paren') && (token !== undefined && token.value !== ')'))
        ) {
          let w = walk();
          node.conditions.push(w);
          token = tokens[++current];
          if (
            token !== undefined &&
            token.type === 'block' &&
            token.value === '{'
          ) {
            let wStructure = {
              type: 'Mutation',
            };
            let lockWStructure = false;
            token = tokens[current++];

            while (
              (token !== undefined && token.type !== 'block') ||
              ((token !== undefined && token.type === 'block') && (token !== undefined && token.value !== '}'))
            ) {
              let w = walk();
              if (
                w !== undefined &&
                (
                  w.type === 'CallExpression'
                )
              ) {
                if (w.name !== undefined && !lockWStructure) {
                  for (let i = 0; i < tokens.length; i += 1) {
                    let t = tokens[i];
                    if (
                      t.type === 'keyword' &&
                      t.value === w.name &&
                      tokens[current].type === 'assignment' &&
                      (
                        tokens[i - 1].type !== 'keyword' &&
                        tokens[i - 1].value !== 'fun'
                      )
                    ) {
                      wStructure.type = 'ScopeAssignmentExpression';
                      wStructure.name = w.name;
                      lockWStructure = true;
                      break;
                    }
                  }
                }
              } if (
                w !== undefined &&
                (
                  w.type === 'CallExpression' &&
                  tokens.filter((t, i) => {
                    if (
                      (tokens[i - 1] !== undefined && (tokens[i - 1].type === 'keyword' && tokens[i - 1].value === 'fun')) &&
                      t.type === 'name' && t.value === w.name
                    ) {
                      return t;
                    }
                  }).length > 0
                )
              ) {
                if (wStructure.type === 'ScopeAssignmentExpression') {
                  wStructure.value = w;
                  node.block.push(wStructure);
                } else {
                  node.block.push(w);
                }
              } else {
                if (w !== undefined && w.value !== undefined) {
                  wStructure.type = 'Mutation';
                  wStructure.value = w.value;
                  node.block.push(wStructure);
                }
              }
              token = tokens[++current];
            }
            current++;
          }
        }

        node.conditions = node.conditions.filter(c => c !== undefined && Object.keys(c).length > 0);
      }

      return node;
    }

    if (token !== undefined && token.type === 'param') {
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
      'print',
      'true',
      'false',
    ];

    if (
      token !== undefined &&
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
      token !== undefined &&
      token.type === 'operation'
    ) {
      let node = {
        type: 'OperationExpression',
        operator: token.value,
        values: []
      };

      token = tokens[--current];
      node.values.push(walk());
      token = tokens[++current];
      node.values.push(walk());
      token = tokens[++current];

      return node;
    }

    if (
      token !== undefined &&
      token.type === 'keyword' &&
      specialTokens.indexOf(token.value) === -1 &&
      tokens[current - 1].value === 'return'
    ) {
      let node = {
        type: 'Accessment',
        value: token.value
      };

      if (
        tokens[current + 1].type === 'dot' &&
        tokens[current + 1].value === '.'
      ) {
        node.value = node.value + '.' + tokens[current + 2].value;
      }

      return node;
    }

    if (
      token !== undefined &&
      token.type === 'keyword' &&
      specialTokens.indexOf(token.value) === -1 &&
      tokens[current - 1].value !== 'return'
    ) {
      let beforeToken = tokens[current - 2];
      let previousNode = {};

      if (
        beforeToken.type === 'keyword' &&
        beforeToken.value === 'print'
      ) {
        previousNode = {
          type: 'CallExpression',
          name: beforeToken.value,
          params: []
        };
      }

      let node = {
        type: 'CallExpression',
        name: token.value,
        params: [],
      };

      if (
        beforeToken.type === 'keyword' &&
        beforeToken.value === 'if'
      ) {
        delete node.params;
        node.type = 'Accessment';
      }

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
      token !== undefined &&
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

    if (token !== undefined && token.type === 'operation') {
      current++;
      return;
    }

    if (
      token !== undefined &&
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
        if (tokens[current + 1].type === 'operation') {
          token = tokens[++current];
          node.value = walk();
          _cacheValueNode = node.value;
        } else {
          node.value = walk();
          _cacheValueNode = node.value;
        }
      }

      if (
        token.type === 'delimiter' &&
        token.value === ';'
      ) {
        current++;
      }

      _cacheNodes.push(node);
      _cacheAssignmentNodes.push(node);

      return node;
    }

    if (
      token !== undefined &&
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
        tokens[current - 1].type !== 'assignment' &&
        tokens[current - 1].value !== '=' &&
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
            token = tokens[++current];
          } else if (node.block.filter(b => b !== undefined && b.type === 'ReturnExpression').length > 0) {
            node.block.map(b => {
              if (b.type === 'ReturnExpression') {
                b.values.push(walk());
              }
              return b;
            });
            token = tokens[++current];
          } else {
            node.block.push(walk(false, false, true));
            if (
              token.type === 'keyword' &&
              isPastAReturnExpression
            ) {
              isPastAReturnExpression = false;
              node.block.push({
                type: 'ReturnExpression',
                name: 'return',
                values: [{
                  type: 'Accessment',
                  value: token.value
                }]
              });
            }
            token = tokens[++current];
          }
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
      _supplyCacheNode = node;

      if (isParamFn) {
        return node;
      }

      return;
    }

    if (
      token !== undefined &&
      token.type === 'block' &&
      token.value === '{'
    ) {
      token = tokens[++current];

      let subCacheNode = {};
      let subExpression = {};

      if (
        token.type === 'keyword' &&
        token.value === 'fun'
      ) {
        subCacheNode = _cacheNode;
        subExpression = walk();
        if (subExpression === undefined) {
          subExpression = walk();
          subCacheNode.block.push(subExpression);
        }
      }

      let node = {};

      if (_cacheNode) {
        node = _cacheNode;
        _cacheNode = {};
      }

      while (
        (token !== undefined && token.type !== 'block') ||
        ((token !== undefined && token.type === 'block') && (token !== undefined && token.value !== '}'))
      ) {
        if (node.block !== undefined) {
          node.block.push(walk());
        }
        token = tokens[++current];
      }

      current++;

      let cacheCallExpression = [];

      if (node.block !== undefined) {
        cacheCallExpression = node.block
        .filter(b => b !== undefined && b.type === 'CallExpression');
      }

      if (cacheCallExpression.length > 0) {
        _cacheCallExpression = cacheCallExpression[0];
      }

      let returnPos = -1;
      let block = [];

      if (node.block !== undefined) {
        node.block.forEach((b, i) => {
          if (b !== undefined && b.type === 'ReturnExpression') {
            returnPos = i;
          }
        });

        node.block.forEach((b, i) => {
          if (b !== undefined && returnPos !== -1 && returnPos >= i) {
            block.push(b);
          }
        });

        node.block = block;
      }

      if (Object.keys(subCacheNode).length > 0) {
        node = subCacheNode;
      }

      return node;
    }

    if (
      token !== undefined &&
      token.type === 'keyword' &&
      token.value === 'return'
    ) {
      current++;
      let w = walk();
      return {
        type: 'ReturnExpression',
        name: 'return',
        values: [w]
      };
    }

    if (
      token !== undefined &&
      token.type === 'paren' &&
      token.value === '('
    ) {
      token = tokens[++current];

      let node = {};

      if (
        tokens[current - 3].type !== 'keyword' &&
        tokens[current - 3].value !== 'fun'
      ) {
        node = {
          type: 'CallExpression',
          name: tokens[current - 2].value,
          params: [],
        };

        if (
          tokens[current + 1].type === 'dot' &&
          tokens[current + 1].value === '.'
        ) {
          let param = {
            type: 'Accessment',
            name: token.value + '.' + tokens[current + 2].value,
            value: {}
          };
          node.params.push(param);
        }

        if (_cacheToken !== null) {
          node.name = _cacheToken.value;
          _cacheToken = null;
        }

        while (
          (token !== undefined && token.type !== 'paren') ||
          (token !== undefined && token.type === 'paren' && token.value !== ')')
        ) {
          let w = walk(true);
          let hasParamSameName = node.params.filter(p => {
            if (p !== undefined && (w !== undefined && p.name.indexOf(w.name) === -1)) {
              return p;
            }
          }).length === 0;
          if (!hasParamSameName) {
            node.params.push(w);
          }
          node.params = node.params.filter(v => v !== undefined);
          token = tokens[++current];
        }

        current++;
      } else {
        node = {
          type: 'FunctionExpression',
          name: tokens[current - 2].value,
          params: [],
          block: [],
        }

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
          tokens[current - 1].type !== 'assignment' &&
          tokens[current - 1].value !== '=' &&
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
              token = tokens[++current];
            } else if (node.block.filter(b => b !== undefined && b.type === 'ReturnExpression').length > 0) {
              node.block.map(b => {
                if (b.type === 'ReturnExpression') {
                  b.values.push(walk());
                }
                return b;
              });
              token = tokens[++current];
            } else {
              node.block.push(walk(false, false, true));
              if (
                token.type === 'keyword' &&
                isPastAReturnExpression
              ) {
                isPastAReturnExpression = false;
                node.block.push({
                  type: 'ReturnExpression',
                  name: 'return',
                  values: [{
                    type: 'Accessment',
                    value: token.value
                  }]
                });
              }
              token = tokens[++current];
            }
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
          b.values = b.values.filter(v => v !== undefined);
          return b;
        });
      }

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
      token !== undefined &&
      token.type === 'delimiter' &&
      token.value === ';'
    ) {
      token = tokens[++current];
      return;
    }

    if (
      token !== undefined &&
      token.type === 'keyword' &&
      token.value === 'print'
    ) {
      let node = {
        type: 'CallExpression',
        name: token.value,
        params: []
      };

      token = tokens[++current];

      if (
        token.type === 'paren' &&
        token.value === '('
      ) {
        token = tokens[++current];

        while (
          (token !== undefined && token.type !== 'paren') ||
          ((token !== undefined && token.type === 'paren') && (token !== undefined && token.value !== ')'))
        ) {
          let w = walk();
          node.params.push(w);
          token = tokens[++current];
        }
        node.params = node.params.filter(p => p !== undefined);
      }

      _cacheBaseNodes.push(node);

      _cacheToken = token;
      token = tokens[++current];

      return node;
    }

    if (
      token !== undefined &&
      token.type === 'block' &&
      token.value === '}'
    ) {
      return;
    }

    if (
      token !== undefined &&
      token.type === 'paren' &&
      token.value === ')'
    ) {
      return;
    }

    if (
      token !== undefined &&
      token.type === 'comma' &&
      token.value === ','
    ) {
      return;
    }

    if (
      token !== undefined &&
      token.type === 'name'
    ) {
      let node = {
        type: 'Accessment',
        name: token.value,
        value: {}
      };
      node.value = _cacheValueNode;
      return node;
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
    ast.body = ast.body.map(v => {
      if (v.block !== undefined) {
        v.block = v.block.filter(w => w !== undefined);
      }
      return v;
    });
  }

  if (_cacheCallExpression && hasPreviousNodeAssignExpression) {
    ast.body.push(_cacheCallExpression);
  }

  if (Object.keys(_cacheWNode).length > 0) {
    let partial = {};
    if (_cacheWNode.block !== undefined) {
      partial = _cacheWNode.block[0].values.slice(1)[0];
      _cacheWNode.block[0].values = _cacheWNode.block[0].values.slice(0, 1);
    }
    if (_cacheWNode.type !== 'ReturnExpression') {
      _cacheWNode.params = _cacheWNode.params.map(p => {
        const names = p.name.split('.');
        if (p.type === 'Accessment') {
          if (
            _cacheAssignmentNodes[0].name === names[0] &&
            _cacheAssignmentNodes[0].value.type === 'ObjectLiteral'
          ) {
            let prop = _cacheAssignmentNodes[0].value.values.filter(v => v.name === names[1]);
            if (prop[0] !== undefined) {
              p.value = prop[0].value;
            }
          }
        }
        return p;
      });
    }
    ast.body.push(_cacheWNode);
    if (partial && Object.keys(partial).length > 0) {
      ast.body.push(partial);
    }
  }

  if (_cacheBaseNodes.length > 0 && ast.body.filter(n => n.type === 'CallExpression').length === 0) {
    _cacheBaseNodes.forEach(n => ast.body.push(n));
  }

  if (ast.body.filter(b => b.type === 'EqualExpression').length > 0) {
    ast.body = ast.body.filter(b => b.type !== 'BooleanLiteral');
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
      case 'CallExpression':
        traverseArray(node.params, node);
        break;
      case 'AssignmentExpression':
      case 'Accessment':
      case 'Mutation':
      case 'OperationExpression':
      case 'FunctionExpression':
        traverseArray(node.block, node);
        break;
      case 'ScopeAssignmentExpression':
      case 'ReturnExpression':
      case 'Argument':
      case 'ConditionalExpression':
      case 'ArrayLiteral':
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

    Mutation: {
      enter(node, parent) {
        parent._context.push({
          type: 'Mutation',
          name: node.name,
          value: node.value
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

    ObjectLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'ObjectLiteral',
          values: node.values
        });
      }
    },

    ArrayLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'ArrayLiteral',
          values: node.values
        });
      }
    },

    OperationExpression: {
      enter(node, parent) {}
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

        if (node.value.type === 'ObjectLiteral') {
          expression.expression.register = {
            type: node.value.type,
            name: node.name,
            values: node.value.values
          };
        }

        if (node.value.type === 'OperationExpression') {
          delete expression.expression.register.type;
          expression.expression.register.value = {
            type: 'OperationStatement',
            expression: {
              type: node.value.type,
              operator: node.value.operator,
              values: node.value.values
            }
          };
        }

        if (node.value.type === 'ArrayLiteral') {
          delete expression.expression.register.type;
          expression.expression.register.value = {
            type: node.value.type,
            values: node.value.values
          };
        }

        parent._context.push(expression);
      }
    },

    ConditionalExpression: {
      enter(node, parent) {
        let expression = {
          type: 'ConditionalStatement',
          expression: {
            type: 'ConditionalExpression',
            name: node.name,
            conditions: node.conditions,
            block: node.block,
          }
        };

        expression.expression.block = expression.expression.block.map(b => {
          if (b.type === 'ScopeAssignmentExpression') {
            b.value = {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'Identifier',
                  name: b.value.name
                },
                arguments: b.value.params
              }
            };
            b.registers = [b.value];
            delete b.value;
            b = {
              type: 'ScopeAssignmentStatement',
              expression: b
            };
          }
          return b;
        });

        parent._context.push(expression);
      }
    },

    ScopeAssignmentExpression: {
      enter(node, parent) {
        let expression = {
          type: 'ScopeAssignmentStatement',
          expression: {
            type: 'ScopeAssignmentExpression',
            name: node.name,
            registers: node.values
          }
        };

        expression.expression.registers = expression.expression.registers.map(r => {
          if (r.type === 'CallExpression') {
            r = {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'Identifier',
                  name: r.name
                },
                arguments: r.params
              }
            };
          }
          return r;
        });

        parent._context.push(expression);
      }
    },

    ReturnExpression: {
      enter(node, parent) {
        let expression = {
          type: 'ReturnStatement',
          name: node.name,
          expression: {
            type: 'ReturnExpression',
            values: node.values
          }
        };

        parent._context.push(expression);
      }
    },

    FunctionExpression: {
      enter(node, parent) {
        let expression = {
          type: 'FunctionExpression',
          name: node.name,
          params: node.params,
          block: [],
        };

        node._context = expression.block;

        if (parent.type !== 'FunctionExpression' || parent.type === 'FunctionExpression') {
          expression = {
            type: 'FunctionStatement',
            expression: expression,
          }
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
      let expressed = false;
      if (node.expression.registers !== undefined) {
        node.expression.registers.forEach(r => {
          if (r.type === 'ExpressionStatement') {
            expressed = true;
            out.push(codeGenerator(r));
          } else {
            out.push(r.value);
          }
        });
      }
      return '' + node.expression.name + ' = ' + out.join(' + ') + (!expressed ? ';' : '');
    case 'AssignmentStatement':
      if (node.expression.register.type === 'StringLiteral') {
        return (
          'var ' +
          node.expression.register.name +
          ' = ' + '"' + node.expression.register.value + '"' +
          ';'
        );
      }
      if (node.expression.register.type === 'ObjectLiteral') {
        let out = [];
        node.expression.register.values.forEach(v => {
          // push values to output related to key/value
          // format of object literal
          out.push('' + v.name + ':' + v.value.value + '');
        });
        return (
          'var ' +
          node.expression.register.name +
          ' = ' + '{' + out.join(', ') + '}' +
          ';'
        );
      }
      if (node.expression.register.value.type === 'ArrayLiteral') {
        let out = [];
        node.expression.register.value.values.forEach(v => {
          out.push(v.value);
        });
        return (
          'var ' +
          node.expression.register.name +
          ' = ' + '[' + out.join(', ') + ']' +
          ';'
        );
      }
      if (node.expression.register.value.type === 'OperationStatement') {
        let values = node.expression.register.value.expression.values.map(v => v.value);
        return (
          'var ' +
          node.expression.register.name +
          ' = ' + values.join(' ' + node.expression.register.value.expression.operator + ' ') +
          ';'
        );
      }
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
    case 'ConditionalStatement':
      let block = node.expression.block.map(v => {
        if (v.type === 'ScopeAssignmentStatement') {
          return codeGenerator(v);
        } else if (v.type !== 'CallExpression') {
          return v.name + ' = ' + v.value;
        } else if (v.type === 'CallExpression') {
          return v.name + '()';
        }
      }).join('');
      return (
        '' + node.expression.name + ' ' +
        '(' + node.expression.conditions.map(v => v.name).join('') + ')' +
        '{' + (block ? block + ';' : '') + '}'
      );
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
