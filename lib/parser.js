class Parser {
	constructor(tokens) {
		this.tokens = tokens;
		this.current = 0;

		this.mechanism = {};
		this.nodes = [];
		this.ast = {
			type: 'Program',
			body: [],
		};

		this.runMechanism = this.runMechanism.bind(this);
		this.run = this.run.bind(this);
		this.getCurrent = this.getCurrent.bind(this);
		this.setCurrent = this.setCurrent.bind(this);
	}

	runMechanism() {
		let node = {};
		let token = this.tokens[this.current];
		for (let key in this.mechanism) {
			const { token: tok, current, node: n, tokenTypeUnkown } = this.mechanism[key](
				token,
				this.current,
				this.tokens
			);
			token = tok;
			this.setCurrent(current);
			node = n;
			if (node.value !== null) {
				break;
			}
		}
		this.nodes.push(node);
		return this;
	}

	run() {
		while (this.getCurrent() < this.tokens.length) {
			this.runMechanism();
			this.ast.body.push(this.nodes[this.nodes.length - 1]);
		}
		return this;
	}

	getCurrent(def = null) {
		return this.current || def;
	}

	setCurrent(value) {
		this.current = value;
		return this;
	}
}
module.exports = Parser;
