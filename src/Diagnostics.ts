import * as ts from 'typescript';

export default class Diagnostics {
	private diagnostics: ts.Diagnostic[] = [];

    get isEmpty() {
        return this.diagnostics.length === 0;
    }

	add(diagnostics: ts.Diagnostic[]) {
		this.diagnostics = this.diagnostics.concat(diagnostics);
	}

    toString() {
        let text = '';

        this.diagnostics.forEach(diagnostic => {
            if (diagnostic.file) {
                const loc = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
                text += `${diagnostic.file.fileName}(${loc.line + 1},${loc.character + 1}): `;
            }
            const category = ts.DiagnosticCategory[diagnostic.category].toLowerCase();
            text += `${category} TS${diagnostic.code}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}\n`;
        });
        return text;
    }
}
