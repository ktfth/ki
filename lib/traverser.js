class Traverser {
	constructor(ast, visitor = {}) {
		this.ast = ast;
		this.visitor = visitor;
		this.newAst = {};

		this.mechanism = {};

		this.transform = this.transform.bind(this);
	}

	traverseArray(array, parent) {
		const self = this;
		if (array !== undefined) {
			array.forEach(child => {
				self.traverseNode(child, parent);
			});
		}
	}

	traverseNode(node, parent) {
		let methods = this.visitor[node.type];
		let mechanismExecution = [];

		if (methods && methods.enter) {
			methods.enter(node, parent);
		}

		for (let key in this.mechanism) {
			if (node.type === key) {
				this.mechanism[key](node, parent);
				mechanismExecution.push(true);
			} else {
				mechanismExecution.push(false);
			}
			if (mechanismExecution.length === Object.keys(this.mechanism).length && mechanismExecution.filter(nodeTypeCheck => nodeTypeCheck === true).length === 0) {
				throw new TypeError(node.type);
			}
		}

		if (methods && methods.exit) {
			methods.exit(node, parent);
		}
	}

	transform() {
		this.newAst = {
			type: 'Program',
			body: [],
		};

		this.ast._context = this.newAst.body;

		this.traverseNode(this.ast, null);

		return this;
	}
}
module.exports = Traverser;
