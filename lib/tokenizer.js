class Tokenizer {
	constructor(input) {
		this.input = input;

		this.current = 0;
		this.tokens = [];

		this.mechanism = {};

		this.runMechanism = this.runMechanism.bind(this);
	}

	runMechanism() {
		mechanism:
		while (this.current < this.input.length) {
			let char = this.input[this.current];

			interaction:
			for (let key in this.mechanism) {
				const { char: mChar, tokens, current, input, continue: c } = this.mechanism[key](
					char,
					this.tokens,
					this.current,
					this.input
				);
				this.char = mChar;
				this.tokens = tokens;
				this.current = current;
				this.input = input;
				if (c) {
					continue interaction;
					continue mechanism;
				}
			}

			if (Object.keys(this.mechanism).length === 0) {
				throw new TypeError('Unknown char "' + char + '"');
			}
		}
		return this;
	}
}

module.exports = Tokenizer;
