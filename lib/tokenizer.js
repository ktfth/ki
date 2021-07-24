class Tokenizer {
	constructor(input) {
		this.input = input;

		this.current = 0;
		this.tokens = [];

		this.mechanism = {};

		this.runMechanism = this.runMechanism.bind(this);
	}

	runMechanism() {
		let latestPointerAgg = {};
		mechanism:
		while (this.current < this.input.length) {
			let char = this.input[this.current];
			let mechanismLenHandler = () => Object.keys(this.mechanism).length;

			interaction:
			for (let key in this.mechanism) {
				const { char: mChar, tokens, current, input, continue: c, pattern } = this.mechanism[key](
					char,
					this.tokens,
					this.current,
					this.input
				);
				// Latest pointer aggregation for char control over the loop
				if (latestPointerAgg[current] === undefined) {
					latestPointerAgg[current] = 0;
				}
				if (latestPointerAgg[current] !== undefined) {
					latestPointerAgg[current] += 1;
				}
				let isUndefined = pattern === undefined;
				let isRegExp = !isUndefined && pattern.constructor.toString().indexOf('RegExp') > -1;
				let isArray = !isUndefined && pattern.constructor.toString().indexOf('Array') > -1;
				let isString = !isUndefined && typeof pattern === 'string';
				let hasReachedTheLimit = latestPointerAgg[current] > mechanismLenHandler() + 1;
				if (
					(hasReachedTheLimit && isUndefined) ||
					(hasReachedTheLimit && isRegExp && pattern.test(char)) ||
					(hasReachedTheLimit && isArray && pattern.includes(char)) ||
					(hasReachedTheLimit && isString && pattern === char) ||
					(latestPointerAgg[current] >= (mechanismLenHandler() + 1) * 2)
				) {
					throw new TypeError('Unknown char "' + char + '"');
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
