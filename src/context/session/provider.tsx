import { useCallback, useEffect, useMemo, useReducer } from "react";
import { toast } from "sonner";
import { SessionContext } from "./context";
import { newfileContents } from "./data/newfile-content";
import type {
    Action,
    SaveEditorProps,
    SessionMethods,
    SessionState,
} from "./types";

// Split up the context files to appease react-refresh.

type SessionProviderProps = {
    children: React.ReactNode;
};

// localStorage utilities
const LocalStorageManager = {
    getItem: (key: string) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },
    
    setItem: (key: string, value: any) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to localStorage:', e);
            return false;
        }
    },
    
    removeItem: (key: string) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },
    
    // 获取所有会话相关的keys
    getSessionKeys: (sessionId: string) => {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`session_${sessionId}_`)) {
                keys.push(key);
            }
        }
        return keys;
    },
    
    // 从localStorage恢复编辑器数据
    restoreEditors: (sessionId: string) => {
        const editorKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`session_${sessionId}_editor_`)) {
                editorKeys.push(key);
            }
        }
        
        const editors = [];
        for (const key of editorKeys) {
            const data = LocalStorageManager.getItem(key);
            if (data && data.content && data.metadata) {
                editors.push({
                    path: data.metadata.path,
                    handle: null,
                    kind: "CODE" as const,
                    mimeType: "text/sql" as const,
                    ext: "sql" as const,
                    content: data.content,
                    isFocused: false,
                    isOpen: false,
                    isDirty: false,
                    isSaved: true,
                    isNew: false,
                });
            }
        }
        
        return editors;
    },
    
    // 清除会话数据
    clearSession: (sessionId: string) => {
        const keys = LocalStorageManager.getSessionKeys(sessionId);
        keys.forEach(key => LocalStorageManager.removeItem(key));
    }
};

const initialFileState: SessionState = {
    status: "initializing_worker",
    sessionId: "DataWorksCopilot",
    directoryHandle: null,
    editors: [],
    sources: [],
};

