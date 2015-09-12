import trace from './trace';

const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const FN_NAME = /^\s*function\s*([^\s\(]*)/m;
const FN_ARGS = /\(([^\)]*)\)/m;

function getFunctionText(fn: Function) {
    return fn.toString().replace(COMMENTS, '');
}

function getFunctionName(fn: Function) {
    return getFunctionText(fn).match(FN_NAME)[1];
}

function getFunctionArgNames(fn: Function) {
    return getFunctionText(fn).match(FN_ARGS)[1].split(',').map(arg => arg.trim());
}

function stringify(value: any) {
    return JSON.stringify(value, null, '\t');
}

interface ITracedMethodOptions {
    return: boolean;
}

const tracedMethod = trace.enabled ? (options?: ITracedMethodOptions): MethodDecorator => {
    const skipReturn = options && options.return === false;
    return (
        target: Object,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<Function>
    ) => {
        const methodName = getFunctionName(target.constructor) + '#' + propertyKey.toString();
        const method = descriptor.value;

        if (typeof method !== 'function') {
            throw new TypeError(`@traceMethod: ${methodName} is not a method`);
        }
        const argNames = getFunctionArgNames(method);

        descriptor.value = function (...args: any[]) {
            trace('CALL: ' + methodName);

            trace.increaseIndent();

            for (let i = 0; i < Math.max(argNames.length, args.length); i++) {
                trace('ARG ' + argNames[i] + ': ' + stringify(args[i]));
            }
            try {
                const result = method.apply(this, args);

                if (!skipReturn) {
                    trace('RETURN: ' + stringify(result));
                }
                return result;
            } catch (err) {
                trace('THROW: ' + stringify(err));

                throw err;
            } finally {
                trace.decreaseIndent();

                trace('EXIT: ' + methodName);
            }
        };
    }
} : (): MethodDecorator => () => {};

export {tracedMethod};
