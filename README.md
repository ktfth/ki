# Ki lang

## Description

This is a compiler based on the super tiny compiler, for a modern language who
compiles to javascript, there are a fill features needed to become a tool for
work, but you can use for practice and all contributions are welcome.

### Usage

A simple example of language usage with the name of greeting.ki:

```
fun greeting(name) {
	return "Hello, " + name;
}

print(greeting("John Doe"));
```

After that you can compile the code

```
./bin/ki greeting.ki
```

This will produce a `greeting.js` and you can:

```
node greeting.js
```

And see the results, cheers.

### Story

[Here](https://kaeyosthaeron.medium.com/vis%C3%B5es-do-futuro-38c5b11e3d16) you can found a resource in portuguese to know more about the language.
