const Tokenizer = require('./tokenizer');
const Parser = require('./parser');
const Traverser = require('./traverser');
const CodeGenerator = require('./code-generator');

class Compiler {
	constructor(input) {
		this.input = input;
		this.output = '';

		this.run = this.run.bind(this);
	}

	run() {
		this.tokenizer = new Tokenizer(this.input);

		this.tokenizer.mechanism['number'] = (char, tokens, current, input) => {
			let NUMBERS = /[0-9]/;
			if (NUMBERS.test(char)) {
				let value = '';

				while (NUMBERS.test(char)) {
					value += char;
					char = input[++current];
				}

				tokens.push({ type: 'number', value });
			}

			return {
				char,
				tokens,
				current,
				input,
				continue: true,
				pattern: NUMBERS
			};
		};

		this.tokenizer.mechanism['special'] = (char, tokens, current, input) => {
			if (/\n|\s/.test(char)) {
				current++;
			}

			return {
				char,
				tokens,
				current,
				input,
				continue: true,
				pattern: /\n|\s/
			};
		};

		this.tokenizer.mechanism['operation'] = (char, tokens, current, input) => {
			if (['+', '-', '*', '/'].includes(char)) {
				tokens.push({ type: 'operation', value: char });
				current++;
			}

			return {
				char,
				tokens,
				current,
				input,
				continue: true,
				pattern: ['+', '-', '*', '/']
			};
		};

		this.tokenizer.mechanism['termination'] = (char, tokens, current, input) => {
			if (char === ';') {
				tokens.push({ type: 'termination', value: char });
				current++;
			}

			return {
				char,
				tokens,
				current,
				input,
				continue: true,
				pattern: ';',
			};
		};

		this.tokenizer.runMechanism();

		this.parser = new Parser(this.tokenizer.tokens);

		this.parser.mechanism['number'] = (token, current, tokens) => {
			let tokenTypeUnkown = false;
			let node = {
				type: 'NumberLiteral',
				value: null
			};
			if (token.type === 'number') {
				node.value = token.value;
				current++;
			} else {
				tokenTypeUnkown = true;
			}

			return {
				token,
				current,
				node,
				tokenTypeUnkown,
			};
		};

		this.parser.mechanism['operation'] = (token, current, tokens) => {
			let tokenTypeUnkown = false;
			let node = {
				type: 'Operation',
				value: null
			};
			if (token.type === 'operation') {
				node.value = token.value;
				current++;
			} else {
				tokenTypeUnkown = true;
			}

			return {
				token,
				current,
				node,
				tokenTypeUnkown,
			};
		};

		this.parser.mechanism['termination'] = (token, current, tokens) => {
			let tokenTypeUnkown = false;
			let node = {
				type: 'Termination',
				value: null
			};
			if (token.type === 'termination') {
				node.value = token.value;
				current++;
			} else {
				tokenTypeUnkown = true;
			}

			return {
				token,
				current,
				node,
				tokenTypeUnkown,
			};
		};

		this.parser.run();

		this.traverser = new Traverser(this.parser.ast);

		this.traverser.visitor['NumberLiteral'] = {
			enter(node, parent) {
				parent._context.push({
					type: 'NumberLiteral',
					value: node.value,
				});
			}
		};

		this.traverser.visitor['Operation'] = {
			enter(node, parent) {
				parent._context.push({
					type: 'Operation',
					value: node.value,
				});
			}
		};

		this.traverser.visitor['Termination'] = {
			enter(node, parent) {
				parent._context.push({
					type: 'Termination',
					value: node.value,
				});
			}
		};

		this.traverser.mechanism['Program'] = (node, parent) => {
			this.traverser.traverseArray(node.body, node);
		};

		this.traverser.mechanism['NumberLiteral'] = (node, parent) => {};

		this.traverser.mechanism['Operation'] = (node, parent) => {};

		this.traverser.mechanism['Termination'] = (node, parent) => {};

		this.traverser.transform();

		this.codeGenerator = new CodeGenerator(this.traverser.newAst);

		this.codeGenerator.mechanism['Program'] = (node) => {
			return node.body.map(this.codeGenerator.run).join('');
		};

		this.codeGenerator.mechanism['NumberLiteral'] = (node) => {
			return '' + node.value + ' ';
		};

		this.codeGenerator.mechanism['Operation'] = (node) => {
			return '' + node.value + ' ';
		};

		this.codeGenerator.mechanism['Termination'] = (node) => {
			return '' + node.value + '';
		};

		this.codeGenerator.run();

		this.output = this.codeGenerator.output;

		return this;
	}
}
module.exports = Compiler;
