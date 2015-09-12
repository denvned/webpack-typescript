/// <reference path="../typings/node/node.d.ts" />

import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import CompilationRequest from './CompilationRequest';
import cwd from './cwd'
import {tracedMethod} from './util/traced';
import trace from './util/trace';

export default class LanguageServiceHost implements ts.LanguageServiceHost {
    private projectVersion: number = 0;
    private request: CompilationRequest;

    @tracedMethod()
    setCompilationRequest(request: CompilationRequest) {
        if (!Object.isFrozen(request)) {
			throw new TypeError('request should be frozen');
		}
		if (!Object.isFrozen(request.options)) {
			throw new TypeError('request.options should be frozen');
		}
        this.request = request;
        this.projectVersion++;
    }

    @tracedMethod()
	getProjectVersion() {
        return this.projectVersion.toString();
    }

    @tracedMethod()
    getCompilationSettings() {
        return this.request.options;
    }

    @tracedMethod()
    getCurrentDirectory() {
        return cwd;
    }

    @tracedMethod()
    getScriptFileNames() {
        return [path.relative(cwd, this.request.inputFileName)];
    }

    @tracedMethod({ return: false })
    getScriptSnapshot(fileName: string) {
        const filePath = path.resolve(cwd, fileName);
        let source: string;
        if (this.request.isInputFile(filePath)) {
            trace('Using input');
            source = this.request.input;
        } else {
            try {
                trace('Reading file: ' + filePath);
                source = fs.readFileSync(filePath, 'utf8');
            } catch (err) {
                trace('Failed to read file');
                return void 0;
            }
        }
        return ts.ScriptSnapshot.fromString(source);
    }

    @tracedMethod()
    getScriptVersion(fileName: string) {
        const filePath = path.resolve(cwd, fileName);
        try {
            return fs.statSync(filePath).mtime.toISOString();
        } catch (err) {
            return void 0;
        }
    }

    @tracedMethod()
    getDefaultLibFileName() {
        return path.resolve(path.dirname(ts.sys.getExecutingFilePath()), ts.getDefaultLibFileName(this.request.options)); // HACK: ts understands absolute path only
    }

    @tracedMethod()
    getNewLine() {
        return this.request.newLine;
    }

    /* HACK: resolveSync of Webpack throws errors most of the time
    @tracedMethod()
    resolveModuleNames(moduleNames: string[], containingFile: string) {
        const dir = path.dirname(containingFile);

        return moduleNames.map(moduleName => {
            try {
                return this.request.resolveFn(dir, moduleName);
            } catch (err) {
                return void 0;
            }
        });
    }
    */
}
