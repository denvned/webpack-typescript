/// <reference path="../typings/node/node.d.ts" />

import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import Diagnostics from './Diagnostics';
import Dependencies from './Dependencies';
import OptionsBuilder from './OptionsBuilder';
import compile from './compile';
import CompilationRequest from './CompilationRequest';
import CompilationResult from './CompilationResult';
import baseDir from './baseDir'
import trace from './util/trace';

export default function loadTypeScript(loaderContext: any, input: string) {
	const diagnostics = new Diagnostics();
	const dependencies = new Dependencies();

	trace('LOAD: ' + loaderContext.resourcePath);

	setupLoader();

	const configFile = readConfigFile();

	const options = prepareOptions();

	const result = diagnostics.isEmpty ? compileInput() : <CompilationResult>{};

	stateDependencies();

	sendResult();

	function setupLoader() {
		loaderContext.cacheable();
	}

	function readConfigFile() {
		const result = {
			path: <string>null,
			content: <string>null
		};

		let dir = baseDir;
		while (true) {
			const filePath = path.resolve(dir, 'tsconfig.json');

			dependencies.add(filePath);

			try {
				result.content = fs.readFileSync(filePath, 'utf8');
				result.path = path.relative(baseDir, filePath);
				break;
			} catch (err) {}

			const parent = path.dirname(dir);
			if (parent === dir) {
				break;
			}
			dir = parent;
		}
		return result;
	}

	function prepareOptions() {
		const optionsBuilder = new OptionsBuilder(diagnostics);
		if (configFile.content) {
			trace('CONFIG FILE: ' + configFile.path);

			optionsBuilder.addConfigFileText(configFile.path, configFile.content);
		} else {
			trace('CONFIG FILE WAS NOT FOUND');
		}
		return optionsBuilder.build(loaderContext.sourceMap);
	}

	function compileInput() {
		const request = Object.freeze(new CompilationRequest(
			loaderContext.resourcePath,
			input,
			options
		));
		return compile(request, dependencies, diagnostics);
	}

	function stateDependencies() {
		dependencies.forEach(filePath => {
			trace('DEPENDENCY: ' + filePath);

			loaderContext.dependency(filePath);
		});
	}

	function sendResult() {
		const messages = diagnostics.toString();

		if (typeof result.output === 'string') {
			process.stdout.write(messages);

			loaderContext.callback(null, result.output, result.sourceMap);
		} else if (messages) {
			loaderContext.callback(new Error('TypeScript compilation failed:\n' + messages));
		} // noEmit
	}
}
