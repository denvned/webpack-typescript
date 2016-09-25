TypeScript Loader for *webpack* ![unmaintained](http://img.shields.io/badge/status-unmaintained-red.png)
===============================

*webpack-typescript* is a lightweight, cleanly designed TypeScript loader for *webpack* allowing you to pack multiple modules written in TypeScript into a bundle.  It supports TypeScript 1.5, 1.6, and experimentally supports [nightly builds](http://blogs.msdn.com/b/typescript/archive/2015/07/27/introducing-typescript-nightlies.aspx) of upcoming TypeScript 1.7 and 1.8.

Installation
------------

To install *webpack-typescript* run the following command in your project directory:

    npm install webpack-typescript --save-dev

And if you want to use a nightly build of TypeScript, also install *typescript@next* before or after installing *webpack-typescript*:

    npm install typescript@next --save-dev

Configuration
-------------

Here is a sample *webpack.config.js* file featuring *webpack-typescript* loader:

```javascript
module.exports = {
    entry: './index',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js'
    },
	resolve: {
        extensions: ['', '.js', '.ts', '.tsx']
    },
    devtool: 'source-map', // if we want a source map
	module: {
		loaders: [
			{
				test: /\.tsx?$/,
				loader: 'webpack-typescript?target=ES5&jsx=react'
			}
		]
	}
}
```

[Here](http://webpack.github.io/docs/configuration.html) you can find more about configuring *webpack*.

### Compiler Options

TypeScript [compiler options](https://github.com/Microsoft/TypeScript/wiki/Compiler-Options) can be supplied as loader query parameters (like in the sample *webpack.config.js* above), and by a standard [tsconfig.json](https://github.com/Microsoft/TypeScript/wiki/tsconfig.json) file.  Note that the `"files"` and `"exclude"` sections in *tsconfig.json* are ignored, because now *webpack* decides what to compile.  Likewise, the loader ignores the compiler options `"out"`, `"outFile"`, `"outDir"`, `"rootDir"`, `"sourceRoot"`, and `"mapRoot"`.

*webpack-typescript* uses the same algorithm to find a *tsconfig.json* as TypeScript compiler uses itself, i.e. first look in the current working directory, then in ancestor directories until it is found.

**If you have a question, a bug report, or a feature request, please don't hesitate to post an issue in [the issue tracker](https://github.com/denvned/webpack-typescript/issues).**
