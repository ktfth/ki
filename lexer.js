'use strict';
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

	return node;
}

module.exports = {
	lexer
};
