import { Button } from "antd";

import { useLocalStorage } from "@uidotdev/usehooks";

import { useCallback } from "react";

import { useHotkeys } from "react-hotkeys-hook";

import { toast } from "sonner";

import { useSpinDelay } from "spin-delay";

import { useLocation } from "@umijs/max";

import { useEditor } from "@/context/editor/useEditor";

import { useQuery } from "@/context/query/useQuery";

import { useSession } from "@/context/session/useSession";

import { LoadingOutlined, PlayCircleOutlined } from "@ant-design/icons";


export default function Toolbar() {
    const { status, onCancelQuery, onRunQuery } = useQuery();

    const { editorRef } = useEditor();
    
    const { editors } = useSession();
    
    const location = useLocation();
    
    const [, setTab] = useLocalStorage<"table" | "chart" | "json" | "history" | "log">(`results-viewer-tab`, `table`);

    // 检查当前是否有正在编辑的文件
    const currentEditor = editors.find((editor) => editor.isFocused);
    const hasActiveEditor = !!currentEditor;

    // 检查当前是否在 /home 路由下
    const isHomeRoute = location.pathname === "/home";

    const onRun = useCallback(async () => {
        const controller = new AbortController();
        const signal = controller.signal;

        const editor = editorRef.current?.getEditor();

        if (!editor) {
            toast.warning("Editor not ready yet", {
                description: "Please wait a moment and try again.",
            });
            return;
        }

        const query = editor?.getModel()?.getValue();

        if (!query) {
            toast.warning("No query to run", {
                description: "Please write a query and try again.",
            });
            return;
        }

        signal.addEventListener("abort", () => {
            onCancelQuery("cancelled");
            toast.info("Query cancelled", {
                description: "The query was cancelled.",
            });
        });

        // cleanup query to remove comments and empty lines
        const cleanedQuery = query
            .split("\n")
            .filter((line) => !line.trim().startsWith("--"))
            .join("\n");

        // Switch to log tab before running query
        setTab("log");
        
        await onRunQuery(cleanedQuery);

        return () => {
            controller.abort();
        };
    }, [editorRef, onCancelQuery, onRunQuery, setTab]);

    useHotkeys(
        "mod+enter",
        () => {
            if (status === "RUNNING") {
                onCancelQuery("cancelled");
            } else {
                onRun();
            }
        },
        [status, onCancelQuery, onRun],
    );

    const isLoading = useSpinDelay(status === "RUNNING", {
        delay: 0,
        minDuration: 100,
    });

    if (isLoading) {
        return (
            <Button
                type="primary"
                danger
                onClick={() => onCancelQuery("cancelled")}
                icon={<LoadingOutlined />}
            >
                取消
            </Button>
        );
    }

    // 只有当在 /home 路由下且有正在编辑的文件时才显示执行查询按钮
    if (!isHomeRoute || !hasActiveEditor) {
        return null;
    }

    return (
        <div className="">
            <Button
                type="primary"
                onClick={onRun}
                icon={<PlayCircleOutlined />}
            >
                执行查询
            </Button>
        </div>
    );
}
