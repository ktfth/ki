const assert = require('assert');
const { Traverser } = require('../');

describe('Traverser', () => {
	let traverser = new Traverser({
		type: 'Program',
		body: [
			{ type: 'NumberLiteral', value: '1' },
			{ type: 'Operation', value: '+' },
			{ type: 'NumberLiteral', value: '1' },
		]
	});

	it('should have ast', () => {
		assert.deepEqual(traverser.ast, {
			type: 'Program',
			body: [
				{ type: 'NumberLiteral', value: '1' },
				{ type: 'Operation', value: '+' },
				{ type: 'NumberLiteral', value: '1' },
			]
		});
	});

	it('should have visitor', () => {
		traverser.visitor['NumberLiteral'] = {
			enter(node, parent) {
				parent._context.push({
					type: 'NumberLiteral',
					value: node.value,
				});
			}
		};
		assert.equal(typeof traverser.visitor['NumberLiteral'].enter, 'function');
	});
});
