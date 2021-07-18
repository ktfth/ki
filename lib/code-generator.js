class CodeGenerator {
	constructor(node = {}, entryMechanism = 'Program') {
		this.node = node;
		this.output = '';

		this.entryMechanism = entryMechanism;
		this.mechanism = {};

		this.run = this.run.bind(this);
	}

	run(node = {}) {
		if (Object.keys(node).length > 0) {
			this.node = node;
		}

		for (let key in this.mechanism) {
			if (this.node.type === key) {
				const mechanism = this.mechanism[key](this.node);
				if (key === this.entryMechanism) {
					this.output = mechanism.replace(/\s$/, '');
				}
				return mechanism;
			}
		}

		return this;
	}
}
module.exports = CodeGenerator;
