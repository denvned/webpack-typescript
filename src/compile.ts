/// <reference path="../typings/node/node.d.ts" />

import * as ts from 'typescript';
import * as path from 'path';
import LanguageServiceHost from './LanguageServiceHost';
import CompilationRequest from './CompilationRequest';
import CompilationResult from './CompilationResult';
import Diagnostics from './Diagnostics';
import cwd from './cwd'

const languageServiceHost = new LanguageServiceHost();
const languageService = ts.createLanguageService(languageServiceHost);

export default function compile(request: CompilationRequest, diagnostics: Diagnostics) {
	languageServiceHost.setCompilationRequest(request);
	const program = languageService.getProgram();
	const result = new CompilationResult();

	const emitResult = request.options.noEmit ? null : emit();

	collectDiagnostics();

	collectInputFiles();

	return result;

	function emit() {
		const emitResult = program.emit(void 0, (fileName, data) => {
			if (fileName.slice(-4) === '.map') {
				result.sourceMap = JSON.parse(data);
			} else {
				result.output = data;
			}
		});

		if (!result.output || emitResult.emitSkipped) {
			result.output = null;
			result.sourceMap = null;
		} else if (result.sourceMap) {
			result.output = result.output.slice(0, result.output.lastIndexOf('//# sourceMappingURL='));
		}
		return emitResult;
	}

	function collectDiagnostics() {
		// We are trying to mimic output of tsc

		diagnostics.add(program.getSyntacticDiagnostics());

		if (diagnostics.isEmpty) {
			if (program.getOptionsDiagnostics) { // New in TypeScript 1.6
				diagnostics.add(program.getOptionsDiagnostics());
			}
			diagnostics.add(program.getGlobalDiagnostics());

			if (diagnostics.isEmpty) {
				diagnostics.add(program.getSemanticDiagnostics());
			}
		}
		if (emitResult) {
			diagnostics.add(emitResult.diagnostics);
		}
	}

	function collectInputFiles() {
		const files = program.getSourceFiles();
		if (files) {
			result.inputFiles = files.map(file => path.resolve(cwd, file.fileName));
		}
	}
}
