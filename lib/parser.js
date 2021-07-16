class Parser {
	constructor(tokens) {
		this.tokens = tokens;
		this.current = 0;

		this.mechanism = {};
		this.nodes = [];

		this.runMechanism = this.runMechanism.bind(this);
	}

	runMechanism() {
		let node = {};
		let checkMechanism = [];
		let token = this.tokens[this.current];
		for (let key in this.mechanism) {
			const { token: tok, current, node: n, tokenTypeUnkown } = this.mechanism[key](
				token,
				this.current,
				this.tokens
			);
			token = tok;
			this.current = current;
			node = n;
			if (node.value !== null) {
				break;
			}
			checkMechanism.push(key);
			// if (checkMechanism.length === Object.keys(this.mechanism).length && tokenTypeUnkown) {
			// 	throw new TypeError(token.type);
			// }
		}
		this.nodes.push(node);
		return this;
	}
}
module.exports = Parser;
