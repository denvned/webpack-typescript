/// <reference path="../typings/node/node.d.ts" />

import * as ts from 'typescript';
import * as path from 'path'
import Diagnostics from './Diagnostics';

export default class OptionsBuilder {
    private options: ts.CompilerOptions = {};

    constructor(public diagnostics: Diagnostics) {}

    addConfigFileText(filePath: string, content: string) {
        const result = ts.parseConfigFileText(filePath, content);
        if (result.error) {
            this.diagnostics.add([result.error]);
        } else {
            this.addConfig(result.config, path.dirname(filePath));
        }
        return this;
    }

    addConfig(config: any, basePath: string) {
        const options = parseOptions.call(this);

        if (options) {
            addOptions.call(this);
        }
        return this;

        function parseOptions() {
            config.files = [];
            const result = ts.parseConfigFile(config, ts.sys, basePath);

            if (result.errors.length > 0) {
                this.diagnostics.add(result.errors);
                return null;
            } else {
                return result.options;
            }
        }

        function addOptions() {
            for (const key in options) {
                if (options.hasOwnProperty(key)) {
                    this.options[key] = options[key];
                }
            }
        }
    }

    build(sourceMap: boolean) {
        const options = this.options;
        this.options = {};

        adjustOptions();

        return Object.freeze(options);

        function adjustOptions() {
            delete options.out;
            delete options.outFile;
            delete options.declaration;
            delete options.emitBOM;

            if (sourceMap) {
                if (options.inlineSourceMap) {
                    delete options.inlineSourceMap;
                    options.sourceMap = true;
                }
                if (typeof options.sourceMap === 'undefined') {
                    options.sourceMap = true;
                }
                if (options.sourceMap) {
                    options.inlineSources = true;
                }
            } else {
                delete options.sourceMap;
                delete options.inlineSourceMap;
                delete options.inlineSources;
            }
        }
    }
}
