/**
 * Monaco Editor 组件
 * 
 * 这是一个基于 Monaco Editor 的代码编辑器组件，支持 SQL 和 Python 语言
 * 主要功能包括：
 * - 语法高亮
 * - 代码补全
 * - 代码格式化
 * - 右键菜单
 * - 类型转换提示
 */

import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";

import * as monaco from "monaco-editor";
import { type editor, type IDisposable, languages, Range } from "monaco-editor";
import { setupContextMenuFeature } from './editor/utils/setupContextMenuFeature';

// 配置 Monaco Editor 的 web worker 环境
// 使用 getWorkerUrl 方式配置 worker 文件路径
if (typeof window !== 'undefined') {
    // @ts-ignore
    self.MonacoEnvironment = {
        getWorkerUrl: function (moduleId: string, label: string) {
            // 使用相对路径指向构建后的worker文件
            if (label === 'json') {
                return './json.worker.js';
            }
            if (label === 'css' || label === 'scss' || label === 'less') {
                return './css.worker.js';
            }
            if (label === 'html' || label === 'handlebars' || label === 'razor') {
                return './html.worker.js';
            }
            if (label === 'typescript' || label === 'javascript') {
                return './ts.worker.js';
            }
            return './editor.worker.js';
        }
    };
}

// 导入 Monaco Editor 的语言支持
import "monaco-editor/esm/vs/basic-languages/sql/sql.contribution";
import "monaco-editor/esm/vs/basic-languages/python/python.contribution";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution";

import { cn } from "@/utils/utils";

import { Panel, PanelGroup, type ImperativePanelHandle } from "react-resizable-panels";
import PanelHandle from "@/components/base/panel-handle";
import DebugConsole from "./parts/debug-console";
import { formatSQL } from "@/utils/sql_fmt";
import { formatPython } from "@/utils/python_fmt";
import { formatJavaScript } from "@/utils/javascript_fmt";

// 导入代码补全相关模块
import { SuggestionMaker } from "./suggestions";

import { PythonSuggestionMaker } from "./suggestions/python";
import { JavaScriptSuggestionMaker } from "./suggestions/javascript";
import { sqlConf, sqlDef, pythonConf, pythonDef, javascriptConf, javascriptDef } from "./syntax";

/**
 * 编辑器组件的属性类型定义
 */
type EditorProps = {
    /** 编辑器内容值 */
    value: string;
    /** 内容变化回调函数 */
    onChange?: (value: string) => void;
    /** 保存回调函数 */
    onSave?: (editor: editor.ICodeEditor) => Promise<void>;
    /** 编程语言类型，默认为 'sql' */
    language?: string;
    /** Copilot 面板的引用，用于右键菜单功能 */
    copolitRef?: React.RefObject<ImperativePanelHandle>;
    /** CSS 类名 */
    className?: string;
    /** 编辑器高度 */
    height?: string;
};

/**
 * 编辑器组件对外暴露的方法类型定义
 */
export type EditorForwardedRef = {
    /** 获取编辑器实例 */
    getEditor: () => editor.IStandaloneCodeEditor | null;
};

/**
 * Monaco Editor 主组件
 * 使用 forwardRef 以支持父组件直接访问编辑器实例
 */
