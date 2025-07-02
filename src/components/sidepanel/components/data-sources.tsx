// icon
import {
    ArrowDownToDot,
    Database,
    Inbox,
    Plus,
    Trash2,
} from "lucide-react";

import { useState } from "react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/base/ui/alert-dialog";

import { Button } from "@/components/base/ui/button";

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/base/ui/context-menu";

import {
    DropdownMenu,
    DropdownMenuTrigger,
} from "@/components/base/ui/dropdown-menu";

import { useEditor } from "@/context/editor/useEditor";

import { useSession } from "@/context/session/useSession";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

import { cn } from "@/lib/utils";

/**
 * Manage datasets.
 *
 * @component
 */
function SourcesToolbar() {
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => console.log(1)}
                    >
                        <Plus size={16} />
                    </Button>
                </DropdownMenuTrigger>
            </DropdownMenu>
        </>
    );
}

type SourceEntry = ReturnType<typeof useSession>["sources"][number];

type DeleteModalProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    path: string;
};

/**
 * Delete the editor (not close the file).
 */
function DeleteEditorModal(props: DeleteModalProps) {
    const { isOpen, onOpenChange } = props;


    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={onOpenChange}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        确定要删除所选数据源吗 ？
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        此操作无法撤销, 这将永久删除该数据源
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction>
                        确认
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function DatesetItem(props: SourceEntry) {
    const { copyToClipboard } = useCopyToClipboard();

    const [showDelete, setShowDelete] = useState(false);

    const { editorRef } = useEditor();

    const { path } = props;

    const onCopy = async () => {
        let snippet = "";

        snippet = `CREATE OR REPLACE TABLE xxx`;

        await copyToClipboard(snippet.trim());

        // insert into editor
        const editor = editorRef.current?.getEditor();

        if (editor) {
            const selection = editor.getSelection();

            editor.executeEdits("my-source", [
                {
                    text: snippet,
                    forceMoveMarkers: false,
                    range: {
                        startLineNumber: selection?.selectionStartLineNumber || 1,
                        startColumn: selection?.selectionStartColumn || 1,
                        endLineNumber: selection?.endLineNumber || 1,
                        endColumn: selection?.endColumn || 1,
                    },
                },
            ]);
        }
    };

    return (
        <>
            <ContextMenu key={path}>
                <ContextMenuTrigger className="w-full data-[state=open]:bg-gray-100">
                    <Button
                        className={cn(
                            "flex h-6 w-full items-center justify-between gap-2 overflow-hidden p-2",
                        )}
                        variant="ghost"
                    >
                        <div className="relative inline-flex w-full items-center gap-1">
                            <Database
                                className={cn("mr-0.5 size-4 shrink-0")}
                            />
                            <span className="truncate font-normal">
                                {path}
                            </span>
                        </div>
                    </Button>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-40">
                    <ContextMenuItem
                        inset
                        onSelect={onCopy}
                    >
                        <ArrowDownToDot size={16} />
                        <span className="ml-2">插入表 SQL</span>
                    </ContextMenuItem>
                    <ContextMenuItem
                        inset
                        onSelect={() => setShowDelete(true)}
                    >
                        <Trash2 size={16} />
                        <span className="ml-2">删除</span>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            <DeleteEditorModal
                isOpen={showDelete}
                onOpenChange={(open) => setShowDelete(open)}
                path={path}
            />
        </>
    );
}

export default function DataSources() {
    const { sources } = useSession();

    return (
        <div className="flex w-full flex-col">
            <div className="sticky top-0 z-10 flex w-full items-center justify-between bg-background">
                <div className="flex grow">
                    <span className="text-sm font-semibold px-4 py-2">数据源</span>
                </div>
                <div className="flex items-center gap-1 px-2">
                    <SourcesToolbar />
                </div>
            </div>
            <div
                className="flex max-h-[calc(100vh-200px)] w-full flex-col space-y-1 overflow-y-auto py-1 pl-4 pr-8"
            >
                {sources.length === 0 ? (
                    <div className="flex h-[200px] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Inbox className="size-12" />
                        <p className="text-sm">暂无数据源</p>
                        <p className="text-xs">点击上方的 + 按钮添加数据源</p>
                    </div>
                ) : (
                    sources.map((source) => (
                        <DatesetItem
                            key={source.path}
                            {...source}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
