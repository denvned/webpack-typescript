/// <reference path="../typings/node/node.d.ts" />

import * as path from 'path';
import baseDir from './baseDir'

export default class Dependencies {
	private dependencies: { [filePath: string]: boolean } = {};

	add(filePath: string) {
		this.dependencies[path.resolve(baseDir, filePath)] = true;
	}

	forEach(callback: (filePath: string) => void) {
		Object.keys(this.dependencies).forEach(filePath => callback(filePath));
	}
}
