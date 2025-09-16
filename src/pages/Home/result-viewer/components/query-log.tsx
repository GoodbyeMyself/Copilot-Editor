import { useEffect, useRef } from "react";
import { useQuery } from "@/context/query/useQuery";
import EmptyResults from "./slot/empty";

export default function QueryLog() {
    const { logs, status } = useQuery();

    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logs]);

    if (logs?.length === 0) {
        return (
            <div className="flex h-full max-h-full flex-1 flex-col justify-between gap-4 overflow-y-auto px-2 py-4">
                <EmptyResults text="暂无运行日志" />
            </div>
        );
    }

    return (
        <div className="h-full w-[calc(100%-24px)] overflow-auto rounded-lg border border-gray-300 bg-gray-900 shadow-lg mx-4 my-2">
            {/* 日志内容区域 */}
            <div className="p-4">
                <div
                    ref={logRef}
                    className="flex min-h-[200px] flex-col space-y-2"
                >
                    {logs?.map((log: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                            {/* 终端提示符 */}
                            <span className="text-green-400 font-mono text-sm shrink-0 mt-0">
                                $
                            </span>
                            {/* 使用 div 组件展示日志 */}
                            <div
                                className="flex-1 text-gray-300 font-mono text-sm cursor-text selection:bg-blue-500/30 whitespace-pre-wrap break-words"
                            >
                                {log}
                            </div>
                        </div>
                    ))}
                    
                    {/* 运行状态指示器 */}
                    {status === "RUNNING" && (
                        <div className="flex items-center space-x-2">
                            <span className="text-green-400 font-mono text-sm shrink-0">
                                $
                            </span>
                            <div className="flex items-center space-x-2">
                                <span className="text-green-400 font-mono text-sm animate-pulse">
                                    查询执行中...
                                </span>
                            </div>
                        </div>
                    )}
                    
                    {/* 光标闪烁效果 */}
                    <div className="flex items-center space-x-2">
                        <span className="text-green-400 font-mono text-sm shrink-0">
                            $
                        </span>
                        <div className="flex items-center">
                            <span className="text-gray-300 font-mono text-sm animate-pulse">
                                _
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
