'use strict';
const assert = require('assert');

function lexer(token) {
	let node = {};

	if (token.type === 'number') {
		node.type = 'NumberLiteral';
		node.value = token.value;
	}

	if (token.type === 'string') {
		node.type = 'StringLiteral';
		node.value = token.value;
	}

	if (token.type === 'boolean') {
		node.type = 'BooleanLiteral';
		node.value = token.value;
	}

	return node;
}

assert.deepStrictEqual(lexer({
	type: 'number',
	value: '1',
}), {
	type: 'NumberLiteral',
	value: '1'
});

assert.deepStrictEqual(lexer({
	type: 'string',
	value: 'ki'
}), {
	type: 'StringLiteral',
	value: 'ki'
});

assert.deepStrictEqual(lexer({
	type: 'boolean',
	value: 'true'
}), {
	type: 'BooleanLiteral',
	value: 'true'
});
