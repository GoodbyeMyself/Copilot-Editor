import { type CodeSource } from "@/types/files/code-source";

import { type Dataset } from "@/types/files/dataset";

/**
 * Each code file and its state including within the tabs.
 */
export type CodeEditor = CodeSource & {
    isOpen: boolean;
    isFocused: boolean;
    isSaved: boolean;
    isDirty: boolean;
    handle: FileSystemFileHandle | null;
    content: string;
    // when adding a new file, we should delete it if it's not saved
    isNew: boolean;
};

export type SessionState = {
    status: "initializing_worker" | "loading_session" | "ready" | "error";
    sessionId: string;
    directoryHandle: FileSystemDirectoryHandle | null;
    editors: CodeEditor[];
    sources: Dataset[];
};

export type SessionMethods = {
    onSessionChange: (session: string) => void;
    dispatch: React.Dispatch<Action> | null;
    onAddEditor: () => Promise<void>;
    onDeleteEditor: (path: string) => Promise<void>;
    onSaveEditor: (props: SaveEditorProps) => Promise<void>;
    onCloseEditor: (path: string) => Promise<void>;
    onBurstCache: () => Promise<void>;
    onRenameEditor: (path: string, newPath: string) => Promise<void>;
    onRemoveDataSource: (path: string) => Promise<void>;
    onInitializeMockDataSources: () => void;
    onAddDataSource: (dataSource: Dataset) => Promise<void>;
};

export type SessionContextValue = SessionState & SessionMethods;

// saving file
export type SaveEditorProps = {
    content: string;
    path: string;
};

export type SaveEditorResponse = SaveEditorProps & {
    handle: FileSystemFileHandle | undefined;
    error: Error | null;
};

type OpenEditor = {
    type: "OPEN_EDITOR";
    payload: {
        path: string;
    };
};

type SaveEditor = {
    type: "SAVE_EDITOR";
    payload: {
        path: string;
        content: string;
        handle: FileSystemFileHandle | null;
    };
};

type FocusEditor = {
    type: "FOCUS_EDITOR";
    payload: {
        path: string;
    };
};

type CloseEditor = {
    type: "CLOSE_EDITOR";
    payload: {
        path: string;
    };
};

type AddEditor = {
    type: "ADD_EDITOR";
    payload: CodeEditor;
};

type DeleteEditor = {
    type: "DELETE_EDITOR";
    payload: {
        path: string;
    };
};

type UpdateEditor = {
    type: "UPDATE_EDITOR";
    payload: {
        path: string;
        content: string;
    };
};

type OpenSession = {
    type: "OPEN_SESSION";
    payload: Pick<
        SessionState,
        "sessionId" | "directoryHandle" | "editors" | "sources"
    >;
};

type SetStatus = {
    type: "SET_STATUS";
    payload: { status: SessionState["status"] };
};

type RefreshEditor = {
    type: "REFRESH_EDITOR";
    payload: {
        path: string;
        handle: FileSystemFileHandle | null;
    };
};

type RESET_SESSION = {
    type: "RESET_SESSION";
};

type RENAME_EDITOR = {
    type: "RENAME_EDITOR";
    payload: {
        path: string;
        newPath: string;
        handle: FileSystemFileHandle | null;
    };
};

type ADD_SOURCES = {
    type: "ADD_SOURCES";
    payload: Dataset[];
};

type REMOVE_SOURCE = {
    type: "REMOVE_SOURCE";
    payload: {
        path: string;
    };
};

type ADD_SINGLE_SOURCE = {
    type: "ADD_SINGLE_SOURCE";
    payload: Dataset;
};

export type Action =
    | RENAME_EDITOR
    | OpenEditor
    | SaveEditor
    | FocusEditor // tabs can be open without being focused
    | CloseEditor
    | AddEditor
    | DeleteEditor
    | UpdateEditor
    | OpenSession
    | SetStatus
    | RefreshEditor
    | RESET_SESSION
    | ADD_SOURCES
    | REMOVE_SOURCE
    | ADD_SINGLE_SOURCE;
