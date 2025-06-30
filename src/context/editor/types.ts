import type { EditorForwardedRef } from "@/components/base/monaco";

export type EditorState = {
    editorRef: React.MutableRefObject<EditorForwardedRef | null>;
};
