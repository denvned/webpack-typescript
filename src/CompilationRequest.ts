/// <reference path="../typings/node/node.d.ts" />

import * as ts from 'typescript';
import * as path from 'path';
import * as os from 'os';

export default class CompilationRequest {
    inputFileName: string;
    options: ts.CompilerOptions;
    newLine: string;

    constructor(inputFileName: string, public input: string, options: ts.CompilerOptions) {
        this.inputFileName = path.normalize(inputFileName);
        this.options = options;

        if (options.newLine === ts.NewLineKind.CarriageReturnLineFeed) {
            this.newLine = '\r\n';
        } else if (options.newLine === ts.NewLineKind.LineFeed) {
            this.newLine = '\n'
        } else {
            this.newLine = os.EOL;
        }
    }

    isInputFile(fileName: string) {
        return path.normalize(fileName) === this.inputFileName;
    }
}
