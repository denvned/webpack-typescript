/// <reference path="../typings/node/node.d.ts" />

import * as path from 'path';
import cwd from './cwd'

export default class Dependencies {
	private dependencies: { [filePath: string]: boolean } = {};

	add(filePath: string) {
		this.dependencies[path.resolve(cwd, filePath)] = true;
	}

	forEach(callback: (filePath: string) => void) {
		Object.keys(this.dependencies).forEach(filePath => callback(filePath));
	}
}
