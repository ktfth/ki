'use strict';
const assert = require('assert');

function isArray(o) {
	return o.constructor.toString().indexOf('Array') > -1;
}

function copy(o) {
	let out = {};
	Object.keys(o).forEach(k => out[k] = o[k]);
	return out;
}

function lexer(t) {
	let node = {};

	if (!isArray(t) && t.type === 'number') {
		node.type = 'NumberLiteral';
		node.value = t.value;
	}

	if (!isArray(t) && t.type === 'string') {
		node.type = 'StringLiteral';
		node.value = t.value;
	}

	if (!isArray(t) && t.type === 'boolean') {
		node.type = 'BooleanLiteral';
		node.value = t.value;
	}

	if (isArray(t)) {
		let entry = t[0];
		if (entry.type === 'block' && entry.value === '{') {
			node.type = 'ObjectLiteral';
			node.values = [];

			let prop = {
				type: 'PropAssignmentExpression',
				name: '',
				value: {},
			};

			let isPropAssignment = false;
			let isEndOfBlock = false;

			t.slice(1).forEach(v => {
				if (v.type === 'param') {
					prop.name = v.value;
				}

				if (v.type === 'colon' && v.value === ':') {
					isPropAssignment = true;
				}

				if (isPropAssignment && v.type !== 'colon' && v.value !== ':') {
					prop.value = lexer(v);
					node.values.push(copy(prop));
					prop.name = '';
					prop.value = {};
					isPropAssignment = false;
				}
			});
		}
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

assert.deepStrictEqual(lexer([
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
]), {
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
});
