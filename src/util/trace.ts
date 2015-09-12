const KEY = 'webpackTypeScript'.toUpperCase();

const enabled = new RegExp('\\b' + KEY + '\\b', 'i').test(process.env.NODE_DEBUG || '');

let indent = '';

interface ITrace {
	(message: string): void;
	enabled?: boolean;
	increaseIndent?(): void;
	decreaseIndent?(): void;
}

const trace: ITrace = enabled ? (message: string) => {
	console.error(KEY + ' ' + process.pid + ': ' + message.replace(/^/g, indent));
} : () => {};

trace.enabled = enabled;

trace.increaseIndent = () => {
	indent += '\t';
}

trace.decreaseIndent = () => {
	if (indent === '') {
		throw new Error("can't decrease zero indent");
	}
	indent = indent.slice(0, -1);
}

export default trace;
