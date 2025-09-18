import { useMemo, useState } from "react";
import { X } from "lucide-react";

type DebugConsoleProps = {
    logs?: string[];
    onClose?: () => void;
};

export default function DebugConsole({ logs = [], onClose }: DebugConsoleProps) {
    const content = useMemo(() => (logs.length === 0 ? ["调试控制台已就绪"] : logs), [logs]);

    const [activeTab, setActiveTab] = useState<string>("调试控制台");

    return (
        <div className="flex h-full w-full flex-col bg-muted/30">
            <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    {(["问题", "输出", "调试控制台", "终端"])?.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            className={
                                "rounded px-2 py-1 transition-colors " +
                                (activeTab === tab
                                    ? "bg-muted text-foreground"
                                    : "hover:bg-muted/60")
                            }
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        aria-label="关闭调试控制台"
                        className="rounded p-1 hover:bg-muted"
                        onClick={onClose}
                        title="关闭"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-auto px-3 py-2 text-xs leading-5">
                {content.map((line, idx) => (
                    <div key={idx} className="whitespace-pre-wrap">
                        {line}
                    </div>
                ))}
            </div>
        </div>
    );
}

