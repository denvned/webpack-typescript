/// <reference path="../typings/node/node.d.ts" />

import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import CompilationRequest from './CompilationRequest';
import Dependencies from './Dependencies';
import baseDir from './baseDir'
import {tracedMethod} from './util/traced';
import trace from './util/trace';

export default class LanguageServiceHost implements ts.LanguageServiceHost {
    private projectVersion: number = 0;
    private request: CompilationRequest;
    private dependencies: Dependencies;

    @tracedMethod()
    setCompilationRequest(request: CompilationRequest, dependencies: Dependencies) {
        if (!Object.isFrozen(request)) {
			throw new TypeError('request should be frozen');
		}
		if (!Object.isFrozen(request.options)) {
			throw new TypeError('request.options should be frozen');
		}
        this.request = request;
        this.dependencies = dependencies;
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
        return baseDir;
    }

    @tracedMethod()
    getScriptFileNames() {
        return [path.relative(baseDir, this.request.inputFileName)];
    }

    @tracedMethod({ return: false })
    getScriptSnapshot(fileName: string) {
        const filePath = path.resolve(baseDir, fileName);

        // Add to dependencies every path that TypeScript tries,
        // even if the file does not exist, because it may become available later
        this.dependencies.add(filePath);

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
        const filePath = path.resolve(baseDir, fileName);

        // Add to dependencies every path that TypeScript tries,
        // even if the file does not exist, because it may become available later
        this.dependencies.add(filePath);

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

    /* HACK: we can't call async resolve, and resolveSync works only with enhanced-require, not with webpack
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
