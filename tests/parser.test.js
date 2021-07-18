const assert = require('assert');
const { Parser } = require('../');

describe('Parser', () => {
	let tokens = [
		{ type: 'number', value: '1' },
		{ type: 'operation', value: '+' },
		{ type: 'number', value: '1' },
	];
	let parser = new Parser(tokens);
	let parserNotTriggered = new Parser(tokens);
	let parserThrows = new Parser([
		{ type: 'assignment', value: '=' },
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
		parserNotTriggered.mechanism['number'] = interactionNumberToken;
		parserThrows.mechanism['number'] = interactionNumberToken;
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
				tokenTypeUnkown = true;
			}

			return {
				token,
				current,
				node,
				tokenTypeUnkown,
			};
		};
		parser.mechanism['operation'] = interactionOperationToken;
		parserNotTriggered.mechanism['operation'] = interactionOperationToken;
		parserThrows.mechanism['operation'] = interactionOperationToken;
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
	});

	it('should run the parser', () => {
		parserNotTriggered.run();
		assert.deepEqual(parserNotTriggered.ast, {
			type: 'Program',
			body: [
				{ type: 'NumberLiteral', value: '1' },
				{ type: 'Operation', value: '+' },
				{ type: 'NumberLiteral', value: '1' },
			]
		});
	});

	it('should run the mechanism and throws the token type', () => {
		assert.throws(() => {
			parserThrows.runMechanism();
		});
	});
});