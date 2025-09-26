import { languages, Range } from "monaco-editor";

export class JavaScriptSuggestionMaker {
    private javascriptKeywords = [
        "break", "case", "catch", "class", "const", "continue", "debugger", "default",
        "delete", "do", "else", "export", "extends", "false", "finally", "for", "from",
        "function", "get", "if", "import", "in", "instanceof", "let", "new", "null",
        "return", "set", "static", "super", "switch", "this", "throw", "true", "try",
        "typeof", "undefined", "var", "void", "while", "with", "yield", "async", "await", "of"
    ];

    private builtinObjects = [
        "Array", "Boolean", "Date", "Error", "Function", "JSON", "Math", "Number", 
        "Object", "RegExp", "String", "Symbol", "Promise", "Map", "Set", "WeakMap", 
        "WeakSet", "Proxy", "Reflect", "ArrayBuffer", "DataView", "Int8Array", 
        "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", 
        "Uint32Array", "Float32Array", "Float64Array", "BigInt64Array", "BigUint64Array"
    ];

    private builtinFunctions = [
        "parseInt", "parseFloat", "isNaN", "isFinite", "decodeURI", "decodeURIComponent",
        "encodeURI", "encodeURIComponent", "escape", "unescape", "eval", "setTimeout",
        "setInterval", "clearTimeout", "clearInterval", "console", "alert", "confirm",
        "prompt", "fetch", "XMLHttpRequest"
    ];

    private arrayMethods = [
        "concat", "join", "pop", "push", "reverse", "shift", "slice", "sort", "splice",
        "toString", "unshift", "valueOf", "indexOf", "lastIndexOf", "forEach", "map",
        "filter", "reduce", "reduceRight", "every", "some", "find", "findIndex",
        "includes", "entries", "keys", "values", "fill", "copyWithin", "from", "of",
        "isArray", "flat", "flatMap"
    ];

    private stringMethods = [
        "charAt", "charCodeAt", "concat", "indexOf", "lastIndexOf", "match", "replace",
        "search", "slice", "split", "substr", "substring", "toLowerCase", "toUpperCase",
        "valueOf", "trim", "trimStart", "trimEnd", "padStart", "padEnd", "repeat",
        "startsWith", "endsWith", "includes", "localeCompare", "normalize"
    ];

    private objectMethods = [
        "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toString", "valueOf",
        "assign", "create", "defineProperty", "defineProperties", "freeze", "getOwnPropertyDescriptor",
        "getOwnPropertyDescriptors", "getOwnPropertyNames", "getOwnPropertySymbols",
        "getPrototypeOf", "is", "isExtensible", "isFrozen", "isSealed", "keys", "preventExtensions",
        "seal", "setPrototypeOf", "values", "entries", "fromEntries"
    ];

    private mathMethods = [
        "abs", "acos", "acosh", "asin", "asinh", "atan", "atanh", "atan2", "cbrt", "ceil",
        "clz32", "cos", "cosh", "exp", "expm1", "floor", "fround", "hypot", "imul", "log",
        "log1p", "log10", "log2", "max", "min", "pow", "random", "round", "sign", "sin",
        "sinh", "sqrt", "tan", "tanh", "trunc", "E", "LN2", "LN10", "LOG2E", "LOG10E", "PI", "SQRT1_2", "SQRT2"
    ];

    private domMethods = [
        "getElementById", "getElementsByClassName", "getElementsByTagName", "querySelector",
        "querySelectorAll", "createElement", "createTextNode", "appendChild", "removeChild",
        "insertBefore", "replaceChild", "addEventListener", "removeEventListener", "setAttribute",
        "getAttribute", "removeAttribute", "classList", "innerHTML", "textContent", "style"
    ];

    private constants = [
        "true", "false", "null", "undefined", "NaN", "Infinity"
    ];

