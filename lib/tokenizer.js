class Tokenizer {
	constructor(input) {
		this.input = input;

		this.current = 0;
		this.tokens = [];

		this.mechanism = {};
	}
}

module.exports = Tokenizer;
