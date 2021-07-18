class Traverser {
	constructor(ast, visitor = {}) {
		this.ast = ast;
		this.visitor = visitor;
	}
}
module.exports = Traverser;
