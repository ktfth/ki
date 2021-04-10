'use strict';
const assert = require('assert');

function lexer(token) {
	let node = {};

	if (token.type === 'number') {
		node.type = 'NumberLiteral';
		node.value = token.value;
	}

	return node;
}

assert.deepStrictEqual(lexer({
	type: 'number', value: '1'
}), {
	type: 'NumberLiteral',
	value: '1'
});