    getSuggestions(word: string, position: { lineNumber: number; column: number }): languages.CompletionItem[] {
        const suggestions: languages.CompletionItem[] = [];
        const range = new Range(
            position.lineNumber,
            position.column - word.length,
            position.lineNumber,
            position.column
        );

        // 添加关键字
        this.javascriptKeywords.forEach(keyword => {
            if (keyword.toLowerCase().startsWith(word.toLowerCase())) {
                suggestions.push({
                    label: keyword,
                    kind: languages.CompletionItemKind.Keyword,
                    insertText: keyword,
                    sortText: "1" + keyword,
                    range: range,
                    documentation: `JavaScript keyword: ${keyword}`
                });
            }
        });

        // 添加内置对象
        this.builtinObjects.forEach(obj => {
            if (obj.toLowerCase().startsWith(word.toLowerCase())) {
                suggestions.push({
                    label: obj,
                    kind: languages.CompletionItemKind.Class,
                    insertText: obj,
                    sortText: "2" + obj,
                    range: range,
                    documentation: `Built-in object: ${obj}`
                });
            }
        });

        // 添加内置函数
        this.builtinFunctions.forEach(func => {
            if (func.toLowerCase().startsWith(word.toLowerCase())) {
                suggestions.push({
                    label: func,
                    kind: languages.CompletionItemKind.Function,
                    insertText: func + "()",
                    sortText: "3" + func,
                    range: range,
                    documentation: `Built-in function: ${func}`
                });
            }
        });

        // 添加数组方法
        this.arrayMethods.forEach(method => {
            if (method.toLowerCase().startsWith(word.toLowerCase())) {
                suggestions.push({
                    label: method,
                    kind: languages.CompletionItemKind.Method,
                    insertText: method + "()",
                    sortText: "4" + method,
                    range: range,
                    documentation: `Array method: ${method}`
                });
            }
        });

        // 添加字符串方法
        this.stringMethods.forEach(method => {
            if (method.toLowerCase().startsWith(word.toLowerCase())) {
                suggestions.push({
                    label: method,
                    kind: languages.CompletionItemKind.Method,
                    insertText: method + "()",
                    sortText: "5" + method,
                    range: range,
                    documentation: `String method: ${method}`
                });
            }
        });

        // 添加对象方法
        this.objectMethods.forEach(method => {
            if (method.toLowerCase().startsWith(word.toLowerCase())) {
                suggestions.push({
                    label: method,
                    kind: languages.CompletionItemKind.Method,
                    insertText: method + "()",
                    sortText: "6" + method,
                    range: range,
                    documentation: `Object method: ${method}`
                });
            }
        });

        // 添加 Math 方法
        this.mathMethods.forEach(method => {
            if (method.toLowerCase().startsWith(word.toLowerCase())) {
                suggestions.push({
                    label: `Math.${method}`,
                    kind: method.includes("PI") || method.includes("E") || method.includes("LN") || method.includes("LOG") || method.includes("SQRT") ? 
                        languages.CompletionItemKind.Constant : languages.CompletionItemKind.Method,
                    insertText: `Math.${method}${method.includes("PI") || method.includes("E") || method.includes("LN") || method.includes("LOG") || method.includes("SQRT") ? "" : "()"}`,
                    sortText: "7" + method,
                    range: range,
                    documentation: `Math ${method.includes("PI") || method.includes("E") || method.includes("LN") || method.includes("LOG") || method.includes("SQRT") ? "constant" : "method"}: Math.${method}`
                });
            }
        });

        // 添加 DOM 方法
        this.domMethods.forEach(method => {
            if (method.toLowerCase().startsWith(word.toLowerCase())) {
                suggestions.push({
                    label: method,
                    kind: languages.CompletionItemKind.Method,
                    insertText: method + "()",
                    sortText: "8" + method,
                    range: range,
                    documentation: `DOM method: ${method}`
                });
            }
        });

        // 添加常量
        this.constants.forEach(constant => {
            if (constant.toLowerCase().startsWith(word.toLowerCase())) {
                suggestions.push({
                    label: constant,
                    kind: languages.CompletionItemKind.Constant,
                    insertText: constant,
                    sortText: "9" + constant,
                    range: range,
                    documentation: `JavaScript constant: ${constant}`
                });
            }
        });

        return suggestions;
    }
}