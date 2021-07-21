# Ki lang

## Description

This is a compiler based on the super tiny compiler, for a modern language who
compiles to javascript, there are a fill features needed to become a tool for
work, but you can use for practice and all contributions are welcome.

### Usage

```
[sudo] npm i ki-lang
```

```js
const { Compiler } = require('ki-lang');
const compiler = new Compiler('1 + 1');

compiler.run();

console.log(compiler.output);
```

### Story

[Here](https://kaeyosthaeron.medium.com/vis%C3%B5es-do-futuro-38c5b11e3d16) you can found a resource in portuguese to know more about the language.
