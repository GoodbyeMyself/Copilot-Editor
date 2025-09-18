import type { OnChange } from "@monaco-editor/react";

// 移除拖拽手柄图标导入

import { FileJson, Loader2, LoaderPinwheel, NotepadText } from "lucide-react";

import { Range, type editor } from "monaco-editor";

import { useCallback, useEffect, useMemo, useState } from "react";

import { type ImperativePanelHandle } from "react-resizable-panels";

import { useSpinDelay } from "spin-delay";

import Editor from "@/components/base/monaco";

import { useEditorSettings } from "@/context/editor-settings/useEditor";
import { useEditor } from "@/context/editor/useEditor";
import { useSession } from "@/context/session/useSession";

import { formatSQL } from "@/utils/sql_fmt";
// 移除结果展示组件
import OpenFileTabs from "./components/open-files";

type EditorPanelProps = {
    copolitRef?: React.RefObject<ImperativePanelHandle>;
};

function CurrentEditor({ copolitRef }: EditorPanelProps) {
    const { editors, onSaveEditor, dispatch } = useSession();

    const { editorRef } = useEditor();

    const [sql, setSql] = useState("");

    const [isReady, setIsReady] = useState(false);

    const [isSaving, setIsSaving] = useState(false);

    const { shouldFormat } = useEditorSettings();

    const currentEditor = useMemo(
        () => editors.find((editor) => editor.isFocused),
        [editors],
    );

    const path = currentEditor?.path;

    const onChangeHandler: OnChange = useCallback(
        (value) => {
            setSql(value ?? "");

            if (!dispatch || !path) return;

            dispatch({
                type: "UPDATE_EDITOR",
                payload: {
                    path,
                    content: value ?? "",
                },
            });
        },
        [dispatch, path],
    );

    // get content of current editor
    useEffect(() => {
        if (currentEditor) {
            setSql(currentEditor.content);
            setIsReady(true);
        }
    }, [currentEditor]);

    const onSave = useCallback(
        async (editor: editor.ICodeEditor) => {
            if (!currentEditor?.path) return;

            // check if the content has changed

            let content = editor.getValue();

            const model = editor.getModel();

            if (model === null) return;

            setIsSaving(true);

            // try format

            if (shouldFormat) {
                try {
                    // check whether user has disabled formatting

                    // Format the SQL query using the formatting provider
                    const formatted = await formatSQL(content);
                    model.applyEdits([
                        {
                            range: new Range(
                                0,
                                0,
                                model.getLineCount(),
                                model.getLineMaxColumn(model.getLineCount()),
                            ),
                            text: formatted,
                        },
                    ]);

                    // Push the formatted content to the undo stack (so that the user can undo the formatting if they want to)
                    model.pushStackElement();

                    content = formatted;
                } catch (e) {
                    console.error(
                        `Error formatting file: ${currentEditor.path}: `,
                        e,
                    );
                }
            }

            try {
                await onSaveEditor({
                    content,
                    path: currentEditor.path,
                });
            } catch (e) {
                console.error(`Error saving file: ${currentEditor.path}: `, e);
            } finally {
                setIsSaving(false);
            }
        },
        [currentEditor, onSaveEditor, shouldFormat],
    );

    const showLoader = useSpinDelay(isSaving, {
        delay: 0,
        minDuration: 120,
    });

    if (!currentEditor) {
        return (
            <div className="flex h-full flex-col items-start justify-start gap-12 bg-gradient-to-b from-background to-muted/20 px-16 pt-12">
                <div className="max-w-2xl text-left">
                    <h1 className="mb-2 text-4xl font-bold text-foreground">
                        SQL Copilot
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        您的智能数据开发助手
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-24">
                    <div>
                        <h3 className="mb-4 text-xl font-semibold text-foreground transition-colors">
                            大数据体验
                        </h3>
                        <p className="inline-flex cursor-pointer text-sm">
                            <LoaderPinwheel className="mr-2 h-4 w-4 text-blue-500" />
                            <span className="text-blue-500">
                                探索 DataWorks Galley 的强大功能
                            </span>
                        </p>
                    </div>
                    <div>
                        <h3 className="mb-4 text-xl font-semibold text-foreground transition-colors">
                            演练
                        </h3>
                        <div className="mb-2">
                            <p className="inline-flex cursor-pointer text-sm">
                                <NotepadText className="mr-2 h-4 w-4 text-yellow-500" />
                                DataWorks Notebook 交互式开发
                            </p>
                        </div>
                        <div className="mb-2">
                            <button
                                type="button"
                                className="inline-flex cursor-pointer border-none bg-transparent p-0 text-sm"
                                onClick={() => {
                                    if (copolitRef?.current?.isCollapsed()) {
                                        copolitRef.current?.expand();
                                        copolitRef.current?.resize(20);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        if (
                                            copolitRef?.current?.isCollapsed()
                                        ) {
                                            copolitRef.current?.expand();
                                            copolitRef.current?.resize(20);
                                        }
                                    }
                                }}
                            >
                                <FileJson className="mr-2 h-4 w-4 text-blue-500" />
                                SQL Copilot 智能助手
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isReady) {
        return (
            <div className="flex h-full items-center justify-center text-gray-400">
                Loading...
            </div>
        );
    }

    return (
        <>
            <Editor
                onSave={onSave}
                value={sql}
                ref={editorRef}
                onChange={onChangeHandler}
                className="h-full border-t-0"
                options={{
                    padding: {
                        top: 10,
                        bottom: 16,
                    },
                }}
                copolitRef={copolitRef}
            />
            {showLoader && (
                <div className="absolute right-4 top-2 z-10">
                    <Loader2
                        name="loader-circle"
                        className="size-4 animate-spin text-primary"
                    />
                </div>
            )}
        </>
    );
}

function EditorPanel({ copolitRef }: EditorPanelProps) {
    return (
        <div className="flex size-full flex-col">
            <OpenFileTabs />
            <CurrentEditor copolitRef={copolitRef} />
        </div>
    );
}

export default EditorPanel;
