import { useCallback, useEffect, useMemo, useReducer } from "react";
import { toast } from "sonner";
import { SessionContext } from "./context";
import { newfileContents } from "./data/newfile-content";
import { mockTreeDataSources } from "./data/mock-datasources";
import type {
    Action,
    SaveEditorProps,
    SessionMethods,
    SessionState,
} from "./types";
import type { Dataset } from "@/types/files/dataset";

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

    // 从localStorage恢复数据源数据
    restoreDataSources: (sessionId: string) => {
        const storageKey = `session_${sessionId}_datasources`;
        const data = LocalStorageManager.getItem(storageKey);
        return data || null;
    },

    // 保存数据源数据到localStorage
    saveDataSources: (sessionId: string, dataSources: any[]) => {
        const storageKey = `session_${sessionId}_datasources`;
        return LocalStorageManager.setItem(storageKey, dataSources);
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

        case "ADD_SINGLE_SOURCE": {
            return {
                ...state,
                sources: [...state.sources, action.payload],
            };
        }

        case "REMOVE_SOURCE": {
            const { path } = action.payload;

            return {
                ...state,
                sources: state.sources.filter((source) => source.path !== path),
            };
        }

        case "UPDATE_SOURCE": {
            const { path, updatedDataSource } = action.payload;
            const index = state.sources.findIndex((source) => source.path === path);
            
            if (index === -1) return { ...state };
            
            return {
                ...state,
                sources: [
                    ...state.sources.slice(0, index),
                    updatedDataSource,
                    ...state.sources.slice(index + 1),
                ],
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
                
                // 尝试从本地缓存恢复数据源
                let dataSources = LocalStorageManager.restoreDataSources(sessionId);
                
                // 如果没有缓存数据，使用模拟数据并保存到缓存
                if (!dataSources) {
                    dataSources = mockTreeDataSources;
                    LocalStorageManager.saveDataSources(sessionId, dataSources);
                }
                
                dispatch({
                    type: "OPEN_SESSION",
                    payload: {
                        sessionId,
                        directoryHandle: null,
                        sources: dataSources, // 使用恢复的数据源
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

    // 监听sources变化，自动保存到本地缓存
    useEffect(() => {
        if (session.sources.length > 0 && session.sessionId) {
            LocalStorageManager.saveDataSources(session.sessionId, session.sources);
        }
    }, [session.sources, session.sessionId]);

    /**
     * Update your session (i.e. open a new project).
     *
     * #TODO: Not implemented yet.
     */
    const onSessionChange = useCallback((_session: string) => {
        console.log(_session, '<- _session');
        return null;
    }, []);


    const onAddEditor = useCallback(async () => {
        if (!session.sessionId) return;

        try {
            // 生成唯一的文件名
            const generateUniqueFilename = (editors: typeof session.editors) => {
                let counter = 1;
                let newPath = `sql-${counter}.sql`;
                
                // 检查是否已存在相同名称的文件
                const existingPaths = new Set(editors.map(editor => editor.path));
                while (existingPaths.has(newPath)) {
                    counter++;
                    newPath = `sql-${counter}.sql`;
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

                // 删除后，如果还有其他文件，切换到第一个文件
                const remainingEditors = session.editors.filter(editor => editor.path !== path);
                if (remainingEditors.length > 0) {
                    const firstEditor = remainingEditors[0];
                    if (firstEditor) {
                        dispatch({
                            type: "FOCUS_EDITOR",
                            payload: {
                                path: firstEditor.path,
                            },
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to delete editor: ", e);
                toast.error("删除编辑器失败", {
                    description: e instanceof Error ? e.message : undefined,
                });
            }
        },
        [session.sessionId, session.editors],
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

    /**
     * 添加单个数据源
     */
    const onAddDataSource: SessionMethods["onAddDataSource"] = useCallback(
        async (dataSource: Dataset) => {
            try {
                dispatch({
                    type: "ADD_SINGLE_SOURCE",
                    payload: dataSource,
                });

                toast.success("数据源已添加");
            } catch (e) {
                console.error("Failed to add data source: ", e);
                toast.error("添加数据源失败", {
                    description: e instanceof Error ? e.message : undefined,
                });
            }
        },
        [],
    );

    /**
     * 删除数据源
     */
    const onRemoveDataSource: SessionMethods["onRemoveDataSource"] = useCallback(
        async (path: string) => {
            try {
                dispatch({
                    type: "REMOVE_SOURCE",
                    payload: { path },
                });

                toast.success("数据源已删除");
            } catch (e) {
                console.error("Failed to remove data source: ", e);
                toast.error("删除数据源失败", {
                    description: e instanceof Error ? e.message : undefined,
                });
            }
        },
        [],
    );

    /**
     * 更新数据源
     */
    const onUpdateDataSource: SessionMethods["onUpdateDataSource"] = useCallback(
        async (path: string, updatedDataSource: Dataset) => {
            try {
                dispatch({
                    type: "UPDATE_SOURCE",
                    payload: {
                        path,
                        updatedDataSource,
                    },
                });

                toast.success("数据源已更新");
            } catch (e) {
                console.error("Failed to update data source: ", e);
                toast.error("更新数据源失败", {
                    description: e instanceof Error ? e.message : undefined,
                });
            }
        },
        [],
    );

    /**
     * 初始化模拟数据源
     */
    const onInitializeMockDataSources: SessionMethods["onInitializeMockDataSources"] = useCallback(() => {
        dispatch({
            type: "ADD_SOURCES",
            payload: mockTreeDataSources,
        });
    }, []);

    const value = useMemo(
        () => ({
            ...session,
            onSessionChange,
            dispatch,
            onAddEditor,
            onDeleteEditor,
            onSaveEditor,
            onCloseEditor,
            onBurstCache,
            onRenameEditor,
            onRemoveDataSource,
            onInitializeMockDataSources,
            onAddDataSource,
            onUpdateDataSource,
        }),
        [
            onSessionChange,
            session,
            onAddEditor,
            onDeleteEditor,
            onSaveEditor,
            onCloseEditor,
            onBurstCache,
            onRenameEditor,
            onRemoveDataSource,
            onInitializeMockDataSources,
            onAddDataSource,
            onUpdateDataSource,
        ],
    );

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}

export { SessionProvider };
