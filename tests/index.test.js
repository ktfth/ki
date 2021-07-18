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

	it('should have visitor for number literal', () => {
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

	it('should have visitor for operation', () => {
		traverser.visitor['Operation'] = {
			enter(node, parent) {
				parent._context.push({
					type: 'Operation',
					value: node.value,
				});
			}
		};
		assert.equal(typeof traverser.visitor['Operation'].enter, 'function');
	});

	it('should traverse', () => {
		let interactionProgram = (node, parent) => {
			traverser.traverseArray(node.body, node);
		};
		traverser.mechanism['Program'] = interactionProgram;
		let interactionNumberLiteral = (node, parent) => {};
		traverser.mechanism['NumberLiteral'] = interactionNumberLiteral;
		let interactionOperation = (node, parent) => {};
		traverser.mechanism['Operation'] = interactionOperation;
		traverser.transform();
		assert.deepEqual(traverser.newAst, {
			type: 'Program',
			body: [
				{ type: 'NumberLiteral', value: '1' },
				{ type: 'Operation', value: '+' },
				{ type: 'NumberLiteral', value: '1' },
			]
		});
	});
});