function reducer(state: SessionState, action: Action): SessionState {
    switch (action.type) {
        case "SET_STATUS": {
            const { status } = action.payload;
            return {
                ...state,
                status,
            };
        }
        case "ADD_EDITOR": {
            return {
                ...state,
                editors: [...state.editors, action.payload],
            };
        }
        case "DELETE_EDITOR": {
            return {
                ...state,
                editors: state.editors.filter(
                    (editor) => editor.path !== action.payload.path,
                ),
            };
        }
        case "RENAME_EDITOR": {
            const { path, newPath, handle } = action.payload;
            const index = state.editors.findIndex(
                (editor) => editor.path === path,
            );
            if (index === -1) return { ...state };
            const editor = state.editors[index];
            if (!editor) return { ...state };
            return {
                ...state,
                editors: [
                    ...state.editors.slice(0, index),
                    {
                        ...editor,
                        path: newPath,
                        handle,
                    },
                    ...state.editors.slice(index + 1),
                ],
            };
        }
        case "UPDATE_EDITOR": {
            const { path, content } = action.payload;
            const index = state.editors.findIndex(
                (editor) => editor.path === path,
            );
            if (index === -1) return { ...state };
            const editor = state.editors[index];
            if (!editor) return { ...state };
            return {
                ...state,
                editors: [
                    ...state.editors.slice(0, index),
                    {
                        ...editor,
                        content,
                        isDirty: true,
                        isSaved: false,
                    },
                    ...state.editors.slice(index + 1),
                ],
            };
        }
        case "ADD_SOURCES": {
            return {
                ...state,
                sources: [...state.sources, ...action.payload],
            };
        }

        case "REMOVE_SOURCE": {
            const { path } = action.payload;

            return {
                ...state,
                sources: state.sources.filter((source) => source.path !== path),
            };
        }
        // close the editor view (not delete the editor from the state)
        case "CLOSE_EDITOR": {
            const { path } = action.payload;
            const index = state.editors.findIndex(
                (editor) => editor.path === path,
            );
            // not found
            if (index === -1) return { ...state };
            const editor = state.editors[index];
            if (!editor) return { ...state };

            // #TODO: focus the next editor

            return {
                ...state,
                editors: [
                    ...state.editors.slice(0, index),
                    {
                        ...editor,
                        isOpen: false,
                        isFocused: false,
                    },
                    ...state.editors.slice(index + 1),
                ],
            };
        }
        case "OPEN_EDITOR": {
            const { path } = action.payload;
            const index = state.editors.findIndex(
                (editor) => editor.handle?.name === path || editor.path === path,
            );
            // not found
            if (index === -1) return { ...state };

            const editor = state.editors[index];

            if (!editor) return { ...state };

            return {
                ...state,
                editors: [
                    ...state.editors.slice(0, index),
                    {
                        ...editor,
                        isOpen: true,
                    },
                    ...state.editors.slice(index + 1),
                ],
            };
        }
        case "SAVE_EDITOR": {
            const { path, content, handle } = action.payload;
            const index = state.editors.findIndex(
                (editor) => editor.path === path,
            );
            if (index === -1) return { ...state };
            const editor = state.editors[index];
            if (!editor) return { ...state };
            return {
                ...state,
                editors: [
                    ...state.editors.slice(0, index),
                    {
                        ...editor,
                        content,
                        isFocused: true,
                        isDirty: false,
                        isSaved: true,
                        isNew: false, // if it was new, it's not new anymore (so we don't delete it when we close it).
                        handle: handle || editor.handle, // 保持原有handle或使用新的handle
                    },
                    ...state.editors.slice(index + 1),
                ],
            };
        }
        case "FOCUS_EDITOR": {
            const { path } = action.payload;
            return {
                ...state,
                editors: state.editors.map((editor) => ({
                    ...editor,
                    isOpen: editor.path === path || editor.isOpen, // open the editor if it's not open
                    isFocused: editor.path === path,
                })),
            };
        }
        // reset the editor state
        case "OPEN_SESSION": {
            const { sessionId, directoryHandle, editors, sources } =
                action.payload;
            return {
                ...state,
                directoryHandle,
                editors,
                sources,
                status: "ready",
                sessionId,
            };
        }

        case "REFRESH_EDITOR": {
            const { path, handle } = action.payload;

            const index = state.editors.findIndex(
                (editor) => editor.path === path,
            );

            if (index === -1) return { ...state };

            const editor = state.editors[index];

            if (!editor) return { ...state };

            return {
                ...state,
                editors: [
                    ...state.editors.slice(0, index),
                    {
                        ...editor,
                        isFocused: true,
                        isDirty: false,
                        isSaved: true,
                        handle,
                    },
                    ...state.editors.slice(index + 1),
                ],
            };
        }
        case "RESET_SESSION": {
            return { ...initialFileState };
        }
        default: {
            console.warn(`Unhandled file action type: ${action}`);
            return { ...state };
        }
    }
}

/**
 * Allows the user to switch between different sessions.
 *
 * Not implemented yet.
 */