const Editor = forwardRef<EditorForwardedRef, EditorProps>((props, ref) => {
    // 编辑器容器引用
    const editorContainerRef = useRef<HTMLDivElement | null>(null);
    const consolePanelRef = useRef<ImperativePanelHandle | null>(null);
    
    // 编辑器实例引用
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    
    // 编辑器是否已准备就绪的状态
    const [isReady, setIsReady] = useState(false);
    
    // 当前编程语言，默认为 SQL
    const language = props.language ?? "sql";
    
    /**
     * 根据语言类型获取对应的配置
     * @param lang 语言类型
     * @returns 语言配置对象，包含语法配置和定义
     */
    const getLanguageConfig = (lang: string) => {
        switch (lang) {
            case "python":
                return {
                    conf: pythonConf,
                    def: pythonDef
                };
            case "javascript":
                return {
                    conf: javascriptConf,
                    def: javascriptDef
                };
            case "sql":
            default:
                return {
                    conf: sqlConf,
                    def: sqlDef
                };
        }
    };
    
    // 获取当前语言对应的配置
    const { conf: languageConf, def: languageDef } = getLanguageConfig(language);

    /**
     * 创建编辑器实例
     */
    useEffect(() => {
        const container = editorContainerRef.current;
        if (!container) return;

        // 定义并设置 Monokai 主题
        try {
            monaco.editor.defineTheme("monokai", {
                base: "vs-dark",
                inherit: true,
                rules: [
                    { token: "", foreground: "F8F8F2", background: "272822" },
                    { token: "comment", foreground: "75715E" },
                    { token: "keyword", foreground: "F92672" },
                    { token: "number", foreground: "AE81FF" },
                    { token: "string", foreground: "E6DB74" },
                    { token: "variable", foreground: "A6E22E" },
                    { token: "type", foreground: "66D9EF" },
                    { token: "delimiter", foreground: "F8F8F2" },
                    { token: "operator", foreground: "F8F8F2" },
                    { token: "identifier", foreground: "A6E22E" },
                ],
                colors: {
                    "editor.background": "#272822",
                    "editor.foreground": "#F8F8F2",
                    "editorCursor.foreground": "#F8F8F0",
                    "editor.lineHighlightBackground": "#3E3D32",
                    "editorLineNumber.foreground": "#8F908A",
                    "editor.selectionBackground": "#49483E",
                    "editor.inactiveSelectionBackground": "#3E3D32",
                    "editorBracketMatch.background": "#3E3D32",
                    "editorBracketMatch.border": "#A6E22E",
                },
            });
            monaco.editor.setTheme("monokai");
        } catch {}

        // 创建编辑器实例
        const editor = monaco.editor.create(container, {
            value: props.value,
            language: language,
            theme: "monokai",
            // 字体设置
            fontFamily: "'jetbrains-mono'",
            
            // 滚动设置
            smoothScrolling: true,
            scrollBeyondLastColumn: 0,
            scrollBeyondLastLine: false,
            scrollbar: {
                alwaysConsumeMouseWheel: false,
                vertical: "auto",
                useShadows: false,
            },
            
            // 布局设置
            automaticLayout: true,
            wordWrap: "on",
            wrappingIndent: "same",
            wrappingStrategy: "advanced",
            
            // 显示设置
            minimap: {
                enabled: false
            }, // 禁用小地图
            lineNumbers: "on",
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            glyphMargin: true,
            
            // 代码折叠设置
            folding: true,
            foldingStrategy: "auto",
            foldingHighlight: true,
            
            // 语法高亮设置
            "semanticHighlighting.enabled": true,
            renderLineHighlightOnlyWhenFocus: true,
            renderWhitespace: "none",
            
            // 补全设置
            quickSuggestions: true,
            tabCompletion: "on",
        });

        // 保存编辑器实例引用
        editorRef.current = editor;

        // 设置内容变化监听
        if (props.onChange) {
            editor.onDidChangeModelContent(() => {
                const value = editor.getValue();
                props.onChange?.(value);
            });
        }

        // 设置右键菜单功能
        setupContextMenuFeature(editor, {
            copolitRef: props.copolitRef,
            onOpenConsole: () => {
                // 展开并设置一个合适高度
                try {
                    consolePanelRef.current?.expand();
                    consolePanelRef.current?.resize(25);
                } catch {}
            },
        });

        // 标记编辑器已准备就绪
        setIsReady(true);

        // 清理函数
        return () => {
            editor.dispose();
            editorRef.current = null;
            setIsReady(false);
        };
    }, []);

    /**
     * 更新编辑器内容
     */
    useEffect(() => {
        if (editorRef.current && props.value !== editorRef.current.getValue()) {
            editorRef.current.setValue(props.value);
        }
    }, [props.value]);

    /**
     * SQL 代码格式化功能
     * 仅对 SQL 语言启用，提供全文档格式化和选中区域格式化
     */
    useEffect(() => {
        const disposables: IDisposable[] = [];

        // 前置条件检查
        if (!editorRef.current) return;
        if (!isReady) return;
        if (language !== "sql") return;

        // 注册全文档格式化提供者
        // 使用 Ctrl+Shift+I 或右键菜单中的 "Format Document" 触发
        disposables.push(
            monaco.languages.registerDocumentFormattingEditProvider(
                "sql",
                {
                    async provideDocumentFormattingEdits(model) {
                        const formatted = await formatSQL(model.getValue());
                        return [
                            {
                                range: model.getFullModelRange(),
                                text: formatted,
                            },
                        ];
                    },
                },
            ),
        );

        // 注册选中区域格式化提供者
        // 选中代码后右键菜单会显示 "Format Selection" 选项
        disposables.push(
            monaco.languages.registerDocumentRangeFormattingEditProvider(
                "sql",
                {
                    async provideDocumentRangeFormattingEdits(
                        model,
                        range,
                    ) {
                        const formatted = await formatSQL(
                            model.getValueInRange(range),
                        );
                        return [
                            {
                                range: range,
                                text: formatted,
                            },
                        ];
                    },
                },
            ),
        );

        // 清理函数：组件卸载时释放所有注册的格式化提供者
        return () => {
            // biome-ignore lint/complexity/noForEach: <explanation>
            disposables.forEach((disposable) => disposable.dispose());
        };
    }, [isReady, language]);

    /**
     * Python 代码格式化功能
     * 提供全文档格式化和选中区域格式化（基础实现：规范换行与去除尾随空白）
     */
    useEffect(() => {
        const disposables: IDisposable[] = [];

        // 前置条件检查
        if (!editorRef.current) return;
        if (!isReady) return;
        if (language !== "python") return;

        // 注册全文档格式化提供者
        disposables.push(
            monaco.languages.registerDocumentFormattingEditProvider(
                "python",
                {
                    async provideDocumentFormattingEdits(model) {
                        const formatted = await formatPython(model.getValue());
                        return [
                            {
                                range: model.getFullModelRange(),
                                text: formatted,
                            },
                        ];
                    },
                },
            ),
        );

        // 注册选中区域格式化提供者
        disposables.push(
            monaco.languages.registerDocumentRangeFormattingEditProvider(
                "python",
                {
                    async provideDocumentRangeFormattingEdits(model, range) {
                        const formatted = await formatPython(
                            model.getValueInRange(range),
                        );
                        return [
                            {
                                range,
                                text: formatted,
                            },
                        ];
                    },
                },
            ),
        );

        return () => {
            disposables.forEach((d) => d.dispose());
        };
    }, [isReady, language]);

    /**
     * JavaScript 代码格式化功能
     * 提供全文档格式化和选中区域格式化
     */
    useEffect(() => {
        const disposables: IDisposable[] = [];

        // 前置条件检查
        if (!editorRef.current) return;
        if (!isReady) return;
        if (language !== "javascript") return;

        // 注册全文档格式化提供者
        disposables.push(
            monaco.languages.registerDocumentFormattingEditProvider(
                "javascript",
                {
                    async provideDocumentFormattingEdits(model) {
                        const formatted = await formatJavaScript(model.getValue());
                        return [
                            {
                                range: model.getFullModelRange(),
                                text: formatted,
                            },
                        ];
                    },
                },
            ),
        );

        // 注册选中区域格式化提供者
        disposables.push(
            monaco.languages.registerDocumentRangeFormattingEditProvider(
                "javascript",
                {
                    async provideDocumentRangeFormattingEdits(model, range) {
                        const formatted = await formatJavaScript(
                            model.getValueInRange(range),
                        );
                        return [
                            {
                                range,
                                text: formatted,
                            },
                        ];
                    },
                },
            ),
        );

        return () => {
            disposables.forEach((d) => d.dispose());
        };
    }, [isReady, language]);

    /**
     * 语言配置和语法高亮设置
     * 为当前语言注册语法配置、词法分析器和语言模型
     */
    useEffect(() => {
        const disposables: IDisposable[] = [];

        // 前置条件检查
        if (!editorRef.current) return;
        if (!isReady) return;

        // 右键菜单功能已集成到 setupContextMenuFeature 中

        // 注册 Monaco 语言定义
        monaco.languages.register({
            id: language,
            extensions: [`.${language}`],
            aliases: [`${language.toLowerCase()}`, `${language.toUpperCase()}`],
        });

        // 设置语言配置（如括号匹配、自动缩进等）
        disposables.push(
            monaco.languages.setLanguageConfiguration(
                language,
                languageConf,
            ),
        );
        
        // 注册词法分析器（用于语法高亮）
        disposables.push(
            monaco.languages.setMonarchTokensProvider(
                language,
                languageDef,
            ),
        );

        // 创建语言模型（用于语言特定的功能）
        disposables.push(monaco.editor.createModel("sql", language));

        // 清理函数：组件卸载时释放所有注册的语言提供者
        return () => {
            // biome-ignore lint/complexity/noForEach: <explanation>
            disposables.forEach((disposable) => disposable.dispose());
        };
    }, [isReady, language, props.copolitRef]);

    /**
     * SQL 代码补全功能
     * 仅对 SQL 语言启用，提供智能代码补全建议
     */
    useEffect(() => {
        const disposables: IDisposable[] = [];

        // 前置条件检查
        if (!isReady) return;
        if (language !== "sql") return;

        // 创建 SQL 建议生成器
        const suggestor = new SuggestionMaker();

        // 注册 Monaco 语言定义
        monaco.languages.register({
            id: language,
            extensions: [`.${language}`],
            aliases: [`${language.toLowerCase()}`, `${language.toUpperCase()}`],
        });

        // 注册代码补全提供者
        disposables.push(
            monaco.languages.registerCompletionItemProvider(
                language,
                {
                    async provideCompletionItems(
                        model,
                        position,
                    ) {
                        // 移除查询相关功能

                        // 获取当前位置的单词信息
                        const { word, endColumn, startColumn } =
                            model.getWordUntilPosition(position);

                        // 创建补全范围
                        const range = new Range(
                            position.lineNumber,
                            startColumn,
                            position.lineNumber,
                            endColumn,
                        );

                        // 创建中止控制器，用于取消异步请求
                        const controller = new AbortController();
                        const { signal } = controller;

                        // 获取补全建议
                        const suggestions = await suggestor.getSuggestions({
                            word,
                            range,
                            signal,
                        });

                        return {
                            suggestions,
                            incomplete: true, // 标记为不完整，允许后续加载更多建议
                            dispose() {
                                controller.abort();
                            },
                        };
                    },
                },
            ),
        );

        // 清理函数：组件卸载时释放所有注册的补全提供者
        return () => {
            // biome-ignore lint/complexity/noForEach: <explanation>
            disposables.forEach((disposable) => disposable.dispose());
        };
    }, [isReady, language]);

    /**
     * Python 代码补全功能
     * 仅对 Python 语言启用，提供 Python 语法相关的代码补全
     */
    useEffect(() => {
        const disposables: IDisposable[] = [];

        // 前置条件检查
        if (!isReady) return;
        if (language !== "python") return;

        // 创建 Python 建议生成器
        const pythonSuggestor = new PythonSuggestionMaker();

        // 注册 Python 代码补全提供者
        disposables.push(
            monaco.languages.registerCompletionItemProvider(
                "python",
                {
                    provideCompletionItems(model, position) {
                        // 获取当前位置的单词
                        const { word } = model.getWordUntilPosition(position);
                        
                        // 获取 Python 补全建议
                        const suggestions = pythonSuggestor.getSuggestions(word, position);
                        
                        return {
                            suggestions,
                            incomplete: false, // Python 补全通常是一次性完成的
                        };
                    },
                },
            ),
        );

        // 清理函数：组件卸载时释放所有注册的补全提供者
        return () => {
            // biome-ignore lint/complexity/noForEach: <explanation>
            disposables.forEach((disposable) => disposable.dispose());
        };
    }, [isReady, language]);

    /**
     * JavaScript 代码补全功能
     * 仅对 JavaScript 语言启用，提供 JavaScript 语法相关的代码补全
     */
    useEffect(() => {
        const disposables: IDisposable[] = [];

        // 前置条件检查
        if (!isReady) return;
        if (language !== "javascript") return;

        // 创建 JavaScript 建议生成器
        const javascriptSuggestor = new JavaScriptSuggestionMaker();

        // 注册 JavaScript 代码补全提供者
        disposables.push(
            monaco.languages.registerCompletionItemProvider(
                "javascript",
                {
                    provideCompletionItems(model, position) {
                        // 获取当前位置的单词
                        const { word } = model.getWordUntilPosition(position);
                        
                        // 获取 JavaScript 补全建议
                        const suggestions = javascriptSuggestor.getSuggestions(word, position);
                        
                        return {
                            suggestions,
                            incomplete: false, // JavaScript 补全通常是一次性完成的
                        };
                    },
                },
            ),
        );

        // 清理函数：组件卸载时释放所有注册的补全提供者
        return () => {
            // biome-ignore lint/complexity/noForEach: <explanation>
            disposables.forEach((disposable) => disposable.dispose());
        };
    }, [isReady, language]);

    /**
     * SQL 类型转换补全功能
     * 当用户输入 "::" 时，提供 SQL 数据类型补全建议
     * 例如：sales::int, name::varchar 等
     * 
     * 参考来源: https://github.com/windmill-labs/windmill/blob/05a1e19b5e3c2e26d858e5024bbc3494da0abf4c/frontend/src/lib/components/Editor.svelte#L281
     */
    useEffect(() => {
        const disposables: IDisposable[] = [];

        // 前置条件检查
        if (!isReady) return;
        if (language !== "sql") return;

        // 注册类型转换补全提供者
        disposables.push(
            monaco.languages.registerCompletionItemProvider("sql", {
                triggerCharacters: [":"], // 当输入 ":" 时触发补全
                provideCompletionItems: (model, position) => {
                    // 获取当前行到光标位置的内容
                    const lineUntilPosition = model.getValueInRange({
                        startLineNumber: position.lineNumber,
                        startColumn: 1,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column,
                    });
                    
                    let suggestions: languages.CompletionItem[] = [];
                    
                    // 检查是否以 "::" 结尾，表示要进行类型转换
                    if (lineUntilPosition.endsWith("::")) {
                        const word = model.getWordUntilPosition(position);
                        const range = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: word.startColumn,
                            endColumn: word.endColumn,
                        };
                        
                        // 通用 SQL 数据类型列表
                        suggestions = [
                            "BIGINT",
                            "BINARY",
                            "BIT",
                            "BITSTRING",
                            "BLOB",
                            "BOOL",
                            "BOOLEAN",
                            "BPCHAR",
                            "BYTEA",
                            "CHAR",
                            "DATE",
                            "DATETIME",
                            "DEC",
                            "DECIMAL",
                            "DOUBLE",
                            "ENUM",
                            "FLOAT",
                            "FLOAT4",
                            "FLOAT8",
                            "GUID",
                            "HUGEINT",
                            "INT",
                            "INT1",
                            "INT128",
                            "INT16",
                            "INT2",
                            "INT32",
                            "INT4",
                            "INT64",
                            "INT8",
                            "INTEGER",
                            "INTEGRAL",
                            "INTERVAL",
                            "LIST",
                            "LOGICAL",
                            "LONG",
                            "MAP",
                            "NULL",
                            "NUMERIC",
                            "NVARCHAR",
                            "OID",
                            "REAL",
                            "ROW",
                            "SHORT",
                            "SIGNED",
                            "SMALLINT",
                            "STRING",
                            "STRUCT",
                            "TEXT",
                            "TIME",
                            "TIMESTAMP",
                            "TIMESTAMPTZ",
                            "TIMESTAMP_MS",
                            "TIMESTAMP_NS",
                            "TIMESTAMP_S",
                            "TIMESTAMP_US",
                            "TIMETZ",
                            "TINYINT",
                            "UBIGINT",
                            "UHUGEINT",
                            "UINT128",
                            "UINT16",
                            "UINT32",
                            "UINT64",
                            "UINT8",
                            "UINTEGER",
                            "UNION",
                            "USMALLINT",
                            "UTINYINT",
                            "UUID",
                            "VARBINARY",
                            "VARCHAR",
                            "BIGINT",
                            "BINARY",
                            "BIT",
                            "BITSTRING",
                            "BLOB",
                            "BOOL",
                            "BOOLEAN",
                            "BPCHAR",
                            "BYTEA",
                            "CHAR",
                            "DATE",
                            "DATETIME",
                            "DEC",
                            "DECIMAL",
                            "DOUBLE",
                            "ENUM",
                            "FLOAT",
                            "FLOAT4",
                            "FLOAT8",
                            "GUID",
                            "HUGEINT",
                            "INT",
                            "INT1",
                            "INT128",
                            "INT16",
                            "INT2",
                            "INT32",
                            "INT4",
                            "INT64",
                            "INT8",
                            "INTEGER",
                            "INTEGRAL",
                            "INTERVAL",
                            "LIST",
                            "LOGICAL",
                            "LONG",
                            "MAP",
                            "NULL",
                            "NUMERIC",
                            "NVARCHAR",
                            "OID",
                            "REAL",
                            "ROW",
                            "SHORT",
                            "SIGNED",
                            "SMALLINT",
                            "STRING",
                            "STRUCT",
                            "TEXT",
                            "TIME",
                            "TIMESTAMP",
                            "TIMESTAMPTZ",
                            "TIMESTAMP_MS",
                            "TIMESTAMP_NS",
                            "TIMESTAMP_S",
                            "TIMESTAMP_US",
                            "TIMETZ",
                            "TINYINT",
                            "UBIGINT",
                            "UHUGEINT",
                            "UINT128",
                            "UINT16",
                            "UINT32",
                            "UINT64",
                            "UINT8",
                            "UINTEGER",
                            "UNION",
                            "USMALLINT",
                            "UTINYINT",
                            "UUID",
                            "VARBINARY",
                            "VARCHAR",
                        ].map((t) => ({
                            label: t, // 显示在补全列表中的标签
                            kind: languages.CompletionItemKind.Function, // 补全项类型
                            insertText: t, // 插入的文本
                            range: range, // 替换的范围
                            sortText: "a", // 排序文本，确保这些建议排在前面
                        }));
                    }

                    return {
                        suggestions,
                    };
                },
            }),
        );

        // 清理函数：组件卸载时释放所有注册的补全提供者
        return () => {
            // biome-ignore lint/complexity/noForEach: <explanation>
            disposables.forEach((disposable) => disposable.dispose());
        };
    }, [isReady, language]);

    /**
     * 使用 useImperativeHandle 向父组件暴露编辑器方法
     * 允许父组件直接调用编辑器的方法
     */
    useImperativeHandle(ref, () => {
        return {
            /**
             * 获取编辑器实例
             * @returns 编辑器实例或 null
             */
            getEditor() {
                return editorRef.current;
            },
            
            /**
             * 获取当前选中的文本
             * @returns 选中的文本或 undefined
             */
            getSelection() {
                const editor = editorRef.current;
                if (!editor) return null;

                const selection = editor.getSelection();
                if (selection) {
                    return editor.getModel()?.getValueInRange(selection);
                }
                return;
            },
            
            /**
             * 获取编辑器的全部内容
             * @returns 编辑器内容或 null
             */
            getValues() {
                const editor = editorRef.current;
                if (!editor) return null;

                return editor.getModel()?.getValue();
            },
        };
    }, []);

    /**
     * 渲染 Monaco Editor 组件
     */
    return (
        <div className={cn(props.className, "flex h-full w-full flex-col")}>
            <PanelGroup direction="vertical" className="h-full w-full" autoSaveId="_monaco-with-console">
                <Panel minSize={20} className="h-full max-h-full">
                    <div ref={editorContainerRef} className="h-full w-full" />
                </Panel>
                <PanelHandle />
                <Panel
                    ref={consolePanelRef}
                    defaultSize={20}
                    minSize={10}
                    maxSize={60}
                    collapsible
                    collapsedSize={0}
                    className="max-h-full"
                >
                    <DebugConsole onClose={() => {
                        consolePanelRef.current?.collapse();
                    }} />
                </Panel>
            </PanelGroup>
        </div>
    );
});

export default Editor;
