class CodeGenerator {
	constructor(node = {}, entryMechanism = 'Program') {
		this.node = node;
		this.output = '';

		this.entryMechanism = entryMechanism;
		this.mechanism = {};

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
					this.output = mechanism.replace(/\s;/, ';');
					this.output = this.output.replace(/\s$/, '');
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
