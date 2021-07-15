const assert = require('assert');
const { Tokenizer } = require('../');

describe('Tokenizer', () => {
	it('should have an input', () => {
		let tokenizer = new Tokenizer('1 + 1');
		assert.equal(tokenizer.input, '1 + 1');
	});

	it('should have a current pointer', () => {
		let tokenizer = new Tokenizer('1 + 1');
		assert.equal(tokenizer.current, 0);
	});

	it('should have tokens', () => {
		let tokenizer = new Tokenizer('1 + 1');
		assert.deepEqual(tokenizer.tokens, []);
	});

	it('should have a mechanism', () => {
		let tokenizer = new Tokenizer('1 + 1');
		let interaction = (char, tokens, current, input) => {
			let NUMBERS = /[0-9]/;
			if (NUMBERS.test(char)) {
				let value = '';

				while (NUMBERS.test(char)) {
					value += char;
					char = input[++current];
				}
			}

			tokens.push({ type: 'number', value });

			return {
				char,
				tokens,
				current,
				input,
				continue: true
			};
		};
		tokenizer.mechanism['number'] = interaction;
		assert.deepEqual(tokenizer.mechanism, { number: interaction });
	});
});
