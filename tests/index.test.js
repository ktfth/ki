const assert = require('assert');
const { Tokenizer } = require('../');

describe('Tokenizer', () => {
	let tokenizer = new Tokenizer('1 + 1');

	it('should have an input', () => {
		assert.equal(tokenizer.input, '1 + 1');
	});

	it('should have a current pointer', () => {
		assert.equal(tokenizer.current, 0);
	});

	it('should have tokens', () => {
		assert.deepEqual(tokenizer.tokens, []);
	});

	it('should have a mechanism for number', () => {
		let interaction = (char, tokens, current, input) => {
			let NUMBERS = /[0-9]/;
			if (NUMBERS.test(char)) {
				let value = '';

				while (NUMBERS.test(char)) {
					value += char;
					char = input[++current];
				}

				tokens.push({ type: 'number', value });
			}

			return {
				char,
				tokens,
				current,
				input,
				continue: true,
			};
		};
		tokenizer.mechanism['number'] = interaction;
		assert.deepEqual(tokenizer.mechanism['number'], interaction);
	});

	it('should have a mechanism for space or break line', () => {
		let interaction = (char, tokens, current, input) => {
			if (/\n|\s/.test(char)) {
				current++;
			}

			return {
				char,
				tokens,
				current,
				input,
				continue: true,
			};
		};
		tokenizer.mechanism['special'] = interaction;
		assert.deepEqual(tokenizer.mechanism['special'], interaction);
	});

	it('should have a mechanism for plus operation', () => {
		let interaction = (char, tokens, current, input) => {
			if (char === '+') {
				tokens.push({ type: 'operation', value: char });
				current++;
			}

			return {
				char,
				tokens,
				current,
				input,
				continue: true
			};
		};
		tokenizer.mechanism['sum'] = interaction;
		assert.deepEqual(tokenizer.mechanism['sum'], interaction);
	});

	it('should run mechanism', () => {
		tokenizer.runMechanism();
		assert.deepEqual(tokenizer.tokens, [
			{ type: 'number', value: '1' },
			{ type: 'operation', value: '+' },
			{ type: 'number', value: '1' },
		]);
	});

	it('should throws for unkown char', () => {
		tokenizer = new Tokenizer('1 - 1');
		assert.throws(() => {
			tokenizer.runMechanism();
		});
	});

	it('should throws for unknown char with context', () => {
		let interactionNumber = (char, tokens, current, input) => {
			let NUMBERS = /[0-9]/;
			if (NUMBERS.test(char)) {
				let value = '';

				while (NUMBERS.test(char)) {
					value += char;
					char = input[++current];
				}

				tokens.push({ type: 'number', value });
			}

			return {
				char,
				tokens,
				current,
				input,
				continue: true,
			};
		};
		tokenizer.mechanism['number'] = interactionNumber;
		let interactionSpecial = (char, tokens, current, input) => {
			if (/\n|\s/.test(char)) {
				current++;
			}

			return {
				char,
				tokens,
				current,
				input,
				continue: true,
			};
		};
		tokenizer.mechanism['special'] = interactionSpecial;
		let interactionSum = (char, tokens, current, input) => {
			if (char === '+') {
				tokens.push({ type: 'operation', value: char });
				current++;
			}

			return {
				char,
				tokens,
				current,
				input,
				continue: true
			};
		};
		tokenizer.mechanism['sum'] = interactionSum;
		assert.throws(() => {
			tokenizer.runMechanism();
		});
	});
});
