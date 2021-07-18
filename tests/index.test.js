const assert = require('assert');
const { CodeGenerator } = require('../');

describe('CodeGenerator', () => {
	let codeGenerator = new CodeGenerator({
		type: 'Program',
		body: [
			{ type: 'NumberLiteral', value: '1' },
			{ type: 'Operation', value: '+' },
			{ type: 'NumberLiteral', value: '1' },
		]
	});

	it('should have node', () => {
		assert.deepEqual(codeGenerator.node, {
			type: 'Program',
			body: [
				{ type: 'NumberLiteral', value: '1' },
				{ type: 'Operation', value: '+' },
				{ type: 'NumberLiteral', value: '1' },
			]
		});
	});

	it('should have a mechanism for program', () => {
		let interactionProgram = (node) => {
			return node.body.map(codeGenerator.run).join('');
		};
		codeGenerator.mechanism['Program'] = interactionProgram;
		assert.deepEqual(codeGenerator.mechanism['Program'], interactionProgram);
	});

	it('should have a mechanism for number literal', () => {
		let interactionNumberLiteral = (node) => {
			return '' + node.value + ' ';
		};
		codeGenerator.mechanism['NumberLiteral'] = interactionNumberLiteral;
		assert.deepEqual(codeGenerator.mechanism['NumberLiteral'], interactionNumberLiteral);
	});

	it('should have a mechanism for operation', () => {
		let interactionOperation = (node) => {
			return '' + node.value + ' ';
		};
		codeGenerator.mechanism['Operation'] = interactionOperation;
		assert.deepEqual(codeGenerator.mechanism['Operation'], interactionOperation);
	});

	it('should run code generator', () => {
		console.log(codeGenerator.run());
		assert.equal(codeGenerator.output, '1 + 1');
	});
});
