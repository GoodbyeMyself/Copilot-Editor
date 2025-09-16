import { Code2, X } from "lucide-react";
import { useSession } from "@/context/session/useSession";
import { cn } from "@/lib/utils";

export default function OpenFileTabs() {
    const { editors, dispatch, onCloseEditor } = useSession();

    const onOpenEditor = (path: string) => {
        if (!dispatch) return;

        dispatch({
            type: "FOCUS_EDITOR",
            payload: {
                path,
            },
        });
    };

    return (
        <div className="flex max-h-9 min-h-9 flex-row justify-between overflow-hidden overflow-x-auto bg-[#f3f3f3]">
            <div className="flex size-full items-center">
                {editors
                    .filter((editor) => editor.isOpen)
                    .map((editor) => {
                        const isCurrent = editor.isFocused;

                        return (
                            <button
                                type="button"
                                className={cn(
                                    "flex h-full cursor-pointer flex-row flex-nowrap items-center gap-1 rounded-none border-x border-t border-t-transparent bg-[#ececec] pl-2 text-[#3d3d3d] first:border-l-0 hover:bg-[#d9d9d9]",
                                    isCurrent &&
                                        "border-t-0 bg-white text-[#3d3d3d] hover:bg-background",
                                )}
                                data-current={isCurrent || undefined}
                                key={editor.path}
                                onClick={() => onOpenEditor(editor.path)}
                            >
                                <Code2 className="mr-1 size-4" />
                                <span
                                    className="max-w-[120px] truncate text-sm"
                                    title={editor.path}
                                >
                                    {editor.path}
                                </span>

                                <div
                                    role="button"
                                    tabIndex={0}
                                    title="关闭文件"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCloseEditor(editor.path);
                                    }}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                        ) {
                                            onCloseEditor(editor.path);
                                        }
                                    }}
                                    className={cn(
                                        "flex h-full items-center bg-inherit px-2 hover:bg-gray-200",
                                        isCurrent &&
                                            "hover:bg-secondary",
                                    )}
                                >
                                    <X
                                        className="size-4"
                                        type="close"
                                    />
                                </div>
                            </button>
                        );
                    })}
                {/* 按钮区域 */}
                <div className="ml-auto flex h-full items-center">
                    {/* <AddNewFileButton /> */}
                </div>
            </div>
        </div>
    );
}
