class CodeGenerator {
	constructor(node = {}, entryMechanism = 'Program') {
		this.node = node;
		this.output = '';

		this.entryMechanism = entryMechanism;
		this.mechanism = {};
		this.puppet = null;

		this.run = this.run.bind(this);
	}

	run(node = {}) {
		let mechanismExecution = [];
		if (Object.keys(node).length > 0) {
			this.node = node;
		}

		for (let key in this.mechanism) {
			if (this.node.type === key) {
				const mechanism = this.mechanism[key](this.node);
				if (key === this.entryMechanism) {
					this.output = mechanism;
					if (this.puppet !== null) {
						this.output = this.puppet(this.output);
					}
				}
				mechanismExecution.push(true);
				return mechanism;
			} else {
				mechanismExecution.push(false);
			}
			if (mechanismExecution.length === Object.keys(this.mechanism).length && mechanismExecution.filter(nodeTypeCheck => nodeTypeCheck === true).length === 0) {
				throw new TypeError(this.node.type);
			}
		}

		return this;
	}
}
module.exports = CodeGenerator;
