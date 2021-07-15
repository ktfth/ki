class Tokenizer {
	constructor(input) {
		this.input = input;

		this.current = 0;
		this.tokens = [];

		this.mechanism = {};

		this.runMechanism = this.runMechanism.bind(this);
	}

	runMechanism() {
		let latestPointer = [];
		let mechanismContext = [];
		let latestPointerAgg = {};
		mechanism:
		while (this.current < this.input.length) {
			let char = this.input[this.current];
			let mechanismLenHandler = () => Object.keys(this.mechanism).length;

			interaction:
			for (let key in this.mechanism) {
				const { char: mChar, tokens, current, input, continue: c } = this.mechanism[key](
					char,
					this.tokens,
					this.current,
					this.input
				);
				latestPointer.push(current);
				mechanismContext.push(key);
				if (latestPointerAgg[current] === undefined) {
					latestPointerAgg[current] = 0;
				}
				if (latestPointerAgg[current] !== undefined) {
					latestPointerAgg[current] += 1;
				}
				if (latestPointerAgg[current] > mechanismLenHandler() + 1) {
					throw new TypeError('Unknown char "' + char + '"')
				}
				this.char = mChar;
				this.tokens = tokens;
				this.current = current;
				this.input = input;
				if (c) {
					continue interaction;
					continue mechanism;
				}
			}

			if (mechanismLenHandler() === 0) {
				throw new TypeError('Unknown char "' + char + '"');
			}
		}
		return this;
	}
}

module.exports = Tokenizer;
