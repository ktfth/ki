const assert = require('assert');
const { Parser } = require('../');

describe('Parser', () => {
	let parser = new Parser([
		{ type: 'number', value: '1' },
		{ type: 'operation', value: '+' },
		{ type: 'number', value: '1' },
	]);

	it('should have tokens', () => {
		assert.deepEqual(parser.tokens, [
			{ type: 'number', value: '1' },
			{ type: 'operation', value: '+' },
			{ type: 'number', value: '1' },
		]);
	});

	it('should have current', () => {
		assert.equal(parser.current, 0);
	});

	it('should have a number interaction token', () => {
		let interactionNumberToken = (token, current, tokens) => {
			let node = {
				type: 'NumberLiteral',
				value: null
			};
			if (token.type === 'number') {
				node.value = token.value;
				current++;
			}

			return {
				current,
				node
			};
		};
		parser.mechanism['number'] = interactionNumberToken;
		assert.deepEqual(parser.mechanism['number'], interactionNumberToken);
	});

	it('should have a operation interaction token', () => {
		let interactionOperationToken = (token, current, tokens) => {
			let node = {
				type: 'Operation',
				value: null
			};
			if (token.type === 'operation') {
				node.value = token.value;
				current++;
			}

			return {
				current,
				node
			};
		};
		parser.mechanism['operation'] = interactionOperationToken;
		assert.deepEqual(parser.mechanism['operation'], interactionOperationToken);
	});
});
