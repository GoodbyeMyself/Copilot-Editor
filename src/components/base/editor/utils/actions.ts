// https://github.com/magic-akari/swc-ast-viewer/blob/main/src/monaco/action.ts
import type { Monaco } from "@monaco-editor/react";
import { KeyCode, KeyMod } from "monaco-editor";
import type { ImperativePanelHandle } from "react-resizable-panels";

// 定义所有动作的配置
const editorActions = {
    convertToLowerCase: {
        id: "convert-to-lowercase",
        label: "转换关键字为小写",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1,
    },
    convertToUpperCase: {
        id: "convert-to-uppercase",
        label: "转换关键字为大写",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 2,
    },
    validateSelection: {
        id: "validate-selection",
        label: "validate-selection",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 3,
    },
    runSelection: {
        id: "run-selection",
        label: "Run Selection",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 4,
    },
    Copolit: {
        id: "Copolit",
        label: "Copolit",
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS] as number[],
        contextMenuGroupId: "0_Copolit",
        contextMenuOrder: 1,
    },
    GenerateAnnotations: {
        id: "Generate-annotations",
        label: "生成注释",
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS] as number[],
        contextMenuGroupId: "1_Copolit",
        contextMenuOrder: 1,
    },
    GenerateSQL: {
        id: "Generate-SQL",
        label: "SQL 生成",
        contextMenuGroupId: "1_Copolit",
        contextMenuOrder: 2,
    },
    SQLErrorCorrection: {
        id: "SQL-Error-Correction",
        label: "SQL 纠错",
        contextMenuGroupId: "1_Copolit",
        contextMenuOrder: 3,
    },
    SQLRewriting: {
        id: "SQL-Rewriting",
        label: "SQL 改写",
        contextMenuGroupId: "1_Copolit",
        contextMenuOrder: 4,
    },
} as const;

// 添加静态标志来跟踪是否已经注册过
let isRegistered = false;

// 集中处理所有动作的函数
export function registerEditorActions(
    monaco: Monaco,
    options: {
        copolitRef?: React.RefObject<ImperativePanelHandle>;
    } = {},
) {
    // 如果已经注册过，直接返回
    if (isRegistered) return;

    const { copolitRef } = options;

    // 验证选择
    monaco.editor.addEditorAction({
        ...editorActions.validateSelection,
        run: async (editor) => {
            const selection = editor.getSelection();
            const value =
                selection?.isEmpty() || selection == null
                    ? editor.getValue()
                    : editor.getModel()?.getValueInRange(selection);
            if (!value) return;
            // --- 校验选择 ---
            console.log(value, '<- 打印 校验选择');
        },
    });

    // 运行选择
    monaco.editor.addEditorAction({
        ...editorActions.runSelection,
        run: (editor) => {
            const selection = editor.getSelection();
            const value =
                selection?.isEmpty() || selection == null
                    ? editor.getValue()
                    : editor.getModel()?.getValueInRange(selection);
            if (!value) return;
            // --- 运行选择 ---
            console.log(value, '<- 打印 运行选择');
        },
    });

    // 转换关键字为小写
    monaco.editor.addEditorAction({
        ...editorActions.convertToLowerCase,
        run: (editor) => {
            const selection = editor.getSelection();
            if (!selection || selection.isEmpty()) return;
            const value = editor.getModel()?.getValueInRange(selection);
            if (!value) return;
            editor.executeEdits("", [
                {
                    range: selection,
                    text: value.toLowerCase(),
                    forceMoveMarkers: true,
                },
            ]);
        },
    });

    // 转换关键字为大写
    monaco.editor.addEditorAction({
        ...editorActions.convertToUpperCase,
        run: (editor) => {
            const selection = editor.getSelection();
            if (!selection || selection.isEmpty()) return;
            const value = editor.getModel()?.getValueInRange(selection);
            if (!value) return;
            editor.executeEdits("", [
                {
                    range: selection,
                    text: value.toUpperCase(),
                    forceMoveMarkers: true,
                },
            ]);
        },
    });

    // Copolit
    if (copolitRef) {
        monaco.editor.addEditorAction({
            ...editorActions.Copolit,
            run: (editor) => {
                const selection = editor.getSelection();
                const selectedText =
                    selection?.isEmpty() || selection == null
                        ? editor.getValue()
                        : editor.getModel()?.getValueInRange(selection);

                if (copolitRef?.current?.isCollapsed()) {
                    copolitRef.current?.expand();
                    copolitRef.current?.resize(20);
                }

                // 触发自定义事件，传递选中的文本
                const event = new CustomEvent("copolit-text-selected", {
                    detail: { text: selectedText },
                });
                window.dispatchEvent(event);
            },
        });
    }

    // 生成注释
    monaco.editor.addEditorAction({
        ...editorActions.GenerateAnnotations,
        run: (editor) => {
            const selection = editor.getSelection();
            if (!selection || selection.isEmpty()) return;

            const selectedText = editor.getModel()?.getValueInRange(selection);
            if (!selectedText) return;

            // 生成随机注释
            const randomComment = '随机注释';

            // 在选中文本前插入注释
            const commentText = `-- ${randomComment}\n${selectedText}`;

            editor.executeEdits("", [
                {
                    range: selection,
                    text: commentText,
                    forceMoveMarkers: true,
                },
            ]);
        },
    });

    // SQL 生成
    monaco.editor.addEditorAction({
        ...editorActions.GenerateSQL,
        run: (editor) => {
            const selection = editor.getSelection();
            const selectedText =
                selection?.isEmpty() || selection == null
                    ? editor.getValue()
                    : editor.getModel()?.getValueInRange(selection);

            if (copolitRef?.current?.isCollapsed()) {
                copolitRef.current?.expand();
                copolitRef.current?.resize(20);
            }

            const event = new CustomEvent("copolit-text-selected", {
                detail: { text: selectedText, action: "generate-sql" },
            });
            window.dispatchEvent(event);
        },
    });

    // SQL 纠错
    monaco.editor.addEditorAction({
        ...editorActions.SQLErrorCorrection,
        run: (editor) => {
            const selection = editor.getSelection();
            const selectedText =
                selection?.isEmpty() || selection == null
                    ? editor.getValue()
                    : editor.getModel()?.getValueInRange(selection);

            if (copolitRef?.current?.isCollapsed()) {
                copolitRef.current?.expand();
                copolitRef.current?.resize(20);
            }

            const event = new CustomEvent("copolit-text-selected", {
                detail: { text: selectedText, action: "sql-error-correction" },
            });
            window.dispatchEvent(event);
        },
    });

    // SQL 改写
    monaco.editor.addEditorAction({
        ...editorActions.SQLRewriting,
        run: (editor) => {
            const selection = editor.getSelection();
            const selectedText =
                selection?.isEmpty() || selection == null
                    ? editor.getValue()
                    : editor.getModel()?.getValueInRange(selection);

            if (copolitRef?.current?.isCollapsed()) {
                copolitRef.current?.expand();
                copolitRef.current?.resize(20);
            }

            const event = new CustomEvent("copolit-text-selected", {
                detail: { text: selectedText, action: "sql-rewriting" },
            });
            window.dispatchEvent(event);
        },
    });

    // 在函数结束时设置标志
    isRegistered = true;
}
