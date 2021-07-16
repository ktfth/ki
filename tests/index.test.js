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
			let tokenTypeUnkown = false;
			let node = {
				type: 'NumberLiteral',
				value: null
			};
			if (token.type === 'number') {
				node.value = token.value;
				current++;
			} else {
				tokenTypeUnkown = true;
			}

			return {
				token,
				current,
				node,
				tokenTypeUnkown,
			};
		};
		parser.mechanism['number'] = interactionNumberToken;
		assert.deepEqual(parser.mechanism['number'], interactionNumberToken);
	});

	it('should have a operation interaction token', () => {
		let interactionOperationToken = (token, current, tokens) => {
			let tokenTypeUnkown = false;
			let node = {
				type: 'Operation',
				value: null
			};
			if (token.type === 'operation') {
				node.value = token.value;
				current++;
			} else {
				tokenTypeUnkown = false;
			}

			return {
				token,
				current,
				node,
				tokenTypeUnkown,
			};
		};
		parser.mechanism['operation'] = interactionOperationToken;
		assert.deepEqual(parser.mechanism['operation'], interactionOperationToken);
	});

	it('should run the mechanism', () => {
		parser
			.runMechanism()
			.runMechanism()
			.runMechanism();
		assert.deepEqual(parser.nodes, [
			{ type: 'NumberLiteral', value: '1' },
			{ type: 'Operation', value: '+' },
			{ type: 'NumberLiteral', value: '1' },
		]);
	})
});
