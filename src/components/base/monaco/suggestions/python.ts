import { languages, Range } from "monaco-editor";

export class PythonSuggestionMaker {
    private pythonKeywords = [
        "and", "as", "assert", "break", "class", "continue", "def", "del", "elif", "else", 
        "except", "exec", "finally", "for", "from", "global", "if", "import", "in", "is", 
        "lambda", "not", "or", "pass", "print", "raise", "return", "try", "while", "with", "yield"
    ];

    private builtinFunctions = [
        "abs", "all", "any", "bin", "bool", "chr", "dict", "dir", "divmod", "enumerate", 
        "eval", "exec", "filter", "float", "format", "frozenset", "getattr", "hasattr", 
        "hash", "help", "hex", "id", "input", "int", "isinstance", "issubclass", "iter", 
        "len", "list", "locals", "map", "max", "min", "next", "object", "oct", "open", 
        "ord", "pow", "print", "property", "range", "repr", "reversed", "round", "set", 
        "setattr", "slice", "sorted", "str", "sum", "super", "tuple", "type", "vars", "zip", "__import__"
    ];

    private builtinTypes = [
        "int", "float", "str", "bool", "list", "dict", "tuple", "set", "frozenset", 
        "bytes", "bytearray", "complex", "range", "slice", "type", "object", "None"
    ];

    private constants = ["True", "False", "None"];

    private commonModules = [
        "os", "sys", "math", "random", "datetime", "json", "re", "collections", 
        "itertools", "functools", "operator", "pathlib", "typing", "asyncio"
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
        this.pythonKeywords.forEach(keyword => {
            if (keyword.toLowerCase().startsWith(word.toLowerCase())) {
                suggestions.push({
                    label: keyword,
                    kind: languages.CompletionItemKind.Keyword,
                    insertText: keyword,
                    sortText: "1" + keyword,
                    range: range,
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
                    sortText: "2" + func,
                    range: range,
                });
            }
        });

        // 添加内置类型
        this.builtinTypes.forEach(type => {
            if (type.toLowerCase().startsWith(word.toLowerCase())) {
                suggestions.push({
                    label: type,
                    kind: languages.CompletionItemKind.Class,
                    insertText: type,
                    sortText: "3" + type,
                    range: range,
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
                    sortText: "4" + constant,
                    range: range,
                });
            }
        });

        // 添加常用模块
        this.commonModules.forEach(module => {
            if (module.toLowerCase().startsWith(word.toLowerCase())) {
                suggestions.push({
                    label: module,
                    kind: languages.CompletionItemKind.Module,
                    insertText: module,
                    sortText: "5" + module,
                    range: range,
                });
            }
        });

        return suggestions;
    }
}