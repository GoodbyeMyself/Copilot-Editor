import { useState, useEffect } from "react";
import { Code, Database } from "lucide-react";
import { Button } from "antd";

import DataSources from "./components/data-sources";
import EditorSources from "./components/editor-files";

import styles from './sidepanel.module.less';

type SidepanelProps = {
    isCollapsed: boolean;
};

type ActivePanel = "files" | "datasources";

// 本地存储的键名
const STORAGE_KEY = "sql-copilot-sidebar-active-panel";

/**
 * 顶部切换按钮组件
 */
function SidebarTabBar({ activePanel, onPanelChange }: {
    activePanel: ActivePanel;
    onPanelChange: (panel: ActivePanel) => void;
}) {
    return (
        <div className={`flex w-full bg-white border-b border-gray-200 px-2 justify-center ${styles.sliderTabBar}`}>
            <div className="flex gap-1">
                <Button
                    type="text"
                    size="small"
                    icon={<Code size={16} />}
                    onClick={() => onPanelChange("files")}
                    className={`
                        flex items-center justify-center px-3 py-1.5 rounded-md border-none
                        transition-all duration-200
                        ${activePanel === "files" 
                            ? "bg-blue-50 text-blue-600 font-medium" 
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        }
                    `}
                >
                </Button>
                <Button
                    type="text"
                    size="small"
                    icon={<Database size={16} />}
                    onClick={() => onPanelChange("datasources")}
                    className={`
                        flex items-center justify-center px-3 py-1.5 rounded-md border-none
                        transition-all duration-200
                        ${activePanel === "datasources" 
                            ? "bg-blue-50 text-blue-600 font-medium" 
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        }
                    `}
                >
                </Button>
            </div>
        </div>
    );
}

/**
 * 左侧面板，包含数据源、编辑器源和查询历史。
 * 
 * 新的布局方式：
 * - 顶部是切换按钮栏，用于切换不同的面板
 * - 下方是内容区域，根据选中的按钮显示对应的内容
 */
export default function Sidepanel(props: SidepanelProps) {
    const { isCollapsed } = props;
    
    // 从 localStorage 读取初始状态，默认为 "files"
    const [activePanel, setActivePanel] = useState<ActivePanel>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return (stored as ActivePanel) || "files";
        } catch {
            return "files";
        }
    });

    // 当 activePanel 改变时，保存到 localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, activePanel);
        } catch {
            // 忽略存储错误
        }
    }, [activePanel]);

    if (isCollapsed) return null;

    return (
        <div className="flex flex-col h-full bg-white">
            {/* 顶部切换按钮栏 */}
            <SidebarTabBar 
                activePanel={activePanel} 
                onPanelChange={setActivePanel} 
            />
            
            {/* 内容区域 */}
            <div className="flex-1 min-w-0 bg-white relative">
                <div 
                    className={`
                        absolute inset-0 transition-opacity duration-300 ease-in-out
                        ${activePanel === "files" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}
                    `}
                >
                    <EditorSources />
                </div>
                <div 
                    className={`
                        absolute inset-0 transition-opacity duration-300 ease-in-out
                        ${activePanel === "datasources" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}
                    `}
                >
                    <DataSources />
                </div>
            </div>
        </div>
    );
}
