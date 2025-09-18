import { Alert } from "antd";

import { motion } from "framer-motion";

import { AlertOctagon, ChevronDown } from "lucide-react";

import { useState } from "react";

// 移除查询上下文依赖

import { cn } from "@/lib/utils";

import { ScrollArea } from "./ui/scroll-area";

const prettify = (str: string) => {
    try {
        // remove newlines
        let pretty = str.replaceAll(/\n/g, "");

        pretty = JSON.stringify(JSON.parse(pretty), null, "\t");

        return pretty;
    } catch (e) {
        return str;
    }
};

export default function ErrorNotification(props: { error: string }) {
    const [isOpen, setIsOpen] = useState(false);

    const error = prettify(props.error);

    return (
        <Alert
            type="error"
            message={
                <div className="flex flex-col gap-3">
                    <div className="inline-flex items-center gap-2">
                        <AlertOctagon className="size-4" />
                        <p className="text-base">Error</p>
                    </div>
                    
                    <ScrollArea className="flex h-full max-h-72 flex-col gap-4 overflow-y-auto">
                        <div className="whitespace-pre-wrap py-2 font-mono text-sm">
                            {error}
                        </div>

                        <div className="py-3">
                            <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex items-center gap-1 text-xs font-semibold"
                            >
                                <span>Details</span>
                                <ChevronDown
                                    className={cn("size-4", isOpen ? "rotate-180" : "rotate-0")}
                                />
                            </button>
                        </div>

                        {isOpen && (
                            <motion.div className="flex flex-col gap-2">
                                <div className="text-xs text-muted-foreground">
                                    详细信息已移除
                                </div>
                            </motion.div>
                        )}
                    </ScrollArea>
                </div>
            }
            className={cn(
                "group flex flex-col gap-3 hover:shadow",
                "space-y-1 font-mono transition-transform",
            )}
        />
    );
}
