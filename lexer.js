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

function lexer(t, cb = () => {}) {
	let node = {};

	if (!isArray(t) && t.type === 'number') {
		node.type = 'NumberLiteral';
		node.value = t.value;
		cb(t);
	}

	if (!isArray(t) && t.type === 'string') {
		node.type = 'StringLiteral';
		node.value = t.value;
		cb(t);
	}

	if (!isArray(t) && t.type === 'boolean') {
		node.type = 'BooleanLiteral';
		node.value = t.value;
		cb(t);
	}

	if (!isArray(t) && t.type === 'keyword') {
		node.type = 'Accessment';
		node.value = t.value;
	}

	if (isArray(t)) {
		let entry = t[0];
		if (entry !== undefined && (entry.type === 'block' && entry.value === '{')) {
			node.type = 'ObjectLiteral';
			node.values = [];

			cb(entry);

			let prop = {
				type: 'PropAssignmentExpression',
				name: '',
				value: {},
			};

			let isPropAssignment = false;

			t.forEach(v => {
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

				cb(v);
			});
		}

		if (t[1] !== undefined && t[1].type === 'equal' && t[1].value === '==') {
			node.type = 'EqualExpression';
			node.value = t[1].value;
			cb(t[0]);
			node.leftHand = lexer(t[0]);
			cb(t[1]);
			node.rightHand = lexer(t[2]);
			cb(t[2]);
		}

		if (t[1] !== undefined && t[1].type === 'strict-equal' && t[1].value === '===') {
			node.type = 'EqualExpression';
			node.value = t[1].value;
			cb(t[0]);
			node.leftHand = lexer(t[0]);
			cb(t[1]);
			node.rightHand = lexer(t[2]);
			cb(t[2]);
		}

		if (t[1] !== undefined && t[1].type === 'operation') {
			node.type = 'OperationExpression';
			node.operator = t[1].value;
			node.values = [];
			cb(t[0]);
			node.values.push(lexer(t[0]));
			cb(t[1]);
			node.values.push(lexer(t[2]));
			cb(t[2]);
		}
	}

	return node;
}
module.exports = {
	lexer
};

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

assert.deepStrictEqual(lexer([
	{ type: 'boolean', value: 'true' },
	{ type: 'equal', value: '==' },
	{ type: 'boolean', value: 'true' },
	{ type: 'delimiter', value: ';' },
]), {
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
});

assert.deepStrictEqual(lexer([
	{ type: 'boolean', value: 'true' },
	{ type: 'strict-equal', value: '===' },
	{ type: 'boolean', value: 'true' },
	{ type: 'delimiter', value: ';' },
]), {
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
});