function SessionProvider({ children }: SessionProviderProps) {
    const [session, dispatch] = useReducer(reducer, initialFileState);

    // 初始化会话数据
    useEffect(() => {
        const initSession = async (sessionId: string) => {
            dispatch({
                type: "SET_STATUS",
                payload: {
                    status: "loading_session",
                },
            });

            try {
                const editors = LocalStorageManager.restoreEditors(sessionId);
                
                dispatch({
                    type: "OPEN_SESSION",
                    payload: {
                        sessionId,
                        directoryHandle: null,
                        sources: [],
                        editors,
                    },
                });
            } catch (e) {
                console.error("Error restoring from localStorage:", e);
                dispatch({
                    type: "SET_STATUS",
                    payload: {
                        status: "error",
                    },
                });
                
                toast.error("会话初始化错误", {
                    description: e instanceof Error ? e.message : "未知错误",
                });
            }
        };

        initSession("DataWorksCopilot");
    }, []);

    /**
     * Update your session (i.e. open a new project).
     *
     * #TODO: Not implemented yet.
     */
    const onSessionChange = useCallback((_session: string) => {
        return null;
    }, []);

    /**
     * Add data sources to the session.
     *
     * 注意：localStorage模式下暂不支持数据源管理
     */
    const onAddDataSources: SessionMethods["onAddDataSources"] = useCallback(
        async (entries) => {
            console.log("数据源管理暂不支持:", entries);
            toast.error("数据源管理暂不支持", {
                description: "当前使用localStorage模式，暂不支持数据源管理功能",
            });
            return [];
        },
        [],
    );

    const onDeleteDataSource: SessionMethods["onDeleteDataSource"] =
        useCallback(
            async (path) => {
                console.log("删除数据源暂不支持:", path);
                toast.error("数据源管理暂不支持", {
                    description: "当前使用localStorage模式，暂不支持数据源管理功能",
                });
            },
            [],
        );

    const onAddEditor = useCallback(async () => {
        if (!session.sessionId) return;

        try {
            // 生成唯一的文件名
            const generateUniqueFilename = (editors: typeof session.editors) => {
                let counter = 1;
                let newPath = `query-${counter}.sql`;
                
                // 检查是否已存在相同名称的文件
                const existingPaths = new Set(editors.map(editor => editor.path));
                while (existingPaths.has(newPath)) {
                    counter++;
                    newPath = `query-${counter}.sql`;
                }
                
                return newPath;
            };
            
            const newPath = generateUniqueFilename(session.editors);
            
            const editorData = {
                path: newPath,
                handle: null,
                kind: "CODE" as const,
                mimeType: "text/sql" as const,
                ext: "sql" as const,
                content: newfileContents,
                isFocused: false,
                isOpen: true,
                isDirty: false,
                isSaved: false,
                isNew: true,
            };

            // 保存到localStorage
            const storageKey = `session_${session.sessionId}_editor_${newPath}`;
            LocalStorageManager.setItem(storageKey, {
                content: editorData.content,
                metadata: {
                    path: newPath,
                    created: Date.now(),
                    modified: Date.now(),
                }
            });

            dispatch({
                type: "ADD_EDITOR",
                payload: editorData,
            });

            dispatch({
                type: "FOCUS_EDITOR",
                payload: {
                    path: newPath,
                },
            });
        } catch (e) {
            console.error("Failed to add editor: ", e);
            toast.error("添加编辑器失败", {
                description: e instanceof Error ? e.message : undefined,
            });
        }
    }, [session.sessionId, session.editors]);

    /**
     * Permanently delete the editor from the session.
     */
    const onDeleteEditor = useCallback(
        async (path: string) => {
            try {
                const storageKey = `session_${session.sessionId}_editor_${path}`;
                LocalStorageManager.removeItem(storageKey);

                dispatch({
                    type: "DELETE_EDITOR",
                    payload: {
                        path,
                    },
                });
            } catch (e) {
                console.error("Failed to delete editor: ", e);
                toast.error("删除编辑器失败", {
                    description: e instanceof Error ? e.message : undefined,
                });
            }
        },
        [session.sessionId],
    );

    /**
     * Save the editor content to localStorage.
     */
    const onSaveEditor = useCallback(
        async (props: Pick<SaveEditorProps, "content" | "path">) => {
            try {
                const storageKey = `session_${session.sessionId}_editor_${props.path}`;
                const success = LocalStorageManager.setItem(storageKey, {
                    content: props.content,
                    metadata: {
                        path: props.path,
                        created: Date.now(),
                        modified: Date.now(),
                    }
                });

                if (!success) {
                    throw new Error("localStorage存储失败");
                }

                dispatch({
                    type: "SAVE_EDITOR",
                    payload: {
                        path: props.path,
                        content: props.content,
                        handle: null,
                    },
                });
            } catch (e) {
                console.error("Failed to save editor: ", e);
                toast.error("保存编辑器失败", {
                    description: e instanceof Error ? e.message : undefined,
                });
            }
        },
        [session.sessionId],
    );

    /**
     * Close the editor, delete if it's new and not dirty.
     */
    const onCloseEditor = useCallback(
        async (path: string) => {
            // find editor
            const editor = session.editors.find(
                (editor) => editor.path === path,
            );

            if (!editor) return;

            // if it's new and not dirty, we should delete it when we close it.
            const shouldDelete = editor.isNew && !editor.isDirty;

            if (shouldDelete) {
                try {
                    const storageKey = `session_${session.sessionId}_editor_${path}`;
                    LocalStorageManager.removeItem(storageKey);

                    dispatch({
                        type: "DELETE_EDITOR",
                        payload: {
                            path,
                        },
                    });

                    return;
                } catch (e) {
                    console.error("Failed to delete editor: ", e);
                    toast.error("关闭编辑器失败", {
                        description: e instanceof Error ? e.message : undefined,
                    });
                    return;
                }
            }

            // 获取当前打开的文件列表
            const openEditors = session.editors.filter(
                (e) => e.isOpen && e.path !== path,
            );

            dispatch({
                type: "CLOSE_EDITOR",
                payload: {
                    path,
                },
            });

            // 如果还有其他打开的文件，自动切换到最后一个打开的文件
            if (openEditors.length > 0) {
                const lastOpenEditor = openEditors[openEditors.length - 1];
                if (lastOpenEditor) {
                    dispatch({
                        type: "FOCUS_EDITOR",
                        payload: {
                            path: lastOpenEditor.path,
                        },
                    });
                }
            }
        },
        [session.editors, session.sessionId],
    );

    /**
     * Reset the session by clearing localStorage and reloading.
     */
    const onBurstCache: SessionMethods["onBurstCache"] = useCallback(async () => {
        try {
            LocalStorageManager.clearSession(session.sessionId);
            
            dispatch({
                type: "RESET_SESSION",
            });

            window.location.reload();
        } catch (e) {
            console.error("Failed to clear session: ", e);
            toast.error("清理会话失败", {
                description: e instanceof Error ? e.message : undefined,
            });
        }
    }, [session.sessionId]);

    /**
     * Rename editor - update localStorage key.
     */
    const onRenameEditor: SessionMethods["onRenameEditor"] = useCallback(
        async (path, newPath) => {
            try {
                const oldKey = `session_${session.sessionId}_editor_${path}`;
                const newKey = `session_${session.sessionId}_editor_${newPath}`;
                
                const data = LocalStorageManager.getItem(oldKey);
                if (data) {
                    data.metadata.path = newPath;
                    LocalStorageManager.setItem(newKey, data);
                    LocalStorageManager.removeItem(oldKey);
                }

                dispatch({
                    type: "RENAME_EDITOR",
                    payload: {
                        path,
                        newPath,
                        handle: null,
                    },
                });
            } catch (e) {
                console.error("Failed to rename editor: ", e);
                toast.error("重命名编辑器失败", {
                    description: e instanceof Error ? e.message : undefined,
                });
            }
        },
        [session.sessionId],
    );

    const value = useMemo(
        () => ({
            ...session,
            onSessionChange,
            dispatch,
            onAddDataSources,
            onAddEditor,
            onDeleteEditor,
            onSaveEditor,
            onCloseEditor,
            onBurstCache,
            onRenameEditor,
            onDeleteDataSource,
        }),
        [
            onSessionChange,
            session,
            onAddDataSources,
            onAddEditor,
            onDeleteEditor,
            onSaveEditor,
            onCloseEditor,
            onBurstCache,
            onRenameEditor,
            onDeleteDataSource,
        ],
    );

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}

export { SessionProvider };
